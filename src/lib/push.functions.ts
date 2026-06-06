import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// VAPID keys are inlined intentionally (user opted out of secret prompts).
const VAPID_PUBLIC =
  "BCHwuEFHo7loPQdF5Ec0EXzqqb9TvG2gWEjliPmjlvutxdusFd0AokdtX6B6ixpC0Hcn4tbC9haqk7trObpj2KA";
const VAPID_PRIVATE = "3ddc7HILviAnYURTp38rPTn7pG4iAXj9xuRLHZVkAfQ";
const VAPID_SUBJECT = "mailto:notify@smrttrdr.app";

const subSchema = z.object({
  endpoint: z.string().url().max(2000),
  p256dh: z.string().min(1).max(500),
  auth: z.string().min(1).max(500),
  userAgent: z.string().max(500).optional(),
});

export const saveSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => subSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        user_agent: data.userAgent ?? null,
      },
      { onConflict: "endpoint" }
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ endpoint: z.string().url().max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await supabase.from("push_subscriptions").delete().eq("endpoint", data.endpoint);
    return { ok: true };
  });

const notifySchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(300).default(""),
  tag: z.string().max(80).optional(),
  url: z.string().max(500).optional(),
});

export const sendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => notifySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const webpush = (await import("web-push")).default;
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

    const { data: subs, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    if (!subs || subs.length === 0) return { sent: 0 };

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      tag: data.tag ?? "smrttrdr",
      url: data.url ?? "/",
    });

    const expired: string[] = [];
    let sent = 0;
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
            { TTL: 60 }
          );
          sent++;
        } catch (err: any) {
          const code = err?.statusCode;
          if (code === 404 || code === 410) expired.push(s.endpoint);
        }
      })
    );
    if (expired.length) {
      await supabaseAdmin.from("push_subscriptions").delete().in("endpoint", expired);
    }
    return { sent };
  });

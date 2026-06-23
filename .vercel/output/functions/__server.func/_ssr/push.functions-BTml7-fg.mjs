import { T as TSS_SERVER_FUNCTION, c as createServerFn } from "./index.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DA7lalMJ.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const VAPID_PUBLIC = "BCHwuEFHo7loPQdF5Ec0EXzqqb9TvG2gWEjliPmjlvutxdusFd0AokdtX6B6ixpC0Hcn4tbC9haqk7trObpj2KA";
const VAPID_PRIVATE = "3ddc7HILviAnYURTp38rPTn7pG4iAXj9xuRLHZVkAfQ";
const VAPID_SUBJECT = "mailto:notify@smrttrdr.app";
const subSchema = objectType({
  endpoint: stringType().url().max(2e3),
  p256dh: stringType().min(1).max(500),
  auth: stringType().min(1).max(500),
  userAgent: stringType().max(500).optional()
});
const saveSubscription_createServerFn_handler = createServerRpc({
  id: "aca7a94adfc906b20421097c5e7e6eb3d4aa925d2e447c68dc7cf5b1e1df59c9",
  name: "saveSubscription",
  filename: "src/lib/push.functions.ts"
}, (opts) => saveSubscription.__executeServer(opts));
const saveSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => subSchema.parse(d)).handler(saveSubscription_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("push_subscriptions").upsert({
    user_id: userId,
    endpoint: data.endpoint,
    p256dh: data.p256dh,
    auth: data.auth,
    user_agent: data.userAgent ?? null
  }, {
    onConflict: "endpoint"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const removeSubscription_createServerFn_handler = createServerRpc({
  id: "7d17c1cf2e13b5e3404d3e4a3b99e4a7ab1d3dbd60410f1aaca8692d32ab6b65",
  name: "removeSubscription",
  filename: "src/lib/push.functions.ts"
}, (opts) => removeSubscription.__executeServer(opts));
const removeSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  endpoint: stringType().url().max(2e3)
}).parse(d)).handler(removeSubscription_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  await supabase.from("push_subscriptions").delete().eq("endpoint", data.endpoint);
  return {
    ok: true
  };
});
const notifySchema = objectType({
  title: stringType().min(1).max(120),
  body: stringType().max(300).default(""),
  tag: stringType().max(80).optional(),
  url: stringType().max(500).optional()
});
const sendNotification_createServerFn_handler = createServerRpc({
  id: "e1746fb741861825449ca9f77d8a0d59c9c3ddff358528e831473ada6a63830f",
  name: "sendNotification",
  filename: "src/lib/push.functions.ts"
}, (opts) => sendNotification.__executeServer(opts));
const sendNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => notifySchema.parse(d)).handler(sendNotification_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-Bc9jZvWa.mjs");
  const webpush = (await import("../_libs/web-push.mjs").then(function(n) {
    return n.i;
  })).default;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  const {
    data: subs,
    error
  } = await supabaseAdmin.from("push_subscriptions").select("endpoint, p256dh, auth").eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  if (!subs || subs.length === 0) return {
    sent: 0
  };
  const payload = JSON.stringify({
    title: data.title,
    body: data.body,
    tag: data.tag ?? "smrttrdr",
    url: data.url ?? "/"
  });
  const expired = [];
  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({
        endpoint: s.endpoint,
        keys: {
          p256dh: s.p256dh,
          auth: s.auth
        }
      }, payload, {
        TTL: 60
      });
      sent++;
    } catch (err) {
      const code = err?.statusCode;
      if (code === 404 || code === 410) expired.push(s.endpoint);
    }
  }));
  if (expired.length) {
    await supabaseAdmin.from("push_subscriptions").delete().in("endpoint", expired);
  }
  return {
    sent
  };
});
export {
  removeSubscription_createServerFn_handler,
  saveSubscription_createServerFn_handler,
  sendNotification_createServerFn_handler
};

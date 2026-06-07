import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

const isVercel = !!process.env.VERCEL || process.env.NITRO_PRESET === "vercel";

export default defineConfig({
  // On Vercel, force-enable nitro with the vercel preset.
  // Otherwise let the wrapper auto-detect (Cloudflare for Lovable deploys).
  nitro: isVercel ? { preset: "vercel" } : undefined,
  plugins: [TanStackRouterVite()],
});

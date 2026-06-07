import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

const isVercel = !!process.env.VERCEL || process.env.NITRO_PRESET === "vercel";

export default defineConfig({
  // On Vercel, disable the Cloudflare plugin and use nitro's vercel preset.
  // Otherwise let the wrapper auto-detect (Cloudflare for Lovable deploys).
  cloudflare: isVercel ? false : undefined,
  nitro: isVercel ? { preset: "vercel" } : undefined,
  plugins: [TanStackRouterVite()],
});

import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

const isVercel = !!process.env.VERCEL || process.env.NITRO_PRESET === "vercel";

export default defineConfig({
  // On Vercel, force nitro with the vercel preset. Outside Lovable's sandbox
  // (i.e. on Vercel) the wrapper honours this and skips Cloudflare.
  nitro: isVercel ? { preset: "vercel" } : undefined,
  plugins: [TanStackRouterVite()],
});

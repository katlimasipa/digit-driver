import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { nitro } from "nitro/vite";

const isVercel = !!process.env.VERCEL || process.env.NITRO_PRESET === "vercel";

export default defineConfig({
  // Lovable deploys to Cloudflare Workers and needs the cloudflare plugin.
  // Vercel deploys use Nitro instead, so disable cloudflare only for Vercel.
  cloudflare: isVercel ? false : undefined,
  plugins: [TanStackRouterVite(), ...(isVercel ? [nitro()] : [])],
});

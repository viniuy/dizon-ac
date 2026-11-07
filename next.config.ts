import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Client router cache: pages the staff have visited or preloaded are reused instantly
    // when they hop back to them, instead of being fetched again behind a loading screen.
    // Saving anything (confirm, done, cancel…) still clears it, and the staff pages refresh
    // themselves quietly in the background (see app/staff/LiveRefresh.tsx).
    staleTimes: {
      dynamic: 60, // pages opened by clicking, with default prefetching
      static: 180, // pages preloaded in full (prefetch={true} / router.prefetch)
    },
  },
};

export default nextConfig;

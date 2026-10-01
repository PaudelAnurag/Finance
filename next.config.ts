import type { NextConfig } from "next";

// Dev server only: which hostnames may load /_next/* (scripts, HMR websocket) from another origin.
// Next 16 blocks everything but localhost by default, and a bare "*" does NOT match IP addresses
// (wildcards must match segment-for-segment), so opening the app at http://192.168.1.20:3000
// loaded the HTML but left the page without JavaScript. List the hosts you use instead.
// Extra hosts (public IP, tunnel, custom hostname): ALLOWED_DEV_ORIGINS="203.0.113.7,my-pc.lan"
const extra = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "[::1]",
    "192.168.*.*", // home / office Wi-Fi
    "10.*.*.*", // private networks, VPNs
    "172.*.*.*", // private 172.16–172.31 (also Docker)
    "100.*.*.*", // Tailscale / carrier-grade NAT
    "*.local", // mDNS names, e.g. my-laptop.local
    "*.lan",
    ...extra,
  ],
};

export default nextConfig;

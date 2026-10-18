import os from 'os';

const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    const netInterface = interfaces[name];
    if (netInterface) {
      for (const iface of netInterface) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push(iface.address);
        }
      }
    }
  }
  return ips;
};

const localIPs = getLocalIPs();
const allowedDevOrigins = [
  ...localIPs,
  ...localIPs.map(ip => `${ip}:3000`),
  ...localIPs.map(ip => `${ip}:3001`),
  ...localIPs.map(ip => `${ip}:3002`),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  allowedDevOrigins,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // SAMEORIGIN (not DENY) so the resume page can embed its own PDF;
          // still blocks other sites from framing us (clickjacking protection).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" },
        ],
      },
      {
        source: "/assets/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;

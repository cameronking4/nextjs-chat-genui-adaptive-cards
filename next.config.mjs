/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          // Apply these headers to all routes.
          source: '/(.*)',
          headers: [
            // This sets a CSP allowing framing from any domain.
            {
              key: 'Content-Security-Policy',
              value: "frame-ancestors *",
            },
            // Optionally, you can override the X-Frame-Options header if it's being set elsewhere.
            {
              key: 'X-Frame-Options',
              value: 'ALLOWALL',
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  
/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          // Apply these headers to all routes.
          source: '/(.*)',
          headers: [
            // This sets a CSP allowing framing from your own domain and an additional allowed domain.
            {
              key: 'Content-Security-Policy',
              value: "frame-ancestors 'self' https://ciastudio.dev",
            },
            // Optionally, you can override the X-Frame-Options header if it’s being set elsewhere.
            {
              key: 'X-Frame-Options',
              value: 'ALLOW-FROM https://ciastudio.dev',
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  
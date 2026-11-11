// The browser only ever talks to this site's own /api path. Next.js forwards it to the Express server,
// so the login cookie is first-party and the API can live on a completely different server or domain.
// API_PROXY_TARGET is read at build time, so set it before `next build`.
const target = (process.env.API_PROXY_TARGET || 'http://localhost:5000').replace(/\/$/, '');

export default {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },
};

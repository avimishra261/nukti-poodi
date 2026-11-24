/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  ...(isGithubPages
    ? {
        output: 'export',
        basePath: '/nukti-poodi',
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
        env: {
          NEXT_PUBLIC_BASE_PATH: '/nukti-poodi',
        },
      }
    : {
        images: {
          unoptimized: true,
        },
        env: {
          NEXT_PUBLIC_BASE_PATH: '',
        },
      }),
};

export default nextConfig;

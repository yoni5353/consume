/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: [
      "cdn.myanimelist.net",
      "occ-0-1853-1167.1.nflxso.net", // Netflix
      "cdn.akamai.steamstatic.com", "cdn.cloudflare.steamstatic.com", // Steam
      "shortstoryproject.com", // Short Story Project
      "wiki.abidanarchive.com", // Abidan Archive wiki
      "img.youtube.com", // Youtube
      "upload.wikimedia.org", // Wikipedia
    ]
  },

  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};
export default config;

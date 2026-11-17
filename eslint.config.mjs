import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: [".next-internal/**", "media-internal/**"] },
  ...nextVitals,
];

export default config;

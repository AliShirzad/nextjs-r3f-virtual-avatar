/** @type {import('next').NextConfig} */
const nextConfig = {
  // three ships untranspiled ESM that older bundler targets choke on; this
  // keeps the GLTF/FBX loader paths working through the Next compiler.
  transpilePackages: ["three"],
};

export default nextConfig;

//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  preset: "netlify",
  output: {
    dir: ".output",
    serverDir: ".output/server",
    publicDir: ".output/public",
  },
});

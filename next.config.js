const path = require("path");
const withSourceMaps = require("@zeit/next-source-maps");
const withPlugins = require("next-compose-plugins");
const withBundleAnalyzer = require("@zeit/next-bundle-analyzer");
const withReactSvg = require('next-react-svg')
const withFonts = require('nextjs-fonts');

module.exports = withPlugins([
  withFonts,
  withSourceMaps,
  [
    withReactSvg,
    {
      include: path.resolve(__dirname, 'public/assets/svg')
    }
  ],
  [
    withBundleAnalyzer,
    {
      analyzeServer: ["server", "both"].includes(process.env.BUNDLE_ANALYZE),
      analyzeBrowser: ["browser", "both"].includes(process.env.BUNDLE_ANALYZE),
      bundleAnalyzerConfig: {
        server: {
          analyzerMode: "static",
          reportFilename: "../server-analyze.html"
        },
        browser: {
          analyzerMode: "static",
          reportFilename: "client-analyze.html"
        }
      }
    }
  ],
], {
  images: {
    disableStaticImages: true
  }
})
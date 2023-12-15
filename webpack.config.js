const GasPlugin = require("gas-webpack-plugin");

module.exports = {
  // we always use dev mode because bundle size is unimportant - code runs server-side
  mode: "development",
  context: __dirname,
  entry: "./build/index.js",
  output: {
    path: __dirname,
    filename: "Code.js",
  },
  plugins: [
    new GasPlugin({
      autoGlobalExportsFiles: ["./build/index.js"],
    }),
  ],
  devtool: false,
};

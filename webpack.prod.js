const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  devtool: false,  // Обычно в продакшене source maps не нужны
  optimization: {
    minimize: true,
    minimizer: [
      `...`, // расширяет дефолтные минимизаторы (например, Terser для JS)
      new CssMinimizerPlugin(),
    ],
  },
});

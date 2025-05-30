const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // Optimize JavaScript bundling
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: false, // Keep console logs for debugging
            drop_debugger: false, // Keep debugger statements
            pure_funcs: [], // Don't remove any functions
            passes: 1, // Single compression pass
            unused: true, // Remove unused variables
          },
          mangle: {
            safari10: true,
            toplevel: false, // Disable top-level mangling
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        extractComments: false, // Don't extract comments to separate file
        parallel: true,
      }),
    ],
    // Optimize code splitting
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the name of the npm package
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            // Return a nice package name
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
    // Remove unused JavaScript
    usedExports: true,
    // Remove dead code
    sideEffects: true,
  },
  // Generate source maps for debugging
  devtool: 'source-map',
  // Configure module resolution
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Configure module rules
  module: {
    rules: [
      // JavaScript/JSX files
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      // CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      // Image files
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
      },
    ],
  },
};

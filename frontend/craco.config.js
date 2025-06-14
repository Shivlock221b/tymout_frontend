const path = require('path');
const { whenProd } = require('@craco/craco');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Optimize bundle size
      // Use default webpack optimization with minimal customization
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000, // Default value
          maxSize: 0, // No maximum size limit
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          automaticNameDelimiter: '~',
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
        runtimeChunk: 'single',
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
                drop_console: false, // Allow console logs for debugging
                drop_debugger: false, // Allow debugger statements
                pure_funcs: [], // Don't remove any functions
                passes: 1, // Single compression pass
                unused: false, // Don't remove unused variables
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
        usedExports: false, // Disable tree shaking
        sideEffects: false, // Disable tree shaking
      };

      // Disable compression plugin in production for now to debug UI issues
      // whenProd(() => {
      //   webpackConfig.plugins.push(
      //     new CompressionPlugin({
      //       algorithm: 'gzip',
      //       test: /\.(js|css|html|svg)$/,
      //       threshold: 10240,
      //       minRatio: 0.8,
      //     })
      //   );
        
        // Uncomment for bundle analysis
        // webpackConfig.plugins.push(
        //   new BundleAnalyzerPlugin({
        //     analyzerMode: 'static',
        //     reportFilename: 'bundle-report.html',
        //     openAnalyzer: false,
        //   })
        // );
      // });

      return webpackConfig;
    },
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@stores': path.resolve(__dirname, 'src/stores'),
    },
  },
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
};

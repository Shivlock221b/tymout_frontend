const path = require('path');
const { whenProd } = require('@craco/craco');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Apply balanced optimizations
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        // Basic code splitting without aggressive settings
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
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
                // Keep console logs for debugging
                drop_console: false,
                drop_debugger: false,
                // Don't remove any functions
                pure_funcs: [],
                // Single compression pass
                passes: 1,
                // Don't remove unused variables
                unused: false,
              },
              mangle: {
                safari10: true,
                // Disable top-level mangling
                toplevel: false,
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
            extractComments: false,
            parallel: true,
          }),
        ],
        // Disable tree shaking to prevent rendering issues
        usedExports: false,
        sideEffects: false,
      };

      // Add compression plugin in production with safe settings
      whenProd(() => {
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            // Higher threshold to compress fewer files
            threshold: 20480,
            minRatio: 0.9,
          })
        );
      });

      return webpackConfig;
    },
  },
  // Add PostCSS configuration
  style: {
    postcss: {
      plugins: [
        require('autoprefixer'),
      ],
    },
  },
  // Add Jest configuration
  jest: {
    configure: {
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  },
};

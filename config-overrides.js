const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: false,
    https: false,
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    zlib: false,
    path: require.resolve('path-browserify'),
    buffer: require.resolve('buffer'),
    process: false,
    util: false
  };
  
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  config.ignoreWarnings = [
    {
      module: /node_modules/,
    },
    {
      message: /Failed to parse source map/,
    },
  ];

  return config;
};

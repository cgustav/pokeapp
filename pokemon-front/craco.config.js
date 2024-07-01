module.exports = {
  // ...
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.resolve.fallback = {
        fs: false,
        tls: false,
        net: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
        url: false,
        timers: false,
        "crypto-browserify": require.resolve("crypto-browserify"),
      };

      return webpackConfig;
    },
  },
};

module.exports = {
    // Other webpack configuration options...
  
    resolve: {
      fallback: {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        zlib: require.resolve('browserify-zlib'),
        assert: require.resolve('assert/')
      },
    },
  };
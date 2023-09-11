const path = require('path');

module.exports = {
  mode: 'production',
  entry: './ts/index.ts',
  output: {
    path: path.join(__dirname, 'pages/js'),
    filename: 'index.js'
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader'
    }]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'ts/interfaces'),
      '~': path.resolve(__dirname, 'ts/sources')
    },
    modules: ["node_modules"],
    extensions: ['.ts', '.js']
  }
};

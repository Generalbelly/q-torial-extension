const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader')
const { VueLoaderPlugin } = require('vue-loader')
const { version } = require('./package.json')
const Dotenv = require('dotenv-webpack')

const config = {
  mode: process.env.NODE_ENV,
  context: __dirname + '/src',
  entry: {
    background: './background.js',
    contentScript: './contentScript.js',
    driver: './driver.js/index.js',
    spaUrlWatcher: './spaUrlWatcher.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loaders: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.sass$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader?indentedSyntax',
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?emitFile=false',
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyWebpackPlugin([
      { from: 'icons', to: 'icons', ignore: ['icon.xcf'] },
      {
        from:
          process.env.NODE_ENV === 'production'
            ? 'manifest.production.json'
            : process.env.NODE_ENV === 'development'
            ? 'manifest.staging.json'
            : 'manifest.json',
        to: 'manifest.json',
        transform: content => {
          const jsonContent = JSON.parse(content)
          jsonContent.version = version

          if (config.mode === 'development') {
            jsonContent['content_security_policy'] =
              "script-src 'self' 'unsafe-eval'; object-src 'self'"
          }

          return JSON.stringify(jsonContent, null, 2)
        },
      },
    ]),
    new Dotenv({
      path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env', // load this now instead of the ones in '.env'
    }),
  ],
}

console.log(process.env.NODE_ENV)
if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ])
}

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ChromeExtensionReloader(),
  ])
}

module.exports = config

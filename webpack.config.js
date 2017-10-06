const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

var plugins = [
  new ExtractTextPlugin('[name].[contenthash:8].css'), // css file will override generated js file
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      // Disabled because of an issue with Uglify breaking seemingly valid code:
      // https://github.com/facebookincubator/create-react-app/issues/2376
      // Pending further investigation:
      // https://github.com/mishoo/UglifyJS2/issues/2011
      comparisons: false,
    },
    output: {
      comments: false,
      // Turned on because emoji and regex is not minified properly using default
      // https://github.com/facebookincubator/create-react-app/issues/2488
      ascii_only: true,
    },
    sourceMap: false,
  }),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: 'src/index.html',
    inject: 'head',
    minify: { collapseWhitespace: true }
  }),
  new CleanWebpackPlugin(['dist'])
];

module.exports = {
  entry: {
    'index': './src/index.js'
  },
  output: {
    filename: '[name].[chunkhash:8].js',
    path: path.resolve(__dirname, './dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      {
        oneOf: [
          {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: 'css-loader'
            })
          },
          {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
              use: [{
                loader: 'css-loader'
              }, {
                loader: 'sass-loader',
                options: {
                  outputStyle: 'compressed'
                }
              }],
              // use style-loader in development
              fallback: 'style-loader'
            })
          },
          {
            loader: require.resolve('file-loader'),
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            options: {
              name: '[name].[ext]',
            },
          }
        ]
      }
    ],
    loaders: [
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  },
  plugins: plugins,
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, '.')
    ],
    extensions: ['.js', '.css', '.min.js']
  }
};
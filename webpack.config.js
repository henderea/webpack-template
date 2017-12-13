/* global __dirname */
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1);

const cssFilename = '[name].[contenthash:8].css';

const extractTextPluginOptions = shouldUseRelativeAssetPaths
? // Making sure that the publicPath goes back to to build folder.
  { publicPath: Array(cssFilename.split('/').length).join('../') }
: {};


var plugins = [
    new ExtractTextPlugin(cssFilename), // css file will override generated js file
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebookincubator/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false
        },
        output: {
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebookincubator/create-react-app/issues/2488
            ascii_only: true
        },
        sourceMap: true
    }),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: paths.appHtml,
        inject: 'head',
        minify: { collapseWhitespace: true }
    }),
    new CleanWebpackPlugin([paths.appBuild])
];

module.exports = {
    entry: {
        'index': paths.appIndexJs
    },
    output: {
        filename: '[name].[chunkhash:8].js',
        path: paths.appBuild,
        publicPath: publicPath,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: info =>
          path
            .relative(paths.appSrc, info.absoluteResourcePath)
            .replace(/\\/g, '/'),
    },
    devtool: 'source-map',
    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.js$/,
                include: paths.appSrc,
                loader: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                        compact: true
                    }
                }
            },
            {
                oneOf: [
                    {
                        test: /\.css$/,
                        loader: ExtractTextPlugin.extract(Object.assign({
                            fallback: {
                                loader: require.resolve('style-loader'),
                                options: {
                                    hmr: false,
                                },
                            },
                            use: [
                                {
                                    loader: 'css-loader',
                                    options: {
                                        minimize: true,
                                        sourceMap: true,
                                    }
                                }
                            ]
                        }), extractTextPluginOptions)
                    },
                    {
                        test: /\.scss$/,
                        loader: ExtractTextPlugin.extract(Object.assign({
                            use: [
                                {
                                    loader: 'css-loader',
                                    options: {
                                        importLoaders: 1,
                                        minimize: true,
                                        sourceMap: true,
                                    }
                                },
                                {
                                    loader: 'sass-loader',
                                    options: {
                                        outputStyle: 'compressed',
                                        sourceMap: true
                                    }
                                }
                            ],
                            // use style-loader in development
                            fallback: {
                                loader: require.resolve('style-loader'),
                                options: {
                                    hmr: false,
                                },
                            }
                        }), extractTextPluginOptions)
                    },
                    {
                        loader: require.resolve('file-loader'),
                        // Exclude `js` files to keep "css" loader working as it injects
                        // it's runtime that would otherwise processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpack's internal loaders.
                        exclude: [/\.js$/, /\.html$/, /\.json$/],
                        options: {
                            name: '[name].[ext]'
                        }
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
            paths.appNodeModules
        ],
        extensions: ['.js', '.css', '.min.js'],
        plugins: [
          // Prevents users from importing files from outside of src/ (or node_modules/).
          // This often causes confusion because we only process files within src/ with babel.
          // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
          // please link the files into your node_modules/ and let module-resolution kick in.
          // Make sure your source files are compiled, as they will not be processed in any way.
          new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
        ]
    }
};
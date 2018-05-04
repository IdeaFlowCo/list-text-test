const webpack = require('webpack')
const path = require('path')
const rucksack = require('rucksack-css')
const poststylus = require('poststylus')

const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { CheckerPlugin } = require('awesome-typescript-loader')
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const CompressionPlugin = require("compression-webpack-plugin")

const useCodeMinification = false//currentEnvironmentConfig.frontend.useCodeMinification
const useProductionReact = false//useCodeMinification

const exclude = /node_modules/;
const frontendRoot = path.resolve(__dirname, 'src')

const partialConfig = require('./webpack.partialConfig')

// we use source maps everywhere as recommended by Webpack,
// as on production they increase only build time,
// but allow debugging as well
const useSourceMap = true

module.exports = env => {
  const compileModernJS = !!(env.modern)
  const enableExtractCSS = !(env.dev)
  const compress = !(env.dev)
  console.log({
    compileModernJS, enableExtractCSS, useSourceMap,
    useProductionReact, useCodeMinification, compress
  })

  const mode = compileModernJS ? "modern" : "legacy"

  const getStyleLoaders = ({ useStylus, useLess, modules }) => {
    const previousLoaders = useStylus
      ? [{
        loader: 'stylus-loader',
        options: {
          use: poststylus(['autoprefixer', 'rucksack-css']),
          preferPathResolver: 'webpack',
        },
      }]
      : useLess
      ? [{ loader: 'less-loader' }]
      : []

    const cssLoader = {
      loader: 'css-loader',
      options: {
        sourceMap: useSourceMap,
        importLoaders: previousLoaders.length,
      },
    }

    // if we use bare css
    // (that's it, outside of components, like when importing css from node_modules),
    // we should preserve original class names, so modules should not be used
    if (modules) {
      cssLoader.options.modules = true
      cssLoader.options.localIdentName = !!(env.dev)
        ? '[name]__[local]___[hash:base64:5]'
        : '[hash:base64:8]'
    }

    return [
      ...(enableExtractCSS ? [MiniCssExtractPlugin.loader] : [{ loader: 'style-loader' }]),
      cssLoader,
      ...previousLoaders
    ]
  }

  return {
    context: __dirname,
    entry: {
      deps: [
        'react', 'react-dom',
        'classnames', 'immutable', 'isomorphic-fetch', 'moment', 'history', 'he',
        'evolving-immutable', 'redux', 'redux-thunk', 'uuid',
        'react-custom-scrollbars', 'react-resize-detector',
        'react-redux', 'react-router', 'react-popper', 'reactstrap'
        // d3 is intentianally kept out of here, because it is only needed by graph view
        // react-virtualized and draft-js are only needed by list-view
      ],
      frontend: [
        'regenerator-runtime/runtime',
        path.join(frontendRoot,'/index'),
      ]
    },
    output: {
        // [TODO] add this https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.m7h0al8ji
      filename: '[name].[hash:24].bundle.js',
      chunkFilename: '[name].[hash:24].bundle.js',
      path: path.join(__dirname, `./build-frontend-${mode}`),
      publicPath: `/build-frontend-${mode}/`,
    },

    //use source maps for any deployment to be able to debug on production
    devtool: useSourceMap ? 'source-map' : undefined,
    plugins:
      [
        new CheckerPlugin(),
        new MiniCssExtractPlugin({
          filename: "[name]-[chunkhash].css",
          chunkFilename: "[name].css"
        }),
        new HtmlWebpackPlugin({ filename: 'index.html', template: 'index.template.html', chunks: ['deps', 'frontend'] }),
        new webpack.DefinePlugin({
          'process.env': {
            // this is React's brilliant way to switch to production mode that removes some stuff like dev-time checks
            // (we use development version of React everywhere to use the same build pipeline for as much code as possible
            // - this results in less special cases and theoretically makes minification better)
            NODE_ENV: JSON.stringify(useProductionReact ? 'production' : 'development')
          }
        }),
        // This is here to make sure the dynamic `require` call in moment doesn't cause all locales to be packed
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en-gb)$/),
        ...(compress ? [new CompressionPlugin()] : [])
      ],

    optimization: {
      namedModules: true,
      splitChunks: {
        name: 'deps',
        chunks: "all",
        // new webpack.optimize.CommonsChunkPlugin({ names: ['deps'], filename: '[name].[hash:24].bundle.js', chunks: ['frontend'] }),        
      },
      minimize: useCodeMinification,
      minimizer: [new UglifyJsPlugin({
        // check defaults and other possible options here: https://webpack.js.org/plugins/uglifyjs-webpack-plugin/#options
        sourceMap: useSourceMap,
        uglifyOptions: {
          // Right now any other config causes uglify-es to throw "Maximum call stack size exceeded"
          compress: false,
        }
      })]
    },

    module: {
      rules: [
        {
          // Compile the .ts(x) files with typescript only (no need for babel)
          test: /\.tsx?$/,
          use: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                configFileName: 'tsconfig.frontend.json',
                useBabel: true,
                babelCore: "@babel/core",
                babelOptions: { extends: `./.${mode}.babelrc` },
                useCache: true
              }
            }
          ],
        },
        {
          test: /\.jsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                extends: `./.${mode}.babelrc`
              }
            }
          ],
          exclude,
        },
        {
          test: /\.css$/,
          use: getStyleLoaders({ useStylus: false, modules: false }),
        },
        {
          test: /\.styl$/,
          use: getStyleLoaders({ useStylus: true, modules: true }),
        },
        {
          test: /\.less$/,
          use: getStyleLoaders({ useLess: true, modules: false }),
        },

        // optional version suffixes are needed for font-awesome files
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: "url-loader",
              options: { limit: 100, mimetype: "application/font-woff" },
            }
          ],
        },
        {
          test: /\.(ttf|eot|htc)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: "file-loader"
        },

        {
          test: /\.(png|jpg|jpeg|gif|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: "url-loader",
              options: { limit: 100 },
            }
          ]
        },

        // order matters
        {
          test: /\.jsx?$/,
          enforce: 'pre',
          use: ['source-map-loader'],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: _getResolveSection(),

    devServer: {
      headers: { "Access-Control-Allow-Origin": "*" },
      disableHostCheck: true,
      contentBase: './',
    },
  }
}

function _getResolveSection () {

  const resolve = Object.assign({}, partialConfig.resolve)

  //set exact paths for frequently used modules to speed up lookup
  // _setExactResolutionPathForNodeModule(resolve, 'react', 'dist/react.js')
  // _setExactResolutionPathForNodeModule(resolve, 'react-dom', 'dist/react-dom.js')
  _setExactResolutionPathForNodeModule(resolve, 'react-redux', 'es/index.js')

  resolve.extensions.push('.jsx', '.tsx', '.styl')

  //this enables use of partial paths like 'components/...', '~commonStyles/...', etc.
  //placing them in the beginning of 'modules' improves performance, as they are used most frequently
  resolve.modules.unshift(frontendRoot)

  return resolve
}

function _setExactResolutionPathForNodeModule (resolveSection, moduleName, moduleEntryInternalPath) {
  const strictModuleNameRegexp = moduleName + '$'
  resolveSection.alias[strictModuleNameRegexp] = path.resolve(partialConfig.projectNodeModules, moduleName, moduleEntryInternalPath)
}

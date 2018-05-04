const path = require('path')

module.exports = _getPartialConfig()

function _getPartialConfig () {
  const appRoot = __dirname

  const sharedRoot = path.resolve(appRoot, 'shared')
  const projectNodeModules = path.resolve(appRoot, "node_modules")

  const partialConfig = {
    appRoot,
    sharedRoot,
    projectNodeModules,

    resolve: {
      alias: {
        //all other partial paths are resolved via modules (now it's actual for frontend only)
        shared: sharedRoot
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modules: [
        // this directory is not mandatory, but accelerates lookup a bit if placed in the beginning,
        // as it's more specific than 'node_modules', and seems to be used more frequently
        projectNodeModules,

        //this is needed for npm modules that have nested `node_modules` directories and use them
        'node_modules',
      ]
    }
  }

  return partialConfig
}

import { Decoder } from './Decoder.js'
/**
 * @author github.com/tintinweb
 * @license MIT
 *
 *
 * */
import solc from 'solc'
import { solcVersions } from './solcVersions.js'

function getSolidityVersion(source) {
  var rx = /^pragma solidity \^?([^;]+);$/gm
  var arr = rx.exec(source)
  if (!arr || !arr[1]) {
    throw new Error('Cannot parse solidity version')
  }
  let ver = arr[1].split(".").map(f => parseInt(f));
  if((ver[1] > 5) || (ver[1]==5 && ver[2]>=13)){
    return arr[1];
  }
  throw new Error('Solidity versions <= 0.5.13 are not supported :/')
}

class SolidityCompiler {
  constructor() {
    this.storageLayout = undefined
  }

  compile(source, target, solidityVersion) {
    const dynamicDownload = true
    solidityVersion =
      solidityVersion ||
      solcVersions.find(
        (e) => !e.includes('nightly') && e.includes(getSolidityVersion(source))
      )
    console.time('loadCompiler')

    if (dynamicDownload) {
      return new Promise((resolve, reject) => {
        let that = this
        solc.loadRemoteVersion(solidityVersion, function (err, solcSnapshot) {
          console.log("--> ",solidityVersion)
          console.timeEnd('loadCompiler')
          console.time('compileCode')
          // if (err) {
          //   // An error was encountered, display and quit
          //   console.error(err)
          //   return reject(err)
          // }
          var input = {
            language: 'Solidity',
            sources: {
              '': {
                content: source,
              },
            },
            settings: {
              outputSelection: {
                '*': {
                  //
                },
              },
            },
          }

          input.settings.outputSelection['*'][target] = ['storageLayout']
          var output = JSON.parse(solcSnapshot.compile(JSON.stringify(input)))
          // `output` here contains the JSON output as specified in the documentation
          that.storageLayout = output.contracts[''][target].storageLayout
          console.timeEnd('compileCode')
          return resolve(that.storageLayout)
        })
      })
    } else {
      var mySolc = solc.setupMethods(
        require('../solcVersions/soljson-v0.8.2+commit.661d1103.js')
      )
      return new Promise((resolve, reject) => {
        let that = this
        // solc.loadRemoteVersion(solidityVersion, function (err, solcSnapshot) {

        // })
        console.timeEnd('loadCompiler')
        console.time('compileCode')
        // if (err) {
        //   // An error was encountered, display and quit
        //   console.error(err)
        //   return reject(err)
        // }
        var input = {
          language: 'Solidity',
          sources: {
            '': {
              content: source,
            },
          },
          settings: {
            outputSelection: {
              '*': {
                //
              },
            },
          },
        }

        input.settings.outputSelection['*'][target] = ['storageLayout']

        var output = JSON.parse(mySolc.compile(JSON.stringify(input)))
        // `output` here contains the JSON output as specified in the documentation

        that.storageLayout = output.contracts[''][target].storageLayout
        console.timeEnd('compileCode')
        return resolve(that.storageLayout)
      })
    }
  }
}
export { SolidityCompiler }

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
  var rx = /^pragma solidity (\^?[^;]+);$/gm
  let allVersions = source.match(rx).map(e => {
    try {
      return e.match(/(\d+)\.(\d+)\.(\d+)/).splice(1,3).map(a => parseInt(a))
    } catch {}
  })

  //find highest version
  let highestVersion = allVersions.reduce((highest, v) => {
    if(!highest) {
      return v;
    }
    if(v[0]>highest[0]){
      return v;
    } else if(v[0]<highest[0]){
      return highest;
    }
    if(v[1]>highest[1]){
      return v;
    } else if(v[1]<highest[1]){
      return highest;
    }
    if(v[2]>highest[2]){
      return v;
    } else if(v[2]<highest[2]){
      return highest;
    }
    return highest;
  })

  if (!highestVersion) {
    throw new Error('Unable to parse solidity version :/')
  }

  if((highestVersion[0] > 0) || (highestVersion[1] > 5) || (highestVersion[1]==5 && highestVersion[2]>=13)){
    return highestVersion.join(".");
  }
  throw new Error('Unsupported solidity compiler version. Solc before 0.5.13 is not supported :/')
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
    console.time(`loadCompiler: ${solidityVersion}` )

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

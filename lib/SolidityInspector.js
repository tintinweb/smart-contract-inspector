import { Decoder } from './Decoder.js'
/**
 * @author github.com/tintinweb
 * @license MIT
 *
 *
 * */
const web3 = require('web3')

class SolidityInspector {
  constructor(provider, storageLayout, address) {
    this.provider = provider
    this.decoder = new Decoder(this)
    this.storageLayout = storageLayout

    this.tasks = []
  }

  listVars() {
    return this.storageLayout.storage.map((s) => s.label)
  }

  getVars(address) {
    return Promise.all(
      this.storageLayout.storage.map((s) => this.getVar(address, s.label))
    )
  }

  getVar(address, name) {
    let svar = this.storageLayout.storage.find((s) => s.label == name)

    if (!svar) {
      throw new Error('Invalid varname')
    }
    let svarType = this.storageLayout.types[svar.type]

    let that = this
    function _storageAtCurrentAddress(slot) {
      return that.getStorageAt(address, slot)
      //return this.web3.eth.getStorageAt(address, slot);
    }
    return new Promise((resolve, reject) => {
      this.getStorageAt(address, svar.slot).then((slotData) => {
        let resultVar = {
          var: svar,
          type: svarType,
          slotData: slotData,
          decoded: this.decoder.decode(
            svar,
            svarType,
            slotData,
            _storageAtCurrentAddress
          ),
        }

        Promise.all(this.tasks).then(() => {
          this.tasks = []
          return resolve(resultVar)
        })
      })
    })
  }

  getStorageAt(address, slot) {
    return this.provider.getStorageAt(address, web3.utils.toHex(slot))
  }

  
}

export { SolidityInspector}

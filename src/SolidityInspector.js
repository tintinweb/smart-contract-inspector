'use strict';

import {Decoder} from './Decoder.js'
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
import solc from 'solc'
import { solcVersions } from './solcVersions.js'
import web3 from 'web3'

function getSolidityVersion(source) {
    var rx = /^pragma solidity \^?([^;]+);$/gm;
    var arr = rx.exec(source);
    if (!arr || !arr[1]) {
        throw new Error("Cannot parse solidity version");
    }
    return arr[1];
}


class SolidityInspector {

    constructor(provider) {
        this.provider = provider;
        this.decoder = new Decoder(this);
        this.storageLayout = undefined;

        this.tasks = [];
    }

    listVars() {
        return this.storageLayout.storage.map(s => s.label);
    }

    getVars(address) {
        return Promise.all(this.storageLayout.storage.map(s => this.getVar(address, s.label)));
    }

    getVar(address, name) {
        let svar = this.storageLayout.storage.find(s => s.label == name);

        if (!svar) {
            throw new Error("Invalid varname");
        }
        let svarType = this.storageLayout.types[svar.type];

        let that = this;
        function _storageAtCurrentAddress(slot) {
            return that.getStorageAt(address, slot);
            //return this.web3.eth.getStorageAt(address, slot);
        }
        return new Promise((resolve, reject) => {
            this.getStorageAt(address, svar.slot).then(slotData => {
                let resultVar = {
                    var: svar,
                    type: svarType,
                    slotData: slotData,
                    decoded: this.decoder.decode(svar, svarType, slotData, _storageAtCurrentAddress)
                };

                Promise.all(this.tasks).then(() => {
                    this.tasks = [];
                    return resolve(resultVar);
                })
            });
        });
    }

    getStorageAt(address, slot) {
        return this.provider.getStorageAt(address, web3.utils.toHex(slot));
    }

    compile(source, target, solidityVersion) {
        solidityVersion = solidityVersion || solcVersions.find(e => !e.includes("nightly") && e.includes(getSolidityVersion(source)));
        return new Promise((resolve, reject) => {
            let that = this;
            solc.loadRemoteVersion(solidityVersion, function (err, solcSnapshot) {
                if (err) {
                    // An error was encountered, display and quit
                    console.error(err);
                    return reject(err);
                }
                var input = {
                    language: 'Solidity',
                    sources: {
                        '': {
                            content: source,
                        }
                    },
                    settings: {
                        outputSelection: {
                            '*': {
                                //
                            }
                        }
                    }
                };

                input.settings.outputSelection['*'][target] = ['storageLayout'];

                var output = JSON.parse(solcSnapshot.compile(JSON.stringify(input)));
                // `output` here contains the JSON output as specified in the documentation

                that.storageLayout = output.contracts[''][target].storageLayout;
                return resolve(that);
            });
        });
    }


}


// module.exports = {
//     SolidityInspector
// };

export {SolidityInspector}
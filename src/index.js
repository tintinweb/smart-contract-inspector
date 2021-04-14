'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
const solc = require('solc');
const web3 = require('web3');
const {solcVersions} = require('./solcVersions');


function getSolidityVersion(source) {
    var rx = /^pragma solidity \^?([^;]+);$/gm;
    var arr = rx.exec(source);
    if (!arr || !arr[1]) {
        throw new Error("Cannot parse solidity version");
    }
    return arr[1];
}

class Decoder {

    constructor(parent) {
        this.parent = parent;
    }

    decode(svar, svarType, slotData, _storageAtCurrentAddress) {
        let bytes = web3.utils.hexToBytes(slotData);
        let selBytes = bytes.slice(bytes.length - svar.offset - svarType.numberOfBytes, bytes.length - svar.offset) // MSB first
        let result = this.decodeType(selBytes, svar, svarType, _storageAtCurrentAddress);
        result.slotDataSelection = web3.utils.bytesToHex(selBytes);
        return result;
    }

    decodeType(selBytes, svar, svarType, _storageAtCurrentAddress) {
        switch (svarType.encoding) {
            case "inplace":
            case "bytes":
                if (/^(u?int\d+)/.test(svarType.label)) {
                    return {
                        type: svarType.label,
                        value: web3.utils.hexToNumberString(web3.utils.bytesToHex(selBytes))
                    }
                } else if (/^(bytes\d+)/.test(svarType.label)) {
                    return {
                        type: svarType.label,
                        value: web3.utils.bytesToHex(selBytes)
                    }
                } else if (/^(contract\s|enum\s|function\s)/.test(svarType.label)) {
                    return {
                        type: svarType.label,
                        value: web3.utils.bytesToHex(selBytes)
                    }
                } else if (/^(struct\s)/.test(svarType.label)) {
                    let result = []

                    for (let m of svarType.members) {
                        let idxslot = web3.utils.toHex(web3.utils.toBN(svar.slot).add(web3.utils.toBN(m.slot)));
                        let p = new Promise((resolve, reject) => {
                            _storageAtCurrentAddress(idxslot).then(data => {
                                m.slot = idxslot;
                                let decoded = this.decode(m, this.parent.storageLayout.types[m.type], data, _storageAtCurrentAddress);
                                return resolve(decoded)
                            });
                        });
                        result.push(p);
                        this.parent.tasks.push(p)
                    }

                    return {
                        type: svarType.label,
                        value: result
                    }
                }

                switch (svarType.label) {
                    case "address":
                        return {
                            type: svarType.label,
                            value: web3.utils.bytesToHex(selBytes)
                        }
                    case "string":
                        let len = selBytes[selBytes.length - 1] / 2
                        return {
                            type: svarType.label,
                            value: web3.utils.hexToUtf8(web3.utils.bytesToHex(selBytes.slice(0, len)))
                        }
                    case "bool":
                        return {
                            type: svarType.label,
                            value: selBytes[0] ? true : false
                        }
                }
                break;
            case "dynamic_array":
                // data at keccak(slot)+*length
                let length = web3.utils.hexToNumber(web3.utils.bytesToHex(selBytes));
                let nextSlot = web3.utils.soliditySha3(svar.slot)
                let result = [];

                for (let i = 0; i < length; i++) {
                    let idxslot = web3.utils.toHex(web3.utils.toBN(nextSlot).add(web3.utils.toBN(i)));
                    let p = new Promise((resolve, reject) => {
                        _storageAtCurrentAddress(idxslot).then(data => {
                            let decoded = this.decode({ offset: 0, slot: idxslot, index: i, type: svarType.base }, this.parent.storageLayout.types[svarType.base], data, _storageAtCurrentAddress);
                            return resolve(decoded)
                        });
                    });
                    result.push(p);
                    this.parent.tasks.push(p)
                }

                return {
                    type: svarType.label,
                    length: length,
                    value: result
                }
            case "mapping":
                //let length = web3.utils.hexToNumber(web3.utils.bytesToHex(selBytes));


                function getMappingValue(key) {
                    /*
                    let key = {
                        type: 'address',
                        value: '0x437f27592ddbf363bb1a30ee535c7f5cd431a8c9'
                        }
                    */
                    let valueslot = web3.utils.soliditySha3(svar.slot, key)
                    let p = new Promise((resolve, reject) => {
                        _storageAtCurrentAddress(valueslot).then(data => {
                            let decoded = this.decode({ offset: 0, slot: valueslot, type: svarType.value }, this.parent.storageLayout.types[svarType.value], data, _storageAtCurrentAddress);
                            return resolve(decoded)
                        });
                    });
                    this.parent.tasks.push(p)
                    return p;

                }


                return {
                    type: svarType.label,
                    value: getMappingValue
                }
                break; //keccak256(uint256(key) . uint256(slot))

        }

        return {};
    }
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


module.exports = {
    SolidityInspector
};
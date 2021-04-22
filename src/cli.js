'use strict';

/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
// const fs = require('fs');
import * as ethers from 'ethers'

import { SolidityInspector } from './SolidityInspector.js'
import {example} from '../examples/example.js'
import {summarize} from './utils.js'

// const src = fs.readFileSync("./examples/example.sol", { encoding: 'utf8', flag: 'r' });
const src = example
const target = "UniqVesting";
const address = "0x923be051f75b4f5494d45e2ce2dda6abb6c1713b";
const inspector = new SolidityInspector(new ethers.providers.InfuraProvider("homestead", "43a4a59391c94a2cbdfec335591e9f71"));

//https://etherscan.io/address/0x923be051f75b4f5494d45e2ce2dda6abb6c1713b#code

// function summarize(resolvedVars) {
//     let summary = ''
//     resolvedVars.forEach(v => {
//         let value = v.decoded.value;
//         if (typeof value === "function") { value = "<func>" }
//         else if (typeof value === "array") {
//             //fix promises in output :/

//         }
//         // console.log(`${v.decoded.type} ${v.var.label}${v.decoded.length?"["+v.decoded.length+"]":""} = ${value} \t\t// slot(base)=${v.var.slot}`);
//         summary = summary + `${v.decoded.type} ${v.var.label}${v.decoded.length?"["+v.decoded.length+"]":""} = ${value} \t\t// slot(base)=${v.var.slot}\n`
//     })

//     return summary
// }

  export const run = async () => {
    try {
        const c = await inspector.compile(src, target, /*'v0.8.2+commit.661d1103'*/)
        console.log(c.listVars());
        console.log(c.storageLayout);
    
        const results = await c.getVars(address)
    
        console.log(results);
        console.log(results[4].decoded.value);
        console.log(results[7].type.members);
        console.log(results[7].decoded.value);
    
        console.log("=======")
        console.log(await summarize(results))
    } catch(e) {
        console.error(e)
    }
  }
  run().catch(console.error)
  // module.exports.run = run
  // module.exports.summarize = summarize
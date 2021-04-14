'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
const fs = require('fs');
const ethers = require('ethers');
const { SolidityInspector } = require('./index');


const src = fs.readFileSync("./examples/example.sol", { encoding: 'utf8', flag: 'r' });
const target = "UniqVesting";
const address = "0x923be051f75b4f5494d45e2ce2dda6abb6c1713b";
const inspector = new SolidityInspector(new ethers.providers.InfuraProvider("homestead", "43a4a59391c94a2cbdfec335591e9f71"));

//https://etherscan.io/address/0x923be051f75b4f5494d45e2ce2dda6abb6c1713b#code

function summarize(resolvedVars) {
    resolvedVars.forEach(v => {
        let value = v.decoded.value;
        if (typeof value === "function") { value = "<func>" }
        else if (typeof value === "array") {
            //fix promises in output :/

        }
        console.log(`${v.decoded.type} ${v.var.label}${v.decoded.length?"["+v.decoded.length+"]":""} = ${value} \t\t// slot(base)=${v.var.slot}`);
    })
}

inspector.compile(src, target, /*'v0.8.2+commit.661d1103'*/).then((c) => {
    console.log(c.listVars());
    console.log(c.storageLayout);
    c.getVars(address).then(results => {
        console.log(results);
        console.log(results[4].decoded.value);
        console.log(results[7].type.members);
        console.log(results[7].decoded.value);

        console.log("=======")
        summarize(results)
    })
})
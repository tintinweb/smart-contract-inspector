'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
const request = require('request');
const fs = require('fs');

request.get('https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/list.txt', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Continue with your processing here.
        let result = [];
        let re = /^soljson-(.*)\.js$/gm;
        let m;
        while (m = re.exec(body)) {
            result.push(m[1]);
        }
        console.log(`module.exports.solcVersions = ${JSON.stringify(result)};`);
    }  
});

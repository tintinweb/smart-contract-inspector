const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

const ethers = require('ethers');
const { SolidityInspector } = require('../src/index');

const inspector = new SolidityInspector(new ethers.providers.InfuraProvider("homestead", "43a4a59391c94a2cbdfec335591e9f71"));

function summarize(resolvedVars) {
    let result = [];
    for (let v of resolvedVars){
        let value = v.decoded.value;
        if (typeof value === "function") { value = "&lt;func&gt;" }
        else if (typeof value === "array") {
            //fix promises in output :/ 

        }
        result.push(`/* slot ${v.var.slot}*/\t ${v.decoded.type} ${v.var.label}${v.decoded.length?"["+v.decoded.length+"]":""} = ${value}`);
    }
    return result.join("\n")
}


app.use(express.urlencoded({
    extended: true
}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/inspect', function(req, res) {
    const target = req.body.target;
    const src = req.body.source;
    const address = req.body.address; 

    console.log("compile")

    inspector.compile(src, target, /*'v0.8.2+commit.661d1103'*/).then((c) => {
        console.log("finished compiling")
        console.log(c.listVars());
        console.log(c.storageLayout);
        c.getVars(address).then(results => {
            console.log("=======")
            res.send(`<pre>${summarize(results)}</pre>`)
        })
        
    })
});

app.listen(port, () => console.log(`smart contract inspector listening on port ${port}!`));
import '@jest/globals';

import { SolidityInspector } from './SolidityInspector.js'
import ethers from 'ethers'
import { example } from '../examples/example.js'
import { summarize } from './utils.js'

// const src = fs.readFileSync("./examples/example.sol", { encoding: 'utf8', flag: 'r' });
const src = example
const target = 'UniqVesting'
const address = '0x923be051f75b4f5494d45e2ce2dda6abb6c1713b'
const inspector = new SolidityInspector(
  new ethers.providers.InfuraProvider(
    'homestead',
    '43a4a59391c94a2cbdfec335591e9f71'
  )
)

//https://etherscan.io/address/0x923be051f75b4f5494d45e2ce2dda6abb6c1713b#code

test('Should have equal Summary', async () => {
  const expected = [
    'mapping(address => uint256) _bonus = <func>',
    'mapping(address => bool) _initialized = <func>',
    'address owner = 0x2b1cbcd0b1a9e8bcc82e86dd3fd5313d4692aade',
    'address newOwner = 0x0000000000000000000000000000000000000000',
  ]
  const c = await inspector.compile(src, target /*'v0.8.2+commit.661d1103'*/)
  //   console.log(c.listVars())
  //   console.log(c.storageLayout)

  const results = await c.getVars(address)
  const actual = await summarize(results)

  //   console.log(results)
  //   console.log(results[4].decoded.value)
  //   console.log(results[7].type.members)
  //   console.log(results[7].decoded.value)
  console.log("🚀",actual)
  expected.forEach(item => {
    console.log(actual.indexOf(item), item)
    expect(actual.indexOf(item)).not.toBe(-1)
  })

  
})

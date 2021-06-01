'use strict'

/**
 * @author github.com/tintinweb
 * @license MIT
 *
 *
 * */

import * as ethers from 'ethers'

import { SolidityInspector } from './SolidityInspector.js'
import { example } from './example.js'
import { summarize } from './utils.js'

export const run = async () => {
  const src = example
  const target = 'UniqVesting'
  const address = '0x923be051f75b4f5494d45e2ce2dda6abb6c1713b'
  const inspector = new SolidityInspector(
    new ethers.providers.InfuraProvider(
      'homestead',
      '43a4a59391c94a2cbdfec335591e9f71'
    )
  )
  try {
    const c = await inspector.compile(src, target /*'v0.8.2+commit.661d1103'*/)
    console.log(c.listVars())
    console.log(c.storageLayout)

    const results = await c.getVars(address)

    console.log(results)
    console.log(results[4].decoded.value)
    console.log(results[7].type.members)
    console.log(results[7].decoded.value)

    console.log('=======')
    const summary = await summarize(results)
    console.log(summary)
    return summary
  } catch (e) {
    console.error(e)
  }
}

export const runWithParams = async ({ source, target, address }) => {
  
  const inspector = new SolidityInspector(
    new ethers.providers.InfuraProvider(
      'homestead',
      '43a4a59391c94a2cbdfec335591e9f71'
    )
  )
  try {
    const c = await inspector.compile(source, target /*'v0.8.2+commit.661d1103'*/)
    console.log(c.listVars())
    console.log(c.storageLayout)

    const results = await c.getVars(address)

    console.log(results)
    console.log(results[4].decoded.value)
    console.log(results[7].type.members)
    console.log(results[7].decoded.value)

    console.log('=======')
    const summary = await summarize(results)
    console.log(summary)
    return summary
  } catch (e) {
    console.error(e)
  }
}

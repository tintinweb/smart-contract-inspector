import { useLayoutEffect, useState } from 'react'

import {
  ExternalLinkIcon,
} from '@heroicons/react/solid'
import Link from 'next/link'
import SourceCode from './SourceCode'
import axios from 'axios'
import { example } from '../lib/example'

const InputForm = ({ setSummary }) => {
  const [contractAddress, setContractAddress] = useState(
    '923be051f75b4f5494d45e2ce2dda6abb6c1713b'
  )
  const [contractName, setContractName] = useState('UniqVesting')
  const [sourceCode, setSourceCode] = useState(example)

  const handleSubmit = (event) => {
    console.log(contractName, contractAddress, sourceCode)
  }

  const tryFlattenEtherscanResponse = (response) => {
    let rexImports = /^(import\s+)[^;]+/igm
    let result = response;
    try {
      let data = JSON.parse(response)
      let imports = Object.entries(data).map(([name, src]) => [name, src.content.match(rexImports)]);

      let contractsInOrder = imports.filter(([name, imp]) => !imp).map(([name, imp]) => name); //put all SU's with no deps first

      for (let [name, imp] of imports.filter(([name, imp]) => imp)) { //all SU's with deps
        let idx = Math.max(...imp.map(i => contractsInOrder.findIndex(io => i.includes(io))))
        if(idx <=0 || idx +1 > contractsInOrder.length ){
          contractsInOrder.push(name) //push at the end. unclear imports
        } else {
          contractsInOrder.splice(idx+1, 0, name)
        }
      }
      result = contractsInOrder.map(contractName => `/* ${contractName} */\n\n${data[contractName].content.replace(rexImports, "// $& /* disabled by smart-contract-inspector */")}`).join('\n')

    } catch (e) {console.error(e)}
    return result;
  }

  const handleFetchCodeFromEtherscan = async () => {
    try {
      const response = await axios.get(
        `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=0x${contractAddress}`
      )

      if (response?.data?.result?.length && response.data.result.length > 0) {
        const [{ ContractName, SourceCode }] = response.data.result

        if (ContractName) {
          setContractName(ContractName)
        }
        if (SourceCode) {
          setSourceCode(tryFlattenEtherscanResponse(SourceCode))
        }
      }
    } catch (e) {
      console.error('Unable to fetch source code from Etherscan')
      console.debug('Error: ', e)
    }
  }

  const handleGetData = async () => {
    if (window !== undefined) {
      const host = window.location.host
      const endpoint =
        host.indexOf('localhost') > -1
          ? `http://${host}/api/hello`
          : `https://${host}/api/hello`
      try {
        const response = await axios.post(
          endpoint,
          {
            address: '0x' + contractAddress,
            target: contractName,
            source: sourceCode,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        setSummary(response.data.summaryObj)
      } catch (e) {
        console.error(e)
        if(typeof window !=="undefined"){
          alert(`Ooopsie!\n\n${e.response.data.error}`);
        }
      }
    }
  }

  const handleContractAddress = (e) => {
    let address
    if (e.target.value.indexOf('0x') > -1) {
      address = e.target.value.slice(2)
    } else {
      address = e.target.value
    }
    setContractAddress(address)
  }

  const handleClear = () => {
    setContractAddress('')
    setContractName('')
    setSourceCode('')
  }

  const handleOpenEtherscanPopupForContractAddress = async () => {
    window.open(
      'https://etherscan.io/address/' +
        document.getElementById('contract_address').value
    )
  }

  return (
    <div className="mt-8 space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Load Remote Contract
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {`All of this can be usually found at https://etherscan.io/address/{contract address}`}
            </p>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              <b>Note:</b> requires solidity &gt;= 0.5.13
            </p>
          </div>

          <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                Contract Address
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <div className="max-w-lg flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    0x
                  </span>
                  <input
                    value={contractAddress}
                    onChange={handleContractAddress}
                    type="text"
                    name="contract_address"
                    id="contract_address"
                    autoComplete="contract_address"
                    className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                  />
                  <button
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleFetchCodeFromEtherscan}
                  >
                    Load
                  </button>
                  <button
                    className="ml-3 inline-flex bg-white justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleOpenEtherscanPopupForContractAddress}
                  >
                    See in Etherscan
                    <ExternalLinkIcon className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                Contract Name
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <div className="max-w-lg flex rounded-md shadow-sm">
                  <input
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    type="text"
                    name="contract_name"
                    id="contract_name"
                    autoComplete="contract_name"
                    className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                </div>
              </div>
            </div>
            <SourceCode sourceCode={sourceCode} setSourceCode={setSourceCode} />
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            onClick={handleClear}
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear
          </button>
          <button
            onClick={handleGetData}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Inspect!
          </button>
          {/* </Link> */}
        </div>
      </div>
    </div>
  )
}
export default InputForm

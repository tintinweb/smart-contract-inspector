import {
  CalendarIcon,
  ChevronDownIcon,
  VariableIcon,
} from '@heroicons/react/solid'
import { summarizeObj, syntaxHighlight } from '../lib/utils'
import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false })

const MappingValue = ({ variable }) => {
  const [responseValue, setResponseValue] = useState('')
  const [query, setQuery] = useState('')

  const handleUpdate = async () => {
    const decodedValue = await variable.value(query)
    setResponseValue(decodedValue)
  }

  return (
    <div className="mt-2 flex flex-col">
      <div className="flex items-center text-sm text-gray-500">
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            type="text"
            name="q"
            id="q"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter search key"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={handleUpdate}
          type="button"
          className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Search
        </button>
        
      </div>
      <div className="mt-3 ml-3">
      {renderValue({ variable: responseValue, nested:true })}
      </div>
    </div>
  )
}

export const ScalarValue = ({ variable, nested=false }) => {
  if(typeof variable.value !=="boolean" && !variable.value && nested) {
    return null
  }
  return (
    <div className="mt-2 flex">
      <div className="flex items-center text-sm text-gray-500">
        <VariableIcon
          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        <p>{typeof variable.value !== "undefined" ? variable.value.toString() : 'n/a'}</p>
      </div>
    </div>
  )
}

export const ArrayValue = ({ variable }) => {
  return (
    <div className="mt-2 flex">
      <div className="flex items-center text-sm text-gray-500">
        <VariableIcon
          className="self-start flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        <DynamicReactJson 
        name={false} 
        collapsed={true}
        src={variable.value.map(i => 
          {
            delete i.slotDataSelection
            return i
          }
          )} />
      </div>
    </div>
  )
}

const renderValue = ({ variable, nested=false }) => {
  if (typeof variable.value === 'object' && variable.value.length) {
    return <ArrayValue variable={variable} />
  } else if (typeof variable.value === 'function') {
    return <MappingValue variable={variable} />
  } else {
    return <ScalarValue variable={variable} nested={nested}/>
  }
}

const DataVis = ({ data, rpcUrl = undefined, customNetwork }) => {
  const { storageLayout, address } = data
  console.log('Decoding data')
  const [decodedData, setDecodedData] = useState([])

  const decodeData = async () => {
    const { SolidityInspector } = require('../lib/SolidityInspector')
    const ethers = require('ethers')

    var c 
    if(!customNetwork && rpcUrl){
      c = new SolidityInspector(
        new ethers.providers.InfuraProvider(
          'homestead',
          '43a4a59391c94a2cbdfec335591e9f71'
        ),
        storageLayout,
        address
      )
    } else {
      c = new SolidityInspector(
        new ethers.providers.WebSocketProvider (
          rpcUrl
        ),
        storageLayout,
        address
      )
  
    }
    const results = await c.getVars(address)
    const summaryObj = await summarizeObj(results)

   var rawSlotSearchItem = {type: "🔎 slot => bytes32", label: "*** Raw Slot Lookup ***", length:null, slot:"0", value: rawSlotData}

    async function rawSlotData(slot){
      let p = await c.getStorageAt(address, slot);
      return {...rawSlotSearchItem, value: p} ; // return clone
    }

    summaryObj.unshift(rawSlotSearchItem)

    window.summaryObj = summaryObj
    setDecodedData(summaryObj)
  }

  useEffect(decodeData, [])

  return (
    <>
      <div className="pb-5 mb-8 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Decoded Storage Data
        </h3>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {decodedData.map((position) => (
            <li key={Math.floor(Math.random() * 100000000)}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="">
                    <div className="flex text-sm">
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        {position.type}
                      </p>
                      <p className="font-medium text-indigo-600 truncate ml-2">
                        {position.label}
                      </p>
                    </div>
                    {renderValue({ variable: position })}
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0">
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default DataVis

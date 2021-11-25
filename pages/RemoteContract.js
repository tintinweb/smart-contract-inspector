import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { useEffect, useState } from 'react'

import DataVis from '../components/DataVis'
import { FileSelector } from '../components/FileSelector'
/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from 'react'
import InputForm from '../components/InputForm'

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [{ name: 'Dashboard', href: '#', current: true }]
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [summary, setSummary] = useState()
  const [rpcUrl, setRpcUrl] = useState()

  return (
    <div className="py-10">
      <div style={{position:"absolute", top:0, right:0, fontSize:6}}>
        <GatewayInput rpcUrl={rpcUrl} setRpcUrl={setRpcUrl}/>
      </div>
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            🕵️‍♂️ Smart C🔎ntract Inspector
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <InputForm setSummary={setSummary} />
          {summary && <DataVis data={summary} rpcUrl={rpcUrl} />}
        </div>
      </main>
    </div>
  )
}


const GatewayInput = ({rpcUrl, setRpcUrl}) => {
  return (
    <div className="my-8">
      <label
        htmlFor="eth_gateway_url"
        className="block text-sm font-medium text-gray-700"
      >
        (optional) eth node / chain data provider
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        
        <input
          type="text"
          style={{height: "1.5rem"}}
          placeholder="ws://mainnet.infura.io/ws/v3/YOUR-PROJECT-ID" 
          name="eth_gateway_url"
          id="eth_gateway_url"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full  sm:text-sm border-gray-300 rounded-md"
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
        />
      </div>
    </div>
  )
}
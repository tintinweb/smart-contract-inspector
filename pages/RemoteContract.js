import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { useEffect, useState } from 'react'

import DataVis from '../components/DataVis'
import { FileSelector } from '../components/FileSelector'
/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from 'react'
import InputForm from '../components/InputForm'
import { blockExplorers } from '../lib/utils'

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
  const [customRpcUrl, setCustomRpcUrl] = useState('wss://your-custom-rpc-here')
  const [network, setNetwork] = useState('mainnet')
  const [blockExplorerUrl, setBlockExplorerUrl] = useState(
    'https://api.etherscan.io'
  )

  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            🕵️‍♂️ Smart C🔎ntract Inspector
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <InputForm
            setSummary={setSummary}
            customRpcUrl={customRpcUrl}
            setCustomRpcUrl={setCustomRpcUrl}
            network={network}
            setNetwork={setNetwork}
            blockExplorerUrl={blockExplorerUrl}
            setBlockExplorerUrl={setBlockExplorerUrl}
          />
          {summary && (
            <DataVis
              data={summary}
              rpcUrl={customRpcUrl}
              customNetwork={network !== 'mainnet'}
            />
          )}
        </div>
      </main>
    </div>
  )
}

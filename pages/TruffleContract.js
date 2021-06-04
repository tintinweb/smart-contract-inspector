import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { useEffect, useState } from 'react'

import ContractPicker from '../components/ContractPicker'
import DataVis from '../components/DataVis'
import { FileSelector } from '../components/FileSelector'
/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from 'react'
import InputFormTruffle from '../components/InputFormTruffle'
import { getTruffleArtifactContractAddress } from '../lib/utils'

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
  const [contracts, setContracts] = useState([])
  const [selectedContract, setSelectedContract] = useState()

  const onFileChange = async (buildArtifacts = []) => {
    // setBuildArtifacts(buildArtifacts)
    try {
      const buildFileContents = await Promise.all(
        buildArtifacts.map(async (artifactFile) => {
          const fileContent = JSON.parse(await artifactFile.text())
          return fileContent
        })
      )

      const contracts = buildFileContents.map((buildFile) => {
        const { contractName, abi, sourcePath, source, networks } = buildFile
        if (!contractName || !abi || !sourcePath || !source || !networks) {
          throw new Error('Unable to get data from build artifact')
        }
        return { contractName, abi, sourcePath, source, networks }
      })
      setContracts(contracts)
    } catch (e) {
      console.error(e)
    }
  }

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
          <FileSelector onFileChange={onFileChange} />
          <ContractPicker
            contracts={contracts}
            setSelectedContract={setSelectedContract}
          />
          {selectedContract ? <InputFormTruffle
            setSummary={setSummary}
            selectedContractAddress={getTruffleArtifactContractAddress(
              selectedContract
            )}
            selectedContractName={selectedContract.contractName}
            selectedContractSourceCode={selectedContract.source}
          /> : undefined}
          {summary && <DataVis data={summary} />}
        </div>
      </main>
    </div>
  )
}

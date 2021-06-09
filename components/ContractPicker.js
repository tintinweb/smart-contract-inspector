import { useEffect, useState } from 'react'

import { RadioGroup } from '@headlessui/react'
import { fetchNetwork } from '../lib/utils'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ContractPicker({
  contracts,
  setSelectedContract = () => {},
}) {
  const [selected, setSelected] = useState()

  const onChange = (e) => {
    setSelected(e)
    setSelectedContract(e)
    console.log('selected ', e)
  }

  if (!contracts || contracts.length === 0) {
    return <span />
  }

  return (
    <div>
      <div className="mt-8 mb-6 sm:border-b sm:border-gray-200 sm:pb-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Select Contract
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {`All of this can be usually found at https://etherscan.io/address/{contract address}`}
        </p>
      </div>

      <RadioGroup value={selected} onChange={onChange}>
        <RadioGroup.Label className="sr-only">Pricing plans</RadioGroup.Label>
        <div className="relative bg-white rounded-md -space-y-px">
          {contracts.map((plan, planIdx) => (
            <RadioGroup.Option
              key={plan.contractName}
              value={plan}
              className={({ checked }) =>
                classNames(
                  planIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                  planIdx === contracts.length - 1
                    ? 'rounded-bl-md rounded-br-md'
                    : '',
                  checked
                    ? 'bg-indigo-50 border-indigo-200 z-10'
                    : 'border-gray-200',
                  'relative border p-4 flex flex-col cursor-pointer md:pl-4 md:pr-6 md:grid md:grid-cols-2 focus:outline-none'
                )
              }
            >
              {({ active, checked }) => (
                <>
                  <div className="flex items-center text-sm">
                    <span
                      className={classNames(
                        checked
                          ? 'bg-indigo-600 border-transparent'
                          : 'bg-white border-gray-300',
                        active ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
                        'h-4 w-4 rounded-full border flex items-center justify-center'
                      )}
                      aria-hidden="true"
                    >
                      <span className="rounded-full bg-white w-1.5 h-1.5" />
                    </span>
                    <RadioGroup.Label
                      as="span"
                      className="ml-3 font-medium text-gray-900"
                    >
                      {plan.contractName}
                    </RadioGroup.Label>
                  </div>
                  <div className="flex flex-col">
                    <RadioGroup.Description className="ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-left">
                      <span
                        className={
                          checked ? 'text-indigo-700' : 'text-gray-500'
                        }
                      >
                        {fetchNetwork(plan.networks)?.address}
                      </span>
                    </RadioGroup.Description>
                    <RadioGroup.Description
                      className={classNames(
                        checked ? 'text-indigo-700' : 'text-gray-500',
                        'ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-left text-xs'
                      )}
                    >
                      {plan.sourcePath}
                    </RadioGroup.Description>
                  </div>
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

import { useEffect, useState } from 'react'

import { PencilAltIcon } from '@heroicons/react/solid'

const SourceCode = ({ sourceCode, setSourceCode }) => {
  const [editMode, setEditMode] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      if (window.hljs) {
        window.hljs.highlightAll()
      }
    }, 50)
  }, [editMode, sourceCode])

  const toggleEditMode = () => setEditMode(!editMode)

  return (
    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
      <div className="flex flex-row">
        <label
          htmlFor="about"
          className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2 self-end"
        >
          Contract Code
        </label>
        <button
          className="flex items-center mt-2 ml-2"
          onClick={toggleEditMode}
        >
          <PencilAltIcon
            className="h-3 w-3 text-gray-400 text-xs self-end mb-0.5"
            aria-hidden="true"
          />
          <span className="text-xs text-gray-500 font-light self-end">
            Edit source code
          </span>
        </button>
      </div>
      <div className="mt-1 sm:mt-0 sm:col-span-2">
        {editMode ? (
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            id="contract_code"
            name="contract_code"
            rows={sourceCode.split(/\r\n|\r|\n/).length}
            className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs border-gray-300 rounded-md"
            style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                paddingLeft: "1rem",
                lineHeight: "1rem",
                background: "#282c34",
                color: "#abb2bf"

            }}
          />
        ) : (
          <pre>
            <code
              style={{ fontSize: '0.75rem', paddingLeft:"1rem" }}
              className="language-solidity text-xs max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            >
              {sourceCode}
            </code>
          </pre>
        )}
      </div>
    </div>
  )
}

export default SourceCode

import Head from 'next/head'
import { useEffect } from 'react'

export const HighlightJs = ({ onLoad = () => {} }) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.hljs !== undefined) {
        // hljs is loaded and we can return
        window.hljs.registerLanguage('solidity', window.hljsDefineSolidity)
        onLoad()
        clearInterval(intervalId)
      }
    }, 200) // in milliseconds
    return () => clearInterval(intervalId)
  }, [])

  return (
    <Head>
      <link
        rel="stylesheet"
        // href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.1/styles/default.min.css"
        href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.1/styles/atom-one-dark.min.css"
      />
      <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.1/highlight.min.js"></script>
      <script src="/solidity.js"></script>
    </Head>
  )
}

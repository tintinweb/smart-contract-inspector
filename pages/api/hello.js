import { SolidityCompiler } from '../../lib/SolidityCompiler'
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// export default (req, res) => {
//   res.status(200).json({ name: 'John Doe' })
// }

export default async (req, res) => {
  console.time('http-request')
  console.time('http-request-1')
  if (req.method === 'POST') {
    console.log("👌 I'm the server")
    const { body } = req
    const { source, target, address } = body
    console.timeEnd('http-request-1')
    let summaryObj
  
    console.time('http-request-2')
    
    const compiler = new SolidityCompiler()
    console.timeEnd('http-request-2')
    
    try {
      console.time('compile')
      const storageLayout = await compiler.compile(
        source,
        target /*'v0.8.2+commit.661d1103'*/
      )
      console.timeEnd('compile')

      console.time('http-request-3')
      res.status(200).json({ summaryObj: {storageLayout, address} })
      console.timeEnd('http-request-3')
      console.timeEnd('http-request')
    } catch (e) {
      console.error(e)
    }
  } else {
    res.status(404).json({ })
  }
  
}

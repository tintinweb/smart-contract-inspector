export async function summarize(resolvedVars) {
  let summary = ''
  try {
    for (let v of resolvedVars) {
      let value = v.decoded.value
      if (typeof value === 'function') {
        value = '<func>'
      } else if (typeof value === 'object' && value.length) {
        //fix promises in output :/
        value = JSON.stringify(await Promise.all(v.decoded.value), null, 2)
      }
      summary =
        summary +
        `${v.decoded.type} ${v.var.label}${
          v.decoded.length ? '[' + v.decoded.length + ']' : ''
        } = ${value} \t\t// slot(base)=${v.var.slot}\n`
    }

    return summary
  } catch (e) {
    console.error(e)
  }
}

// module.exports.summarize = summarize

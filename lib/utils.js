let inspector

export const getInspector = () => {
  if (inspector === undefined) {
    const { SolidityInspector } = require('./SolidityInspector.js')
    const ethers = require('ethers')
    inspector = new SolidityInspector(
      new ethers.providers.InfuraProvider(
        'homestead',
        '43a4a59391c94a2cbdfec335591e9f71'
      )
    )
  }
  return inspector
}

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

export async function summarizeObj_old(resolvedVars) {
  let summary = []
  let getValue
  try {
    for (let v of resolvedVars) {
      let value = v.decoded.value
      if (typeof value === 'function') {
        value = '<func>'
      } else if (typeof value === 'object' && value.length) {
        value = JSON.stringify(await Promise.all(v.decoded.value), null, 2)
      }
      const newItem = {
        type: v.decoded.type,
        label: v.var.label,
        length: v.decoded.length ? v.decoded.length : null,
        slot: v.var.slot,
        value,
      }
      summary = [...summary, newItem]
    }

    return summary
  } catch (e) {
    console.error(e)
  }
}

export async function summarizeObj(resolvedVars) {
  let summary = []
  let getValue
  try {
    for (let v of resolvedVars) {
      let value = v.decoded.value
      // if (typeof value === 'function') {
      //   value = '<func>'
      if (typeof value === 'object' && value.length) {
        value = await Promise.all(v.decoded.value)
      }
      const newItem = {
        type: v.decoded.type,
        label: v.var.label,
        length: v.decoded.length ? v.decoded.length : null,
        slot: v.var.slot,
        value,
      }
      summary = [...summary, newItem]
    }

    return summary
  } catch (e) {
    console.error(e)
  }
}

export const syntaxHighlight = (json) => {
  if (typeof json != 'string') {
       json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'key';
          } else {
              cls = 'string';
          }
      } else if (/true|false/.test(match)) {
          cls = 'boolean';
      } else if (/null/.test(match)) {
          cls = 'null';
      }
      return <span class={cls}>match</span>;
  });
}
// Custom replacer function for JSON.stringify
const replacer = (_: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString() + 'n'
  }
  return value
}

// Custom reviver function for JSON.parse
const reviver = (_: string, value: any) => {
  if (typeof value === 'string' && /^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1))
  }
  return value
}

export const stringifyJSON = (obj: any): string => JSON.stringify(obj, replacer)
export const parseJSON = (json: string): any => JSON.parse(json, reviver)

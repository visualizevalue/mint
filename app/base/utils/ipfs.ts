import { CID } from 'multiformats/cid'

export const validateCID = (cid: string): string|false => {
  try {
    const parsed = CID.parse(cid)

    return parsed.toString()
  } catch (e) {
    console.warn(`Invalid CID`)

    return false
  }
}

export const getValidIpfsURI = (cid: string): string => {
  const validated = validateCID(cid)

  return validated ? `ipfs://${validated}` : ''
}

export const ipfsToHttpURI = (
  url: string,
  gateway: string = 'https://ipfs.io/ipfs/'
) => url
  .replace('https://ipfs.io/ipfs/', gateway)
  .replace('ipfs://', gateway)


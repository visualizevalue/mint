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

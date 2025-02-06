export const validateArweaveTx = (tx: string): string|false => {
  return tx
}

export const getValidArweaveURI = (tx: string): string => {
  const validated = validateArweaveTx(tx)

  return validated ? `ipfs://${validated}` : ''
}

export const arweaveToHttpURI = (url: string, gateway: string = 'https://arweave.net/') => url.replace('ar://', gateway)


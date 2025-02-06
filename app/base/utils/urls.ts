type UrlValidationConfig = {
  ipfsGateway?: string,
  arweaveGateway?: string,
}

export const validateURI = (url: string, config: UrlValidationConfig = {}) => {
  if (! url || ! url.length) return false

  let validated = url.trim()

  // Normalize protocol
  // if (validated.startsWith('ipfs://') || validated.contains('ipfs')) {
  if (validated.indexOf('ipfs') > -1) {
    validated = ipfsToHttpURI(validated, config.ipfsGateway)
  }
  if (validated.startsWith('ar://')) {
    validated = arweaveToHttpURI(validated, config.arweaveGateway)
  }
  if (! validated.startsWith('data:') && ! validated.startsWith('http')) {
    validated = `https://${validated}`
  }

  // Check url validity
  try {
    new URL(validated)
  } catch (e) {
    return false
  }

  return validated
}

export const getMainDomain = (url: string) => {
  const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/\n]+)/i
  const match = url.match(regex)
  return match ? match[1] : null
}

export const getFirstSubpath = (url: string) => {
  try {
    // This will throw an error if the URL is not valid
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname

    // Remove the leading slash and split by slash to get path segments
    const pathSegments = pathname.replace(/^\//, '').split('/')

    // Return the first path segment, if there is one
    return pathSegments.length > 0 ? pathSegments[0] : null
  } catch (e) {
    // The URL is invalid
    return null
  }
}

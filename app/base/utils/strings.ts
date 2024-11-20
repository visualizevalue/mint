export const pluralize = (word: string, count: number): string => {
  if (count === 1) return word

  // Basic rules for pluralization
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies'
  } else if (word.endsWith('s') || word.endsWith('ch') || word.endsWith('sh') || word.endsWith('x')) {
    return word + 'es'
  } else {
    return word + 's'
  }
}

export const cleanText = (str: string) => str?.replace(/<[^>]*>?/gm, '').trim() || ''

export const shortenedCleanText = (str: string, length: number = 80) => {
  const txt = cleanText(str)

  const nextSpaceIndex = txt.indexOf(' ', length)

  return txt.length > length && nextSpaceIndex > 0 ? txt.substring(0, nextSpaceIndex) + '...' : txt
}

const urlPattern = /\b((http|https):\/\/)?(www\.)?([a-zA-Z0-9\-\.]+)\.([a-zA-Z]{2,})(\/[^\s]*)?\b/g
export const extractURLs = (str: string) => {
  return {
    text: str.replace(urlPattern, ''),
    urls: str.match(urlPattern),
  }
}

// Replace special characters with their escaped counterparts
export const sanitizeForJson = (input: string): string => JSON.stringify(input).slice(1, -1)

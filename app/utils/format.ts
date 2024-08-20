import { formatEther, formatGwei } from 'viem'

export const formatNumber = (i: number) => i?.toLocaleString('en-US')

export const toFloat = (number: string, digits: number = 2) => parseFloat(number).toFixed(digits)

export const roundNumber = (number: string) => parseInt(Math.round(parseFloat(number)).toString())

export const shortString = (str: string, max: number = 40, length: number = 10) => str?.length > max
  ? (
    str.substring(0, length + 2) +
    '...' +
    str.substring(str.length - length)
  ) : str

export const shortAddress = (address: string, length: number = 4) => shortString(address, 8, length)

export const customGweiFormat = (price: bigint) => price > 20000000000n
  ? roundNumber(formatGwei(price))
  : toFloat(formatGwei(price), 1)

export const customFormatEther = (value: bigint) => {
  const format = value > 10_000_000_000_000_000n ? 'ETH' : 'GWEI'

  const formatted = format === 'ETH'
    ? formatEther(value)
    : customGweiFormat(value)

  return {
    value: formatted,
    format,
  }
}

interface FormattedSize {
  B: string
  KB: string
  MB: string
}

export const formatBytesObject = (bytes: number): FormattedSize => {
  const KB = bytes / 1024
  const MB = KB / 1024

  return {
    B: bytes.toLocaleString('en-US'),
    KB: KB.toLocaleString('en-US', { maximumFractionDigits: 2 }),
    MB: MB.toLocaleString('en-US', { maximumFractionDigits: 2 }),
  }
}

export const formatBytes = (bytes: number): string => {
  const formatted = formatBytesObject(bytes)

  if (bytes < 1024) {
    return `${formatted.B} B`
  } else if (bytes < 1024 * 1024) {
    return `${formatted.KB} KB`
  } else {
    return `${formatted.MB} MB`
  }
}

import { formatEther, formatGwei } from 'viem'

export const formatNumber = (i: number, digits?: number) => i?.toLocaleString('en-US', { maximumFractionDigits: digits })

export const toFloat = (number: string, digits: number = 2) => parseFloat(number).toFixed(digits)

export const roundNumber = (number: string) => parseInt(Math.round(parseFloat(number)).toString())

export const shortString = (str: string, max: number = 40, length: number = 10) => str?.length > max
  ? str.substring(0, length) + '...' : str

export const shortAddress = (address: string, length: number = 3) => address.substring(0, length + 2) +
  '...' +
  address.substring(address.length - length)

export const customGweiFormat = (price: bigint, digits?: number) => price > 20000000000n
  ? formatNumber(roundNumber(formatGwei(price)), digits)
  : formatNumber(parseFloat(formatGwei(price)), digits)

export const customFormatEther = (value: bigint, digits: number = 4) => {
  const format = value > 100_000_000_000_000n ? 'ETH' : 'GWEI'

  const formatted = format === 'ETH'
    ? formatNumber(parseFloat(formatEther(value)), digits)
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

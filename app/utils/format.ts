import { formatEther, formatGwei } from 'viem'

export const formatNumber = (i: number) => i?.toLocaleString('en-US')

export const toFloat = (number: string, digits: number = 2) => parseFloat(number).toFixed(digits)

export const roundNumber = (number: string) => parseInt(Math.round(parseFloat(number)).toString())

export const shortAddress = (address: string, length = 4) => address &&
  (
    address.substring(0, length + 2) +
    '...' +
    address.substring(address.length - length)
  ) || ''

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

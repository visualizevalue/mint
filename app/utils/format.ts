export const formatNumber = (i: number) => i?.toLocaleString('en-US')

export const toFloat = (number: string, digits: number = 2) => parseFloat(number).toFixed(digits)

export const shortAddress = (address: string, length = 4) => address &&
  (
    address.substring(0, length + 2) +
    '...' +
    address.substring(address.length - length)
  ) || ''

import { toBytes, toHex } from 'viem'

const MAX_BYTES = 24575

export function toByteArray (input: string, maxItemSize: number = MAX_BYTES): `0x${string}`[] {
  const inputBytes = toBytes(input)
  const chunks: `0x${string}`[] = []

  for (let i = 0; i < inputBytes.length; i += maxItemSize) {
    chunks.push(toHex(inputBytes.slice(i, i + maxItemSize)))
  }

  return chunks
}

export function chunkArray<T> (array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

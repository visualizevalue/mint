import { toBytes, toHex } from 'viem'

const MAX_BYTES = 24576

export const splitIntoChunks = (input: string, maxChunkSize: number = MAX_BYTES): `0x${string}`[] => {
  const inputBytes = toBytes(input)
  const chunks: `0x${string}`[] = []

  for (let i = 0; i < inputBytes.length; i += maxChunkSize) {
    chunks.push(toHex(inputBytes.slice(i, i + maxChunkSize)))
  }

  return chunks
}

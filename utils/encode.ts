import { encodeAbiParameters } from 'viem'

export const encodeTokenMetadata = (name: string, description: string) => encodeAbiParameters(
  [
    { name: 'name', type: 'string' },
    { name: 'description', type: 'string' },
  ],
  [name, description]
)


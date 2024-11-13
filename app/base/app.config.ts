export default defineAppConfig({
  knownRenderers: {
    // Mainnet
    1: [
      {
        component: 'P5',
        name: 'P5 Renderer',
        version: 1n,
        address: '0x32B8Ffa14e7F77c252b6D43BEC5498FCef2b205F',
        description: 'Allows using P5 scripts as the artifact content'
      },
    ],
    // Sepolia
    11155111: [
      {
        component: 'P5',
        name: 'P5 Renderer (Sepolia)',
        version: 1n,
        address: '0xfaDF2fB2F8a15Fc830c176B71D2c905E95f4169e',
        description: 'Allows using P5 scripts as the artifact content'
      },
    ],
  }
})


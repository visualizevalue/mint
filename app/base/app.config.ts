export default defineAppConfig({
  knownRenderers: {
    // Mainnet
    1: [
      {
        component: 'P5',
        name: 'P5 Renderer',
        version: 1n,
        address: '0x32b8ffa14e7f77c252b6d43bec5498fcef2b205f',
        description: 'Allows using P5 scripts as the artifact content'
      },
      // {
      //   component: 'Animation',
      //   name: 'Animation Renderer',
      //   version: 1n,
      //   address: '', // TODO: Deploy...
      //   description: 'Allows linking to both an image and an animation url'
      // },
    ],
    // Sepolia
    11155111: [
      {
        component: 'P5',
        name: 'P5 Renderer (Sepolia)',
        version: 1n,
        address: '0xfadf2fb2f8a15fc830c176b71d2c905e95f4169e',
        description: 'Allows using P5 scripts as the artifact content'
      },
      {
        component: 'Animation',
        name: 'Animation Renderer',
        version: 1n,
        address: '0xeeaf428251c477002d52c69e022b357a91f36517',
        description: 'Allows linking to both an image and an animation url'
      },
    ],
  }
})


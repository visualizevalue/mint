export default defineAppConfig({
  knownRenderers: {
    // Mainnet
    1: [
      {
        component: 'P5',
        name: 'P5 Renderer [Deprecated]',
        version: 1n,
        address: '0x32b8ffa14e7f77c252b6d43bec5498fcef2b205f',
        description: 'Allows using P5 scripts as the artifact content. Deprecated: Please use V2'
      },
      {
        component: 'P5',
        name: 'P5 Renderer',
        version: 2n,
        address: '0xbf42cabb7d46bfa290dcc6223477c6afe6a83174',
        description: 'Allows using P5 scripts as the artifact content'
      },
      {
        component: 'Animation',
        name: 'Animation Renderer',
        version: 1n,
        address: '0xcb681409046e45e6187ec2205498e4adbe19749c',
        description: 'Allows linking to both an image and an animation url'
      },
    ],
    // Sepolia
    11155111: [
      {
        component: 'P5',
        name: 'P5 Renderer (Sepolia) [Deprecated]',
        version: 1n,
        address: '0xfadf2fb2f8a15fc830c176b71d2c905e95f4169e',
        description: 'Allows using P5 scripts as the artifact content. Deprecated: Please use V2'
      },
      {
        component: 'P5',
        name: 'P5 Renderer (Sepolia)',
        version: 2n,
        address: '0x55b69a4f2db99417c1b211151181ed48b39df438',
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


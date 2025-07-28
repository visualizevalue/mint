export default defineAppConfig({
  knownRenderers: {
    // Mainnet
    1: [
      {
        component: 'Base',
        name: 'Base Renderer',
        version: 1n,
        address: '0xe5d2da253c7d4b7609afce15332bb1a1fb461d09',
        description: 'The default renderer',
      },
      {
        component: 'P5',
        name: 'P5 Renderer',
        version: 2n,
        address: '0xbf42cabb7d46bfa290dcc6223477c6afe6a83174',
        description: 'Allows using P5 scripts as the artifact content',
      },
      {
        component: 'Animation',
        name: 'Animation Renderer',
        version: 1n,
        address: '0xcb681409046e45e6187ec2205498e4adbe19749c',
        description: 'Allows linking to both an image and an animation url',
      },
      {
        component: 'P5',
        name: 'P5 Renderer',
        version: 1n,
        address: '0x32b8ffa14e7f77c252b6d43bec5498fcef2b205f',
        description: 'Allows using P5 scripts as the artifact content.',
        deprecated: true,
      },
    ],
    // Sepolia
    11155111: [
      {
        component: 'Base',
        name: 'Base Renderer',
        version: 1n,
        address: '0x901603b81aae5eb2a1dc3cec77280bf6e4727bfe',
        description: 'The default renderer',
      },
      {
        component: 'P5',
        name: 'P5 Renderer (Sepolia)',
        version: 2n,
        address: '0x55b69a4f2db99417c1b211151181ed48b39df438',
        description: 'Allows using P5 scripts as the artifact content',
      },
      {
        component: 'Animation',
        name: 'Animation Renderer',
        version: 1n,
        address: '0xeeaf428251c477002d52c69e022b357a91f36517',
        description: 'Allows linking to both an image and an animation url',
      },
      {
        component: 'P5',
        name: 'P5 Renderer (Sepolia)',
        version: 1n,
        address: '0xfadf2fb2f8a15fc830c176b71d2c905e95f4169e',
        description: 'Allows using P5 scripts as the artifact content.',
        deprecated: true,
      },
    ],
  },
})

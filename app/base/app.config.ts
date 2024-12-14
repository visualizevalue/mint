export default defineAppConfig({
  knownRenderers: {
    // Mainnet
    1: [
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
      {
        component: 'P5',
        name: 'P5 Renderer',
        version: 1n,
        address: '0x32b8ffa14e7f77c252b6d43bec5498fcef2b205f',
        description: 'Allows using P5 scripts as the artifact content.',
        deprecated: true,
      },
    ],
    // Optimism Mainnet
    10: [
      {
        component: 'P5',
        name: 'P5 Renderer',
        version: 2n,
        address: '0xA06eC430a54a8210627cF04790a9Ca2Ad35512E2',
        description: 'Allows using P5 scripts as the artifact content'
      },
      {
        component: 'Animation',
        name: 'Animation Renderer',
        version: 1n,
        address: '0x5651c5F2299600337Cb2aBFc5f5D3c97e039C931',
        description: 'Allows linking to both an image and an animation url'
      },
      {
        component: 'P5',
        name: 'P5 Renderer',
        version: 1n,
        address: '0xDE64153f65c5F2a4e6f49321D29B7095DFd7C626',
        description: 'Allows using P5 scripts as the artifact content.',
        deprecated: true,
      },
    ],
    // Sepolia
    11155111: [
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
      {
        component: 'P5',
        name: 'P5 Renderer (Sepolia)',
        version: 1n,
        address: '0xfadf2fb2f8a15fc830c176b71d2c905e95f4169e',
        description: 'Allows using P5 scripts as the artifact content.',
        deprecated: true,
      },
    ],
    // Holesky
    17000: [
      {
        component: 'P5',
        name: 'P5 Renderer (Holesky)',
        version: 2n,
        address: '0x0Aa39c98FBE578e442D91CeDB8B59aaA0A21E2b6',
        description: 'Allows using P5 scripts as the artifact content'
      },
      {
        component: 'Animation',
        name: 'Animation Renderer',
        version: 1n,
        address: '0x3E88db5d08ee1D040733bA560968f0BC5aAB859D',
        description: 'Allows linking to both an image and an animation url'
      },
      {
        component: 'P5',
        name: 'P5 Renderer (Holesky)',
        version: 1n,
        address: '0x8a0A2Aa2E0D259229A9D259065cE5B3E2EC32919',
        description: 'Allows using P5 scripts as the artifact content.',
        deprecated: true,
      },
    ],
  }
})


import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const FactoryModule = buildModule('Factory', (m) => {
  const contractMetadataRenderer = m.contract('ContractMetadata')

  const factory = m.contract('Factory', [], {
    libraries: {
      ContractMetadata: contractMetadataRenderer,
    },
    // gasMultiplier: 2,
  })

  return { factory }
})

export default FactoryModule

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const FactoryModule = buildModule('ContractMetadata', (m) => {
  const contractMetadataRenderer = m.library('ContractMetadata')

  return { contractMetadataRenderer }
})

export default FactoryModule

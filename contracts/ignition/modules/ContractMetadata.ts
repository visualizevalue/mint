import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const ContractMetadata = buildModule('ContractMetadata', (m) => {
  const contractMetadataRenderer = m.library('ContractMetadata')

  return { contractMetadataRenderer }
})

export default ContractMetadata

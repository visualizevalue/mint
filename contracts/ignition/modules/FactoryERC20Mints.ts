import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const FactoryERC20MintsModule = buildModule('FactoryERC20Mints', (m) => {
  // Prepare base contracts
  const contractMetadata = m.contractAt('ContractMetadata', m.getParameter('contractMetadata'))
  const artifactReader = m.contractAt('ArtifactReader', m.getParameter('artifactReader'))
  const renderer = m.contractAt('Renderer', m.getParameter('renderer'))

  // Deploy the factory for MintViaERC20 contracts
  const factoryERC20Mints = m.contract('FactoryERC20Mints', [renderer], {
    libraries: {
      ContractMetadata: contractMetadata,
    },
  })

  return {
    factoryERC20Mints,
    artifactReader,
    renderer
  }
})

export default FactoryERC20MintsModule

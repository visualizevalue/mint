import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { toByteArray } from '@visualizevalue/mint-utils'
import { LOGO, VV } from '../../test/constants'

const FactoryERC20MintsModule = buildModule('FactoryERC20Mints', (m) => {
  // Prepare base contracts
  const contractMetadata = m.contractAt('ContractMetadata', m.getParameter('contractMetadata'))
  const artifactReader = m.contractAt('ArtifactReader', m.getParameter('artifactReader'))
  const renderer = m.contractAt('Renderer', m.getParameter('renderer'))

  const mint = m.contract('MintViaERC20', [], {
    libraries: {
      ContractMetadata: contractMetadata,
    }
  })
  m.call(mint, 'init', ['Mint via ERC20', 'MINT20', '', toByteArray(LOGO), renderer, VV])

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

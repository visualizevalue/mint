import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { toByteArray } from '@visualizevalue/mint-utils'
import { ICON } from '../../test/constants'

const FactoryModule = buildModule('Factory', (m) => {
  const contractMetadata = m.contract('ContractMetadata')
  const renderer = m.contract('Renderer')

  const mint = m.contract('Mint', [], {
    libraries: {
      ContractMetadata: contractMetadata,
    },
    after: [contractMetadata, renderer]
  })
  m.call(mint, 'init', ['VV Mint', 'VVM', '', toByteArray(ICON), renderer, m.getAccount(0)])

  const factory = m.contract('Factory', [mint, renderer], {
    libraries: {
      ContractMetadata: contractMetadata,
    },
    after: [renderer, contractMetadata]
  })

  return { factory, mint, renderer, contractMetadata }
})

export default FactoryModule

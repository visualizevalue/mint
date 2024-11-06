import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import FactoryModule from './Factory'

const P5RendererModule = buildModule('P5Renderer', (m) => {
  const { storageReader } = m.useModule(FactoryModule)

  const renderer = m.contract('P5Renderer', [], {
    libraries: {
      StorageReader: storageReader,
    }
  })

  return { renderer }
})

export default P5RendererModule

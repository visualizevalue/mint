import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import FactoryModule from './Factory.js'

const P5RendererModule = buildModule('P5Renderer', (m) => {
  const { artifactReader } = m.useModule(FactoryModule)

  const renderer = m.contract('P5Renderer', [], {
    libraries: {
      ArtifactReader: artifactReader,
    }
  })

  return { renderer }
})

export default P5RendererModule

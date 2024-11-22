import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import FactoryModule from './Factory'

const P5RendererV2Module = buildModule('P5RendererV2', (m) => {
  const artifactReader = m.contractAt('ArtifactReader', m.getParameter('artifactReader'))

  const rendererV2 = m.contract('P5RendererV2', [], {
    libraries: {
      ArtifactReader: artifactReader,
    }
  })

  return { rendererV2 }
})

export default P5RendererV2Module

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import FactoryModule from './Factory.js'

const AnimationRendererModule = buildModule('AnimationRenderer', (m) => {
  const artifactReader = m.contractAt('ArtifactReader', m.getParameter('artifactReader'))

  const renderer = m.contract('AnimationRenderer', [], {
    libraries: {
      ArtifactReader: artifactReader,
    }
  })

  return { renderer }
})

export default AnimationRendererModule

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import FactoryModule from './Factory'

const AnimationRendererModule = buildModule('AnimationRenderer', (m) => {
  const { artifactReader } = m.useModule(FactoryModule)

  const renderer = m.contract('AnimationRenderer', [], {
    libraries: {
      ArtifactReader: artifactReader,
    }
  })

  return { renderer }
})

export default AnimationRendererModule

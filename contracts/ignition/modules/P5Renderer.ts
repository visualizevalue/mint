import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const P5RendererModule = buildModule('P5Renderer', (m) => {
  const artifactReader = m.contract('ArtifactReader')
  const renderer = m.contract('P5Renderer', [], {
    libraries: {
      ArtifactReader: artifactReader,
    }
  })

  return { renderer }
})

export default P5RendererModule

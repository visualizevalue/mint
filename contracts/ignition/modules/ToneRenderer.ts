import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const ToneRendererModule = buildModule('ToneRenderer', (m) => {
  const artifactReader = m.contractAt('ArtifactReader', m.getParameter('artifactReader'))

  const renderer = m.contract('ToneRenderer', [], {
    libraries: {
      ArtifactReader: artifactReader,
    }
  })

  return { renderer }
})

export default ToneRendererModule

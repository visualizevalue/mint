import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const MarkdownRendererModule = buildModule('MarkdownRenderer', (m) => {
  const artifactReader = m.contractAt('ArtifactReader', m.getParameter('artifactReader'))

  const renderer = m.contract('MarkdownRenderer', [], {
    libraries: {
      ArtifactReader: artifactReader,
    }
  })

  return { renderer }
})

export default MarkdownRendererModule

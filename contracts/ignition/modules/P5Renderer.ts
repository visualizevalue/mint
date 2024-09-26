import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const P5RendererModule = buildModule('P5Renderer', (m) => {
  const renderer = m.contract('P5Renderer')

  return { renderer }
})

export default P5RendererModule

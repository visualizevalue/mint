import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const RendererModule = buildModule('Renderer', (m) => {
  const renderer = m.contract('Renderer')

  return { renderer }
})

export default RendererModule

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const FactoryModule = buildModule('Renderer', (m) => {
  const renderer = m.contract('Renderer')

  return { renderer }
})

export default FactoryModule

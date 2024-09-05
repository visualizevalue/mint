import { useBreakpoints as useBreakpointsCore } from '@vueuse/core'

export const breakpointConfig = {
  xs: 431,
  sm: 719,
  md: 1023,
}

export const useBreakpoints = () => {
  return useBreakpointsCore(breakpointConfig)
}

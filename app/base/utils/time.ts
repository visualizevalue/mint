import { BLOCK_TIME, BLOCKS_PER_CACHE, BLOCKS_PER_HOUR, BLOCKS_PER_DAY } from '@visualizevalue/mint-utils/time'
import { blocksToSeconds, delay, nowInSeconds, secondsToBlocks } from '@visualizevalue/mint-utils'

export {
  BLOCK_TIME, BLOCKS_PER_CACHE, BLOCKS_PER_HOUR, BLOCKS_PER_DAY,
  blocksToSeconds, delay, nowInSeconds, secondsToBlocks,
}

const now = ref(nowInSeconds())
let nowInterval: NodeJS.Timeout
export const useNow = () => {
  onMounted(() => {
    if (! nowInterval) {
      nowInterval = setInterval(() => {
        now.value = nowInSeconds()
      }, 1000)
    }
  })

  return now
}

export const useCountDown = (s: Ref<Number|BigInt>) => {
  const duration = computed(() => Math.abs(parseInt(`${s.value}`)))

  const seconds = computed(() => duration.value % 60)
  const minutes = computed(() => Math.floor(duration.value / 60) % 60)
  const hours   = computed(() => Math.floor(duration.value / 60 / 60))

  const str = computed(() => [
    hours.value   ? `${hours.value}h`   : null,
    minutes.value ? `${minutes.value}m` : null,
    seconds.value ? `${seconds.value}s` : null,
  ].filter(s => !!s).join(' '))

  return {
    seconds,
    minutes,
    hours,
    str,
  }
}

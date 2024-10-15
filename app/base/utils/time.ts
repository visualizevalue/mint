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

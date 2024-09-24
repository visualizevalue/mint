export const BLOCKS_PER_CACHE = 5n * 30n // 30 minutes (5 blocks each)
export const BLOCKS_PER_HOUR = 300n // 5n * 60n * 24n (5 blocks/min * 60 min * 24 hours)
export const BLOCKS_PER_DAY = 7200n // 300n * 24n (300 blocks per hour * 24 hours)

export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const blocksToSeconds = (blocks: bigint): number => Number(blocks * 12n)

export const nowInSeconds = (): number => Math.floor(Date.now() / 1000)


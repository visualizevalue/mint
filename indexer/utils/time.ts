export const ONE_DAY = 60n * 60n * 24n
export const ONE_MONTH = 30n * ONE_DAY

export const nowInSeconds = () => BigInt(Math.floor(Date.now() / 1000))

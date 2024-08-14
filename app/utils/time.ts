export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const nowInSeconds = (): number => Math.floor(Date.now() / 1000)

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

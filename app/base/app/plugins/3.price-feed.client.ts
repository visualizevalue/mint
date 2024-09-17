// Fetch and update USD price feed
export default defineNuxtPlugin((_) => {
  const priceFeed = usePriceFeedStore()

  priceFeed.fetchEthUsdPrice()

  setInterval(() => priceFeed.fetchEthUsdPrice(), 60 * 60 * 1000) // once per hour
})


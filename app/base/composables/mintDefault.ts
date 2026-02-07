export const useMintDefault = () => {
  const { amount, step, value } = useMintConfig()
  const gasPrice = useGasPrice()
  const priceFeed = usePriceFeedStore()

  const defaultAmount = computed(() => {
    if (! value.value) return amount.value

    const gasPriceWei = gasPrice.value.wei || 0n
    const ethUSDRaw = priceFeed.ethUSDRaw || 0n

    if (! gasPriceWei || ! ethUSDRaw) return amount.value

    // Unit price in wei: basefee * 60_000
    const unitPriceWei = gasPriceWei * 60_000n

    // Convert target USD to cents, compute unit price in cents
    // ethUSDRaw has 8 decimals from Chainlink
    // unitPriceCents = (unitPriceWei * ethUSDRaw) / 1e18 / 1e6
    const targetCents = BigInt(Math.round(value.value * 100))
    const unitPriceCents = (unitPriceWei * ethUSDRaw) / (10n ** 18n) / (10n ** 6n)

    if (! unitPriceCents) return amount.value

    return Math.max(1, Number(targetCents / unitPriceCents))
  })

  return { defaultAmount, step }
}

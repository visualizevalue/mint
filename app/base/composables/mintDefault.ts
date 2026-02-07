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

    // targetCents / unitPriceCents, but computed as a single division
    // to avoid BigInt truncation on the intermediate unitPriceCents:
    // (targetCents * 1e24) / (unitPriceWei * ethUSDRaw)
    const targetCents = BigInt(Math.round(value.value * 100))
    const denominator = unitPriceWei * ethUSDRaw

    if (! denominator) return amount.value

    return Math.max(1, Number(targetCents * (10n ** 24n) / denominator))
  })

  // Persist across navigations so the value survives remounts
  const mintCount = useState('mint-count', () => String(defaultAmount.value))

  watch(defaultAmount, (v) => { mintCount.value = String(v) })

  return { defaultAmount, mintCount, step }
}

<template>
  <Popover id="about-gas">
    <template #trigger><MintGasPrice :mint-count="2" /></template>
    <template #content>
      <div class="prose">
        <h1>{{ $t('popover.mint_pricing')}}</h1>
        <p>{{ $t('popover.pricing_info')}}</p>
        <p>{{ $t('popover.network_fees')}}</p>
        <p>{{ $t('popover.artist_reward') }}</p>
        <table>
          <tbody>
            <tr>
              <td>{{ $t('popover.gas_price') }}</td>
              <td><GasPrice /></td>
            </tr>
            <tr>
              <td>{{ $t('popover.cost_to_mint') }}</td>
              <td>
                <span>
                  60.000 gas * <GasPrice />
                </span>
              </td>
            </tr>
            <tr>
              <td>{{ $t('popover.ethereum_fee') }}</td>
              <td><MintGasPrice /></td>
            </tr>
            <tr>
              <td>{{ $t('popover.artist_comp') }} (50%)</td>
              <td><MintGasPrice /></td>
            </tr>
            <tr>
              <td>{{ $t('popover.mint_price') }}</td>
              <td><MintGasPrice :mint-count="2" /></td>
            </tr>
          </tbody>
        </table>
        <p>{{ $t('popover.mint_more_info') }}</p>
        <table>
          <thead>
            <tr>
              <th>{{ $t('popover.amount') }}</th>
              <th>{{ $t('popover.eth_fee')}}</th>
              <th>{{  $t('popover.artist_comp') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  type="number"
                  min="1"
                  :value="mintAmount"
                  @input="amount = $event.target.value"
                  @focus="animate = false"
                  :class="{ animate }"
                />
              </td>
              <td>
                {{ ethPercentage }}%
                <MintGasPrice v-slot="{ dollarPrice }" :mint-count="1">
                  <span>(${{ dollarPrice }})</span>
                </MintGasPrice>
              </td>
              <td>
                {{ artistPercentage }}%
                <MintGasPrice v-slot="{ dollarPrice }" :mint-count="parseInt(amount)">
                  <span>(${{ dollarPrice }})</span>
                </MintGasPrice>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </Popover>
</template>

<script setup>
const amount = ref('2')
const mintAmount = computed(() => amount.value ? Math.max(1, parseInt(amount.value)) : 1)
const ethPercentage = computed(() => (100 / Math.max(1, mintAmount.value + 1)).toFixed(2))
const artistPercentage = computed(() => (100 - ethPercentage.value).toFixed(2))

const animate = ref(true)
const runAnimation = async () => {
  await delay(3000)
  if (! animate.value) return
  const amounts = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
  const mints = takeRandom(amounts)

  amount.value = mints

  runAnimation()
}

onMounted(() => {
  runAnimation()
})
</script>

<style scoped>
  table {
    width: 100%;

    td {
      > div {
        display: grid;

        > span {
          white-space: nowrap;
        }
      }

      &:has(input) {
        padding: 0;
        width: 33%;
      }

      input {
        border-radius: 0;
        border: 0;
      }
    }

    thead {
      th {
        text-align: left;
        white-space: nowrap;
        font-weight: var(--font-weight);
      }
    }

    :deep(.usd) {
      display: inline-block;
      margin-left: auto;
    }
  }
</style>


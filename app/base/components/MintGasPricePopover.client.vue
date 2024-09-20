<template>
  <Popover id="about-gas">
    <template #trigger><MintGasPrice :mint-count="2" /></template>
    <template #content>
      <div class="prose">
        <h1>Mint Pricing</h1>
        <p>Artifacts are priced based on the Ethereum network fees at the time of collecting.</p>
        <p>Network fees (Gas fees) are an essential component of securing and running decentralized blockchains.</p>
        <p>
          The cost to store and secure the object on the network is mirrored as compensation to the artist,
          creating a direct link between network value and creator reward.
        </p>
        <table>
          <tbody>
            <tr>
              <td>Gas price</td>
              <td><GasPrice /></td>
            </tr>
            <tr>
              <td>Cost to mint</td>
              <td>
                <span>
                  60.000 gas * <GasPrice />
                </span>
              </td>
            </tr>
            <tr>
              <td>Ethereum fee (50%)</td>
              <td><MintGasPrice /></td>
            </tr>
            <tr>
              <td>Artist <abbr title="Artist Compensation">comp.</abbr> (50%)</td>
              <td><MintGasPrice /></td>
            </tr>
            <tr>
              <td>Mint price</td>
              <td><MintGasPrice :mint-count="2" /></td>
            </tr>
          </tbody>
        </table>
        <p>
          Mints of more than one don't increase the Ethereum fee, resulting in higher
          artist compensation.
        </p>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Ethereum fee</th>
              <th>Artist <abbr title="Artist Compensation">comp.</abbr></th>
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
                <MintGasPrice v-slot="{ dollarPrice }" :mint-count="amount">
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


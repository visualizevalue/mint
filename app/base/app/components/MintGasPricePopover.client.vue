<template>
  <Popover id="about-gas">
    <template #trigger><MintGasPrice :mint-count="2" /></template>
    <template #content>
      <div class="prose">
        <h1>Mint Pricing</h1>
        <p>Artifacts are priced based on the ethereum network fees at the time of collecting.</p>
        <p>Network fees (Gas fees) are an essential component of of securing and running decentralized blockchains.</p>
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
      </div>
    </template>
  </Popover>
</template>

<script setup>
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
    }

    :deep(.usd) {
      display: inline-block;
      margin-left: auto;
    }
  }
</style>


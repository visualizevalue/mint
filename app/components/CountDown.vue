<template>
<div v-if="countDownComplete" class="complete countdown">
  <slot name="complete"></slot>
</div>
<div v-else class="countdown">
  <slot name="header"></slot>
  <span v-if="timeUntil">{{ countdown }}</span>
  <span v-else>_d _h _m _s</span>
  <slot />
  <slot name="footer" />
</div>
</template>

<script>
export default {
  emits: ['start', 'complete'],

  props: {
    adjustSeconds: {
      type: Number,
      default: 0,
    },
    until: {
      type: Number,
      default: 1632552931,
    },
    minimal: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      timeUntil: null,
      interval: null,
    }
  },

  computed: {
    countDownComplete () {
      return this.timeUntil <= 0
    },

    years () {
      return Math.floor(this.timeUntil / 60 / 60 / 24 / 365)
    },

    accountedForYears () {
      return this.years * 60 * 60 * 24 * 365
    },

    days () {
      return Math.floor((this.timeUntil - this.accountedForYears) / 60 / 60 / 24)
    },

    accountedForDays () {
      return this.days * 60 * 60 * 24
    },

    hours () {
      return Math.floor((this.timeUntil - this.accountedForYears - this.accountedForDays) / 60 / 60)
    },

    accountedForHours () {
      return this.hours * 60 * 60
    },

    minutes () {
      return Math.floor((this.timeUntil - this.accountedForYears - this.accountedForDays - this.accountedForHours) / 60)
    },

    totalSeconds () {
      return this.timeUntil / 60
    },

    seconds () {
      return this.timeUntil % 60
    },

    countdown () {
      const yearsString = this.years + 'y'
      const daysString = this.days + 'd'
      const hoursString = this.hours + 'h'
      const minutesString = this.minutes + 'm'
      const secondsString = this.seconds + 's'

      return [
        this.years && yearsString,
        this.days && daysString,
        this.hours && hoursString,
        minutesString,
        (!this.minimal || this.totalSeconds < 600) && secondsString,
      ].filter(i => !!i).join(' ')
    }
  },

  mounted () {
    this.update()
    this.interval = setInterval(() => this.update(), 1000)
  },

  beforeUnmount () {
    clearInterval(this.interval)
  },

  methods: {
    update () {
      let start = this.until

      start += this.adjustSeconds

      this.timeUntil = start - nowInSeconds()

      if (this.countDownComplete) {
        this.$emit('complete')
        clearInterval(this.interval)
      }
    },
  },

}
</script>

<style lang="postcss" scoped>
.countdown {
  text-align: center;

  small,
  span {
    display: block;
  }

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }

  &.inline,
  &.inline * {
    display: inline !important;
    text-align: left !important;
    font-size: 1em !important;
  }
}

.complete {
  padding: 0;
}
</style>

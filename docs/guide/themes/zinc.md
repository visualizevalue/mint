---
outline: deep
---

# Zinc Theme

The Zinc Theme is our first example theme implementation.
Please refer to it for a simple primer on how to implement a custom theme.

![The Zinc Theme](../../assets/zinc-theme.png)

Let's run through the main changes that are applied to the base application
to understand how to build themes similar to this.

## Adjusted core styling

The base theme comes with various CSS variables, that can be overridden
to change basic styles quickly without touching custom CSS rules.

The Zinc theme makes use of this by applying these variables:

```css
:root {
  /*
  * THEME COLORS
  */
  /* ... */

  /*
  * FONTS
  */
  --font-family: sans-serif;
  --font-base: 14px;
  --font-lg: calc(var(--font-base) * 1.618);

  /*
  * UI ELEMENTS
  */
  --ui-font-family: monospace;
  --ui-font-size: 12px;
  --ui-text-transform: uppercase;
  --ui-font-weight: 500;

  /*
  * BORDERS
  */
  --border-color: var(--gray-z-3);
  --border-radius: var(--size-1);

  /*
  * COMPONENTS
  */
  --button-background-highlight: var(--gray-z-3);
  --card-background-highlight: var(--gray-z-3);
  --breadcrumb-background-highlight: var(--gray-z-3);
}

/* LIGHT */
:root {
  --background: var(--gray-200);
  --color:      var(--gray-800);
}

/* DARK */
.dark {
  --background: var(--gray-800);
  --color: var(--gray-200);
}
```

Check out the full CSS customizations on [Github](https://github.com/visualizevalue/mint/blob/main/app/themes/zinc/assets/theme.css).

## Customize an existing component

### Customizing via CSS

If you want to further customize some components, you can do
so by applying custom CSS rules:

```css
/* Apply custom padding to Breadcrumbs */
.breadcrumbs a,
.breadcrumbs > span:not(:has(> a)){
  padding: var(--ui-padding-y) calc(var(--ui-padding-x)/2);
}
```

### Customizing by overriding an existing component

You can override components from the base app implementations
by naming them like the root component. As an example, the
Zinc theme overrides the `Icon.vue` component like so:

```vue
<template>
  <i v-if="ICONS[type]" class="icon">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" v-html="ICONS[type]"></svg>
  </i>
  <FeatherIcon v-else :type="ICON_NAMES[type] || type" class="icon" />
</template>

<script setup>
import FeatherIcon from 'vue-feather'

const ICON_NAMES = {
  add: 'plus',
  close: 'x',
  edit: 'edit-2',
  email: 'mail',
  discord: 'at-sign',
  times: 'x',
  website: 'globe',
  withdraw: 'dollar-sign',
}

const ICONS = {
  'x.com': `<path ...`,
  vv: `<path ...`,
  check: `<path ...`,
}

const props = defineProps({
  type: String,
})

const type = computed(() => ICON_NAMES[props.type] || props.type)
</script>
```

### Customizing by extend an existing component

If you want to functionally extend an existing component, you
can create a custom wrapper component and using it instead
The Zinc theme showcases how to do this by making the
application header sticky and applying
a border when scrolling down.

```vue
<template>
  <BaseAppHeader
    :style="{
      borderColor: y > 10 ? 'var(--border-color)' : 'transparent'
    }"
  />
</template>

<script setup>
import { default as BaseAppHeader } from '@base/components/AppHeader.vue'
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()
</script>

<style>
  .app-header {
    position: sticky;
    top: 0;
    /* ... */
  }
</style>
```

> [!TIP]
> Note we can import the base component using `@base/components/...` because we set it up as an alias in our `nuxt.config.ts`.
> ```ts
>  alias: {
>    '@base': '@visualizevalue/mint-app-base',
>  }
> ```

## Add new components

You can add entirely new components as well, and use them throughout
the application. The Zinc theme adds a `ToggleDarkMode.vue` component
which changes the color scheme of the site and stores
the current selection in localStorage.

We register the new dark mode toggle in the root `app.vue` file
by simply overriding it.

::: code-group

```vue [ToggleDarkMode.vue]
<template>
  <button @click="() => toggleDark()" title="Switch Light/Dark mode">
    <Icon v-if="isDark" type="sun" :size="20" />
    <Icon v-else type="moon" :size="20" />
  </button>
</template>

<script setup>
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)

watch(isDark, () => {
  if (isDark.value) {
    document.documentElement.classList.remove('lightmode')
    localStorage.setItem('color-scheme', 'dark')
  } else {
    document.documentElement.classList.add('lightmode')
    localStorage.setItem('color-scheme', 'light')
  }
})

onMounted(() => {
  if (! isDark.value) {
    document.documentElement.classList.add('lightmode')
  }
})
</script>
```

```vue{9} [app.vue]
<template>
  <div>
    <AppHeader />

    <main>
      <NuxtPage />
    </main>

    <ToggleDarkMode />
  </div>
</template>
```

:::

Feel free to reach out on Github with theming issues, and improvements.

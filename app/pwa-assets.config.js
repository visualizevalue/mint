import {
  defineConfig,
  minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...preset,
    maskable: {
      ...preset.maskable,
      resizeOptions: { fit: 'contain', background: '#131313' }
    },
    apple: {
      ...preset.maskable,
      resizeOptions: { fit: 'contain', background: '#131313' }
    },
  },
  images: ['public/icon.svg']
})

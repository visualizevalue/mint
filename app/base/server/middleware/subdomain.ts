export default defineEventHandler(({ node, context }) => {
  const hostname: string = node.req.headers.host?.split(':')[0] as string

  const sub = hostname.split('.')[0]?.toLowerCase() as string
  const main = process.env.NUXT_PUBLIC_DOMAIN?.split('.')[0] || `localhost`

  if (sub !== main) {
    context.subdomain = sub
  }
})

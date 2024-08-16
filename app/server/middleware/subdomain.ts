export default defineEventHandler(({ node, context }) => {
  const hostname: string = node.req.headers.host?.split(':')[0] as string

  const sub = hostname.split('.')[0]?.toLowerCase() as string
  const main = `mint`

  if (sub !== main) {
    context.subdomain = sub
  }
})

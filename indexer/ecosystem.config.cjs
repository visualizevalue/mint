module.exports = {
  apps: [
    {
      name: 'mint-indexer',
      cwd: '/var/www/indexer/indexer',
      script: 'pnpm',
      args: 'start',
    },
    {
      name: 'mint-indexer-api',
      cwd: '/var/www/indexer/indexer',
      script: 'pnpm',
      args: 'serve',
    },
  ],
}

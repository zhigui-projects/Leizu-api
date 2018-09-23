module.exports = {
  server: {
    port: 3000,
    url: 'http://localhost:3000'
  },
  jwt: {
    secret: '`yGE[RniLYCX6rCni>DKG_(3#si&zvA$WPmgrb2P',
    expiresIn: 36000
  },
  database: {
    connection: {
      host: 'localhost',
      user: 'root',
      password: 'passw0rd',
      database: 'ledgerdb'
    },
    pool: { min: 0, max: 7 },
    debug: false
  }
}
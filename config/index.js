const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'findhublog',
  password: process.env.DB_PASSWORD || 'qazmlpty',
  port: process.env.DB_PORT || 5432,
});

client.connect();

module.exports = client

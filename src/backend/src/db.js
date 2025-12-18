const { Pool } = require('pg');
require('dotenv').config();

const Pools = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = Pools;
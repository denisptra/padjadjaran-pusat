
const { Client } = require('pg');

async function test() {
  const connectionString = 'postgresql://neondb_owner:npg_1fTIdhM5LSei@ep-raspy-union-a1o9huxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('Connected successfully with pg!');
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

test();

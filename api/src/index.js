const express = require('express');
const mariadb = require('mariadb');

let connMariaDb;

async function connectDb() {
  try {
    connMariaDb = await mariadb.createConnection({
      host: 'db',
      user: 'root',
      password: 'example',
    });
    console.log('Connected to MariaDB');
    await connMariaDb.query('CREATE DATABASE IF NOT EXISTS test');
    await connMariaDb.query('CREATE TABLE IF NOT EXISTS counts (count INT)');
  } catch (err) {
    throw err;
  } finally {
    if (connMariaDb) return connMariaDb.end();
  }
}

connectDb();

const app = express();

app.get('/api/count', async (req, res) => {
  const connMariaDb = await mariadb.createConnection({
    host: 'db',
    user: 'root',
    password: 'example',
    database: 'test',
  });
  let data = await connMariaDb.query('SELECT count FROM counts');
  if (data.length === 0) {
    await connMariaDb.query('INSERT INTO counts (count) VALUES (0)');
  }
  await connMariaDb.query('UPDATE counts SET count = count + 1');
  data = await connMariaDb.query('SELECT count FROM counts');
  res.json({ count: data[0].count });
});

app.all('*', (req, res) => {
  res.status(404).end();
});

app.listen(80);

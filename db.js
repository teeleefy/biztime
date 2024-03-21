const { Client } = require("pg");

if (process.env.NODE_ENV === "test") {
  db = "biztime_test";
} else {
  db = "biztime";
}

const client = new Client({
  host: '/var/run/postgresql',
  database: db,
})

client.connect();

module.exports = client;

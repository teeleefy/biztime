// /** Database setup for BizTime. */

// const { Client } = require("pg");

// let DB_URI;

// if (process.env.NODE_ENV === "test") {
//   DB_URI = "postgresql:///biztime_test";
// } else {
//   DB_URI = "postgresql:///biztime";
// }



// let db = new Client({
//   connectionString: DB_URI
// });

// db.connect();

// module.exports = db;
// const { pw } = require('./pw');
const { Client } = require("pg");
// const connectionStr = 'postgresql://@/var/run/postgresql:5432/biztime'
// const client = new Client({
//     connectionString: connectionStr
// });
if (process.env.NODE_ENV === "test") {
  db = "biztime_test";
} else {
  db = "biztime";
}

const client = new Client({
//   user: 'tammy',
  host: '/var/run/postgresql',
  database: db,
//   password: pw,
//   port: 5432,
})

client.connect();


module.exports = client;

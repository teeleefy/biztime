//set environment to test
process.env.NODE_ENV = "test";

//npm packages
const request = require('supertest');

//app imports
const app = require("../app");
const db = require('../db');


let testInvoice;
let testCompany;

beforeAll(async function() {
  let result = await db.query(`
    INSERT INTO 
        companies 
        VALUES ('test', 'Test Company', 'Example test company.')
        RETURNING code, name, description`);
  testCompany = result.rows[0];
});

beforeEach(async function() {
  let result = await db.query(`
        INSERT INTO 
        invoices (comp_code, amt)
        VALUES ('test', 100)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`);
    testInvoice = result.rows[0];
});


/** GET  invoices - returns ` invoices: [invoice, ...]}` */

describe("GET /invoices", function() {
    test("Gets a list of invoices", async function() {
      const response = await request(app).get(`/invoices`);
      expect(response.statusCode).toEqual(200);
      let object = response.body.invoices[0];
      expect(object.comp_code).toEqual('test');
      expect(object.amt).toEqual(100);
    });
  });

// end


/** GET  invoices/[id] - return data about one invoice: `{invoice: invoice}` */

describe("GET /invoices/:id", function() {
    test("Gets a single invoice", async function() {
      const response = await request(app).get(`/invoices/${testInvoice.id}`);
      expect(response.statusCode).toEqual(200);
      let object = response.body.invoice;
      expect(object.comp_code).toEqual('test');
      expect(object.amt).toEqual(100);
      expect(object.paid).toEqual(false);
      expect(object.paid_date).toEqual(null);
    });

    test("Responds with 404 if can't find invoice", async function() {
        const response = await request(app).get(`/invoices/0`);
        expect(response.statusCode).toEqual(404);
      });
  });

// end


/** POST  invoices - create invoice from data; return `{invoice: invoice}` */

describe("POST /invoices", function() {
  test("Creates a new invoice", async function() {
    const response = await request(app)
      .post(`/invoices`)
      .send({
         "compCode" : "test", "amt" : 200
      });
    expect(response.statusCode).toEqual(201);
    let object = response.body.invoice;
    expect(object.amt).toEqual(200);
    expect(object.comp_code).toEqual('test');
  });
});
// end


// /** PATCH  invoices/[id] - update invoice; return `{invoice: invoice}` */

describe("PUT /invoices/:id", function() {
  test("Updates a single invoice", async function() {
    const response = await request(app)
      .put(`/invoices/${testInvoice.id}`)
      .send({
        amt: 300
      });
    expect(response.statusCode).toEqual(200);
    let object = response.body.invoice;
    expect(object.amt).toEqual(300);
  });

  test("Updates paid-date when paid is passed as true", async function() {
    const resp = await request(app)
      .put(`/invoices/${testInvoice.id}`)
      .send({paid: true});
    expect(resp.statusCode).toEqual(200);
    let object = resp.body.invoice;
    expect(object.paid).toEqual(true);
  });

  test("Responds with 404 if can't find invoice", async function() {
    const response = await request(app).put(`/invoices/0`);
    expect(response.statusCode).toEqual(404);
  });
});
// // end

// /** DELETE  invoices/[id] - delete invoice,
//  *  return `{message: "invoice deleted"}` */

describe("DELETE  invoices/:id", function() {
  test("Deletes a single a invoice", async function() {
    const response = await request(app)
      .delete(`/invoices/${testInvoice.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ status: "deleted" });
  });
});
// // end


afterEach(async function() {
  // delete any data created by test
  await db.query("DELETE FROM invoices");
});

afterAll(async function() {
    await db.query("DELETE FROM companies");
  // close db connection
  await db.end();
});

//set environment to test
process.env.NODE_ENV = "test";

//npm packages
const request = require('supertest');

//app imports
const app = require("../app");
const db = require('../db');


let testCompany;

beforeEach(async function() {
  let result = await db.query(`
    INSERT INTO 
    companies VALUES 
    ('test', 'Test Company', 'Example test company.')
    RETURNING code, name, description`);
  testCompany = result.rows[0];
});


/** GET /companies - returns `{companies: [company, ...]}` */

describe("GET /companies", function() {
    test("Gets a list of companies", async function() {
      const response = await request(app).get(`/companies`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        companies: [testCompany]
      });
    });
  });

// end


/** GET /companies/[id] - return data about one company: `{company: company}` */

describe("GET /companies/:code", function() {
    test("Gets a single company", async function() {
      const response = await request(app).get(`/companies/${testCompany.code}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({company: testCompany});
    });

    test("Responds with 404 if can't find company", async function() {
        const response = await request(app).get(`/companies/0`);
        expect(response.statusCode).toEqual(404);
      });
  });

// end


/** POST /companies - create company from data; return `{company: company}` */

describe("POST /companies", function() {
  test("Creates a new company", async function() {
    const response = await request(app)
      .post(`/companies`)
      .send({
         "name": "Taco Co", "description": "A taco truck"
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: [{code: "taco-co", name: "Taco Co", description: "A taco truck"}]
    });
  });
});
// end


// /** PATCH /companies/[id] - update company; return `{company: company}` */

describe("PUT /companies/:code", function() {
  test("Updates a single company", async function() {
    const response = await request(app)
      .put(`/companies/${testCompany.code}`)
      .send({
        name: "Test Dummy"
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      company: {code: "test", name: "Test Dummy", description: "Example test company."}
    });
  });

  test("Responds with 404 if can't find company", async function() {
    const response = await request(app).put(`/companies/0`);
    expect(response.statusCode).toEqual(404);
  });
});
// // end


// /** DELETE /companies/[code] - delete company,
//  *  return `{message: "company deleted"}` */

describe("DELETE /companies/:code", function() {
  test("Deletes a single a company", async function() {
    const response = await request(app)
      .delete(`/companies/${testCompany.code}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("Responds with 404 if can't find company", async function() {
    const response = await request(app).delete(`/companies/0`);
    expect(response.statusCode).toEqual(404);
  });
});
// // end


afterEach(async function() {
  // delete any data created by test
  await db.query("DELETE FROM companies");
});

afterAll(async function() {
  // close db connection
  await db.end();
});

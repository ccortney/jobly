"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "New Job Title",
    salary: 55000,
    equity: 0,
    companyHandle: "c1"
  };

  test("works", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        // .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job Title",
        salary: 55000,
        equity: "0",
        companyHandle: "c1" 
      },
    });
  });

//   test("ok for admin", async function () {
//     const resp = await request(app)
//         .post("/companies")
//         .send(newCompany)
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(201);
//     expect(resp.body).toEqual({
//       company: newCompany,
//     });
//   });

//   test("not ok for users", async function () {
//     const resp = await request(app)
//       .post("/companies")
//       .send(newCompany)
//       .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toBe(401)
//   });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "New Job Title",
            salary: 55000,
        })
        // .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "New Job Title",
            salary: 55000,
            equity: 0,
            companyHandle: "not-a-company" 
        })
        // .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
  test("works", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
                id: expect.any(Number),
                title: "Math Teacher",
                salary: 45000,
                equity: "0",
                companyHandle: "c1"
            },
            {
                id: expect.any(Number),
                title: "Superintendent",
                salary: 650000,
                equity: "0.05",
                companyHandle: "c1"
            },
            {
                id: expect.any(Number),
                title: "Software Engineer",
                salary: 125000,
                equity: "0.35",
                companyHandle: "c2"
            },
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        // .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "Math Teacher",
        salary: 45000,
        equity: "0",
        companyHandle: "c1"
      },
    });
  });

  test("not found for job id", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "Science Teacher",
        })
        // .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "Science Teacher",
        salary: 45000,
        equity: "0",
        companyHandle: "c1"
      },
    });
  });

//   test("works for admin", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1-new",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("does not work for users", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401)
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         });
//     expect(resp.statusCode).toEqual(401);
//   });

  test("not found on job id", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "Science Teacher",
        })
        // .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          id: 10000000000,
        })
        // .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: 12, 
          salary: "not-a-number"
        })
        // .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
//   test("doees not work for users", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("works for admin", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`)
//         .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

  test("works", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        // .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`);
//     expect(resp.statusCode).toEqual(401);
//   });

  test("not found for job id", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        // .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

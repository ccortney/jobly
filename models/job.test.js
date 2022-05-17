"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 95000,
    equity: 0.01,
    companyHandle: 'c1'
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
        id: expect.any(Number),
        title: "new",
        salary: 95000,
        equity: '0.01',
        companyHandle: 'c1'});

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 95000,
        equity: '0.01',
        company_handle: 'c1',
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let data = {}
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Math Teacher",
        salary: 45000,
        equity: '0',
        companyHandle: 'c1'
      },
      {
        id: expect.any(Number),
        title: "Superintendent",
        salary: 650000,
        equity: '0.05',
        companyHandle: 'c1'
      },
      {
        id: expect.any(Number),
        title: "Software Engineer",
        salary: 125000,
        equity: '0.35',
        companyHandle: 'c2'
      },
    ]);
  });
//   test("works: name filter", async function () {
//     let data = {name: "1"}
//     let companies = await Company.findAll(data);
//     expect(companies).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     ]);
//   });
//   test("works: employee filter", async function () {
//     let data = {minEmployees: "3", maxEmployees: "5"}
//     let companies = await Company.findAll(data);
//     expect(companies).toEqual([
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       },
//     ]);
//   });
//   test("error if min is greater than max", async function () {
//     let data = {minEmployees: "5", maxEmployees: "3"}
//     try {
//       await Company.findAll(data);
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
});

/************************************** get */

describe("get", function () {


  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
        id: 1,
        title: "Math Teacher",
        salary: 45000,
        equity: '0',
        companyHandle: 'c1'
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "Science Teacher",
    salary: 55000,
    equity: 0.2,
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: "Science Teacher",
      salary: 55000,
      equity: '0.2',
      companyHandle: 'c1'
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "Science Teacher",
      salary: 55000,
      equity: '0.2',
      company_handle: 'c1'
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "Science Teacher",
      salary: null,
      equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
        id: 1,
        title: "Science Teacher",
        salary: null,
        equity: null,
        companyHandle: 'c1'
    });

    const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE id = 1`);
    expect(result.rows).toEqual([{
        id: 1,
        title: "Science Teacher",
        salary: null,
        equity: null,
        company_handle: 'c1'
    }]);
  });

  test("works: partial fields", async function () {
    const updateDataSetNulls = {
      title: "Science Teacher",
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
        id: 1,
        title: "Science Teacher",
        salary: 45000,
        equity: '0',
        companyHandle: 'c1'
    });

    const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE id = 1`);
    expect(result.rows).toEqual([{
        id: 1,
        title: "Science Teacher",
        salary: 45000,
        equity: '0',
        company_handle: 'c1'
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await db.query(`UPDATE jobs SET id = 1 WHERE title = 'Math Teacher' RETURNING id`);
    await Job.remove(1);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

const db = require("../db");
const { sqlForPartialUpdate, sqlForFilter } = require("./sql");
const { BadRequestError } = require("../expressError");


beforeEach(async function() {
    await db.query("BEGIN");
})
  
afterEach(async function() {
    await db.query("ROLLBACK");
})
  
afterAll(async function() {
    await db.end();
})

describe("sqlForPartialUpdate", function () {
    test("works", function () {
        const dataToUpdate = {firstName: "Aliya", age: 32};
        const jsToSql = {firstName: "first_name"};
        const {setCols, values} = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(setCols).toEqual(`"first_name"=$1, "age"=$2`)
        expect(values).toEqual(["Aliya", 32])
    });

    test("error if no data", function() {
        try {
            const dataToUpdate = {};
            const jsToSql = {firstName: "first_name"};
            const {setCols, values} = sqlForPartialUpdate(dataToUpdate, jsToSql);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })
});


describe("sqlForFilter", function () {
    test("company: works with name", function () {
        const dataToFilter = {name: "Aliya"};
        const whereStr = sqlForFilter(dataToFilter, "company");
        expect(whereStr).toEqual({
            "values": ["%Aliya%"], 
            "whereStr": "WHERE name iLIKE $1"
        })
    });

    test("company: works with min", function () {
        const dataToFilter = {minEmployees: "700"};
        const whereStr = sqlForFilter(dataToFilter, "company");

        expect(whereStr).toEqual({
            "values": [700], 
            "whereStr": "WHERE num_employees >= $1"
        })
    });

    test("company: works with max", function () {
        const dataToFilter = {maxEmployees: "700"};
        const whereStr = sqlForFilter(dataToFilter, "company");

        expect(whereStr).toEqual({
            "values": [700], 
            "whereStr": "WHERE num_employees <= $1"
        })
    });

    test("company: works with min and max", function () {
        const dataToFilter = {minEmployees: "700", maxEmployees: "800"};
        const whereStr = sqlForFilter(dataToFilter, "company");

        expect(whereStr).toEqual({
            "values": [700, 800], 
            "whereStr": "WHERE num_employees >= $1 AND num_employees <= $2"
        })
    });

    test("company: works with name, min, and max", function () {
        const dataToFilter = {name: "Aliya", minEmployees: "700", maxEmployees: "800"};
        const whereStr = sqlForFilter(dataToFilter, "company");

        expect(whereStr).toEqual({
            "values": ["%Aliya%", 700, 800], 
            "whereStr": "WHERE name iLIKE $1 AND num_employees >= $2 AND num_employees <= $3"
        })
    });

    test("company: works with no data", function () {
        const dataToFilter = {};
        const whereStr = sqlForFilter(dataToFilter, "company");

        expect(whereStr).toEqual({
            "values": [], 
            "whereStr": ""
        })
    });

    test("company: works with invalid filters", function () {
        const dataToFilter = {title: "teacher"};
        const whereStr = sqlForFilter(dataToFilter, "company");
        expect(whereStr).toEqual({
            "values": [], 
            "whereStr": ""
        })
    });

    test("company: error if min is greater than max", function() {
        try {
            const dataToFilter = {minEmployees: "800", maxEmployees: "700"};
            const whereStr = sqlForFilter(dataToFilter, "company");
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("job: works with title", function () {
        const dataToFilter = {title: "teacher"};
        const whereStr = sqlForFilter(dataToFilter, "job");
        expect(whereStr).toEqual({
            "values": ["%teacher%"], 
            "whereStr": "WHERE title iLIKE $1"
        })
    });

    test("job: works with minSalary", function () {
        const dataToFilter = {minSalary: 125000};
        const whereStr = sqlForFilter(dataToFilter, "job");
        expect(whereStr).toEqual({
            "values": [125000], 
            "whereStr": "WHERE salary >= $1"
        })
    });

    test("job: works when hasEquity = true", function () {
        const dataToFilter = {hasEquity: true};
        const whereStr = sqlForFilter(dataToFilter, "job");
        expect(whereStr).toEqual({
            "values": [0], 
            "whereStr": "WHERE equity > $1"
        })
    });

    test("job: works when hasEquity = false", function () {
        const dataToFilter = {hasEquity: false};
        const whereStr = sqlForFilter(dataToFilter, "job");
        expect(whereStr).toEqual({
            "values": [], 
            "whereStr": ""
        })
    });

    test("job: works with no data", function () {
        const dataToFilter = {};
        const whereStr = sqlForFilter(dataToFilter, "job");
        expect(whereStr).toEqual({
            "values": [], 
            "whereStr": ""
        })
    });

    test("job: works with invalid filters", function () {
        const dataToFilter = {name: "Aliya"};
        const whereStr = sqlForFilter(dataToFilter, "job");
        expect(whereStr).toEqual({
            "values": [], 
            "whereStr": ""
        })
    });
});

  
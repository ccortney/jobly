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
    test("works with name", function () {
        const dataToFilter = {name: "Aliya"};
        const whereStr = sqlForFilter(dataToFilter);

        expect(whereStr).toEqual(`WHERE name iLIKE '%Aliya%'`)
    });

    test("works with min", function () {
        const dataToFilter = {minEmployees: "700"};
        const whereStr = sqlForFilter(dataToFilter);

        expect(whereStr).toEqual(`WHERE num_employees > 700`)
    });

    test("works with max", function () {
        const dataToFilter = {maxEmployees: "700"};
        const whereStr = sqlForFilter(dataToFilter);

        expect(whereStr).toEqual(`WHERE num_employees < 700`)
    });

    test("works with min and max", function () {
        const dataToFilter = {minEmployees: "700", maxEmployees: "800"};
        const whereStr = sqlForFilter(dataToFilter);

        expect(whereStr).toEqual(`WHERE num_employees BETWEEN 700 and 800`)
    });

    test("works with name, min, and max", function () {
        const dataToFilter = {name: "Aliya", minEmployees: "700", maxEmployees: "800"};
        const whereStr = sqlForFilter(dataToFilter);

        expect(whereStr).toEqual(`WHERE name iLIKE '%Aliya%' and num_employees BETWEEN 700 and 800`)
    });

    test("works with no data", function () {
        const dataToFilter = {};
        const whereStr = sqlForFilter(dataToFilter);

        expect(whereStr).toEqual(``)
    });

    test("error if min is greater than max", function() {
        try {
            const dataToFilter = {minEmployees: "800", maxEmployees: "700"};
            const whereStr = sqlForFilter(dataToFilter);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }


    })
});

  
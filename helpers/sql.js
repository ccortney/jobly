const { BadRequestError } = require("../expressError");

  /** Prepare data that can be used to update the database
   *
   * dataToUpdate is an object that contains the new data
   * Example: {firstName: 'Aliya', age: 32}
   *
   * jsToSql is an object of key-value pairs that contains JS variable names and SQL variable names
   * Example: {firstName: first_name}
   * 
   * Returns set of Cols and values
   * setCols: a string that contains the column values for the data that will be updated
   * and parameterized queries. Example: `"first_name"=$1, "age"=$2`
   * 
   * values: an array of data values that be substituted in for the parameters
   * Example: ["Aliya", 32]
   */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

 /** Prepare data that can be used to filter the database
   *
   * dataToFilter is an object that contains the data to filter for
   * Example: {minEmployees: 50}
   * 
   * Returns whereStr
   * whereStr: a string that contains the the WHERE statement for filtered name/employees 
   * Example: `WHERE num_employees > 50`
   */

function sqlForFilter(dataToFilter) {
  // if (!dataToFilter) {
  //   return;
  // }

  let name;
  let employees;
  let whereStr;

  if (dataToFilter.name) {
    name = `name iLIKE '%${dataToFilter.name}%'`
  }
  if (dataToFilter.minEmployees && dataToFilter.maxEmployees) {
    if (+dataToFilter.minEmployees > +dataToFilter.maxEmployees) {
      throw new BadRequestError('minEmployees cannot be greater than maxEmployees');
    }
    employees = `num_employees BETWEEN ${dataToFilter.minEmployees} and ${dataToFilter.maxEmployees}`
  } else if (dataToFilter.minEmployees) {
    employees = `num_employees > ${dataToFilter.minEmployees}`
  } else if (dataToFilter.maxEmployees) {
    employees = `num_employees < ${dataToFilter.maxEmployees}`
  }

  if (name && employees) {
    whereStr = `WHERE ${name} and ${employees}`
  } else if (name) {
    whereStr = `WHERE ${name}`
  } else if (employees) {
    whereStr = `WHERE ${employees}`
  } else {
    whereStr = "";
  }

  return whereStr;
}


module.exports = { sqlForPartialUpdate, sqlForFilter };

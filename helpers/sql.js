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
  if (keys.length === 0) throw new BadRequestError("No Data");

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
   * Example: {minEmployees: 50, name: Target}
   * 
   * Returns whereStr and values
   * whereStr: a string that contains the the WHERE statement for filtered name/employees 
   * Example: `WHERE num_employees > $1 AND name iLIKE $2`
   * 
   * values: array of values that be substituted in for the parameters
   * Example: [50, '%Target%']
   */

function sqlForFilter(dataToFilter, filterFor) {

  const filters = [];
  const values = [];
  let whereStr = "";
  let idx = 1;

  // filters for companies
  if (filterFor === "company") {
    if (dataToFilter.minEmployees && dataToFilter.maxEmployees && +dataToFilter.minEmployees > +dataToFilter.maxEmployees) {
      throw new BadRequestError('minEmployees cannot be greater than maxEmployees');
    } 
  
    if (dataToFilter.name) {
      filters.push(`name iLIKE $${idx}`);
      values.push(`%${dataToFilter.name}%`);
      idx++;
    }
  
    if (dataToFilter.minEmployees) {
      filters.push(`num_employees >= $${idx}`);
      values.push(+dataToFilter.minEmployees);
      idx++;
    }
  
    if (dataToFilter.maxEmployees) {
      filters.push(`num_employees <= $${idx}`);
      values.push(+dataToFilter.maxEmployees);
      idx++;
    }
  }
  
  // filters for jobs
  if (filterFor === "job") {
    if (dataToFilter.title) {
      filters.push(`title iLIKE $${idx}`);
      values.push(`%${dataToFilter.title}%`);
      idx++;
    }
  
    if (dataToFilter.minSalary) {
      filters.push(`salary >= $${idx}`);
      values.push(+dataToFilter.minSalary);
      idx++;
    }
  
    if (dataToFilter.hasEquity === true) {
      filters.push(`equity > $${idx}`);
      values.push(0);
      idx++;
    } 
  }


  if (filters.length > 0) {
    whereStr = "WHERE ";
    whereStr += filters.join(" AND ");
  }
  return {
    whereStr, 
    values
  }
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

function sqlForFilterOriginalFunction(dataToFilter) {

  let name;
  let employees;
  let whereStr;

  if (dataToFilter.name) {
    
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

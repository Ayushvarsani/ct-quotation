import { pool } from "../../lib/db";

export const getAllCustomerCompany = async (company_uuid: string) => {
  const query = `
    select * from customers where company_uuid=$1;
  `;

  const values = [company_uuid];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    return {
      msg: "No customer found",
      code: 200,
      status: false,
    };
  }

  return {
    msg: "Customers Found",
    code: 200,
    status: true,
    data: result.rows,
  };
};

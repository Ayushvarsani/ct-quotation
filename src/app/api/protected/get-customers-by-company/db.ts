import { pool } from "../../lib/db";

export const getCustomersByCompany = async (params: { customer_uuid: string }) => {
  const query = `
    SELECT c.*, ci.company_message_number , ci.company_name
    FROM customers c
    LEFT JOIN company_info ci ON c.company_uuid = ci.company_uuid
    WHERE c.customer_uuid = $1 
  `;

  const values = params.customer_uuid;

  try {
    const result = await pool.query(query, [values]);

    if (result.rowCount === 0) {
      return {
        msg: "No customers found for this customer",
        code: 200,
        status: false,
        data: [],
      };
    }
console.log(result.rows[0]);
    return {
      msg: "Customers found successfully",
      code: 200,
      status: true,
      data: result.rows[0],
    };
  } catch (error) {
    console.error("Error getting customers by company:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error,
    };
  }
};

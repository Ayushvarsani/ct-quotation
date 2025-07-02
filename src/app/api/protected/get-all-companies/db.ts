import { pool } from "../../lib/db";

export const getAllCompany = async () => {
  const query = `
    select * from company_info ORDER BY created_at desc;
  `;

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    return {
      msg: "No company found",
      code: 200,
      status: false,
    };
  }

  return {
    msg: "Company Found",
    code: 200,
    status: true,
    data: result.rows,
  };
};

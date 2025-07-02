import { pool } from "../../lib/db";

export const getAllCompany = async () => {
  const query = `
    select * ,ci.company_uuid as company_uuid from company_info ci left join quotation_labels qp on ci.company_uuid=qp.company_uuid ORDER BY ci.created_at desc;
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

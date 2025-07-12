import { pool } from "../../lib/db";

export interface UpdateCompanyMessageNumberParams {
  company_uuid: string;
  company_message_number: string;
}

export const updateCompanyMessageNumber = async (params: UpdateCompanyMessageNumberParams) => {
  const query = `
    UPDATE company_info 
    SET company_message_number = $1
    WHERE company_uuid = $2
    RETURNING company_uuid, company_message_number
  `;

  const values = [params.company_message_number, params.company_uuid];

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return {
        msg: "Company not found or update failed",
        code: 404,
        status: false,
      };
    }

    return {
      msg: "Company message number updated successfully",
      code: 200,
      status: true,
      data: result.rows[0],
    };
  } catch (error) {
    console.error("Error updating company message number:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error,
    };
  }
}; 
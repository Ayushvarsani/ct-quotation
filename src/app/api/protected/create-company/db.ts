import { pool } from "../../lib/db";

export interface CompanyInfo {
  company_name: string;
  company_email: string;
  company_mobile: string;
  company_country_code: string;
  comapny_location?: string;
  company_city?: string;
  company_state?: string;
  company_country?: string;
  company_gst?: string;
  created_by?: string;
  quotation_module?: boolean;
  bussiness_card_module?: boolean;
}

export const registerCompany = async (data: CompanyInfo) => {
  const query = `
    INSERT INTO company_info (
      company_name,
      company_email,
      company_mobile,
      company_country_code,
      comapny_location,
      company_city,
      company_state,
      company_country,
      company_gst,
      created_by,
      quotation_module,
      bussiness_card_module
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
    )
    RETURNING company_uuid
  `;

  const values = [
    data.company_name,
    data.company_email,
    data.company_mobile,
    data.company_country_code,
    data.comapny_location ?? null,
    data.company_city ?? null,
    data.company_state ?? null,
    data.company_country ?? null,
    data.company_gst ?? null,
    data.created_by ?? null,
    data.quotation_module ?? false,
    data.bussiness_card_module ?? false,
  ];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    return {
      msg: `Company not created`,
      code: 200,
      status: false,
    };
  }

  return {
    msg: `Company registered`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

import { pool } from "../../lib/db";

export interface WhatsAppApiKeyParams {
  company_uuid: string;
  whatsapp_api_key?: string;
}

export const getWhatsAppApiKey = async (company_uuid: string) => {
  const query = `
    SELECT * 
    FROM company_info 
    WHERE company_uuid = $1
  `;

  const values = [company_uuid];

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return {
        msg: "Company not found",
        code: 404,
        status: false,
      };
    }

    return {
      msg: "WhatsApp API key retrieved successfully",
      code: 200,
      status: true,
      data: {
        whatsapp_api_key: result.rows[0].whatsapp_api_ket || null,
      },
    };
  } catch (error) {
    console.error("Error getting WhatsApp API key:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const updateWhatsAppApiKey = async (params: WhatsAppApiKeyParams) => {
  const query = `
    UPDATE company_info 
    SET whatsapp_api_ket = $1
    WHERE company_uuid = $2
    RETURNING company_uuid, whatsapp_api_ket, company_name
  `;

  const values = [params.whatsapp_api_key, params.company_uuid];

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
      msg: "WhatsApp API key updated successfully",
      code: 200,
      status: true,
      data: {
        company_uuid: result.rows[0].company_uuid,
        whatsapp_api_key: result.rows[0].whatsapp_api_ket,
        company_name: result.rows[0].company_name,
      },
    };
  } catch (error) {
    console.error("Error updating WhatsApp API key:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}; 
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
  company_uuid?: string;
  status?: string;
  start_date?: Date;
  end_date?: Date;
  company_message_number?: string;
}
interface QuotationLabel {
  company_uuid?: string;
  product_name?: string;
  product_category?: string;
  product_size?: string;
  product_quantity?: string;
  product_cost?: string;
  product_series?: string;
  product_finish?: string;
  product_pieces_per_box?: string;
  product_weight?: string;
  product_sq_ft_box?: string;
  pre_grade?: boolean;
  eco_grade?: boolean;
  com_grade?: boolean;
  std_grade?: boolean;
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
      bussiness_card_module,
      start_date,
      end_date,
      company_message_number
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13,$14,$15
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
    data.start_date,
    data.end_date,
    data.company_message_number,
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

export const createQuotationLabel = async (data: QuotationLabel) => {
  const query = `
    INSERT INTO quotation_labels (
      company_uuid,
      product_name,
      product_category,
      product_size,
      product_quantity,
      product_cost,
      product_series,
      product_finish,
      product_pieces_per_box,
      product_weight,
      product_sq_ft_box,
      pre_grade,
      com_grade,
      eco_grade,
      std_grade
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12,$13,$14,$15
    )
    RETURNING id
  `;

  const values = [
    data.company_uuid,
    data.product_name ?? null,
    data.product_category ?? null,
    data.product_size ?? null,
    data.product_quantity ?? null,
    data.product_cost ?? null,
    data.product_series ?? null,
    data.product_finish ?? null,
    data.product_pieces_per_box ?? null,
    data.product_weight ?? null,
    data.product_sq_ft_box ?? null,
    data.pre_grade ?? false,
    data.com_grade ?? false,
    data.eco_grade ?? false,
    data.std_grade ?? false,
  ];

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return {
        msg: "Quotation label not created",
        code: 200,
        status: false,
      };
    }

    return {
      msg: "Quotation label created",
      code: 200,
      status: true,
      data: {
        id: result.rows[0].id,
      },
    };
  } catch (error) {
    console.error("Error creating quotation label:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error,
    };
  }
};

export const updateCompany = async (data: CompanyInfo) => {
  const query = `
    UPDATE company_info SET
      company_name = $1,
      company_email = $2,
      company_mobile = $3,
      company_country_code = $4,
      comapny_location = $5,
      company_city = $6,
      company_state = $7,
      company_country = $8,
      company_gst = $9,
      created_by = $10,
      quotation_module = $11,
      bussiness_card_module = $12,
      status=$13,
      start_date=$14,
      end_date=$15,
      company_message_number=$16
    WHERE company_uuid = $17
    RETURNING company_uuid
  `;

  const values = [
    data.company_name ?? null,
    data.company_email ?? null,
    data.company_mobile ?? null,
    data.company_country_code ?? null,
    data.comapny_location ?? null,
    data.company_city ?? null,
    data.company_state ?? null,
    data.company_country ?? null,
    data.company_gst ?? null,
    data.created_by ?? null,
    data.quotation_module ?? false,
    data.bussiness_card_module ?? false,
    data.status ?? "ACTIVE",
    data.start_date,
    data.end_date,
    data.company_message_number,
    data.company_uuid,
  ];

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
      msg: "Company updated successfully",
      code: 200,
      status: true,
      data: result.rows[0],
    };
  } catch (error) {
    console.error("Error updating company:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error,
    };
  }
};

export const updateQuotationLabel = async (data: QuotationLabel) => {
  const query = `
    UPDATE quotation_labels SET
      product_name = $1,
      product_category = $2,
      product_size = $3,
      product_quantity = $4,
      product_cost = $5,
      product_series = $6,
      product_finish = $7,
      product_pieces_per_box = $8,
      product_weight = $9,
      product_sq_ft_box = $10,
      pre_grade = $11,
      com_grade = $12,
      eco_grade = $13,
      std_grade = $14,
      updated_at = CURRENT_TIMESTAMP
    WHERE company_uuid = $15
    RETURNING id
  `;

  const values = [
    data.product_name ?? null,
    data.product_category ?? null,
    data.product_size ?? null,
    data.product_quantity ?? null,
    data.product_cost ?? null,
    data.product_series ?? null,
    data.product_finish ?? null,
    data.product_pieces_per_box ?? null,
    data.product_weight ?? null,
    data.product_sq_ft_box ?? null,
    data.pre_grade ?? false,
    data.com_grade ?? false,
    data.eco_grade ?? false,
    data.std_grade ?? false,
    data.company_uuid,
  ];

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return {
        msg: "Quotation label not found or update failed",
        code: 404,
        status: false,
      };
    }

    return {
      msg: "Quotation label updated",
      code: 200,
      status: true,
      data: {
        id: result.rows[0].id,
      },
    };
  } catch (error) {
    console.error("Error updating quotation label:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error,
    };
  }
};

export const getCompany = async (company_uuid: string) => {
  const query = `
    select * from company_info ci left join quotation_labels qp on ci.company_uuid=qp.company_uuid
    WHERE ci.company_uuid = $1`;

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
      msg: "Company get successfully",
      code: 200,
      status: true,
      data: result.rows[0],
    };
  } catch (error) {
    console.error("Error updating company:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error,
    };
  }
};

export const deleteCompany = async (
  company_uuid: string,
  admin_uuid: string
) => {
  const query = `update company_info set status='Inactive', deleted_by=$1 where company_uuid=$2 returning company_uuid;`;
  const query2 = `update customers set is_deleted=true,deleted_by=$1 where company_uuid=$2 returning company_uuid`;
  const values = [admin_uuid, company_uuid];

  try {
    const result = await pool.query(query, values);
    await pool.query(query2, values);
    if (result.rowCount === 0) {
      return {
        msg: "Company not found",
        code: 404,
        status: false,
      };
    }

    return {
      msg: "Company deleted successfully",
      code: 200,
      status: true,
      data: result.rows[0],
    };
  } catch (error) {
    console.error("Error updating company:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error,
    };
  }
};

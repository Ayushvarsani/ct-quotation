import { pool } from "../../lib/db";

export interface QuotationProduct {
  product_uuid?: string;
  product_name?: string;
  product_category?: string;
  product_size?: string;
  product_quantity?: number;
  product_cost?: number;
  customer_uuid: string;
  company_uuid?: string;
  product_series?: string;
  product_finish?: string;
  product_pieces_per_box?: number;
  product_weight?: number;
  product_sq_ft_box?: number;
}
export interface CompanyProduct {
  company_uuid: string;
}
export const registerQuotationProduct = async (data: QuotationProduct) => {
  const query = `
    INSERT INTO quotation_products (
      product_name,
      product_category,
      product_size,
      product_quantity,
      product_cost,
      customer_uuid,
      company_uuid,
      product_series,
      product_finish,
      product_pieces_per_box,
      product_weight,
      product_sq_ft_box
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12
    )
    RETURNING product_uuid
  `;

  const values = [
    data.product_name ?? null,
    data.product_category ?? null,
    data.product_size ?? null,
    data.product_quantity ?? null,
    data.product_cost ?? null,
    data.customer_uuid,
    data.company_uuid ?? null,
    data.product_series ?? null,
    data.product_finish ?? null,
    data.product_pieces_per_box ?? null,
    data.product_weight ?? null,
    data.product_sq_ft_box ?? null,
  ];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    return {
      msg: "Quotation product not created",
      code: 400,
      status: false,
    };
  }

  return {
    msg: "Quotation product created successfully",
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

export const getQuotationProduct = async (company_uuid: string) => {
  const query = `
    select * from quotation_products where company_uuid=$1;
  `;

  const values = [company_uuid];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    return {
      msg: "Quotation product not founded",
      code: 400,
      status: false,
    };
  }

  return {
    msg: "Quotation product founded successfully",
    code: 200,
    status: true,
    data: result.rows,
  };
};

export const updateQuotationProduct = async (data: QuotationProduct) => {
  if (!data.product_uuid) {
    return {
      msg: "Missing product_uuid for update",
      code: 400,
      status: false,
    };
  }

  const query = `
    UPDATE quotation_products SET
      product_name = $1,
      product_category = $2,
      product_size = $3,
      product_quantity = $4,
      product_cost = $5,
      customer_uuid = $6,
      product_series = $7,
      product_finish = $8,
      product_pieces_per_box = $9,
      product_weight = $10,
      product_sq_ft_box = $11,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_uuid = $12
    RETURNING product_uuid
  `;

  const values = [
    data.product_name ?? null,
    data.product_category ?? null,
    data.product_size ?? null,
    data.product_quantity ?? null,
    data.product_cost ?? null,
    data.customer_uuid,
    data.product_series ?? null,
    data.product_finish ?? null,
    data.product_pieces_per_box ?? null,
    data.product_weight ?? null,
    data.product_sq_ft_box ?? null,
    data.product_uuid,
  ];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    return {
      msg: "Quotation product not found or not updated",
      code: 404,
      status: false,
    };
  }

  return {
    msg: "Quotation product updated successfully",
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

export const deleteProduct = async (product_uuid: string) => {
  const query = `DELETE FROM public.quotation_products WHERE product_uuid=$1 returning product_uuid;`;

  const values = [product_uuid];

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return {
        msg: "Prdouct not found",
        code: 404,
        status: false,
      };
    }

    return {
      msg: "Product deleted successfully",
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

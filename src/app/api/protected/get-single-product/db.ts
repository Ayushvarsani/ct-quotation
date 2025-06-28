import { pool } from "../../lib/db";

export const getQuotationProduct = async (product_uuid: string) => {
  const query = `
    select * from quotation_products where product_uuid=$1;
  `;

  const values = [product_uuid];

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

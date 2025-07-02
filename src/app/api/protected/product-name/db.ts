import { pool } from "../../lib/db";

interface AddProductsName {
  company_uuid?: string;
  product_name?: string;
  created_by?: string;
}

export const getProductNames = async (company_uuid: string) => {
  const query = `select * from product_name_master where company_uuid=$1`;
  const values = [company_uuid];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `Products not found`,
      code: 200,
      status: false,
    };
  }
  return {
    msg: `Products found`,
    code: 200,
    status: true,
    data: result.rows,
  };
};

export const addProductNames = async (data: AddProductsName) => {
  const query = `INSERT into product_name_master(product_name,company_uuid,created_by) values($1,$2,$3) returning *`;
  const values = [data.product_name, data.company_uuid, data.created_by];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `Product not Added`,
      code: 200,
      status: false,
    };
  }
  return {
    msg: `Product Added`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

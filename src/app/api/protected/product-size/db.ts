import { pool } from "../../lib/db";

interface AddProductsSize {
  company_uuid?: string;
  product_size?: string;
  created_by?: string;
  product_size_uuid?: string;
}

export const getProductSizes = async (company_uuid: string) => {
  const query = `select * from product_size_master where company_uuid=$1`;
  const values = [company_uuid];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `Products Size not found`,
      code: 200,
      status: false,
    };
  }
  return {
    msg: `Products Size found`,
    code: 200,
    status: true,
    data: result.rows,
  };
};

export const addProductSizes = async (data: AddProductsSize) => {
  const query = `INSERT into product_size_master(product_size,company_uuid,created_by) values($1,$2,$3) returning *`;
  const values = [data.product_size, data.company_uuid, data.created_by];
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

export const updateProductSizes = async (data: AddProductsSize) => {
  const query = `update  product_size_master set product_size=$1 where product_size_uuid=$2`;
  const values = [data.product_size, data.product_size_uuid];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `Product Size Not Updated`,
      code: 200,
      status: false,
    };
  }
  return {
    msg: `Product Size Updated`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

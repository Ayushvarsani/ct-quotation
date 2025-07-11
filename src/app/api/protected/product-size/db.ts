import { pool } from "../../lib/db";

interface AddProductsSize {
  company_uuid?: string;
  product_size?: string;
  created_by?: string;
  product_size_uuid?: string;
}

interface UpdateProductSize {
  product_size: string;
  product_size_uuid: string;
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
  const checkQuery = `SELECT * FROM product_size_master WHERE company_uuid = $1 AND LOWER(product_size) = LOWER($2)`;
  const checkValues = [data.company_uuid, data.product_size];
  const checkResult = await pool.query(checkQuery, checkValues);
  if (checkResult.rowCount && checkResult.rowCount > 0) {
    return {
      msg: `Product size already exists for this company`,
      code: 400,
      status: false,
    };
  }

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

export const updateProductSizes = async (data: UpdateProductSize) => {
  // First, get the company_uuid for the product_size_uuid to ensure proper validation
  const getCompanyQuery = `SELECT company_uuid FROM product_size_master WHERE product_size_uuid = $1`;
  const getCompanyValues = [data.product_size_uuid];
  const getCompanyResult = await pool.query(getCompanyQuery, getCompanyValues);
  
  if (getCompanyResult.rowCount === 0) {
    return {
      msg: `Product size not found`,
      code: 404,
      status: false,
    };
  }

  const company_uuid = getCompanyResult.rows[0].company_uuid;

  // Check for duplicate product size within the same company (excluding current record)
  const checkQuery = `SELECT * FROM product_size_master WHERE company_uuid = $1 AND LOWER(product_size) = LOWER($2) AND product_size_uuid != $3`;
  const checkValues = [company_uuid, data.product_size, data.product_size_uuid];
  const checkResult = await pool.query(checkQuery, checkValues);
  if (checkResult.rowCount && checkResult.rowCount > 0) {
    return {
      msg: `Product size already exists for this company`,
      code: 400,
      status: false,
    };
  }

  // Update the product size
  const updateQuery = `UPDATE product_size_master SET product_size = $1 WHERE product_size_uuid = $2 RETURNING *`;
  const updateValues = [data.product_size, data.product_size_uuid];
  const result = await pool.query(updateQuery, updateValues);
  
  if (result.rowCount === 0) {
    return {
      msg: `Product Size Not Updated`,
      code: 400,
      status: false,
    };
  }
  
  return {
    msg: `Product Size Updated Successfully`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

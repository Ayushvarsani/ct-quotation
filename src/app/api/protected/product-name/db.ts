import { pool } from "../../lib/db";

interface AddProductsName {
  company_uuid?: string;
  product_name?: string;
  created_by?: string;
  product_name_uuid?: string;
}

interface UpdateProductName {
  product_name: string;
  product_name_uuid: string;
}

export const getProductNames = async (company_uuid: string) => {
  const query = `select * from product_name_master where company_uuid=$1 order by LOWER(product_name) ASC`;
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
  // Check if product name already exists for this company
  const checkQuery = `SELECT * FROM product_name_master WHERE company_uuid = $1 AND LOWER(product_name) = LOWER($2)`;
  const checkValues = [data.company_uuid, data.product_name];
  const checkResult = await pool.query(checkQuery, checkValues);
  
  if (checkResult.rowCount && checkResult.rowCount > 0) {
    return {
      msg: `Product name already exists for this company`,
      code: 400,
      status: false,
    };
  }

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

export const updateProductNames = async (data: UpdateProductName) => {
  // First get the company_uuid for the product being updated
  const getCompanyQuery = `SELECT company_uuid FROM product_name_master WHERE product_name_uuid = $1`;
  const getCompanyResult = await pool.query(getCompanyQuery, [data.product_name_uuid]);
  
  if (getCompanyResult.rowCount === 0) {
    return {
      msg: `Product not found`,
      code: 404,
      status: false,
    };
  }
  
  const company_uuid = getCompanyResult.rows[0].company_uuid;
  
  // Check if the new product name already exists for this company (excluding the current product)
  const checkQuery = `SELECT * FROM product_name_master WHERE company_uuid = $1 AND LOWER(product_name) = LOWER($2) AND product_name_uuid != $3`;
  const checkValues = [company_uuid, data.product_name, data.product_name_uuid];
  const checkResult = await pool.query(checkQuery, checkValues);
  
  if (checkResult.rowCount && checkResult.rowCount > 0) {
    return {
      msg: `Product name already exists for this company`,
      code: 400,
      status: false,
    };
  }

  const query = `UPDATE product_name_master SET product_name = $1 WHERE product_name_uuid = $2 RETURNING *`;
  const values = [data.product_name, data.product_name_uuid];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `Product not Updated`,
      code: 400,
      status: false,
    };
  }
  return {
    msg: `Product Updated Successfully`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

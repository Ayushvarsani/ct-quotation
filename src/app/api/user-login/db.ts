import { pool } from "../lib/db";

export const loginUser = async (email: string) => {
  const query = `select * from customers cs left join quotation_labels qp on cs.company_uuid=qp.company_uuid where cs.customer_email=$1`;
  const values = [email];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `customer not found`,
      code: 200,
      status: false,
    };
  }
  return {
    msg: `customer found`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

export const updateUserToken = async (email: string, jwt_token: string) => {
  const query = `update customers set jwt_token=$1  where customer_email=$2 returning customer_uuid`;
  const values = [jwt_token, email];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `customer not found`,
      code: 200,
      status: false,
    };
  }
  return {
    msg: `customer token updated`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

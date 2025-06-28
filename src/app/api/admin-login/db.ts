import { pool } from "../lib/db";

export const loginAdmin = async (email: string) => {
  const query = `select * from admin where admin_email=$1`;
  const values = [email];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `Admin not found`,
      code: 200,
      status: false,
    };
  }
  return {
    msg: `Admin found`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

export const updateAdminToken = async (email: string, jwt_token: string) => {
  const query = `update admin set jwt_token=$1 where admin_email=$2 returning admin_uuid`;
  const values = [jwt_token, email];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `Admin not found`,
      code: 200,
      status: false,
    };
  }
  return {
    msg: `Admin token updated`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

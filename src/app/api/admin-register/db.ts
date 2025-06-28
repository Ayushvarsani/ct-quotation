import { pool } from "../lib/db";
interface AdminLogin {
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_country_code: string;
  admin_mobile: string;
}
export const registerAdmin = async (data: AdminLogin) => {
  const query = `insert into admin(admin_name,admin_email,admin_password,admin_country_code,admin_mobile) 
  values($1,$2,$3,$4,$5) returning admin_uuid`;
  const values = [
    data.admin_name,
    data.admin_email,
    data.admin_password,
    data.admin_country_code,
    data.admin_mobile,
  ];
  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return {
      msg: `Admin Not Added`,
      code: 200,
      status: false,
    };
  }
  return {
    msg: `Admin Added`,
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

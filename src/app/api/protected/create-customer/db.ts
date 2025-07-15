import { pool } from "../../lib/db";
export interface CustomerInfo {
  customer_name: string;
  customer_email: string;
  customer_password: string;
  customer_country_code?: string;
  customer_mobile?: string; // Made optional
  customer_role?: number;
  quotation_module?: boolean;
  bussiness_card_module?: boolean;
  created_by_admin?: string;
  company_uuid?: string;
  customer_uuid: string;
  status?: string;
  company_password?: string;
}

export const registerCustomer = async (data: CustomerInfo) => {
  // Build dynamic query based on whether mobile is provided
  let query = `
    INSERT INTO customers (
      customer_name,
      customer_email,
      customer_password,
      customer_country_code,
      customer_role,
      quotation_module,
      bussiness_card_module,
      created_by_admin,
      company_uuid`;

  const values = [
    data.customer_name,
    data.customer_email,
    data.customer_password,
    data.customer_country_code ?? "+91",
    data.customer_role ?? null,
    data.quotation_module ?? false,
    data.bussiness_card_module ?? false,
    data.created_by_admin ?? null,
    data.company_uuid,
  ];

  // Add mobile number to query if provided
  if (data.customer_mobile && data.customer_mobile.trim() !== '') {
    query += `, customer_mobile`;
    values.push(data.customer_mobile);
  }

  query += `) VALUES (`;
  
  // Add placeholders for the values
  for (let i = 1; i <= values.length; i++) {
    query += `$${i}`;
    if (i < values.length) query += ', ';
  }
  
  query += `) RETURNING customer_uuid`;

  console.log(data);
  console.log(data.customer_password);
  console.log('Query:', query);
  console.log('Values:', values);

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    return {
      msg: "Customer not created",
      code: 400,
      status: false,
    };
  }

  return {
    msg: "Customer registered successfully",
    code: 200,
    status: true,
    data: result.rows[0],
  };
};

export const updateCustomer = async (data: CustomerInfo) => {
  let query = `
    UPDATE customers SET
      customer_name = $1,
      customer_email = $2,
      customer_country_code = $3,
      customer_role = $4,
      quotation_module = $5,
      bussiness_card_module = $6`;

  const values = [
    data.customer_name ?? null,
    data.customer_email ?? null,
    data.customer_country_code ?? "+91",
    data.customer_role ?? 1,
    data.quotation_module ?? false,
    data.bussiness_card_module ?? false,
  ];
  let index: number = values.length + 1;
  
  // Add mobile number to query if provided
  if (data.customer_mobile !== undefined && data.customer_mobile !== null) {
    query += `, customer_mobile = $${index}`;
    values.push(data.customer_mobile);
    index += 1;
  }
  console.log("data.customer_password ",data.customer_password);
  
  // Add password to query if provided
  if (data.customer_password != null && data.customer_password != undefined && data.customer_password.trim() !== '') {
    query += `, customer_password = $${index}`;
    values.push(data.customer_password);
    console.log("Password will be updated with:", data.customer_password);
    console.log("Password length:", data.customer_password.length);
    index += 1;
  } else {
    console.log("Password not provided or empty - skipping password update");
  }
  
  // Add status to query if provided
  if (data.status != null && data.status != undefined) {
    query += `, status = $${index}`;
    values.push(data.status);
    index += 1;
  }
  
  query += ` WHERE customer_uuid = $${index}
    RETURNING customer_uuid`;
  values.push(data.customer_uuid);
  
  console.log('Update Query:', query);
  console.log('Update Values:', values);
  
  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    return {
      msg: "Customer not found or update failed",
      code: 404,
      status: false,
    };
  }

  return {
    msg: "Customer updated successfully",
    code: 200,
    status: true,
    data: {
      customer_uuid: result.rows[0].customer_uuid,
    },
  };
};

export const getCustomer = async (customer_uuid: string) => {
  const query = `
    select * from customers
    WHERE customer_uuid = $1
  `;

  const values = [customer_uuid];

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return {
        msg: "Customer not found ",
        code: 404,
        status: false,
      };
    }

    return {
      msg: "Customer get successfully",
      code: 200,
      status: true,
      data: result.rows,
    };
  } catch (error) {
    console.error("Error updating customer:", error);
    return {
      msg: "Database error occurred",
      code: 500,
      status: false,
      error,
    };
  }
};

export const deleteCustomer = async (customer_uuid: string) => {
  const query2 = `DELETE FROM public.customers WHERE customer_uuid=$1 returning customer_uuid;`;
  const values = [customer_uuid];

  try {
    const result = await pool.query(query2, values);
    if (result.rowCount === 0) {
      return {
        msg: "Customer not found",
        code: 404,
        status: false,
      };
    }

    return {
      msg: "Customer deleted successfully",
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

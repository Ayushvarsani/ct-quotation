import { pool } from "../../lib/db";
export interface CustomerInfo {
  customer_name: string;
  customer_email: string;
  customer_password: string;
  customer_country_code?: string;
  customer_mobile: string;
  customer_role?: number;
  quotation_module?: boolean;
  bussiness_card_module?: boolean;
  created_by_admin?: string;
  company_uuid?: string;
  customer_uuid?: string;
}

export const registerCustomer = async (data: CustomerInfo) => {
  const query = `
    INSERT INTO customers (
      customer_name,
      customer_email,
      customer_password,
      customer_country_code,
      customer_mobile,
      customer_role,
      quotation_module,
      bussiness_card_module,
      created_by_admin,
      company_uuid
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,$10
    )
    RETURNING customer_uuid
  `;
  console.log(data);
  console.log(data.customer_password);
  const values = [
    data.customer_name,
    data.customer_email,
    data.customer_password,
    data.customer_country_code ?? "+91",
    data.customer_mobile,
    data.customer_role ?? null,
    data.quotation_module ?? false,
    data.bussiness_card_module ?? false,
    data.created_by_admin ?? null,
    data.company_uuid,
  ];

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
  const query = `
    UPDATE customers SET
      customer_name = $1,
      customer_email = $2,
      customer_country_code = $3,
      customer_mobile = $4,
      customer_role = $5,
      quotation_module = $6,
      bussiness_card_module = $7
    WHERE customer_uuid = $8
    RETURNING customer_uuid
  `;

  const values = [
    data.customer_name ?? null,
    data.customer_email ?? null,
    data.customer_country_code ?? "+91",
    data.customer_mobile ?? null,
    data.customer_role ?? 1,
    data.quotation_module ?? false,
    data.bussiness_card_module ?? false,
    data.customer_uuid,
  ];

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

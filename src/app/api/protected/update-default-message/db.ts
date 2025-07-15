import { NextRequest } from "next/server";
import { sql } from "@vercel/postgres";

export async function updateDefaultMessageNumber(request: NextRequest) {
  try {
    const { defaultMessageNo, customerUuid } = await request.json();

    if (!defaultMessageNo || !customerUuid) {
      return {
        status: false,
        msg: "Default message number and customer UUID are required",
      };
    }

    // Validate phone number format
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(defaultMessageNo)) {
      return {
        status: false,
        msg: "Invalid phone number format",
      };
    }

    // Update the default message number for the customer
    const result = await sql`
      UPDATE customers 
      SET default_message_no = ${defaultMessageNo}, 
          updated_at = NOW()
      WHERE customer_uuid = ${customerUuid}
      RETURNING customer_uuid, default_message_no
    `;

    if (result.rowCount === 0) {
      return {
        status: false,
        msg: "Customer not found",
      };
    }

    return {
      status: true,
      msg: "Default message number updated successfully",
      data: {
        customerUuid: result.rows[0].customer_uuid,
        defaultMessageNo: result.rows[0].default_message_no,
      },
    };
  } catch (error) {
    console.error("Error updating default message number:", error);
    return {
      status: false,
      msg: "Internal server error",
    };
  }
} 
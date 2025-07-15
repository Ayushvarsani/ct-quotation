import axios from "axios"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobile, message, apikey,pdf } = body

    if (!mobile || !message || !apikey || !pdf ) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Make the WhatsApp API call from the backend
    const whatsappUrl = `http://whatsappapi.fastsmsindia.com/wapp/api/send`
    const params = new URLSearchParams({
      apikey: apikey,
      mobile: `91${mobile}`,
      msg: message,
      pdf:pdf
    })

    const response = await axios.post(`${whatsappUrl}?${params.toString()}`)
    console.log(response.data)
    const responseData = response.data

    if (responseData && responseData.status === "success") {
      return NextResponse.json({ 
        success: true, 
        message: "WhatsApp message sent successfully",
        data: responseData 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: responseData?.message || "Failed to send WhatsApp message",
        data: responseData 
      }, { status: 400 })
    }

  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 
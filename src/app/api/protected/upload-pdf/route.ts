import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_TOKEN_KEY)

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("x-auth-token")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      if (!payload?.userUuid) {
        return NextResponse.json(
          { message: "Unauthorized: Invalid token payload" },
          { status: 401 }
        )
      }
    } catch {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      )
    }

    const requestBody = await request.json()
    
    // Handle both object format and direct properties
    let pdfBase64: string
    let fileName: string
    
    if (requestBody.value && typeof requestBody.value === 'object') {
      // If value is an object, extract pdfBase64 and fileName from it
      pdfBase64 = requestBody.value.pdfBase64
      fileName = requestBody.value.fileName
    } else {
      // Direct properties format
      pdfBase64 = requestBody.pdfBase64
      fileName = requestBody.fileName
    }

    if (!pdfBase64 || !fileName) {
      return NextResponse.json(
        { error: "PDF data and filename are required" },
        { status: 400 }
      )
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64")

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const uniqueFileName = `quotations/${timestamp}.pdf`

    // Validate environment variables
    let bucketName = process.env.S3_BUCKET_NAME
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    const region = process.env.AWS_REGION || "us-east-1"
    
    // Extract bucket name if full URL is provided
    if (bucketName && bucketName.includes('s3.')) {
      // Extract bucket name from URL like "https://ct-quotation.s3.ap-south-1.amazonaws.com/"
      const urlMatch = bucketName.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com/)
      if (urlMatch) {
        bucketName = urlMatch[1] // Extract just the bucket name
      }
    }
    
    console.log("Bucket:", bucketName, "Region:", region)
    if (!bucketName) {
      return NextResponse.json(
        { error: "S3_BUCKET_NAME environment variable is not configured" },
        { status: 500 }
      )
    }

    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { error: "AWS credentials are not configured. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY" },
        { status: 500 }
      )
    }

    // Upload to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      ContentDisposition: "inline",
    }

    const command = new PutObjectCommand(uploadParams)
    await s3Client.send(command)

    // Generate S3 URL
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueFileName}`

    return NextResponse.json({
      success: true,
      url: s3Url,
      fileName: uniqueFileName,
      message: "PDF uploaded successfully to S3",
    })
  } catch (error) {
    console.error("Error uploading PDF to S3:", error)
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('AccessDenied')) {
        return NextResponse.json(
          { error: "Access denied to S3 bucket. Check AWS credentials and permissions." },
          { status: 500 }
        )
      } else if (error.message.includes('NoSuchBucket')) {
        return NextResponse.json(
          { error: "S3 bucket not found. Check AWS_S3_BUCKET_NAME environment variable." },
          { status: 500 }
        )
      } else if (error.message.includes('InvalidAccessKeyId')) {
        return NextResponse.json(
          { error: "Invalid AWS access key. Check AWS_ACCESS_KEY_ID environment variable." },
          { status: 500 }
        )
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        return NextResponse.json(
          { error: "Invalid AWS secret key. Check AWS_SECRET_ACCESS_KEY environment variable." },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Failed to upload PDF to S3", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 
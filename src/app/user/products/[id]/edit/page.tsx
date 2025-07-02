"use client"

import ProductForm from "@/components/productForm/page"
import { useParams } from "next/navigation"

export default function EditProductPage() {
  const params = useParams()
  const { id } = params 

  return <ProductForm productId={id as string} />
}

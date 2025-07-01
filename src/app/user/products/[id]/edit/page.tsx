"use client"
import ProductForm from "@/components/productForm/page"
import { useParams } from "next/navigation"

export default function EditProductPage() {
  const params = useParams();
  const { product_uuid } = params;
  return <ProductForm productId={product_uuid as string} />
}

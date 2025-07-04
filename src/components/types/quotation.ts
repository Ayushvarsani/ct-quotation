// Quotation-related types
export interface Product {
  id: number
  product_uuid: string
  product_name: string
  product_category: string
  product_size: string
  product_series: string
  product_finish: string
  product_pieces_per_box: number
  product_sq_ft_box: number
  product_weight: number
}

export interface ProductGroup {
  name: string
  products: Product[]
}

export interface FormData {
  Name: string
  mobile: string
  refParty: string
  seName: string
  paymentWithDays: string
  tax: string
  remark: string
}

export interface ProductPricing {
  [key: number]: {
    premium: string
    standard: string
    price: string
    com?: string
    eco?: string
  }
}

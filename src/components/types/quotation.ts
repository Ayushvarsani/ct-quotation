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

export interface Column {
  key: string;
  label: string;
  visible: boolean;
}

export interface User {
  name?: string;
  usermobile?: string;
  companyuuid?: string;
}

export interface GradeFields {
  com_grade?: string;
  eco_grade?: string;
  pre_grade?: string;
  std_grade?: string;
}

export interface ProductFields {
  product_size?: string;
  product_category?: string;
  product_series?: string;
  product_finish?: string;
  product_pieces_per_box?: string;
  product_sq_ft_box?: string;
  product_weight?: string;
}

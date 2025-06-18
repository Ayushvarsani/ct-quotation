import { NextResponse } from 'next/server';

// Reference to the products array from the parent route
let products = [
  {
    id: 1,
    name: 'Sample Product 1',
    description: 'This is a sample product description',
    price: 99.99,
    stock: 100,
  },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = products.find((p) => p.id === parseInt(params.id));
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const index = products.findIndex((p) => p.id === parseInt(params.id));
  
  if (index === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  products[index] = {
    ...products[index],
    ...data,
  };

  return NextResponse.json(products[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const index = products.findIndex((p) => p.id === parseInt(params.id));
  
  if (index === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  products = products.filter((p) => p.id !== parseInt(params.id));
  return NextResponse.json({ message: 'Product deleted successfully' });
} 
import { NextResponse } from 'next/server';

// This is a mock database. In a real application, you would use a proper database
let products = [
  {
    id: 1,
    name: 'Sample Product 1',
    description: 'This is a sample product description',
    price: 99.99,
    stock: 100,
  },
];

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newProduct = {
    id: products.length + 1,
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    stock: parseInt(data.stock),
  };
  products.push(newProduct);
  return NextResponse.json(newProduct);
}

export async function PUT(request: Request) {
  const data = await request.json();
  const { id, ...updateData } = data;
  
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  products[productIndex] = {
    ...products[productIndex],
    ...updateData,
    price: parseFloat(updateData.price),
    stock: parseInt(updateData.stock),
  };

  return NextResponse.json(products[productIndex]);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '0');

  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  products = products.filter((p) => p.id !== id);
  return NextResponse.json({ success: true });
} 
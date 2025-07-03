'use client'
import UserForm from '@/components/userForm/page';
import { useParams } from 'next/navigation';

export default function EditUserPage() {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  return <UserForm userId={userId} mode="edit" />;
} 
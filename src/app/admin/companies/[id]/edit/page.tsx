'use client';

import CompanyForm from '@/components/CompanyForm';
import { useParams } from 'next/navigation';

export default function EditCompanyPage() {
  const params = useParams();
  const companyId = Array.isArray(params.id) ? params.id[0] : params.id;
  return <CompanyForm mode="edit" companyId={companyId} />;
} 
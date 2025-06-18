'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  employeeCount: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export default function CompanyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here you would typically fetch the company data from your API
    // This is just sample data for demonstration
    setCompany({
      id: params.id,
      name: 'Tech Corp',
      email: 'contact@techcorp.com',
      phone: '+1 234 567 890',
      address: '123 Tech Street, Silicon Valley, CA',
      industry: 'Technology',
      employeeCount: 100,
      description: 'A leading technology company specializing in software solutions.',
      status: 'in_progress',
      createdAt: '2024-03-20',
      updatedAt: '2024-03-20',
    });
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-600">Company not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <div className="flex space-x-4">
                <Link
                  href={`/admin/companies/${company.id}/edit`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Edit Company
                </Link>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Status</h2>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                    ${company.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      company.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {company.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Email</h2>
                  <p className="mt-1 text-gray-900">{company.email}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Phone</h2>
                  <p className="mt-1 text-gray-900">{company.phone}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Industry</h2>
                  <p className="mt-1 text-gray-900">{company.industry}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Number of Employees</h2>
                  <p className="mt-1 text-gray-900">{company.employeeCount}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Address</h2>
                  <p className="mt-1 text-gray-900">{company.address}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Description</h2>
                  <p className="mt-1 text-gray-900">{company.description}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Created At</h2>
                  <p className="mt-1 text-gray-900">{company.createdAt}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Last Updated</h2>
                  <p className="mt-1 text-gray-900">{company.updatedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
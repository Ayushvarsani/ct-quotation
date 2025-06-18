"use client";

import { useState } from "react";

interface FormData {
  name: string;
  ref: string;
  partyGroup: string;
  date: string;
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}

const Input = ({ label, value, onChange, type = "text", placeholder, className = "" }: InputProps) => (
  <div className="flex items-center gap-4 group">
    <label className="w-24 text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400 ${className}`}
      placeholder={placeholder}
      aria-label={label}
    />
  </div>
);

const QuotationPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    ref: "",
    partyGroup: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [taxes, setTaxes] = useState("");
  const [paymentWithin, setPaymentWithin] = useState("");
  const [customNote, setCustomNote] = useState("");

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 container mx-auto">
      <div className="w-full px-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 transform transition-all hover:shadow-3xl">
          <div className="flex justify-between items-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Price List
            </h1>
          </div>
          <div className="flex justify-between mb-8 border-b pb-6">
            <div className="space-y-6 w-2/3">
              <Input
                label="Name"
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder="Enter Name"
              />
              <Input
                label="Reference"
                value={formData.ref}
                onChange={handleInputChange("ref")}
                placeholder="Enter Reference"
              />
              <Input
                label="Party Group"
                value={formData.partyGroup}
                onChange={handleInputChange("partyGroup")}
                placeholder="Enter Party Group"
              />
            </div>
            <div className="flex gap-4 w-[30%] justify-end">
              <div className="h-full flex flex-col justify-start group">
                <Input
                  label="Date"
                  value={formData.date}
                  onChange={handleInputChange("date")}
                  type="date"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <table className="w-full border-collapse">
            <thead>
                <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Sr. No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Packing</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Sq. Ft.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Weight</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Prem</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">1</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter item"
                        />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter description"
                        />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Qty"
                        />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Price"
                        />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">0.00</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                        <button className="text-red-600 hover:text-red-800 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </td>
                </tr>
            </tbody>
          </table>
          {/* Note Section */}
          <div className="mt-10">
            <div className="text-lg font-semibold mb-2">Note :-</div>
            <ol className="list-decimal ml-6 space-y-2">
              <li>
                Taxes <input
                  type="text"
                  value={taxes}
                  onChange={e => setTaxes(e.target.value)}
                  className="border-b border-black w-40 outline-none focus:border-blue-500 bg-transparent px-2"
                  placeholder=""
                />
              </li>
              <li>
                Payment within <input
                  type="text"
                  value={paymentWithin}
                  onChange={e => setPaymentWithin(e.target.value)}
                  className="border-b border-black w-34 outline-none focus:border-blue-500 bg-transparent px-2"
                  placeholder=""
                /> from date of billing
              </li>
              <li>
                <input
                  type="text"
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  className="border-b border-black w-full outline-none focus:border-blue-500 bg-transparent px-2"
                  placeholder=""
                />
              </li>
            </ol>
          </div>
          {/* Button Section */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2"
              onClick={() => {/* Add share functionality */}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share
            </button>
            <button
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              onClick={() => {/* Add preview functionality */}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPage;

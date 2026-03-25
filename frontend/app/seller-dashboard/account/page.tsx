"use client";

import React, { useState, useEffect } from "react";
import { useSeller } from "../SellerContext";
import { Save, Upload } from "lucide-react";

export default function AccountPage() {
  const { seller, loading, refreshData } = useSeller();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shopName: "",
    address: "",
    description: "",
    gstNumber: "",
  });
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (seller) {
      setFormData({
        name: seller.name || "",
        email: seller.email || "",
        phone: seller.phone || "",
        shopName: seller.shopDetails?.shopName || "",
        address: seller.shopDetails?.address || "",
        description: seller.shopDetails?.description || "",
        gstNumber: seller.gstNumber || "",
      });
      if (seller.documents && seller.documents.length > 0) {
        setDocumentUrl(seller.documents[seller.documents.length - 1]);
      }
    }
  }, [seller]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const data = new FormData();
    data.append("document", file);

    try {
      setUploading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");

      const result = await res.json();
      setDocumentUrl(result.filePath);
      setMessage({ type: "success", text: "File uploaded successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to upload file." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("sellerToken");

      const payload = {
        ...formData,
        documents: documentUrl ? [documentUrl] : [],
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/account`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update account details");
      }

      await refreshData();
      setMessage({ type: "success", text: "Account details updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900">Account Settings</h1>
        <p className="mt-2 text-gray-600">Manage your personal and store information.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-6 sm:p-8 space-y-8">
          
          {/* Personal Info Section */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 border-b border-gray-200 pb-8">
            <div className="sm:col-span-6">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Personal Information</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">Update your contact details.</p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
              <div className="mt-2">
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email Address</label>
              <div className="mt-2">
                <input type="email" name="email" id="email" disabled value={formData.email} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-500 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 px-3 cursor-not-allowed" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">Phone Number</label>
              <div className="mt-2">
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>
          </div>

          {/* Store Info Section */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 border-b border-gray-200 pb-8">
            <div className="sm:col-span-6">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Store Details</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">Information visible to customers.</p>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="shopName" className="block text-sm font-medium leading-6 text-gray-900">Store Name</label>
              <div className="mt-2">
                <input type="text" name="shopName" id="shopName" value={formData.shopName} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Store Description</label>
              <div className="mt-2">
                <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3"></textarea>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">Store Address</label>
              <div className="mt-2">
                <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>
          </div>

          {/* GST and Documents Section */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Legal & Documents</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">GST information and verification documents.</p>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="gstNumber" className="block text-sm font-medium leading-6 text-gray-900">GST Number</label>
              <div className="mt-2">
                <input type="text" name="gstNumber" id="gstNumber" value={formData.gstNumber} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3 uppercase" placeholder="e.g. 22AAAAA0000A1Z5" />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">GST Registration Document</label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 transition-colors hover:bg-gray-50">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-burgundy focus-within:outline-none focus-within:ring-2 focus-within:ring-burgundy focus-within:ring-offset-2 hover:text-burgundy/80">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept="image/*,.pdf" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, PDF up to 10MB</p>
                  
                  {uploading && <p className="text-sm mt-3 text-blue-600 font-medium animate-pulse">Uploading...</p>}
                  
                  {documentUrl && !uploading && (
                     <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100 flex items-center justify-between">
                       <span className="text-sm text-green-800 truncate px-2">Document attached</span>
                       <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${documentUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-burgundy font-medium hover:underline">
                         View File
                       </a>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50">
          <button type="button" onClick={() => refreshData()} className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700">
            Reset
          </button>
          <button type="submit" disabled={saving || uploading} className="rounded-md bg-burgundy px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-burgundy/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

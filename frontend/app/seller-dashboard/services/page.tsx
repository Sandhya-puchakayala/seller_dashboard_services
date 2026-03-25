"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Image as ImageIcon, Search, MoreVertical, Edit2, Trash2, ArrowLeft, Upload, ExternalLink } from "lucide-react";
import { useSeller } from "../SellerContext";

interface ServiceFormData {
  _id?: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: string;
  salePrice?: string;
  image: string;
  images: string[];
  category: string;
  status: string;
  duration?: string;
  availability?: string;
}

const defaultFormData: ServiceFormData = {
  name: "",
  description: "",
  shortDescription: "",
  price: "",
  salePrice: "",
  image: "",
  images: [],
  category: "",
  status: "Draft",
  duration: "",
  availability: "Available"
};

export default function ServicesPage() {
  const { services = [], loading, refreshData } = useSeller() as any;
  
  const [viewState, setViewState] = useState<"LIST" | "ADD" | "EDIT">("LIST");
  const [addStep, setAddStep] = useState(1);
  const [currentService, setCurrentService] = useState<ServiceFormData>(defaultFormData);
  
  const [activeTab, setActiveTab] = useState("Edit");
  const tabs = ["Edit", "Details"];

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // KPIs
  const publishedCount = services.filter(s => s.status === "Published" || s.status === "Online").length;
  const draftCount = services.filter(s => s.status === "Draft").length;
  const availableCount = services.filter(s => s.availability === "Available").length;
  const totalServices = services.length;

  const handleEdit = (service: any) => {
    setCurrentService({
      _id: service._id,
      name: service.name || "",
      description: service.description || "",
      price: service.price?.toString() || "",
      image: service.image || "",
      images: service.images || [],
      category: service.category || "",
      status: service.status || "Draft",
      duration: service.duration || "",
      availability: service.availability || "Available"
    });
    setViewState("EDIT");
    setActiveTab("Edit");
  };

  const handleAddNew = () => {
    setCurrentService(defaultFormData);
    setViewState("ADD");
    setAddStep(1);
    setActiveTab("Edit");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const token = localStorage.getItem("sellerToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshData();
    } catch (err) {
      alert("Failed to delete service.");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("sellerToken");
      const url = viewState === "ADD" 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/services`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/services/${currentService._id}`;
      
      const payload: any = {
        ...currentService,
        price: Number(currentService.price) || 0,
      };

      if (payload.salePrice === "") delete payload.salePrice;
      else if (payload.salePrice !== undefined) payload.salePrice = Number(payload.salePrice);
      
      if (!payload.name) {
        alert("Service Name is required.");
        setSaving(false);
        return;
      }

      const res = await fetch(url, {
        method: viewState === "ADD" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save service from backend");
      }
      
      refreshData();
      setViewState("LIST");
    } catch (err: any) {
      alert("Error saving service: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
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
      
      if (isGallery) {
        setCurrentService(prev => ({ ...prev, images: [...prev.images, result.filePath] }));
      } else {
        setCurrentService(prev => ({ ...prev, image: result.filePath }));
      }
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading && viewState === "LIST") {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      {viewState === "LIST" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Services List</h1>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1e1e1e] text-white p-4 rounded text-center">
              <div className="text-2xl font-bold">{totalServices}</div>
              <div className="text-sm text-gray-300">Total Services</div>
            </div>
            <div className="bg-[#1e1e1e] text-white p-4 rounded text-center">
              <div className="text-2xl font-bold">{publishedCount}</div>
              <div className="text-sm text-gray-300">Published</div>
            </div>
            <div className="bg-[#1e1e1e] text-white p-4 rounded text-center">
              <div className="text-2xl font-bold">{availableCount}</div>
              <div className="text-sm text-gray-300">Available</div>
            </div>
            <div className="bg-[#1e1e1e] text-white p-4 rounded text-center">
              <div className="text-2xl font-bold">{draftCount}</div>
              <div className="text-sm text-gray-300">Draft</div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded border border-gray-200">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                <Trash2 className="w-4 h-4 text-red-500" /> Delete
              </button>
              <button onClick={handleAddNew} className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Search Service by..." className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500" />
              <button className="px-4 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Search</button>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Click on the Name to edit a service. Hover on rows to see actions.
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 w-12"><input type="checkbox" className="rounded" /></th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Image</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Price</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Availability</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No services found.</td></tr>
                ) : (
                  services.map(s => (
                    <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50 group">
                      <td className="py-3 px-4"><input type="checkbox" className="rounded" /></td>
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 bg-gray-100 border flex items-center justify-center rounded">
                          {s.image ? <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${s.image}`} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-blue-500 hover:underline cursor-pointer font-medium" onClick={() => handleEdit(s)}>{s.name}</div>
                        <div className="hidden group-hover:flex gap-2 text-xs mt-1">
                           <span className="text-gray-500 cursor-pointer hover:text-blue-500" onClick={() => handleEdit(s)}>Edit</span> | 
                           <span className="text-red-500 cursor-pointer hover:underline" onClick={() => handleDelete(s._id)}>Trash</span> | 
                           <span className="text-gray-500 cursor-pointer hover:text-blue-500">View</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">${s.price}</td>
                      <td className="py-3 px-4 text-gray-600">{s.status || 'Draft'}</td>
                      <td className="py-3 px-4 text-gray-600">{s.availability || 'Available'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : viewState === "ADD" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setViewState("LIST")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-medium text-gray-900">Add Service</h1>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md">
            {addStep === 1 ? (
               <div className="p-8 space-y-6 min-h-[500px]">
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Service Category</label>
                    <input type="text" placeholder="Choose category" value={currentService.category} onChange={e => setCurrentService({...currentService, category: e.target.value})} className="w-full sm:max-w-md px-3 py-2 border border-gray-200 focus:outline-none focus:border-blue-500 rounded" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 pt-4">
                    <div className="hidden sm:block"></div>
                    <div>
                      <button onClick={() => setAddStep(2)} className="bg-[#111] text-white px-6 py-2 rounded text-sm font-medium hover:bg-black transition-colors">
                        Next
                      </button>
                    </div>
                  </div>
               </div>
            ) : (
               <div className="p-8 max-w-4xl space-y-8 min-h-[600px] mb-8">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Service Name<span className="text-red-500">*</span> :</label>
                   <input type="text" value={currentService.name} onChange={e => setCurrentService({...currentService, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm" required />
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between items-center mb-1">
                     <label className="text-sm font-bold text-gray-700">About Service</label>
                   </div>
                   <button type="button" className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-xs font-medium text-gray-700 hover:bg-gray-100 mb-2 shadow-sm">
                     <ImageIcon className="w-3.5 h-3.5" /> Add Media
                   </button>
                   <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
                     <div className="bg-[#f0f0f1] border-b border-gray-300 px-2 py-1 flex items-center gap-2 text-gray-600">
                       <select className="text-xs bg-transparent border-0 outline-none"><option>Paragraph</option></select>
                       <div className="w-px h-4 bg-gray-300 mx-1"></div>
                       <button className="font-bold px-2 hover:bg-gray-200 rounded">B</button>
                       <button className="italic px-2 hover:bg-gray-200 rounded">I</button>
                     </div>
                     <textarea rows={8} value={currentService.description} onChange={e => setCurrentService({...currentService, description: e.target.value})} className="w-full p-3 focus:outline-none resize-y" />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Service Thumbnail</label>
                   <div className="mt-2 mb-2 w-16 h-16 bg-gray-50 border border-gray-200 rounded flex flex-col items-center justify-center relative overflow-hidden">
                      {currentService.image ? (
                        <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${currentService.image}`} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      )}
                   </div>
                   <label className="text-sm text-blue-500 hover:underline cursor-pointer">
                     Upload Thumbnail
                     <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, false)} />
                   </label>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Price ($)</label>
                   <input type="number" value={currentService.price} onChange={e => setCurrentService({...currentService, price: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm" />
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Service Short Description</label>
                   <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
                     <div className="bg-[#f0f0f1] border-b border-gray-300 px-2 py-1 flex items-center gap-2 text-gray-600">
                       <select className="text-xs bg-transparent border-0 outline-none"><option>Paragraph</option></select>
                       <div className="w-px h-4 bg-gray-300 mx-1"></div>
                       <button className="font-bold px-2 hover:bg-gray-200 rounded">B</button>
                       <button className="italic px-2 hover:bg-gray-200 rounded">I</button>
                     </div>
                     <textarea rows={6} value={currentService.shortDescription || ''} onChange={e => setCurrentService({...currentService, shortDescription: e.target.value})} className="w-full p-4 focus:outline-none resize-y min-h-[120px]" />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Duration</label>
                   <input type="text" value={currentService.duration || ''} onChange={e => setCurrentService({...currentService, duration: e.target.value})} placeholder="e.g., 1 hour, 30 minutes" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm" />
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Status</label>
                   <select value={currentService.status} onChange={e => setCurrentService({...currentService, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm bg-white">
                     <option>Draft</option>
                     <option>Published</option>
                   </select>
                 </div>

                 <div className="pt-6 mt-6 flex justify-center pb-8 border-t border-gray-100">
                   <button onClick={handleSave} disabled={saving || uploading} className="px-12 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                     {saving ? "Saving..." : "Save"}
                   </button>
                 </div>
               </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setViewState("LIST")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-medium text-gray-900">Edit Service: {currentService.name}</h1>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md">
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-gray-200 bg-[#f8f9fa] px-2 pt-2 gap-1 rounded-t-md">
              {tabs.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium border border-b-0 rounded-t-md transition-colors ${activeTab === tab ? "bg-white text-gray-900 border-gray-200 relative top-[1px]" : "bg-transparent text-gray-500 border-transparent hover:text-gray-700"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">
              {activeTab === "Edit" && (
                <div className="space-y-6 max-w-4xl">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Service Name<span className="text-red-500">*</span> :</label>
                     <input 
                       type="text" 
                       value={currentService.name}
                       onChange={e => setCurrentService({...currentService, name: e.target.value})}
                       placeholder="Enter service name"
                       className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Price ($)</label>
                     <input 
                       type="number" 
                       value={currentService.price}
                       onChange={e => setCurrentService({...currentService, price: e.target.value})}
                       className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>

                   <div className="space-y-2">
                     <div className="flex justify-between items-center mb-1">
                       <label className="text-sm font-bold text-gray-700">About Service</label>
                     </div>
                     <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
                       <div className="bg-[#f0f0f1] border-b border-gray-300 px-2 py-1 flex items-center gap-2 text-gray-600">
                         <select className="text-xs bg-transparent border-0 outline-none"><option>Paragraph</option></select>
                         <div className="w-px h-4 bg-gray-300 mx-1"></div>
                         <button className="font-bold px-1 hover:bg-gray-200 rounded">B</button>
                         <button className="italic px-1 hover:bg-gray-200 rounded">I</button>
                       </div>
                       <textarea 
                         rows={8}
                         value={currentService.description}
                         onChange={e => setCurrentService({...currentService, description: e.target.value})}
                         className="w-full p-3 focus:outline-none resize-y"
                         placeholder="Enter service description..."
                       />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Service Category</label>
                     <input 
                       type="text" 
                       value={currentService.category}
                       onChange={e => setCurrentService({...currentService, category: e.target.value})}
                       className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Duration</label>
                     <input 
                       type="text" 
                       value={currentService.duration || ''}
                       onChange={e => setCurrentService({...currentService, duration: e.target.value})}
                       placeholder="e.g., 1 hour, 30 minutes"
                       className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>
                </div>
              )}

              {activeTab === "Details" && (
                <div className="space-y-6 max-w-4xl">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Status</label>
                     <select 
                       value={currentService.status}
                       onChange={e => setCurrentService({...currentService, status: e.target.value})}
                       className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm bg-white"
                     >
                       <option>Draft</option>
                       <option>Published</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Availability</label>
                     <select 
                       value={currentService.availability}
                       onChange={e => setCurrentService({...currentService, availability: e.target.value})}
                       className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm bg-white"
                     >
                       <option>Available</option>
                       <option>Unavailable</option>
                       <option>By Appointment</option>
                     </select>
                   </div>
                </div>
              )}

              <div className="pt-6 mt-6 flex justify-center pb-8 border-t border-gray-100">
                <button onClick={handleSave} disabled={saving || uploading} className="px-12 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

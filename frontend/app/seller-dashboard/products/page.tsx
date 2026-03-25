"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Image as ImageIcon, Search, MoreVertical, Edit2, Trash2, ArrowLeft, Upload, ExternalLink } from "lucide-react";
import { useSeller } from "../SellerContext";

interface ProductFormData {
  _id?: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: string;
  salePrice?: string;
  sku?: string;
  image: string;
  images: string[];
  type: string;
  category: string;
  status: string;
  stock: string;
  stockStatus: string;
  isVirtual: boolean;
  isDownloadable: boolean;
  shipping: {
    weight: string;
    dimensions: { length: string; width: string; height: string };
    shippingClass: string;
  };
  linked: { upsells: string; crossSells: string };
}

const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  shortDescription: "",
  price: "",
  salePrice: "",
  sku: "",
  image: "",
  images: [],
  type: "Simple product",
  category: "",
  status: "Draft",
  stock: "0",
  stockStatus: "In stock",
  isVirtual: false,
  isDownloadable: false,
  shipping: {
    weight: "0",
    dimensions: { length: "", width: "", height: "" },
    shippingClass: "No shipping class"
  },
  linked: { upsells: "", crossSells: "" }
};

export default function ProductsPage() {
  const { products, loading, refreshData } = useSeller();
  
  const [viewState, setViewState] = useState<"LIST" | "ADD" | "EDIT">("LIST");
  const [addStep, setAddStep] = useState(1);
  const [currentProduct, setCurrentProduct] = useState<ProductFormData>(defaultFormData);
  
  const [activeTab, setActiveTab] = useState("Edit");
  const tabs = ["Edit", "Inventory", "Shipping", "Linked Products", "Attributes", "Tags & Brand", "Status"];

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // KPIs
  const publishedCount = products.filter(p => p.status === "Published" || p.status === "Online").length;
  const lowStockCount = products.filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0).length;
  const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;
  const draftCount = products.filter(p => p.status === "Draft").length;
  const onSaleCount = 0;

  const handleEdit = (product: any) => {
    setCurrentProduct({
      _id: product._id,
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      image: product.image || "",
      images: product.images || [],
      type: product.type || "Simple product",
      category: product.category || "",
      status: product.status || "Draft",
      stock: product.stock?.toString() || "0",
      stockStatus: product.stockStatus || "In stock",
      isVirtual: product.isVirtual || false,
      isDownloadable: product.isDownloadable || false,
      shipping: {
        weight: product.shipping?.weight?.toString() || "0",
        dimensions: {
          length: product.shipping?.dimensions?.length?.toString() || "",
          width: product.shipping?.dimensions?.width?.toString() || "",
          height: product.shipping?.dimensions?.height?.toString() || "",
        },
        shippingClass: product.shipping?.shippingClass || "No shipping class"
      },
      linked: {
        upsells: product.linked?.upsells?.join(", ") || "",
        crossSells: product.linked?.crossSells?.join(", ") || "",
      }
    });
    setViewState("EDIT");
    setActiveTab("Edit");
  };

  const handleAddNew = () => {
    setCurrentProduct(defaultFormData);
    setViewState("ADD");
    setAddStep(1);
    setActiveTab("Edit");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("sellerToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshData();
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("sellerToken");
      const url = viewState === "ADD" 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/products`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/products/${currentProduct._id}`;
      
      const payload: any = {
        ...currentProduct,
        price: Number(currentProduct.price) || 0,
        stock: Number(currentProduct.stock) || 0,
        shipping: {
          ...currentProduct.shipping,
          weight: Number(currentProduct.shipping.weight) || 0,
          dimensions: {
            length: Number(currentProduct.shipping.dimensions.length) || 0,
            width: Number(currentProduct.shipping.dimensions.width) || 0,
            height: Number(currentProduct.shipping.dimensions.height) || 0,
          }
        },
        linked: {
          upsells: currentProduct.linked.upsells.split(",").map(s => s.trim()).filter(Boolean),
          crossSells: currentProduct.linked.crossSells.split(",").map(s => s.trim()).filter(Boolean),
        }
      };

      if (payload.salePrice === "") delete payload.salePrice;
      else if (payload.salePrice !== undefined) payload.salePrice = Number(payload.salePrice);
      
      if (!payload.name) {
        alert("Product Name is required.");
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
        throw new Error(errData.message || "Failed to save product from backend");
      }
      
      refreshData();
      setViewState("LIST");
    } catch (err: any) {
      alert("Error saving product: " + err.message);
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
        setCurrentProduct(prev => ({ ...prev, images: [...prev.images, result.filePath] }));
      } else {
        setCurrentProduct(prev => ({ ...prev, image: result.filePath }));
      }
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading && viewState === "LIST") {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {viewState === "LIST" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Product List</h1>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#1e1e1e] text-white p-4 rounded text-center">
              <div className="text-2xl font-bold">{publishedCount}</div>
              <div className="text-sm text-gray-300">Published</div>
            </div>
            <div className="bg-[#1e1e1e] text-white p-4 rounded text-center">
              <div className="text-2xl font-bold">{lowStockCount}</div>
              <div className="text-sm text-gray-300">Low Stock</div>
            </div>
            <div className="bg-[#1e1e1e] text-white p-4 rounded text-center">
              <div className="text-2xl font-bold">{outOfStockCount}</div>
              <div className="text-sm text-gray-300">Out of Stock</div>
            </div>
            <div className="bg-[#1e1e1e] text-white p-4 rounded text-center">
              <div className="text-2xl font-bold">{draftCount}</div>
              <div className="text-sm text-gray-300">Draft</div>
            </div>
            <div className="bg-[#1e1e1e] text-white p-4 rounded text-center">
              <div className="text-2xl font-bold">{onSaleCount}</div>
              <div className="text-sm text-gray-300">On Sale</div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded border border-gray-200">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                <Trash2 className="w-4 h-4 text-red-500" /> Delete
              </button>
              <button onClick={handleAddNew} className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                <Plus className="w-4 h-4" /> Add Product
              </button>
              <button className="text-sm text-blue-500 hover:underline px-2">Miscellaneous Settings</button>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Search Product by..." className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-500" />
              <button className="px-4 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Search</button>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Click on the Name to edit a product. Hover on rows to see actions. <span className="text-blue-500 cursor-pointer">Items Per Page (10)</span>
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
                  <th className="py-3 px-4 font-semibold text-gray-900">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No products found.</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 group">
                      <td className="py-3 px-4"><input type="checkbox" className="rounded" /></td>
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 bg-gray-100 border flex items-center justify-center rounded">
                          {p.image ? <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${p.image}`} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-blue-500 hover:underline cursor-pointer font-medium" onClick={() => handleEdit(p)}>{p.name}</div>
                        <div className="hidden group-hover:flex gap-2 text-xs mt-1">
                           <span className="text-gray-500 cursor-pointer hover:text-blue-500" onClick={() => handleEdit(p)}>Edit</span> | 
                           <span className="text-red-500 cursor-pointer hover:underline" onClick={() => handleDelete(p._id)}>Trash</span> | 
                           <span className="text-gray-500 cursor-pointer hover:text-blue-500">View</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">${p.price}</td>
                      <td className="py-3 px-4 text-gray-600">{p.status || 'Draft'}</td>
                      <td className="py-3 px-4 text-gray-600">{p.stockStatus} {(p.stock || 0) > 0 ? `(${p.stock})` : ''}</td>
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
              <h1 className="text-2xl font-medium text-gray-900">Add Product</h1>
            </div>
            <a href="#" className="hidden text-blue-600 hover:underline text-sm font-medium items-center gap-1">View <ExternalLink className="w-4 h-4" /></a>
          </div>

          <div className="bg-white border border-gray-200 rounded-md">
            {addStep === 1 ? (
               <div className="p-8 space-y-6 min-h-[500px]">
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Product categories</label>
                    <input type="text" placeholder="Choose category(s)" value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} className="w-full sm:max-w-md px-3 py-2 border border-gray-200 focus:outline-none focus:border-blue-500 rounded" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Product Type</label>
                    <select value={currentProduct.type} onChange={e => setCurrentProduct({...currentProduct, type: e.target.value})} className="w-full sm:max-w-md px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500 bg-white">
                       <option>Simple product</option>
                       <option>Variable product</option>
                       <option>Grouped product</option>
                       <option>External/Affiliate product</option>
                    </select>
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
                   <label className="text-sm font-bold text-gray-700">Product Name<span className="text-red-500">*</span> :</label>
                   <input type="text" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm" required />
                 </div>

                 <div className="space-y-2">
                   <div className="flex justify-between items-center mb-1">
                     <label className="text-sm font-bold text-gray-700">About Product</label>
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
                     <textarea rows={8} value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} className="w-full p-3 focus:outline-none resize-y" />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Product Thumbnail</label>
                   <div className="mt-2 mb-2 w-16 h-16 bg-gray-50 border border-gray-200 rounded flex flex-col items-center justify-center relative overflow-hidden">
                      {currentProduct.image ? (
                        <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${currentProduct.image}`} className="w-full h-full object-cover" />
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
                   <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                     Product SKU
                     <span className="w-3.5 h-3.5 bg-gray-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">?</span>
                     <span className="text-xs text-gray-500 font-normal ml-1">(Prefix: JOHN_ will be added automatically as it is enabled by admin.)</span>
                   </label>
                   <div className="flex items-center border border-gray-300 rounded shadow-sm focus-within:border-blue-500 overflow-hidden">
                      <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">JOHN_</span>
                      <input type="text" value={currentProduct.sku || ''} onChange={(e) => setCurrentProduct({...currentProduct, sku: e.target.value})} className="w-full px-4 py-2 border-none focus:outline-none" />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Regular Price ($)</label>
                   <input type="number" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm" />
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Sale Price ($)</label>
                   <input type="number" value={currentProduct.salePrice || ''} onChange={e => setCurrentProduct({...currentProduct, salePrice: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm" />
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Product Short Description</label>
                   <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
                     <div className="bg-[#f0f0f1] border-b border-gray-300 px-2 py-1 flex items-center gap-2 text-gray-600">
                       <select className="text-xs bg-transparent border-0 outline-none"><option>Paragraph</option></select>
                       <div className="w-px h-4 bg-gray-300 mx-1"></div>
                       <button className="font-bold px-2 hover:bg-gray-200 rounded">B</button>
                       <button className="italic px-2 hover:bg-gray-200 rounded">I</button>
                     </div>
                     <textarea rows={6} value={currentProduct.shortDescription || ''} onChange={e => setCurrentProduct({...currentProduct, shortDescription: e.target.value})} className="w-full p-4 focus:outline-none resize-y min-h-[120px]" />
                   </div>
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
              <h1 className="text-2xl font-medium text-gray-900">Edit Product: {currentProduct.name}</h1>
            </div>
            <a href="#" className="hidden text-blue-600 hover:underline text-sm font-medium items-center gap-1">View <ExternalLink className="w-4 h-4" /></a>
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
                     <label className="text-sm font-bold text-gray-700">Product Type:</label>
                     <select 
                       value={currentProduct.type} 
                       onChange={e => setCurrentProduct({...currentProduct, type: e.target.value})}
                       className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                     >
                       <option>Simple product</option>
                       <option>Variable product</option>
                       <option>Grouped product</option>
                     </select>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Product Name<span className="text-red-500">*</span> :</label>
                     <input 
                       type="text" 
                       value={currentProduct.name}
                       onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                       placeholder="Enter product name"
                       className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Price :</label>
                     <input 
                       type="number" 
                       value={currentProduct.price}
                       onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})}
                       className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>

                   <div className="space-y-2">
                     <div className="flex justify-between items-center mb-1">
                       <label className="text-sm font-bold text-gray-700">About Product</label>
                       <button className="flex items-center gap-1 border border-gray-300 px-2 py-1 text-xs rounded bg-gray-50 hover:bg-gray-100">
                         <ImageIcon className="w-3 h-3" /> Add Media
                       </button>
                     </div>
                     <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
                       <div className="bg-[#f0f0f1] border-b border-gray-300 px-2 py-1 flex items-center gap-2 text-gray-600">
                         <select className="text-xs bg-transparent border-0 outline-none"><option>Paragraph</option></select>
                         <div className="w-px h-4 bg-gray-300 mx-1"></div>
                         <button className="font-bold px-1 hover:bg-gray-200 rounded">B</button>
                         <button className="italic px-1 hover:bg-gray-200 rounded">I</button>
                         <button className="px-1 hover:bg-gray-200 rounded text-xs line-through">S</button>
                       </div>
                       <textarea 
                         rows={8}
                         value={currentProduct.description}
                         onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                         className="w-full p-3 focus:outline-none resize-y"
                         placeholder="Enter rich text description..."
                       />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Product Category</label>
                     <input 
                       type="text" 
                       value={currentProduct.category}
                       onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                       className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>
                </div>
              )}

              {activeTab === "Inventory" && (
                <div className="space-y-6 max-w-4xl">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Stock quantity</label>
                     <input 
                       type="number" 
                       value={currentProduct.stock}
                       onChange={e => setCurrentProduct({...currentProduct, stock: e.target.value})}
                       className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Stock Status</label>
                     <select 
                       value={currentProduct.stockStatus}
                       onChange={e => setCurrentProduct({...currentProduct, stockStatus: e.target.value})}
                       className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm bg-white"
                     >
                       <option>In stock</option>
                       <option>Out of stock</option>
                       <option>On backorder</option>
                     </select>
                   </div>
                </div>
              )}

              {activeTab === "Shipping" && (
                <div className="space-y-6 max-w-4xl">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Weight (kg)</label>
                     <input 
                       type="number" 
                       value={currentProduct.shipping.weight}
                       onChange={e => setCurrentProduct({...currentProduct, shipping: {...currentProduct.shipping, weight: e.target.value}})}
                       className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm"
                       placeholder="0"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Dimensions (cm)</label>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       <input type="number" placeholder="Length" value={currentProduct.shipping.dimensions.length} onChange={e => setCurrentProduct({...currentProduct, shipping: {...currentProduct.shipping, dimensions: {...currentProduct.shipping.dimensions, length: e.target.value}}})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm" />
                       <input type="number" placeholder="Width" value={currentProduct.shipping.dimensions.width} onChange={e => setCurrentProduct({...currentProduct, shipping: {...currentProduct.shipping, dimensions: {...currentProduct.shipping.dimensions, width: e.target.value}}})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm" />
                       <input type="number" placeholder="Height" value={currentProduct.shipping.dimensions.height} onChange={e => setCurrentProduct({...currentProduct, shipping: {...currentProduct.shipping, dimensions: {...currentProduct.shipping.dimensions, height: e.target.value}}})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm" />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Shipping class</label>
                     <select 
                       value={currentProduct.shipping.shippingClass}
                       onChange={e => setCurrentProduct({...currentProduct, shipping: {...currentProduct.shipping, shippingClass: e.target.value}})}
                       className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 shadow-sm bg-white"
                     >
                       <option>No shipping class</option>
                       <option>Standard Delivery</option>
                       <option>Express Delivery</option>
                     </select>
                   </div>
                </div>
              )}

              {activeTab === "Linked Products" && (
                <div className="space-y-6 max-w-4xl">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Upsells</label>
                     <input 
                       type="text" 
                       placeholder="Search..." 
                       value={currentProduct.linked.upsells}
                       onChange={e => setCurrentProduct({...currentProduct, linked: {...currentProduct.linked, upsells: e.target.value}})}
                       className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-700">Cross-sells</label>
                     <input 
                       type="text" 
                       placeholder="Search..." 
                       value={currentProduct.linked.crossSells}
                       onChange={e => setCurrentProduct({...currentProduct, linked: {...currentProduct.linked, crossSells: e.target.value}})}
                       className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                   </div>
                </div>
              )}

              {activeTab === "Status" && (
                <div className="space-y-8 max-w-4xl">
                   <div className="flex items-center gap-6">
                     <label className="text-sm text-gray-700">Product Status: <span className="font-bold text-gray-900">{currentProduct.status}</span></label>
                     <div className="flex items-center gap-4">
                       <label className="flex items-center gap-2 text-sm text-gray-700">
                         <input type="radio" name="status" checked={currentProduct.status === "Online" || currentProduct.status === "Published"} onChange={() => setCurrentProduct({...currentProduct, status: "Published"})} />
                         Online
                       </label>
                       <label className="flex items-center gap-2 text-sm text-gray-700">
                         <input type="radio" name="status" checked={currentProduct.status === "Draft"} onChange={() => setCurrentProduct({...currentProduct, status: "Draft"})} />
                         Draft
                       </label>
                     </div>
                   </div>

                   <hr className="border-gray-100" />
                   
                   <label className="flex items-center gap-2 text-sm text-gray-700">
                     <input type="checkbox" className="rounded" checked={currentProduct.isVirtual} onChange={e => setCurrentProduct({...currentProduct, isVirtual: e.target.checked})} />
                     Virtual
                   </label>
                   
                   <hr className="border-gray-100" />
                   
                   <label className="flex items-center gap-2 text-sm text-gray-700">
                     <input type="checkbox" className="rounded" checked={currentProduct.isDownloadable} onChange={e => setCurrentProduct({...currentProduct, isDownloadable: e.target.checked})} />
                     Downloadable Product
                   </label>
                   
                   <hr className="border-gray-100" />
                   
                   <div className="space-y-4">
                     <label className="text-sm font-bold text-gray-700">Main Image</label>
                     <div className="flex flex-wrap gap-4">
                       {currentProduct.image && (
                         <div className="relative group">
                           <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${currentProduct.image}`} className="w-24 h-24 object-cover border border-gray-200 rounded p-1" />
                           <button onClick={() => setCurrentProduct({...currentProduct, image: ''})} className="text-xs text-blue-500 mt-1 hover:underline text-center w-full">Delete</button>
                         </div>
                       )}
                     </div>
                     <div className="mt-2">
                       <label className="text-sm text-blue-500 hover:underline cursor-pointer flex items-center gap-1 w-max">
                         <Upload className="w-4 h-4" /> Add main image
                         <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, false)} />
                       </label>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-sm font-bold text-gray-700">Image Gallery</label>
                     <div className="flex flex-wrap gap-4">
                       {currentProduct.images.map((img, idx) => (
                         <div key={idx} className="relative group">
                           <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${img}`} className="w-24 h-24 object-cover border border-gray-200 rounded p-1" />
                           <button onClick={() => setCurrentProduct(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))} className="text-xs text-blue-500 mt-1 hover:underline text-center w-full">Delete</button>
                         </div>
                       ))}
                     </div>
                     <div className="mt-2">
                       <label className="text-sm text-blue-500 hover:underline cursor-pointer flex items-center gap-1 w-max">
                         <Plus className="w-4 h-4" /> Add product images
                         <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
                       </label>
                     </div>
                   </div>
                </div>
              )}

              {(activeTab === "Attributes" || activeTab === "Tags & Brand") && (
                <div className="py-8 text-center text-gray-500">
                  Detailed {activeTab.toLowerCase()} configuration settings will appear here. 
                </div>
              )}

              <div className="border-t border-gray-200 pt-6 mt-6 pb-2">
                <button 
                  onClick={handleSave} 
                  disabled={saving || uploading}
                  className="w-full max-w-[200px] flex justify-center items-center py-2.5 px-4 bg-gray-900 border border-transparent rounded shadow-sm text-sm font-medium text-white hover:bg-black focus:outline-none transition-colors"
                >
                  {saving ? "Updating..." : "Update"}
                </button>
                {uploading && <p className="text-xs text-blue-500 mt-2">Uploading image...</p>}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

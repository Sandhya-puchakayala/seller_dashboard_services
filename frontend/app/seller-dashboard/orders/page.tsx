"use client";

import { motion } from "framer-motion";
import { Search, Filter, Download, ExternalLink } from "lucide-react";
import { useSeller } from "../SellerContext";

export default function OrdersPage() {
  const { orders, loading } = useSeller();

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading orders...</div>;
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage customer orders.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by order ID, customer..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">No recent orders found.</td>
                </tr>
              ) : (
                orders.map((order) => {
                  const firstProductName = order.products[0]?.product?.name || "Unknown Product";
                  const isMultiple = order.products.length > 1;
                  const productName = isMultiple ? `${firstProductName} +${order.products.length - 1} more` : firstProductName;
                  
                  let statusColor = "bg-gray-100 text-gray-700";
                  if (order.status === "Delivered") statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
                  if (order.status === "Processing") statusColor = "bg-blue-100 text-blue-700 border-blue-200";
                  if (order.status === "Shipped") statusColor = "bg-purple-100 text-purple-700 border-purple-200";
                  if (order.status === "Cancelled") statusColor = "bg-red-100 text-red-700 border-red-200";

                  return (
                    <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900">#{order._id.substring(0, 8).toUpperCase()}</td>
                      <td className="py-4 px-6 text-gray-700 font-medium">{order.buyerId || "Guest"}</td>
                      <td className="py-4 px-6 text-gray-600">{productName}</td>
                      <td className="py-4 px-6 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-burgundy hover:text-[#7a124a] font-medium text-sm flex items-center justify-end gap-1 w-full transition-colors">
                          <span>View</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
          <span>Showing 1 to 6 of 150 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-gray-200 rounded bg-white font-medium text-burgundy">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, DollarSign, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useSeller } from "./SellerContext";

export default function SellerDashboardPage() {
  const { seller, products, orders, payments, loading } = useSeller();

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading dashboard data...</div>;
  }

  const totalRevenue = payments
    .filter(p => p.status === "Completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+0.0%",
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      bg: "bg-emerald-100",
    },
    {
      label: "Total Orders",
      value: orders.length.toString(),
      change: "+0.0%",
      icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      label: "Active Products",
      value: products.length.toString(),
      change: "0 new",
      icon: <Package className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-100",
    },
    {
      label: "Store Address",
      value: seller?.shopDetails?.address || "Not set",
      change: "N/A",
      icon: <Users className="w-6 h-6 text-orange-600" />,
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome, {seller?.name}!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your store ({seller?.shopDetails?.shopName || 'Unnamed Store'}) today.</p>
        </div>
        <button className="bg-burgundy text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-[#7a124a] transition-colors flex items-center justify-center gap-2">
          <span>View Storefront</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No recent orders.</td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order) => {
                    const firstProductName = order.products[0]?.product?.name || "Unknown Product";
                    const isMultiple = order.products.length > 1;
                    const productName = isMultiple ? `${firstProductName} +${order.products.length - 1} more` : firstProductName;
                    
                    let statusColor = "bg-gray-100 text-gray-700";
                    if (order.status === "Delivered") statusColor = "bg-emerald-100 text-emerald-700";
                    if (order.status === "Processing") statusColor = "bg-blue-100 text-blue-700";
                    if (order.status === "Shipped") statusColor = "bg-purple-100 text-purple-700";

                    return (
                      <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-medium text-gray-900">#{order._id.substring(0, 8).toUpperCase()}</td>
                        <td className="py-4 text-gray-600">{productName}</td>
                        <td className="py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 font-medium text-gray-900">${order.totalAmount.toFixed(2)}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Insights</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Products</p>
                <p className="text-xs text-gray-500 mt-1">You have {products.length} products listed.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Orders</p>
                <p className="text-xs text-gray-500 mt-1">You have processed {orders.length} orders.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Payments</p>
                <p className="text-xs text-gray-500 mt-1">Received ${totalRevenue.toFixed(2)} across {payments.length} payouts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

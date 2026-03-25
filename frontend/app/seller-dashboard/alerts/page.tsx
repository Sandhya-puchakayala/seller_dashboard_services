"use client";

import { motion } from "framer-motion";
import { AlertCircle, Bell, Package, CheckCircle2, Info, Clock } from "lucide-react";

export default function AlertsPage() {
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Low Stock Warning",
      message: "Premium Dog Food 5kg is running low. Only 3 items left in stock.",
      time: "2 hours ago",
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      bg: "bg-orange-50",
      border: "border-orange-200"
    },
    {
      id: 2,
      type: "success",
      title: "Payout Successful",
      message: "Your weekly payout of $1,250.00 has been successfully transferred to your bank account ending in 4920.",
      time: "5 hours ago",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-200"
    },
    {
      id: 3,
      type: "info",
      title: "Platform Update",
      message: "We've added new features to the analytics dashboard. Take a look at the new sales breakdown by region.",
      time: "Yesterday",
      icon: <Info className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
      border: "border-blue-200"
    },
    {
      id: 4,
      type: "neutral",
      title: "Customer Return Request",
      message: "A return request has been initiated for Order #ORD-8012. Please review within 48 hours.",
      time: "Mar 15, 2026",
      icon: <Package className="w-5 h-5 text-gray-600" />,
      bg: "bg-gray-50",
      border: "border-gray-200"
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Alerts</h1>
          <p className="text-gray-500 mt-1">Stay updated with notifications and warnings.</p>
        </div>
        <button className="text-burgundy font-medium text-sm hover:underline flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {alerts.map((alert, index) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors flex gap-4 sm:gap-6 items-start relative group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${alert.bg} border ${alert.border}`}>
                {alert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                  <h3 className="text-base font-bold text-gray-900">{alert.title}</h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.time}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{alert.message}</p>
                
                {alert.type === "warning" && (
                  <button className="mt-3 text-sm font-medium text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                    Restock Now
                  </button>
                )}
                {alert.type === "neutral" && (
                  <button className="mt-3 text-sm font-medium text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                    Review Request
                  </button>
                )}
              </div>
              
              <button className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center text-gray-400 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                &times;
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

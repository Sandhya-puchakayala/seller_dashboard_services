"use client";

import { motion } from "framer-motion";
import { Download, CreditCard, Building, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments & Earnings</h1>
        <p className="text-gray-500 mt-1">Manage your revenue, see upcoming payouts, and track transactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-burgundy text-white p-6 rounded-2xl shadow-lg shadow-burgundy/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="w-32 h-32" />
          </div>
          <p className="text-white/80 font-medium text-sm mb-1">Available to Withdraw</p>
          <h2 className="text-4xl font-bold relative z-10">$3,450.00</h2>
          
          <button className="mt-6 bg-white text-burgundy w-full py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors">
            Withdraw Funds
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 font-medium text-sm">Next Payout</p>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">$850.25</h2>
          <p className="text-sm font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Scheduled for Mar 20, 2026
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">Processing</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-900 font-bold text-base">Payment Method</p>
            <button className="text-burgundy text-sm font-medium hover:underline">Edit</button>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-auto">
            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
              <Building className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Chase Bank</p>
              <p className="text-xs text-gray-500 font-medium font-mono">**** **** 4920</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Download Statement</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { date: "Mar 17, 2026", desc: "Order #ORD-8092 Settlement", amount: "+$42.50", status: "Completed", statusClass: "bg-emerald-100 text-emerald-700" },
                { date: "Mar 16, 2026", desc: "Weekly Payout Transfer", amount: "-$1,250.00", status: "Completed", statusClass: "bg-emerald-100 text-emerald-700" },
                { date: "Mar 15, 2026", desc: "Platform Fees (Feb)", amount: "-$45.00", status: "Completed", statusClass: "bg-emerald-100 text-emerald-700" },
                { date: "Mar 14, 2026", desc: "Order #ORD-8089 Settlement", amount: "+$17.10", status: "Completed", statusClass: "bg-emerald-100 text-emerald-700" },
                { date: "Mar 14, 2026", desc: "Customer Refund #ORD-8087", amount: "-$35.50", status: "Completed", statusClass: "bg-emerald-100 text-emerald-700" },
              ].map((tx, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-500">{tx.date}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{tx.desc}</td>
                  <td className={`py-4 px-6 font-bold ${tx.amount.startsWith('+') ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {tx.amount}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tx.statusClass}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-400 hover:text-burgundy transition-colors p-1 rounded-lg hover:bg-gray-100 inline-flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

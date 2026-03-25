"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

export default function AskAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const messages = [
    {
      id: 1,
      date: "August 23, 2019",
      subject: "Regarding Recent orders",
      message: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestasPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas"
    },
    {
      id: 2,
      date: "August 23, 2019",
      subject: "Regarding Product",
      message: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestasPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas"
    },
    {
      id: 3,
      date: "August 23, 2019",
      subject: "Regarding product",
      message: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas"
    },
    {
      id: 4,
      date: "January 4, 2019",
      subject: "Regarding Commission Charges",
      message: "HI Admin, I would like to know about the commission charges apply to sellers?? Regards, John Doe"
    },
    {
      id: 5,
      date: "August 23, 2019",
      subject: "Regarding Commission charges",
      message: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestasPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas"
    },
    {
      id: 6,
      date: "August 23, 2019",
      subject: "Regarding Commission Charges",
      message: "HI Admin, I would like to know about the commission charges apply to sellers?? Regards, John Doe"
    },
    {
      id: 7,
      date: "August 23, 2019",
      subject: "Pellentesque habitant morbi",
      message: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestasPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas"
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-medium text-gray-900 mb-6">Ask to Admin</h1>
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search by subject" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-200 rounded px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-blue-500"
          />
          <button className="border border-gray-200 rounded px-6 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center">
            Search
          </button>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border border-gray-200 rounded p-2 text-gray-700 hover:bg-gray-50 transition-colors self-end sm:self-auto flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border text-gray-600 border-gray-200 rounded-sm overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="py-4 px-6 font-bold text-gray-900 w-40 text-center">Date</th>
              <th className="py-4 px-6 font-bold text-gray-900 w-64 text-center">Subject</th>
              <th className="py-4 px-6 font-bold text-gray-900 text-center">Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, index) => (
              <tr key={msg.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="py-4 px-6 text-gray-500 min-w-[120px] align-top text-center leading-relaxed">
                  {msg.date.split(", ").map((part, i) => (
                    <div key={i}>{part}{i === 0 ? "," : ""}</div>
                  ))}
                </td>
                <td className="py-4 px-6 text-gray-600 align-top text-center">
                  <div className="max-w-[180px] mx-auto">
                    {msg.subject}
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-500 align-top leading-relaxed text-center">
                  {msg.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 pb-2">
              <h2 className="text-xl font-bold text-gray-900">Ask your query</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="space-y-1">
                <label className="text-[15px] text-gray-800">Subject<span className="text-red-500">*</span> :</label>
                <input 
                  type="text" 
                  placeholder="Subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[15px] text-gray-800">Message<span className="text-red-500">*</span> :</label>
                <textarea 
                  rows={4}
                  placeholder="Message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-y"
                />
              </div>
              <div className="pt-2 pb-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-black text-white px-8 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors tracking-wide"
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

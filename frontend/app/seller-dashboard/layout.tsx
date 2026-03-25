"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Bell, 
  CreditCard, 
  Settings, 
  MessageSquare,
  LogOut 
} from "lucide-react";
import { SellerProvider } from "./SellerContext";

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerProvider>
      <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <Link href="/seller-dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-serif text-burgundy font-bold">Seller Hub</span>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1 overflow-y-auto flex-1">
            <Link href="/seller-dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <LayoutDashboard className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link href="/seller-dashboard/services" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Package className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Services</span>
            </Link>
            
            <Link href="/seller-dashboard/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Orders</span>
            </Link>
            
            <Link href="/seller-dashboard/payments" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Payments</span>
            </Link>

            <Link href="/seller-dashboard/alerts" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Alerts</span>
            </Link>

            <Link href="/seller-dashboard/account" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Account</span>
            </Link>

            <Link href="/seller-dashboard/ask-admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Ask to Admin</span>
            </Link>
          </nav>
          
          <div className="mt-auto border-t border-gray-200 p-4 bg-white hidden md:block w-full filter-none fixed md:relative bottom-0 z-10 left-0 md:left-auto right-0 md:right-auto md:w-auto">
            <button 
              onClick={() => {
                localStorage.removeItem("sellerToken");
                window.location.href = "/Login";
              }}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 w-full text-left rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full">
          {/* Mobile header / spacer for mobile if needed, else mostly padding */}
          <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SellerProvider>
  );
}

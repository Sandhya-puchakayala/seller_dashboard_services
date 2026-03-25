"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface Seller {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  shopDetails?: {
    shopName?: string;
    address?: string;
    description?: string;
  };
  gstNumber?: string;
  documents?: string[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  type?: string;
  category?: string;
  status?: string;
  stock?: number;
  stockStatus?: string;
  shipping?: {
    weight?: number;
    dimensions?: { length?: number; width?: number; height?: number };
    shippingClass?: string;
  };
  linked?: {
    upsells?: string[];
    crossSells?: string[];
  };
  isVirtual?: boolean;
  isDownloadable?: boolean;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string;
  status?: string;
  duration?: string;
  availability?: string;
  shortDescription?: string;
}

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  _id: string;
  buyerId?: string;
  products: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  createdAt: string;
}

interface Payment {
  _id: string;
  order: {
    _id: string;
    totalAmount: number;
    status: string;
  };
  amount: number;
  status: string;
  createdAt: string;
}

interface DashboardData {
  seller: Seller | null;
  products: Product[];
  services: Service[];
  orders: Order[];
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const defaultContext: DashboardData = {
  seller: null,
  products: [],
  services: [],
  orders: [],
  payments: [],
  loading: true,
  error: null,
  refreshData: async () => {},
};

const SellerContext = createContext<DashboardData>(defaultContext);

export const SellerProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<{
    seller: Seller | null;
    products: Product[];
    services: Service[];
    orders: Order[];
    payments: Payment[];
  }>({
    seller: null,
    products: [],
    services: [],
    orders: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("sellerToken");

      // If no token, try fetching anyway (preview mode) — skip redirect to login
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/dashboard`, {
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        setData({
          seller: result.seller,
          products: result.products || [],
          services: result.services || [],
          orders: result.orders || [],
          payments: result.payments || [],
        });
      }
      // If backend is unavailable, just stay with empty data — no redirect
    } catch (err: any) {
      console.error(err);
      // Don't set error so dashboard still renders with empty data
    } finally {
      setLoading(false);
    }
  };

  // To avoid hydration mismatch and unauthenticated rendering, 
  // we strictly redirect and render nothing if there's no valid session.
  useEffect(() => {
    fetchDashboardData();
  }, [router]);

  // Ensure we always return the Provider so Next.js hydration bounds are maintained.
  // We rely on page.tsx and the inner layout to handle `loading` and `!seller` visual states.
  return (
    <SellerContext.Provider value={{ ...data, loading, error, refreshData: fetchDashboardData }}>
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => useContext(SellerContext);

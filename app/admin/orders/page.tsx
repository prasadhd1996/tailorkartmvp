"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, STATUS_LABELS, ORDER_STATUSES, OrderStatus } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  fabricChoice: string;
  colorPreference: string;
  user: { name: string; email: string };
  design: { name: string };
}

const STATUS_VARIANT: Record<string, "default" | "warning" | "success" | "secondary"> = {
  RECEIVED: "default",
  MEASURING: "warning",
  CUTTING: "warning",
  STITCHING: "warning",
  READY: "success",
  DELIVERED: "secondary",
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session.user.role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/orders")
        .then((r) => r.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        });
    }
  }, [status]);

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-stone-800">All Orders</h1>
          <p className="text-stone-400 text-sm">{filtered.length} orders</p>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === "all" ? "bg-rose-600 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"
            }`}
          >
            All
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === s ? "bg-rose-600 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-stone-400 text-center py-20">Loading...</p>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Order</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium hidden md:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium hidden sm:table-cell">Design</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-stone-500 font-medium">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-stone-400">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="font-medium">{order.user.name}</p>
                      <p className="text-xs text-stone-400">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p>{order.design.name}</p>
                      <p className="text-xs text-stone-400">{order.fabricChoice} / {order.colorPreference}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[order.status] || "secondary"}>
                        {STATUS_LABELS[order.status as OrderStatus] || order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-rose-700">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-rose-600 hover:underline text-xs">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-stone-400">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

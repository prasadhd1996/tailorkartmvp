"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, STATUS_LABELS, OrderStatus } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  deliveryDate: string;
  fabricChoice: string;
  colorPreference: string;
  design: {
    name: string;
    imageUrl: string;
    category: string;
  };
}

const STATUS_VARIANT: Record<string, "default" | "warning" | "success" | "secondary"> = {
  RECEIVED: "default",
  MEASURING: "warning",
  CUTTING: "warning",
  STITCHING: "warning",
  READY: "success",
  DELIVERED: "secondary",
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-stone-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">My Orders</h1>
            <p className="text-stone-400 text-sm">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/catalog">
            <Button>Browse Designs</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 text-lg mb-4">No orders yet.</p>
            <Link href="/catalog">
              <Button>Place Your First Order</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-rose-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.design.imageUrl} alt={order.design.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-stone-800">{order.design.name}</h3>
                      <p className="text-sm text-stone-400">Ordered {formatDate(order.createdAt)}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[order.status] || "secondary"}>
                      {STATUS_LABELS[order.status as OrderStatus] || order.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-stone-500 mb-3">
                    <span>Fabric: {order.fabricChoice}</span>
                    <span>Color: {order.colorPreference}</span>
                    <span>Delivery: {formatDate(order.deliveryDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-700">{formatCurrency(order.totalPrice)}</span>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

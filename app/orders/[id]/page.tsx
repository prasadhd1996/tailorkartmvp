"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import OrderStatusTracker from "@/components/OrderStatusTracker";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, STATUS_LABELS, OrderStatus } from "@/lib/utils";

interface Measurements {
  bust: string;
  waist: string;
  hip: string;
  height: string;
  sleeveLength: string;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  deliveryDate: string;
  fabricChoice: string;
  colorPreference: string;
  specialNotes?: string;
  adminNotes?: string;
  measurements: string;
  design: {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
  };
  user: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then((data) => {
          setOrder(data);
          setLoading(false);
        });
    }
  }, [status, orderId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-stone-400">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-stone-500">Order not found.</p>
          <Link href="/orders"><button className="mt-4 text-rose-600 hover:underline">View my orders</button></Link>
        </div>
      </div>
    );
  }

  const measurements: Measurements = JSON.parse(order.measurements);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/orders" className="text-sm text-rose-600 hover:underline mb-6 inline-block">
          ← Back to My Orders
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Order Details</h1>
            <p className="text-stone-400 text-sm">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
          <Badge className="text-sm px-3 py-1">
            {STATUS_LABELS[order.status as OrderStatus] || order.status}
          </Badge>
        </div>

        {/* Status Tracker */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <h2 className="font-semibold text-stone-800 mb-4">Order Progress</h2>
          <OrderStatusTracker currentStatus={order.status as OrderStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Design */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-stone-700 mb-4">Design</h3>
            <div className="flex gap-4">
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-rose-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order.design.imageUrl} alt={order.design.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-stone-800">{order.design.name}</p>
                <p className="text-sm text-stone-400 capitalize mb-2">{order.design.category}</p>
                <p className="font-bold text-rose-700">{formatCurrency(order.totalPrice)}</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-stone-700 mb-4">Preferences</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Fabric</span>
                <span className="font-medium">{order.fabricChoice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Color</span>
                <span className="font-medium">{order.colorPreference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Delivery By</span>
                <span className="font-medium">{formatDate(order.deliveryDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ordered On</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-stone-700 mb-4">Measurements</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(measurements).map(([key, val]) => (
                <div key={key}>
                  <p className="text-stone-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                  <p className="font-medium">{val} cm</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-stone-700 mb-4">Notes</h3>
            {order.specialNotes ? (
              <div className="mb-4">
                <p className="text-xs text-stone-400 mb-1">Your Notes</p>
                <p className="text-sm text-stone-700">{order.specialNotes}</p>
              </div>
            ) : (
              <p className="text-sm text-stone-400 mb-4">No special notes</p>
            )}
            {order.adminNotes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-600 font-medium mb-1">Message from Tailor</p>
                <p className="text-sm text-amber-800">{order.adminNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

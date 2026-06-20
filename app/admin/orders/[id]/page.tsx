"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import OrderStatusTracker from "@/components/OrderStatusTracker";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, STATUS_LABELS, ORDER_STATUSES, OrderStatus } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  deliveryDate: string;
  fabricChoice: string;
  colorPreference: string;
  specialNotes?: string;
  adminNotes?: string;
  measurements: string;
  design: { id: string; name: string; category: string; imageUrl: string };
  user: { name: string; email: string; phone?: string };
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session.user.role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then((data) => {
          setOrder(data);
          setNewStatus(data.status);
          setAdminNotes(data.adminNotes || "");
          setLoading(false);
        });
    }
  }, [status, orderId]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, adminNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder((prev) => prev ? { ...prev, status: updated.status, adminNotes: updated.adminNotes } : null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center h-64"><p className="text-stone-400">Loading...</p></div>
      </div>
    );
  }

  if (!order) return null;

  const measurements = JSON.parse(order.measurements);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/admin/orders" className="text-sm text-rose-600 hover:underline mb-6 inline-block">
          ← Back to Orders
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-stone-400 text-sm">Placed {formatDate(order.createdAt)}</p>
          </div>
          <Badge>
            {STATUS_LABELS[order.status as OrderStatus] || order.status}
          </Badge>
        </div>

        {/* Status Tracker */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <OrderStatusTracker currentStatus={order.status as OrderStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-700 mb-4">Customer</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-stone-400">Name</span><span className="font-medium">{order.user.name}</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Email</span><span className="font-medium">{order.user.email}</span></div>
                {order.user.phone && <div className="flex justify-between"><span className="text-stone-400">Phone</span><span className="font-medium">{order.user.phone}</span></div>}
              </div>
            </div>

            {/* Design */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-700 mb-4">Design Details</h3>
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order.design.imageUrl} alt={order.design.name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="text-sm">
                  <p className="font-medium text-stone-800 mb-1">{order.design.name}</p>
                  <p className="text-stone-400 capitalize mb-2">{order.design.category}</p>
                  <p className="text-stone-500">Fabric: <span className="font-medium">{order.fabricChoice}</span></p>
                  <p className="text-stone-500">Color: <span className="font-medium">{order.colorPreference}</span></p>
                  <p className="text-stone-500">Delivery: <span className="font-medium">{formatDate(order.deliveryDate)}</span></p>
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-700 mb-4">Measurements (cm)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {Object.entries(measurements).map(([key, val]) => (
                  <div key={key} className="bg-rose-50 rounded-lg p-3">
                    <p className="text-stone-400 text-xs capitalize mb-1">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="font-bold text-stone-800">{String(val)} cm</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Notes */}
            {order.specialNotes && (
              <div className="bg-white rounded-xl border border-stone-200 p-5">
                <h3 className="font-semibold text-stone-700 mb-2">Customer Notes</h3>
                <p className="text-stone-600 text-sm">{order.specialNotes}</p>
              </div>
            )}
          </div>

          {/* Admin Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h3 className="font-semibold text-stone-700 mb-2">Total</h3>
              <p className="text-2xl font-bold text-rose-700">{formatCurrency(order.totalPrice)}</p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
              <h3 className="font-semibold text-stone-700">Update Order</h3>
              <Select
                id="status"
                label="Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </Select>
              <Textarea
                id="adminNotes"
                label="Note to Customer (optional)"
                placeholder="e.g. Your fabric has arrived and we're starting stitching today."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

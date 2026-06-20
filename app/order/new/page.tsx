"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface FabricOption {
  name: string;
  surcharge: number;
}

interface Design {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  imageUrl: string;
  fabricOptions: string;
}

function NewOrderForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get("designId");

  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    bust: "",
    waist: "",
    hip: "",
    height: "",
    sleeveLength: "",
    fabricChoice: "",
    colorPreference: "",
    deliveryDate: "",
    specialNotes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/order/new?designId=${designId}`);
    }
  }, [status, router, designId]);

  useEffect(() => {
    if (!designId) return;
    fetch(`/api/designs/${designId}`)
      .then((r) => r.json())
      .then((d) => {
        setDesign(d);
        const fabrics: FabricOption[] = JSON.parse(d.fabricOptions || "[]");
        if (fabrics.length > 0) {
          setForm((prev) => ({ ...prev, fabricChoice: fabrics[0].name }));
        }
        setLoading(false);
      });
  }, [designId]);

  const fabricOptions: FabricOption[] = design ? JSON.parse(design.fabricOptions || "[]") : [];
  const chosenFabric = fabricOptions.find((f) => f.name === form.fabricChoice);
  const totalPrice = design ? design.basePrice + (chosenFabric?.surcharge ?? 0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designId,
          measurements: {
            bust: form.bust,
            waist: form.waist,
            hip: form.hip,
            height: form.height,
            sleeveLength: form.sleeveLength,
          },
          fabricChoice: form.fabricChoice,
          colorPreference: form.colorPreference,
          deliveryDate: form.deliveryDate,
          specialNotes: form.specialNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }

      const order = await res.json();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Design not found.</p>
        <Link href="/catalog"><Button className="mt-4">Browse Catalog</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href={`/catalog/${designId}`} className="text-sm text-rose-600 hover:underline mb-6 inline-block">
        ← Back to Design
      </Link>
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Place Custom Order</h1>
      <p className="text-stone-500 mb-8">Fill in your measurements and preferences for a perfectly tailored garment.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* Measurements */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-1">Your Measurements</h2>
            <p className="text-stone-400 text-sm mb-5">All measurements in centimeters (cm)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="bust" label="Bust (cm)" type="number" placeholder="e.g. 86" value={form.bust} onChange={(e) => setForm({ ...form, bust: e.target.value })} required />
              <Input id="waist" label="Waist (cm)" type="number" placeholder="e.g. 70" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} required />
              <Input id="hip" label="Hip (cm)" type="number" placeholder="e.g. 92" value={form.hip} onChange={(e) => setForm({ ...form, hip: e.target.value })} required />
              <Input id="height" label="Height (cm)" type="number" placeholder="e.g. 162" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} required />
              <Input id="sleeveLength" label="Sleeve Length (cm)" type="number" placeholder="e.g. 58" value={form.sleeveLength} onChange={(e) => setForm({ ...form, sleeveLength: e.target.value })} required />
            </div>
          </div>

          {/* Fabric & Color */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-800 mb-1">Fabric & Color</h2>
            {fabricOptions.length > 0 && (
              <Select id="fabric" label="Fabric Choice" value={form.fabricChoice} onChange={(e) => setForm({ ...form, fabricChoice: e.target.value })} required>
                {fabricOptions.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} {f.surcharge > 0 ? `(+${formatCurrency(f.surcharge)})` : "(Included)"}
                  </option>
                ))}
              </Select>
            )}
            <Input id="color" label="Color Preference" placeholder="e.g. Deep Maroon, Rose Gold, Teal..." value={form.colorPreference} onChange={(e) => setForm({ ...form, colorPreference: e.target.value })} required />
          </div>

          {/* Delivery & Notes */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-800 mb-1">Delivery & Notes</h2>
            <Input
              id="delivery"
              label="Requested Delivery Date"
              type="date"
              min={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              value={form.deliveryDate}
              onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
              required
            />
            <Textarea id="notes" label="Special Notes (optional)" placeholder="Any special requirements, embroidery preferences, occasion details..." value={form.specialNotes} onChange={(e) => setForm({ ...form, specialNotes: e.target.value })} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Placing Order..." : `Place Order — ${formatCurrency(totalPrice)}`}
          </Button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-stone-200 p-5 sticky top-24">
            <h3 className="font-semibold text-stone-800 mb-4">Order Summary</h3>
            <div className="text-center mb-4">
              <div className="relative h-40 rounded-lg overflow-hidden bg-rose-50 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={design.imageUrl} alt={design.name} className="w-full h-full object-cover" />
              </div>
              <p className="font-medium text-stone-800">{design.name}</p>
              <p className="text-sm text-stone-400 capitalize">{design.category}</p>
            </div>
            <div className="space-y-2 text-sm border-t border-stone-100 pt-4">
              <div className="flex justify-between">
                <span className="text-stone-500">Base Price</span>
                <span>{formatCurrency(design.basePrice)}</span>
              </div>
              {chosenFabric && chosenFabric.surcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Fabric Surcharge</span>
                  <span>+{formatCurrency(chosenFabric.surcharge)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-stone-100">
                <span>Total</span>
                <span className="text-rose-700">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-stone-400">Loading...</p></div>}>
        <NewOrderForm />
      </Suspense>
    </div>
  );
}

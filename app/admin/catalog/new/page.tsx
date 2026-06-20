"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CATEGORIES, CATEGORY_LABELS, Category } from "@/lib/utils";

interface FabricOption {
  name: string;
  surcharge: number;
}

export default function NewDesignPage() {
  useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "saree",
    description: "",
    basePrice: "",
    imageUrl: "",
  });

  const [fabrics, setFabrics] = useState<FabricOption[]>([
    { name: "Cotton", surcharge: 0 },
    { name: "Silk", surcharge: 1500 },
  ]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addFabric = () => setFabrics([...fabrics, { name: "", surcharge: 0 }]);
  const removeFabric = (i: number) => setFabrics(fabrics.filter((_, idx) => idx !== i));
  const updateFabric = (i: number, field: keyof FabricOption, value: string | number) => {
    setFabrics(fabrics.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          basePrice: Number(form.basePrice),
          images: [],
          fabricOptions: fabrics,
        }),
      });

      if (!res.ok) throw new Error("Failed to create design");
      router.push("/admin/catalog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/admin/catalog" className="text-sm text-rose-600 hover:underline mb-6 inline-block">
          ← Back to Catalog
        </Link>
        <h1 className="text-2xl font-bold text-stone-800 mb-8">Add New Design</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
            <h2 className="font-semibold text-stone-700">Basic Information</h2>
            <Input id="name" label="Design Name" placeholder="Bridal Silk Saree" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Select id="category" label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c as Category]}</option>)}
            </Select>
            <Textarea id="description" label="Description" placeholder="Describe the design, its features, and occasions it's suitable for..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <Input id="price" label="Base Price (₹)" type="number" placeholder="3500" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
            <Input id="image" label="Main Image URL" type="url" placeholder="https://picsum.photos/seed/saree1/600/800" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required />
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-700">Fabric Options</h2>
              <button type="button" onClick={addFabric} className="text-sm text-rose-600 hover:underline">+ Add Fabric</button>
            </div>
            <div className="space-y-3">
              {fabrics.map((fabric, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      id={`fabric-name-${i}`}
                      label={i === 0 ? "Fabric Name" : ""}
                      placeholder="e.g. Silk, Cotton, Georgette"
                      value={fabric.name}
                      onChange={(e) => updateFabric(i, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      id={`fabric-surcharge-${i}`}
                      label={i === 0 ? "Surcharge (₹)" : ""}
                      type="number"
                      placeholder="0"
                      value={fabric.surcharge}
                      onChange={(e) => updateFabric(i, "surcharge", Number(e.target.value))}
                    />
                  </div>
                  {fabrics.length > 1 && (
                    <button type="button" onClick={() => removeFabric(i)} className="text-red-400 hover:text-red-600 pb-2">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <Link href="/admin/catalog">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Design"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DesignCard from "@/components/DesignCard";
import { CATEGORIES, CATEGORY_LABELS, Category } from "@/lib/utils";

interface Design {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  imageUrl: string;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("category") || "all";

  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = activeCategory === "all" ? "/api/designs" : `/api/designs?category=${activeCategory}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setDesigns(data);
        setLoading(false);
      });
  }, [activeCategory]);

  const setCategory = (cat: string) => {
    if (cat === "all") {
      router.push("/catalog");
    } else {
      router.push(`/catalog?category=${cat}`);
    }
  };

  return (
    <>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-rose-600 text-white"
              : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600"
          }`}
        >
          All Designs
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-rose-600 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600"
            }`}
          >
            {CATEGORY_LABELS[cat as Category]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-stone-200 overflow-hidden animate-pulse">
              <div className="h-64 bg-stone-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-full" />
                <div className="h-3 bg-stone-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg">No designs found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </>
  );
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Browse Designs</h1>
          <p className="text-stone-500">Explore our collection of handcrafted Indian clothing</p>
        </div>
        <Suspense fallback={<div className="text-stone-400">Loading catalog...</div>}>
          <CatalogContent />
        </Suspense>
      </div>
    </div>
  );
}

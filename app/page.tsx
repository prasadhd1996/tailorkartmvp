import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { formatCurrency, CATEGORY_LABELS, Category } from "@/lib/utils";

const FEATURES = [
  {
    icon: "✂️",
    title: "Made to Measure",
    description: "Every garment crafted precisely to your measurements for a perfect fit.",
  },
  {
    icon: "🪡",
    title: "Premium Fabrics",
    description: "Choose from silks, georgettes, cotton and more — sourced from finest mills.",
  },
  {
    icon: "🎨",
    title: "Custom Colors",
    description: "Pick your preferred color and we'll match it exactly to your vision.",
  },
  {
    icon: "📦",
    title: "Doorstep Delivery",
    description: "Carefully packaged and delivered right to your home across India.",
  },
];

export default async function HomePage() {
  const featuredDesigns = await prisma.design.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-900 via-rose-800 to-amber-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-amber-300 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-rose-300 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <div className="inline-block bg-amber-500/20 border border-amber-400/30 text-amber-200 text-sm px-4 py-1.5 rounded-full mb-6">
              Handcrafted with Love — Since 2010
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Custom Indian Clothing, <span className="text-amber-300">Tailored for You</span>
            </h1>
            <p className="text-rose-100 text-lg md:text-xl mb-8 leading-relaxed">
              From elegant sarees to stunning lehengas — every piece crafted to your exact measurements, style, and occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalog">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold w-full sm:w-auto">
                  Browse Designs
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-stone-800 text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([slug, label]) => (
            <Link key={slug} href={`/catalog?category=${slug}`}>
              <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white border border-stone-200 hover:border-rose-300 hover:shadow-md transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center text-2xl transition-colors">
                  {slug === "saree" ? "🥻" : slug === "lehenga" ? "👗" : slug === "salwar-suit" ? "👘" : slug === "kurti" ? "🫱" : "🪡"}
                </div>
                <span className="text-sm font-medium text-stone-700 text-center">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Designs */}
      {featuredDesigns.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-stone-800">Featured Designs</h2>
            <Link href="/catalog">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDesigns.map((design) => (
              <div key={design.id} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-64 bg-rose-50 overflow-hidden">
                    <Image
                      src={design.imageUrl}
                      alt={design.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-rose-600 font-medium uppercase tracking-wide mb-1 capitalize">
                      {CATEGORY_LABELS[design.category as Category] || design.category}
                    </p>
                    <h3 className="font-semibold text-stone-800 mb-1">{design.name}</h3>
                    <p className="text-stone-500 text-sm line-clamp-2 mb-3">{design.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-rose-700 font-bold">{formatCurrency(design.basePrice)}</span>
                      <div className="flex gap-2">
                        <Link href={`/catalog/${design.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Link href={`/order/new?designId=${design.id}`}>
                          <Button size="sm">Order</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-stone-800 text-center mb-12">Why Choose TailorKart?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-stone-800 mb-2">{f.title}</h3>
                <p className="text-stone-500 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-rose-800 to-amber-700 text-white text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Ready for Your Perfect Outfit?</h2>
        <p className="text-rose-100 mb-8 text-lg">Browse our catalog and place your custom order today.</p>
        <Link href="/catalog">
          <Button size="lg" className="bg-white text-rose-800 hover:bg-rose-50">
            Start Shopping
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">TK</span>
          </div>
          <span className="text-white font-semibold">TailorKart</span>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} TailorKart. All rights reserved.</p>
      </footer>
    </div>
  );
}

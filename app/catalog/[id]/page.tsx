import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { formatCurrency, CATEGORY_LABELS, Category } from "@/lib/utils";

interface FabricOption {
  name: string;
  surcharge: number;
}

export default async function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await prisma.design.findUnique({ where: { id, isActive: true } });
  if (!design) notFound();

  const fabricOptions: FabricOption[] = JSON.parse(design.fabricOptions);
  const images: string[] = JSON.parse(design.images);
  const allImages = [design.imageUrl, ...images].filter(Boolean);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/catalog" className="text-sm text-rose-600 hover:underline mb-6 inline-block">
          ← Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative h-96 rounded-2xl overflow-hidden bg-rose-50">
              <Image
                src={design.imageUrl}
                alt={design.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-rose-50">
                    <Image src={img} alt={`${design.name} ${i + 1}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <Badge className="mb-3 capitalize">
              {CATEGORY_LABELS[design.category as Category] || design.category}
            </Badge>
            <h1 className="text-3xl font-bold text-stone-800 mb-4">{design.name}</h1>
            <p className="text-stone-600 leading-relaxed mb-6">{design.description}</p>

            <div className="bg-rose-50 rounded-xl p-5 mb-6">
              <p className="text-sm text-stone-500 mb-1">Base Price</p>
              <p className="text-3xl font-bold text-rose-700">{formatCurrency(design.basePrice)}</p>
              <p className="text-xs text-stone-400 mt-1">Final price may vary based on fabric selection</p>
            </div>

            {fabricOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-stone-700 mb-3">Available Fabrics</h3>
                <div className="space-y-2">
                  {fabricOptions.map((fabric) => (
                    <div key={fabric.name} className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-white">
                      <span className="text-stone-700 font-medium capitalize">{fabric.name}</span>
                      <span className="text-sm text-stone-500">
                        {fabric.surcharge > 0
                          ? `+${formatCurrency(fabric.surcharge)}`
                          : "Included"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-amber-800 mb-2">Customization Included</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Custom measurements (bust, waist, hip, height, sleeve)</li>
                <li>• Color preference matching</li>
                <li>• Special notes & alterations</li>
                <li>• Delivery date selection</li>
              </ul>
            </div>

            <Link href={`/order/new?designId=${design.id}`}>
              <Button size="lg" className="w-full">
                Place Custom Order
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

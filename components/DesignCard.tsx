import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { formatCurrency, CATEGORY_LABELS, Category } from "@/lib/utils";

interface Design {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  imageUrl: string;
}

export default function DesignCard({ design }: { design: Design }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-64 w-full overflow-hidden bg-rose-50">
        <Image
          src={design.imageUrl}
          alt={design.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="capitalize">
            {CATEGORY_LABELS[design.category as Category] || design.category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-stone-800 text-base mb-1">{design.name}</h3>
        <p className="text-stone-500 text-sm line-clamp-2 mb-3">{design.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400">Starting from</p>
            <p className="text-rose-700 font-bold text-lg">{formatCurrency(design.basePrice)}</p>
          </div>
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
  );
}

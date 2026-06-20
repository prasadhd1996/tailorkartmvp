import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, CATEGORY_LABELS, Category } from "@/lib/utils";

export default async function AdminCatalogPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const designs = await prisma.design.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-stone-800">Catalog Management</h1>
          <Link href="/admin/catalog/new" className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-rose-700 transition-colors">
            + Add Design
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Design</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {designs.map((design) => (
                <tr key={design.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-rose-50 shrink-0">
                        <Image src={design.imageUrl} alt={design.name} fill className="object-cover" unoptimized />
                      </div>
                      <p className="font-medium text-stone-800">{design.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="capitalize">{CATEGORY_LABELS[design.category as Category] || design.category}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-medium text-rose-700">
                    {formatCurrency(design.basePrice)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={design.isActive ? "success" : "secondary"}>
                      {design.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/catalog/${design.id}/edit`} className="text-rose-600 hover:underline text-xs">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {designs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-stone-400">No designs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [totalOrders, pendingOrders, totalRevenue, totalDesigns] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { notIn: ["DELIVERED", "READY"] } } }),
    prisma.order.aggregate({ _sum: { totalPrice: true } }),
    prisma.design.count({ where: { isActive: true } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      design: { select: { name: true } },
    },
  });

  const stats = [
    { label: "Total Orders", value: totalOrders.toString(), color: "bg-rose-50 text-rose-700" },
    { label: "Active Orders", value: pendingOrders.toString(), color: "bg-amber-50 text-amber-700" },
    { label: "Total Revenue", value: formatCurrency(totalRevenue._sum.totalPrice || 0), color: "bg-green-50 text-green-700" },
    { label: "Designs", value: totalDesigns.toString(), color: "bg-blue-50 text-blue-700" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-stone-800">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Link href="/admin/catalog/new" className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-rose-700 transition-colors">
              + Add Design
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <p className="text-sm text-stone-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/admin/orders" className="bg-white border border-stone-200 rounded-xl p-5 hover:border-rose-300 hover:shadow-sm transition-all">
            <h3 className="font-semibold text-stone-800 mb-1">Manage Orders</h3>
            <p className="text-stone-400 text-sm">View and update order statuses</p>
          </Link>
          <Link href="/admin/catalog" className="bg-white border border-stone-200 rounded-xl p-5 hover:border-rose-300 hover:shadow-sm transition-all">
            <h3 className="font-semibold text-stone-800 mb-1">Manage Catalog</h3>
            <p className="text-stone-400 text-sm">Add, edit, and remove designs</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-stone-200">
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h2 className="font-semibold text-stone-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-rose-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-stone-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-stone-700">{order.user.name} — {order.design.name}</p>
                  <p className="text-xs text-stone-400">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-rose-700">{formatCurrency(order.totalPrice)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === "DELIVERED" ? "bg-stone-100 text-stone-600" :
                    order.status === "READY" ? "bg-green-100 text-green-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {order.status}
                  </span>
                  <Link href={`/admin/orders/${order.id}`} className="text-xs text-rose-600 hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="p-5 text-stone-400 text-sm text-center">No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

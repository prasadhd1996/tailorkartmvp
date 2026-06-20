import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await prisma.design.findUnique({ where: { id } });
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(design);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const design = await prisma.design.update({
    where: { id },
    data: {
      ...body,
      basePrice: body.basePrice ? Number(body.basePrice) : undefined,
      images: body.images ? JSON.stringify(body.images) : undefined,
      fabricOptions: body.fabricOptions ? JSON.stringify(body.fabricOptions) : undefined,
    },
  });

  return NextResponse.json(design);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.design.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}

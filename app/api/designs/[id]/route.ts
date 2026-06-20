import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await prisma.design.findUnique({ where: { id, isActive: true } });
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(design);
}

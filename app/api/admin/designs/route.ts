import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const designs = await prisma.design.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(designs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, category, description, basePrice, imageUrl, images, fabricOptions } = body;

  const design = await prisma.design.create({
    data: {
      name,
      category,
      description,
      basePrice: Number(basePrice),
      imageUrl,
      images: JSON.stringify(images || []),
      fabricOptions: JSON.stringify(fabricOptions || []),
    },
  });

  return NextResponse.json(design, { status: 201 });
}

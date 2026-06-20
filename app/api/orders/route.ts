import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { design: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { designId, measurements, fabricChoice, colorPreference, deliveryDate, specialNotes } = body;

    const design = await prisma.design.findUnique({ where: { id: designId } });
    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const fabricOptions: { name: string; surcharge: number }[] = JSON.parse(design.fabricOptions);
    const chosenFabric = fabricOptions.find((f) => f.name === fabricChoice);
    const surcharge = chosenFabric?.surcharge ?? 0;
    const totalPrice = design.basePrice + surcharge;

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        designId,
        measurements: JSON.stringify(measurements),
        fabricChoice,
        colorPreference,
        deliveryDate: new Date(deliveryDate),
        specialNotes,
        totalPrice,
        status: "RECEIVED",
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

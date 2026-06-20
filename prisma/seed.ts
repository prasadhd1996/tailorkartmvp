import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const designs = [
  {
    name: "Royal Kanjivaram Silk Saree",
    category: "saree",
    description: "Exquisite Kanjivaram silk saree with traditional gold zari work and rich border. Perfect for weddings and festive occasions. The intricate temple border design adds a royal touch.",
    basePrice: 8500,
    imageUrl: "https://picsum.photos/seed/saree-silk/600/800",
    images: JSON.stringify(["https://picsum.photos/seed/saree-silk-2/600/800"]),
    fabricOptions: JSON.stringify([
      { name: "Pure Silk", surcharge: 0 },
      { name: "Art Silk", surcharge: -2000 },
      { name: "Tussar Silk", surcharge: 1500 },
    ]),
  },
  {
    name: "Bridal Lehenga Choli",
    category: "lehenga",
    description: "Stunning bridal lehenga with heavy embroidery and mirror work. Comes with matching blouse and dupatta. This masterpiece is crafted with love for your special day.",
    basePrice: 25000,
    imageUrl: "https://picsum.photos/seed/lehenga-bridal/600/800",
    images: JSON.stringify(["https://picsum.photos/seed/lehenga-bridal-2/600/800"]),
    fabricOptions: JSON.stringify([
      { name: "Velvet", surcharge: 0 },
      { name: "Georgette", surcharge: -3000 },
      { name: "Net with Silk Base", surcharge: 5000 },
    ]),
  },
  {
    name: "Cotton Anarkali Salwar Suit",
    category: "salwar-suit",
    description: "Elegant Anarkali style salwar suit with floral embroidery. Comfortable cotton fabric perfect for daily wear and casual occasions. Comes with matching dupatta.",
    basePrice: 3200,
    imageUrl: "https://picsum.photos/seed/salwar-anarkali/600/800",
    images: JSON.stringify([]),
    fabricOptions: JSON.stringify([
      { name: "Cotton", surcharge: 0 },
      { name: "Cotton-Silk Blend", surcharge: 800 },
      { name: "Chiffon", surcharge: 1200 },
    ]),
  },
  {
    name: "Embroidered Kurti Set",
    category: "kurti",
    description: "Beautiful embroidered kurti with intricate thread work and mirror embellishments. Pair with palazzo or leggings for a chic, modern Indian look.",
    basePrice: 1800,
    imageUrl: "https://picsum.photos/seed/kurti-embroidered/600/800",
    images: JSON.stringify([]),
    fabricOptions: JSON.stringify([
      { name: "Rayon", surcharge: 0 },
      { name: "Cotton", surcharge: 200 },
      { name: "Georgette", surcharge: 500 },
    ]),
  },
  {
    name: "Aari Work Blouse",
    category: "blouse",
    description: "Heavily embroidered blouse with traditional Aari work in zardosi and thread. Custom designed to complement your saree or lehenga perfectly.",
    basePrice: 2500,
    imageUrl: "https://picsum.photos/seed/blouse-aari/600/800",
    images: JSON.stringify([]),
    fabricOptions: JSON.stringify([
      { name: "Raw Silk", surcharge: 0 },
      { name: "Brocade", surcharge: 800 },
      { name: "Velvet", surcharge: 1000 },
    ]),
  },
  {
    name: "Party Wear Georgette Saree",
    category: "saree",
    description: "Modern georgette saree with sequin and stone work, perfect for parties and evening events. Light and flowy, easy to drape and carry all day.",
    basePrice: 4500,
    imageUrl: "https://picsum.photos/seed/saree-georgette/600/800",
    images: JSON.stringify([]),
    fabricOptions: JSON.stringify([
      { name: "Georgette", surcharge: 0 },
      { name: "Crepe", surcharge: 300 },
      { name: "Chiffon", surcharge: 200 },
    ]),
  },
  {
    name: "Sharara Suit Set",
    category: "salwar-suit",
    description: "Trendy sharara suit with a long kurti top and wide-leg sharara pants. Adorned with gota patti work and tassel details for a festive look.",
    basePrice: 5500,
    imageUrl: "https://picsum.photos/seed/sharara-suit/600/800",
    images: JSON.stringify([]),
    fabricOptions: JSON.stringify([
      { name: "Chanderi Silk", surcharge: 0 },
      { name: "Net", surcharge: 500 },
      { name: "Georgette", surcharge: 300 },
    ]),
  },
  {
    name: "Designer Lehenga Set",
    category: "lehenga",
    description: "Contemporary designer lehenga with geometric patterns and modern cuts. Perfect for engagement ceremonies and cocktail parties. Includes blouse and dupatta.",
    basePrice: 12000,
    imageUrl: "https://picsum.photos/seed/lehenga-designer/600/800",
    images: JSON.stringify([]),
    fabricOptions: JSON.stringify([
      { name: "Crepe", surcharge: 0 },
      { name: "Silk", surcharge: 2000 },
      { name: "Organza", surcharge: 1500 },
    ]),
  },
];

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tailorkart.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@tailorkart.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "+91 98765 00000",
    },
  });
  console.log("Admin created:", admin.email);

  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "+91 98765 43210",
    },
  });
  console.log("Customer created:", customer.email);

  for (const design of designs) {
    const created = await prisma.design.create({ data: design });
    console.log("Design created:", created.name);
  }

  const firstDesign = await prisma.design.findFirst();
  if (firstDesign) {
    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        designId: firstDesign.id,
        status: "STITCHING",
        measurements: JSON.stringify({
          bust: "86",
          waist: "70",
          hip: "92",
          height: "162",
          sleeveLength: "58",
        }),
        fabricChoice: "Pure Silk",
        colorPreference: "Deep Maroon",
        deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        specialNotes: "Please add a small hook at the waist for the fall",
        totalPrice: firstDesign.basePrice,
        adminNotes: "Fabric has been sourced. Stitching in progress.",
      },
    });
    console.log("Sample order created:", order.id);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

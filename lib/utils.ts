export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const ORDER_STATUSES = [
  "RECEIVED",
  "MEASURING",
  "CUTTING",
  "STITCHING",
  "READY",
  "DELIVERED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: "Order Received",
  MEASURING: "Taking Measurements",
  CUTTING: "Fabric Cutting",
  STITCHING: "Stitching",
  READY: "Ready for Pickup",
  DELIVERED: "Delivered",
};

export const CATEGORIES = [
  "saree",
  "lehenga",
  "salwar-suit",
  "kurti",
  "blouse",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  saree: "Saree",
  lehenga: "Lehenga",
  "salwar-suit": "Salwar Suit",
  kurti: "Kurti",
  blouse: "Blouse",
};

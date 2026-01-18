import { CartItem, Restaurant } from "@/lib/types";

interface OrderDetails {
  customerName: string;
  phone?: string;
  address?: string; // Delivery
  tableNumber?: string; // Dine-In (table / room / bar / location)
  orderType: "dine-in" | "takeaway" | "delivery";
  items: CartItem[];
  total: number;
}

export function generateWhatsAppLink(
  restaurant: Restaurant,
  order: OrderDetails
): string {
  const {
    customerName,
    phone,
    address,
    tableNumber,
    orderType,
    items,
    total,
  } = order;

  const orderTypeLabel: Record<OrderDetails["orderType"], string> = {
    "dine-in": "Dine-In",
    takeaway: "Takeaway",
    delivery: "Delivery",
  };

  let message = `*New Order - ${restaurant.name}*\n`;
  message += `--------------------------------\n`;
  message += `Type: *${orderTypeLabel[orderType]}*\n`;

  // Dine-In location (editable, prefilled from QR if available)
  if (orderType === "dine-in" && tableNumber) {
    message += `Location: *${tableNumber}*\n`;
  }

  message += `Name: *${customerName}*\n`;

  if (phone) {
    message += `Phone: ${phone}\n`;
  }

  // Delivery address (multiline for clarity)
  if (orderType === "delivery" && address) {
    message += `Address:\n${address}\n`;
  }

  message += `--------------------------------\n`;
  message += `Order Details:\n`;

  items.forEach((item) => {
    const variantStr = item.variant ? ` (${item.variant})` : "";
    const lineTotal = item.price * item.quantity;
    message += `${item.quantity} x ${item.name}${variantStr} = ₹${lineTotal}\n`;
  });

  message += `--------------------------------\n`;
  message += `*Estimated Amount: ₹${total}*\n`;
  message += `--------------------------------\n`;

  if (orderType === "takeaway") {
    message += `Please confirm pickup time.\n`;
  } else if (orderType === "delivery") {
    message += `Please confirm delivery time.\n`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${restaurant.whatsappNumber}?text=${encodedMessage}`;
}

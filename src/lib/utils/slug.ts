export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `VTC-${year}-${rand}`;
}

export function generateTicketCode(orderNumber: string): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${orderNumber}-${rand}`;
}

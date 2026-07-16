import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  tierId: string;
  tierName: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (eventId: string, tierId: string) => void;
  updateQuantity: (eventId: string, tierId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.eventId === item.eventId && i.tierId === item.tierId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.eventId === item.eventId && i.tierId === item.tierId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (eventId, tierId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.eventId === eventId && i.tierId === tierId)
          ),
        })),

      updateQuantity: (eventId, tierId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !(i.eventId === eventId && i.tierId === tierId)
                )
              : state.items.map((i) =>
                  i.eventId === eventId && i.tierId === tierId
                    ? { ...i, quantity }
                    : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'vitaconnect-cart' }
  )
);

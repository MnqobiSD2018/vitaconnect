import { Event } from './constants/mockData';
type ApiEvent = any;

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const STORAGE_KEY = 'vitaconnect_events_v1';

function loadFromStorage(): Event[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Event[];
  } catch (e) {
    console.error('Failed to load events from storage', e);
    return [];
  }
}

function saveToStorage(events: Event[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events to storage', e);
  }
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function listEvents(): Promise<Event[]> {
  // simulate small delay
  await new Promise((r) => setTimeout(r, 50));
  // Prefer server API for canonical data
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const api = await res.json();
      if (Array.isArray(api) && api.length) {
        // fetch categories to map ids to names
        let catMap: Record<number, string> = {};
        try {
          const cres = await fetch('/api/categories');
          if (cres.ok) {
            const cats = await cres.json();
            (cats || []).forEach((c: any) => { catMap[c.id] = c.name; });
          }
        } catch (e) {}

        const mapped = (api as ApiEvent[]).map((e) => {
          const tiers = e.ticketTiers || e.ticket_tiers || [];
          const ticketTiers = (tiers).map((t: any) => ({
            id: t.id,
            name: t.name,
            price: Number(t.price) || 0,
            currency: t.currency || 'USD',
            description: t.description || '',
            available: t.quantity ?? 0
          }));

          const customFields = (e.content?.customFields) || [];

          const dateStr = e.starts_at ? new Date(e.starts_at).toLocaleDateString() : '';
          const timeStr = e.starts_at ? new Date(e.starts_at).toLocaleTimeString() : '';

          return {
            id: e.id,
            title: e.title,
            slug: e.slug,
            description: e.description || '',
            date: dateStr,
            time: timeStr,
            location: e.venue_address || '',
            category: (catMap[e.category_id] as any) || 'Other',
            image: e.cover_image_url || PLACEHOLDER_IMAGE,
            ticketTiers,
            customFields
          } as Event;
        });
        if (mapped.length) return mapped;
      }
    }
  } catch (e) {
    // ignore and fallback
  }

  const stored = loadFromStorage();
  if (stored.length) return stored;
  // if no stored events, fallback to mock data bundled with app
  try {
    const mock = (await import('./constants/mockData')).MOCK_EVENTS as Event[];
    saveToStorage(mock);
    return mock;
  } catch (e) {
    return [];
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  await new Promise((r) => setTimeout(r, 30));
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const api = await res.json();
      if (Array.isArray(api)) {
        const foundApi = (api as ApiEvent[]).find((e) => e.id === id);
        if (foundApi) {
          const cres = await fetch('/api/categories');
          const cats = cres.ok ? await cres.json() : [];
          const catMap: Record<number, string> = {};
          (cats || []).forEach((c: any) => { catMap[c.id] = c.name; });

          const tiers = foundApi.ticketTiers || foundApi.ticket_tiers || [];
          const ticketTiers = tiers.map((t: any) => ({
            id: t.id,
            name: t.name,
            price: Number(t.price) || 0,
            currency: t.currency || 'USD',
            description: t.description || '',
            available: t.quantity ?? 0
          }));

          const customFields = (foundApi.content?.customFields) || [];
          const dateStr = foundApi.starts_at ? new Date(foundApi.starts_at).toLocaleDateString() : '';
          const timeStr = foundApi.starts_at ? new Date(foundApi.starts_at).toLocaleTimeString() : '';

          return {
            id: foundApi.id,
            title: foundApi.title,
            slug: foundApi.slug,
            description: foundApi.description || '',
            date: dateStr,
            time: timeStr,
            location: foundApi.venue_address || '',
            category: (catMap[foundApi.category_id] as any) || 'Other',
            image: foundApi.cover_image_url || PLACEHOLDER_IMAGE,
            ticketTiers,
            customFields
          } as Event;
        }
      }
    }
  } catch (e) {
    // ignore
  }

  const events = loadFromStorage();
  return events.find((e) => e.id === id) ?? null;
}

export async function createEvent(data: Partial<Event>): Promise<Event> {
  await new Promise((r) => setTimeout(r, 50));
  const events = loadFromStorage();
  const now = Date.now();
  const id = `evt_${now}`;
  const title = data.title ?? `New Event ${now}`;
  // ensure correct precedence when mixing ?? and ||
  const slugCandidate = data.slug ?? slugify(title);
  const slug = slugCandidate || `event-${now}`;
  const newEvent: Event = {
    id,
    title,
    slug,
    description: data.description ?? '',
    date: data.date ?? '',
    time: data.time ?? '',
    location: data.location ?? '',
    category: (data.category as any) ?? 'Other',
    image: data.image || PLACEHOLDER_IMAGE,
    ticketTiers: data.ticketTiers ?? [],
    customFields: data.customFields ?? [],
  };
  // Prefer server API - map to normalized fields
  try {
    const startsAt = data.date ? (new Date(data.date).toISOString()) : new Date().toISOString();
    const endsAt = data.date ? new Date(Date.parse(data.date) + 1000 * 60 * 60 * 4).toISOString() : new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString();
    const body = {
      title: newEvent.title,
      description: newEvent.description,
      starts_at: startsAt,
      ends_at: endsAt,
      venue_address: newEvent.location,
      category_id: null,
      cover_image_url: newEvent.image,
      ticketTiers: newEvent.ticketTiers,
      content: { original: newEvent }
    };
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const payload = await res.json();
      if (payload?.id) return { ...newEvent, id: payload.id };
    }
  } catch (e) {
    // ignore
  }

  events.unshift(newEvent);
  saveToStorage(events);
  return newEvent;
}

export async function updateEvent(id: string, patch: Partial<Event>): Promise<Event | null> {
  await new Promise((r) => setTimeout(r, 50));
  // Call API to update normalized event
  try {
    const body: any = { ...patch };
    if (patch.ticketTiers) body.ticketTiers = patch.ticketTiers;
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      // return merged local representation
      const events = loadFromStorage();
      const idx = events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        const updated = { ...events[idx], ...patch } as Event;
        events[idx] = updated;
        saveToStorage(events);
        return updated;
      }
      return null;
    }
  } catch (e) {
    // fallback to local
  }

  const events = loadFromStorage();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated = { ...events[idx], ...patch } as Event;
  if (patch.title && !patch.slug) {
    updated.slug = slugify(patch.title!);
  }
  events[idx] = updated;
  saveToStorage(events);
  return updated;
}

export async function deleteEvent(id: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 30));
  try {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (e) {
    // ignore
  }

  let events = loadFromStorage();
  const before = events.length;
  events = events.filter((e) => e.id !== id);
  saveToStorage(events);
  return events.length < before;
}

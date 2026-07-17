import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | VitaConnect',
  description: 'Browse concerts, marathons, conferences, and more happening across Zimbabwe.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
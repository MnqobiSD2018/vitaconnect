import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-slate-400">
      <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
      <p className="text-sm font-medium">Loading event details...</p>
    </div>
  );
}

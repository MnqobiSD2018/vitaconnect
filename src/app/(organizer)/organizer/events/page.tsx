"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listEvents, deleteEvent } from "@/lib/eventStore";
import { Event } from "@/lib/constants/mockData";

export default function OrganizerEventsPage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		listEvents()
			.then((res) => {
				if (mounted) setEvents(res);
			})
			.finally(() => mounted && setLoading(false));
		return () => {
			mounted = false;
		};
	}, []);

	async function handleDelete(id: string) {
		if (!confirm('Delete this event?')) return;
		await deleteEvent(id);
		setEvents((s) => s.filter((e) => e.id !== id));
	}

	if (loading) return <div>Loading...</div>;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-slate-900">Your Events</h2>
				<Link href="/organizer/events/new" className="text-sm text-slate-700 hover:underline">Create new</Link>
			</div>

			<div className="grid gap-3">
				{events.map((ev) => (
					<div key={ev.id} className="rounded-lg border border-slate-100 bg-white p-3 flex items-center justify-between">
						<div>
							<div className="font-medium text-slate-900">{ev.title}</div>
							<div className="text-xs text-slate-500">{ev.date} • {ev.location}</div>
						</div>
						<div className="flex gap-2">
							<Link href={`/organizer/events/${ev.id}`} className="text-sm text-slate-600 hover:underline">Manage</Link>
							<button onClick={() => handleDelete(ev.id)} className="text-sm text-rose-600 hover:underline">Delete</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

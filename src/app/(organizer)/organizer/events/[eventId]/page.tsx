"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getEventById, updateEvent, deleteEvent } from "@/lib/eventStore";
import { Event } from "@/lib/constants/mockData";

export default function OrganizerEventPage() {
	const params = useParams();
	const eventId = params?.eventId as string;
	const router = useRouter();
	const [event, setEvent] = useState<Event | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		if (!eventId) {
			setLoading(false);
			return;
		}
		getEventById(eventId).then((e) => {
			if (mounted) setEvent(e);
		}).finally(() => mounted && setLoading(false));
		return () => { mounted = false };
	}, [eventId]);

	async function handleSave() {
		if (!event) return;
		setSaving(true);
		const updated = await updateEvent(event.id, {
			title: event.title,
			date: event.date,
			location: event.location,
			description: event.description,
		});
		setSaving(false);
		if (updated) setEvent(updated);
		alert('Saved');
	}

	async function handleDelete() {
		if (!confirm('Delete this event?')) return;
		const ok = await deleteEvent(eventId);
		if (ok) router.push('/organizer/events');
	}

	if (loading) return <div>Loading...</div>;
	if (!event) return <div>Event not found.</div>;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
				<div className="flex gap-2">
					<Link href={`/organizer/events/${eventId}/attendees`} className="text-sm text-slate-600 hover:underline">Attendees</Link>
					<Link href={`/organizer/events/${eventId}/tickets`} className="text-sm text-slate-600 hover:underline">Tickets</Link>
				</div>
			</div>

			<div className="rounded-lg border border-slate-100 bg-white p-6 space-y-4">
				<div>
					<label className="block text-sm font-medium text-slate-700">Title</label>
					<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} />
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700">Date</label>
					<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={event.date} onChange={(e) => setEvent({ ...event, date: e.target.value })} />
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700">Location</label>
					<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={event.location} onChange={(e) => setEvent({ ...event, location: e.target.value })} />
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700">Description</label>
					<textarea className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={event.description} onChange={(e) => setEvent({ ...event, description: e.target.value })} />
				</div>

				<div className="flex items-center gap-3">
					<button onClick={handleSave} disabled={saving} className="rounded-xl bg-teal-600 px-4 py-2 text-white">{saving ? 'Saving...' : 'Save changes'}</button>
					<button onClick={handleDelete} className="rounded-xl border border-rose-500 px-4 py-2 text-rose-600">Delete</button>
				</div>
			</div>
		</div>
	);
}

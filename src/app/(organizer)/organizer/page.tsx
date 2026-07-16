"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Event } from "@/lib/constants/mockData";
import { listEvents } from "@/lib/eventStore";

export default function OrganizerHome() {
	const [events, setEvents] = useState<Event[]>([]);

	useEffect(() => {
		let cancelled = false;

		listEvents()
			.then((items) => {
				if (!cancelled) setEvents(items);
			})
			.catch(() => {
				if (!cancelled) setEvents([]);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-semibold text-slate-900">Welcome back, Organizer</h2>
					<p className="text-sm text-slate-500">Overview of your events and recent activity</p>
				</div>

				<div className="flex items-center gap-3">
					<Link
						href="/organizer/events/new"
						className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
						style={{ background: 'linear-gradient(90deg, rgb(15 23 42) 0%, rgb(51 65 85) 55%, rgb(30 41 59) 100%)' }}
					>
						Create Event
					</Link>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="rounded-xl border border-slate-200 bg-white p-4">
					<div className="text-sm text-slate-500">Events</div>
					<div className="mt-2 text-2xl font-bold text-slate-900">{events.length}</div>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-4">
					<div className="text-sm text-slate-500">Tickets Sold (est.)</div>
					<div className="mt-2 text-2xl font-bold text-slate-900">{events.reduce((s, e) => s + e.ticketTiers.reduce((a, t) => a + Math.min(50, t.available), 0), 0)}</div>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-4">
					<div className="text-sm text-slate-500">Upcoming Payouts</div>
					<div className="mt-2 text-2xl font-bold text-slate-900">{2}</div>
				</div>
			</div>

			<section className="rounded-xl border border-slate-200 bg-white p-6">
				<h3 className="text-lg font-semibold text-slate-900">Recent Events</h3>
				<div className="mt-4 grid gap-4">
					{events.map((ev) => (
						<div key={ev.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
							<div>
								<div className="text-sm font-semibold text-slate-900">{ev.title}</div>
								<div className="text-xs text-slate-500">{ev.date} • {ev.location}</div>
							</div>

							<div className="flex items-center gap-3">
								<Link href={`/organizer/events/${ev.id}`} className="text-sm text-slate-600 hover:underline">Manage</Link>
								<Link href={`/events/${ev.slug}`} className="text-sm text-slate-600 hover:underline">View</Link>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

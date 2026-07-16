"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string };

export default function NewEventPage() {
	const router = useRouter();
	const [title, setTitle] = useState('');
	const [startsAt, setStartsAt] = useState('');
	const [endsAt, setEndsAt] = useState('');
	const [location, setLocation] = useState('');
	const [description, setDescription] = useState('');
	const [categoryId, setCategoryId] = useState<number | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [isOnline, setIsOnline] = useState(false);
	const [onlineUrl, setOnlineUrl] = useState('');
	const [coverImage, setCoverImage] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetch('/api/categories')
			.then((r) => r.json())
			.then((data) => setCategories(data || []))
			.catch(() => setCategories([]));
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		const body = {
			title,
			description,
			starts_at: startsAt || new Date().toISOString(),
			ends_at: endsAt || new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
			venue_address: location,
			category_id: categoryId,
			is_online: isOnline,
			online_url: onlineUrl,
			cover_image_url: coverImage,
			status: 'published'
		};

		const res = await fetch('/api/events', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const payload = await res.json();
		setSubmitting(false);
		if (payload?.id) router.push(`/organizer/events/${payload.id}`);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-slate-900">Create Event</h2>
				<Link href="/organizer/events" className="text-sm text-slate-700 hover:underline">Back to events</Link>
			</div>

			<form onSubmit={handleSubmit} className="rounded-lg border border-slate-100 bg-white p-6 space-y-4">
				<div>
					<label className="block text-sm font-medium text-slate-700">Title</label>
					<input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700">Description</label>
					<textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-slate-700">Starts At</label>
						<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700">Ends At</label>
						<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700">Category</label>
					<select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2">
						<option value="">Select category</option>
						{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700">Location</label>
					<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue or online address" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
				</div>

				<div className="grid grid-cols-2 gap-4 items-end">
					<div>
						<label className="block text-sm font-medium text-slate-700">Cover image URL</label>
						<input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700">Online?</label>
						<div className="mt-2">
							<label className="inline-flex items-center">
								<input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="mr-2" />
								<span className="text-sm text-slate-700">Is this event online?</span>
							</label>
						</div>
					</div>
				</div>

				{isOnline && (
					<div>
						<label className="block text-sm font-medium text-slate-700">Online URL</label>
						<input value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
					</div>
				)}

				<div className="flex items-center gap-3">
					<button type="submit" disabled={submitting} className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 px-4 py-2 text-white">{submitting ? 'Creating...' : 'Create Event'}</button>
				</div>
			</form>
		</div>
	);
}

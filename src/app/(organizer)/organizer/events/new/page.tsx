"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/ui/notifications";

type Category = { id: number; name: string };

export default function NewEventPage() {
	const router = useRouter();
	const notify = useNotification();
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

	type TicketTier = { name: string; description: string; price: string; quantity: string; currency: string };
	const [tiers, setTiers] = useState<TicketTier[]>([{ name: 'General Admission', description: '', price: '', quantity: '', currency: 'USD' }]);

	function updateTier(index: number, field: keyof TicketTier, value: string) {
		setTiers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
	}
	function addTier() {
		setTiers(prev => [...prev, { name: '', description: '', price: '', quantity: '', currency: 'USD' }]);
	}
	function removeTier(index: number) {
		setTiers(prev => prev.filter((_, i) => i !== index));
	}

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
			status: 'published',
			ticketTiers: tiers
				.filter(t => t.name && t.price !== '' && t.quantity !== '')
				.map(t => ({
					name: t.name,
					description: t.description || null,
					price: parseFloat(t.price) || 0,
					quantity: parseInt(t.quantity) || 0,
					currency: t.currency,
				})),
		};

		try {
			const res = await fetch('/api/events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const payload = await res.json();
			if (!res.ok) {
				notify.error(payload?.error || 'Failed to create event');
				return;
			}
			if (payload?.id) router.push(`/organizer/events/${payload.id}`);
		} catch {
			notify.error('Network error — please try again');
		} finally {
			setSubmitting(false);
		}
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

			<div className="border-t border-slate-200 pt-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="text-sm font-bold text-slate-900">Ticket Tiers</h3>
						<p className="text-xs text-slate-500">Define pricing and capacity for your event</p>
					</div>
					<button type="button" onClick={addTier} className="text-xs font-semibold text-teal-600 hover:text-teal-700">+ Add Tier</button>
				</div>
				<div className="space-y-4">
					{tiers.map((tier, i) => (
						<div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold text-slate-400">Tier {i + 1}</span>
								{tiers.length > 1 && (
									<button type="button" onClick={() => removeTier(i)} className="text-xs text-rose-500 hover:text-rose-600 font-semibold">Remove</button>
								)}
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
									<input value={tier.name} onChange={(e) => updateTier(i, 'name', e.target.value)} placeholder="e.g. Early Bird" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
								</div>
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
									<input value={tier.description} onChange={(e) => updateTier(i, 'description', e.target.value)} placeholder="Optional description" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
								</div>
							</div>
							<div className="grid grid-cols-3 gap-3">
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">Price *</label>
									<input type="number" min="0" step="0.01" value={tier.price} onChange={(e) => updateTier(i, 'price', e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
								</div>
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">Quantity *</label>
									<input type="number" min="1" value={tier.quantity} onChange={(e) => updateTier(i, 'quantity', e.target.value)} placeholder="100" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
								</div>
								<div>
									<label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
									<select value={tier.currency} onChange={(e) => updateTier(i, 'currency', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
										<option value="USD">USD</option>
										<option value="ZiG">ZiG</option>
									</select>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="flex items-center gap-3">
					<button type="submit" disabled={submitting} className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 px-4 py-2 text-white">{submitting ? 'Creating...' : 'Create Event'}</button>
				</div>
			</form>
		</div>
	);
}

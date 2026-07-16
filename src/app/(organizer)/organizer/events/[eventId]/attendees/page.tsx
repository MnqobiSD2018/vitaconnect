import React from "react";

export default function AttendeesPage({ params }: { params: { eventId: string } }) {
	return (
		<div>
			<h3 className="text-lg font-semibold text-slate-900">Attendees for {params.eventId}</h3>
			<p className="text-sm text-slate-500 mt-2">No attendees yet (placeholder).</p>
		</div>
	);
}

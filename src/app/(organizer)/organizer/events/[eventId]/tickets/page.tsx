import React from "react";

export default function TicketsPage({ params }: { params: { eventId: string } }) {
	return (
		<div>
			<h3 className="text-lg font-semibold text-slate-900">Tickets for {params.eventId}</h3>
			<p className="text-sm text-slate-500 mt-2">Ticketing controls will appear here.</p>
		</div>
	);
}

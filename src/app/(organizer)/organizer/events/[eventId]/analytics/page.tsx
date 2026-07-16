import React from "react";

export default function AnalyticsPage({ params }: { params: { eventId: string } }) {
	return (
		<div>
			<h3 className="text-lg font-semibold text-slate-900">Analytics for {params.eventId}</h3>
			<p className="text-sm text-slate-500 mt-2">Analytics placeholders.</p>
		</div>
	);
}

"use client"
import { useState, useEffect } from "react";
import { addDays, isWithinInterval, parse } from "date-fns";
import MapComponent from "./Map";
import type { LatLngBounds } from "leaflet";
import { Event as EventComponent } from "./Event";
import { Event, useEvents } from "./useEvents";

export default function EventExplorer() {
	const events = useEvents();
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
	const [keyword, setKeyword] = useState("");
	const [timeFilter, setTimeFilter] = useState("all");
	const [boundsFilter, setBoundsFilter] = useState<LatLngBounds | undefined>(undefined);

	useEffect(() => {
		setFilteredEvents(events)
	}, [events])

	useEffect(() => {
		applyFilters();
	}, [keyword, timeFilter, events, boundsFilter]);

	const applyFilters = () => {
		let result = [...events];

		if (keyword.trim() !== "") {
			result = result.filter((e) =>
				Object.values(e).some((val) =>
					String(val).toLowerCase().includes(keyword.toLowerCase())
				)
			);
		}

		if (timeFilter == "week") {
			const now = new Date();
			const endDate =
				timeFilter === "week" ? addDays(now, 7) : addDays(now, 30);

			result = result.filter((e) => {
				const date = parse(e.date[0], "dd.MM.yyyy", new Date());
				return isWithinInterval(date, { start: now, end: endDate });
			});
		}

		if (boundsFilter !== undefined && timeFilter === "map") {
			result = result.filter(e => e.way_points.some(point => boundsFilter?.contains(point.position)))
		}
		setFilteredEvents(result);
	};
	const onMapChange = (bounds: LatLngBounds) => {
		setBoundsFilter(bounds);
	}


	return (
		<div className="p-4 max-w-3xl mx-auto flex flex-col h-dvh gap-2">
			<div className="flex flex-row justify-between items-center">
				<h1 className="text-xl font-bold">Event Explorer</h1>
				<h2 className="text-sm">Stand 13.Juni 25 20:00</h2>
			</div>
			<div className="flex flex-col sm:flex-row gap-2">
				<input
					type="text"
					placeholder="Suche nach Keyword..."
					className="border rounded py-1 px-2 flex-1"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
				/>
				<div className="flex gap-2">
					<button
						onClick={() => setTimeFilter("all")}
						className={`py-1 px-2 border rounded ${timeFilter === "all" ? "bg-blue-500 text-white" : "bg-white"
							}`}
					>
						Alle
					</button>
					<button
						onClick={() => setTimeFilter("week")}
						className={`py-1 px-2 border rounded ${timeFilter === "week" ? "bg-blue-500 text-white" : "bg-white"
							}`}
					>
						Nächste Woche
					</button>
					<button
						onClick={() => setTimeFilter("map")}
						className={`py-1 px-2 border rounded ${timeFilter === "map" ? "bg-blue-500 text-white" : "bg-white"
							}`}
					>
						Auf Karte
					</button>
				</div>
			</div>
			<MapComponent event={selectedEvent} onMapChange={onMapChange} disableFlyTo={timeFilter === "map"} />
			{filteredEvents.length} Events
			{filteredEvents.length === 0 ? (
				<p className="text-gray-500">Keine Events gefunden.</p>
			) : (
				<div className={`${filteredEvents.length < 3 ? '' : 'flex-1'} grid gap-2 overflow-auto`} >
					{filteredEvents.map((e, idx) => (
						<EventComponent key={idx} onClick={() => setSelectedEvent(e)} event={e} selected={e.thema === selectedEvent?.thema} />
					))}
				</div>
			)}
		</div>
	);
}

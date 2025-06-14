"use client"
import { useState, useEffect } from "react";
import { addDays, isWithinInterval, parse } from "date-fns";
import MapComponent from "./Map";

export interface Event { time: string; location: string; thema: string; date: string[]; way_points: string[][] }

export default function EventExplorer() {
	const [events, setEvents] = useState<Event[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
	const [keyword, setKeyword] = useState("");
	const [timeFilter, setTimeFilter] = useState("all");

	useEffect(() => {
		// Beispiel: JSON lokal importieren
		import("./events.json").then((data) => {
			setEvents(data.default || data);
			setFilteredEvents(data.default || data);
		});
	}, []);

	useEffect(() => {
		applyFilters();
	}, [keyword, timeFilter, events]);

	const applyFilters = () => {
		let result = [...events];

		if (keyword.trim() !== "") {
			result = result.filter((e) =>
				Object.values(e).some((val) =>
					String(val).toLowerCase().includes(keyword.toLowerCase())
				)
			);
		}

		if (timeFilter !== "all") {
			const now = new Date();
			const endDate =
				timeFilter === "week" ? addDays(now, 7) : addDays(now, 30);

			result = result.filter((e) => {
				const date = parse(e.date[0], "dd.MM.yyyy", new Date());
				return isWithinInterval(date, { start: now, end: endDate });
			});
		}

		setFilteredEvents(result);
	};

	const dateString = (date: string[]) => {
		if (date.length === 1) {
			return date[0]
		}
		return `${date[0]} und ${date.length - 1} weitere`
	}

	return (
		<div className="p-4 max-w-3xl mx-auto flex flex-col h-screen gap-2">
			<h1 className="text-xl font-bold">Event Explorer</h1>
			<h2 className="text-sm">Stand 13.Juni 25 20:00</h2>
			<div className="flex flex-col sm:flex-row gap-2">
				<input
					type="text"
					placeholder="Suche nach Keyword..."
					className="border rounded p-2 flex-1"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
				/>
				<div className="flex gap-2">
					<button
						onClick={() => setTimeFilter("all")}
						className={`p-2 border rounded ${timeFilter === "all" ? "bg-blue-500 text-white" : "bg-white"
							}`}
					>
						Alle
					</button>
					<button
						onClick={() => setTimeFilter("week")}
						className={`p-2 border rounded ${timeFilter === "week" ? "bg-blue-500 text-white" : "bg-white"
							}`}
					>
						Nächste Woche
					</button>
					<button
						onClick={() => setTimeFilter("month")}
						className={`p-2 border rounded ${timeFilter === "month" ? "bg-blue-500 text-white" : "bg-white"
							}`}
					>
						Nächster Monat
					</button>
				</div>
			</div>
			<MapComponent event={selectedEvent} />
			{filteredEvents.length} Events
			{filteredEvents.length === 0 ? (
				<p className="text-gray-500">Keine Events gefunden.</p>
			) : (
				<div className="flex-1 grid gap-2 overflow-auto" >
					{filteredEvents.map((e, idx) => (
						<button
							key={idx}
							className={`w-full border grid gap-2 text-left rounded p-2 hover:shadow transition cursor-pointer ${e.thema === selectedEvent?.thema
								? 'bg-blue-50' : ''}`}
							onClick={() => setSelectedEvent(e)}
						>
							<div className="font-semibold">{e.thema || "Kein Thema"}</div>
							<div className="text-sm text-gray-600">
								{dateString(e.date)} {e.time}
							</div>
							<div className="text-sm">
								{e.location}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

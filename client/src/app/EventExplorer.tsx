"use client"
import { useState, useEffect } from "react";
import { addDays, isWithinInterval, parse } from "date-fns";

interface Event { von: string; bis: string; plz: string; versammlungsort: string; aufzugsstrecke: string; thema: string; datum: string[]; }
export default function EventExplorer() {
	const [events, setEvents] = useState<Event[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
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
				const date = parse(e.datum[0], "dd.MM.yyyy", new Date());
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

	const locationString = (event: Event) => {
		if (event.versammlungsort) {
			return `${event.versammlungsort} ${event.plz}`
		}
		return event.aufzugsstrecke
	}

	return (
		<div className="p-4 max-w-3xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">Event Explorer - Stand 13.Juni 25 20:00</h1>

			<div className="flex flex-col sm:flex-row gap-2 mb-4">
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

			{filteredEvents.length === 0 ? (
				<p className="text-gray-500">Keine Events gefunden.</p>
			) : (
				<div className="grid gap-2">
					{filteredEvents.length} Events
					{filteredEvents.map((e, idx) => (
						<div
							key={idx}
							className="border rounded p-2 hover:shadow transition"
						>
							<div className="font-semibold">{e.thema || "Kein Thema"}</div>
							<div className="text-sm text-gray-600">
								{dateString(e.datum)} {e.von} - {e.bis}
							</div>
							<div className="text-sm">
								{locationString(e)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

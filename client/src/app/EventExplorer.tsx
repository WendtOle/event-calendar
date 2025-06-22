"use client"
import { useState, useEffect } from "react";
import { addDays, isAfter, parse, isBefore } from "date-fns";
import MapComponent from "./Map";
import type { LatLngBounds } from "leaflet";
import { Event as EventComponent } from "./Event";
import { Event, useEvents } from "./useEvents";
import { FilterButton } from "./FilterButton";
import { isEqual } from "date-fns/fp";

type TimeFilter = "past" | "future" | "today" | "tomorrow"

export default function EventExplorer() {
	const { events, updated } = useEvents();
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
	const [keyword, setKeyword] = useState("");
	const [timeFilter, setTimeFilter] = useState<TimeFilter>("future");
	const [filterByMapBounds, setFilterByMapBounds] = useState(false);
	const [mapBounds, setMapBounds] = useState<LatLngBounds | undefined>(undefined);

	useEffect(() => {
		setFilteredEvents(events)
	}, [events])

	useEffect(() => {
		applyFilters();
	}, [keyword, timeFilter, events, mapBounds, filterByMapBounds]);

	const checkDates = (dates: string[], func: (date: Date, comparison: Date) => boolean, comparison: Date) =>
		dates.map(date => parse(date, "dd.MM.yyyy", new Date())).some(date => func(date, comparison))

	const applyFilters = () => {
		let result = [...events];

		if (keyword.trim() !== "") {
			result = result.filter((e) =>
				Object.values(e).some((val) =>
					String(val).toLowerCase().includes(keyword.toLowerCase())
				)
			);
		}
		if (timeFilter === "past") {
			const now = new Date();
			result = result.filter((e) => checkDates(e.date, isBefore, now))
		}
		if (timeFilter === "future") {
			const now = new Date();
			now.setHours(0, 0, 0, 0)
			result = result.filter(e => checkDates(e.date, (date: Date, comparison: Date) => isAfter(date, comparison) || isEqual(date, comparison), now))
		}
		if (timeFilter === "today") {
			const now = new Date();
			now.setHours(0, 0, 0, 0)
			result = result.filter((e) => checkDates(e.date, isEqual, now))
		}
		if (timeFilter === "tomorrow") {
			const now = new Date();
			now.setHours(0, 0, 0, 0)
			const tomorrow = addDays(now, 1)
			result = result.filter((e) => checkDates(e.date, isEqual, tomorrow))
		}
		if (mapBounds !== undefined && filterByMapBounds) {
			result = result.filter(e => e.way_points.some(point => mapBounds?.contains(point.position)))
		}
		setFilteredEvents(result);
	};
	const onMapChange = (bounds: LatLngBounds) => {
		setMapBounds(bounds);
	}
	const toggleFilter = (inputFilter: TimeFilter) => () => {
		if (inputFilter === timeFilter) {
			setTimeFilter("future")
			return
		}
		setTimeFilter(inputFilter)
	}


	return (
		<div className="p-4 max-w-3xl mx-auto flex flex-col h-dvh gap-2">
			<div className="flex flex-row justify-between items-center">
				<h1 className="text-xl font-bold">Event Explorer</h1>
				{updated && <h2 className="text-sm">Stand {updated}</h2>}
			</div>
			<div className="flex flex-col gap-2">
				<input
					type="text"
					placeholder="Suche nach Keyword..."
					className="border rounded py-1 px-2 flex-1"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
				/>
				<div className="flex justify-between">
					<div className="flex gap-2">
						{(timeFilter === "today" || timeFilter === "future") && <FilterButton onClick={toggleFilter("today")} enabled={timeFilter === "today"}>
							Heute
						</FilterButton>}
						{(timeFilter === "tomorrow" || timeFilter === "future") && <FilterButton onClick={toggleFilter("tomorrow")} enabled={timeFilter === "tomorrow"}>
							Morgen
						</FilterButton>}
						{(timeFilter === "past" || timeFilter === "future") && <FilterButton onClick={toggleFilter("past")} enabled={timeFilter === "past"}>
							Vergangene
						</FilterButton>}
					</div>
					<FilterButton onClick={() => setFilterByMapBounds(state => !state)} enabled={filterByMapBounds}>
						Auf Karte
					</FilterButton>
				</div>
			</div>
			<MapComponent
				event={selectedEvent}
				onMapChange={onMapChange}
				disableFlyTo={filterByMapBounds}
				events={filteredEvents}
				onEventClick={(event) => setSelectedEvent(event)}
			/>
			{filteredEvents.length} Events
			{filteredEvents.length === 0 ? (
				<p className="text-gray-500">Keine Events gefunden.</p>
			) : (
				<div className={`${filteredEvents.length < 3 ? '' : 'flex-1'} grid gap-2 overflow-auto`} >
					{filteredEvents.map((e, idx) => (
						<EventComponent key={idx} onClick={() => setSelectedEvent(state => {
							if (state === undefined) {
								return e
							}
							if (state.thema !== e.thema) {
								return e
							}
							return undefined

						})} event={e} selected={e.thema === selectedEvent?.thema} />
					))}
				</div>
			)}
		</div>
	);
}

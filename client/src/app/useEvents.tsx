"use client"
import { useState, useEffect } from "react";
import type { LatLngBounds, LatLngTuple } from "leaflet";
import { detectLocationOutliers } from "./getWithoutOutliers";

export interface Event { time: string; location: string; thema: string; date: string[]; way_points: WayPoint[], bounds: LatLngBounds }
export type WayPoint = { text: string, position: LatLngTuple }

interface Entry {
	lat: string,
	lon: string
}

export const useEvents = () => {
	const [events, setEvents] = useState<Event[]>([]);
	useEffect(() => {
		const run = async () => {
			const { LatLngBounds } = await import('leaflet');
			const data = await import("./locations.json")
			const locationLookup: Record<string, Entry[]> = data.default || data;

			const eventData = await import("./events.json")
			const rawEvents = eventData.default || eventData
			const events = rawEvents.map(event => {
				const alteredWayPoints = event.way_points.reduce((acc, pointString) => {
					const location = locationLookup[pointString]?.[0]
					if (!location) {
						return acc
					}
					const position: LatLngTuple = [parseFloat(location.lat), parseFloat(location.lon)]
					const newWayPoint: WayPoint = { text: pointString, position }
					return [...acc, newWayPoint]
				}, [] as Array<WayPoint>)
				const filtered = detectLocationOutliers(alteredWayPoints, 0)
				const bounds = new LatLngBounds(filtered.map(point => point.position))
				return { ...event, way_points: filtered, bounds }
			})
			setEvents(events);
		}
		run()
	}, [])
	return events
}

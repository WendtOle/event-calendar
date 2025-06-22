"use client"
import { useState, useEffect } from "react";
import type { LatLngBounds, LatLngTuple } from "leaflet";
import { detectLocationOutliers } from "./getWithoutOutliers";

export interface Event { id: string, time: string; location: string; thema: string; date: string[]; way_points: WayPoint[], bounds: LatLngBounds }
export type WayPoint = { text: string, position: LatLngTuple }

interface Entry {
	lat: string,
	lon: string
}
const simpleHash = (str: string) => {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
	}
	return (hash >>> 0).toString(16); // unsigned 32-bit, hex string
}
export const useEvents = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [updated, setUpdated] = useState<string>("");
	useEffect(() => {
		const run = async () => {
			const { LatLngBounds } = await import('leaflet');
			const data = await import("./locations.json")
			const locationLookup: Record<string, Entry[]> = data.default || data;

			const eventData = await import("./events.json")
			const { events: rawEvents, updated } = eventData.default || eventData
			if (!!updated) {
				setUpdated(updated)
			}
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
				return { ...event, way_points: filtered, bounds, id: simpleHash(event.thema) }
			})
			setEvents(events);
		}
		run()
	}, [])
	return { events, updated }
}

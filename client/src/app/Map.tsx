import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LatLngBounds, LatLngTuple } from 'leaflet';
import { Event } from "./useEvents";

interface MapComponentProps {
	event?: Event
	onMapChange: (bounds: LatLngBounds) => void;
	disableFlyTo: boolean;
}

const colors = ["blue", "red", "orange", "yellow", "green", "purple"]
const MapComponent = ({ event, onMapChange, disableFlyTo }: MapComponentProps) => {
	const [map, setMap] = useState<L.Map | undefined>();
	const [markerLayer, setMarkerLayer] = useState<L.LayerGroup | undefined>();

	const berlinCenter: LatLngTuple = [52.5200, 13.4050];

	useEffect(() => {
		if (!event || !markerLayer) {
			return
		}
		markerLayer?.clearLayers()
		const { way_points, bounds } = event;
		import('leaflet').then(L => {
			way_points.map(({ position }) => {
				L.circle(position, {
					color: colors[0],
					fillColor: colors[0],
					radius: 200
				}).addTo(markerLayer);
			})
			if (disableFlyTo) {
				return
			}
			if (way_points.length === 1) {
				map?.flyTo(way_points[0].position, 13)
			}
			if (way_points.length > 1) {
				map?.flyToBounds(bounds)
			}
		})
	}, [event, map, markerLayer])

	useEffect(() => {
		import('leaflet').then(L => {
			const map = L.map('map').setView(berlinCenter, 13);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap contributors'
			}).addTo(map);
			setMarkerLayer(L.layerGroup().addTo(map));
			setMap(map)
			const onMoveEnd = () => onMapChange(map.getBounds())
			map.on("moveend", onMoveEnd)
			return () => {
				map.off("moveend", onMoveEnd)
				map.remove()

			}
		})
	}, []);
	return (
		<div className="w-full h-44 sm:h-52">
			<div id="map"
				style={{ height: "100%", width: "100%" }}
			/>
		</div>
	);
};

export default MapComponent;

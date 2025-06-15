import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Event } from "./EventExplorer";
import { LatLngTuple } from 'leaflet';

interface MapComponentProps {
	event?: Event
}

interface Entry {
	lat: string,
	lon: string
}

const colors = ["blue", "red", "orange", "yellow", "green", "purple"]
const MapComponent = ({ event }: MapComponentProps) => {
	const [locationLookup, setLocationLookup] = useState<Record<string, Entry[]>>({});
	const [map, setMap] = useState<L.Map | undefined>();
	const [markerLayer, setMarkerLayer] = useState<L.LayerGroup | undefined>();

	useEffect(() => {
		import("./locations.json").then((data) => {
			setLocationLookup(data.default || data);
		});
	}, []);

	const berlinCenter: LatLngTuple = [52.5200, 13.4050];

	useEffect(() => {
		if (!event || !markerLayer) {
			return
		}
		markerLayer?.clearLayers()
		const { way_points } = event;
		import('leaflet').then(L => {
			let firstLocation: LatLngTuple | undefined = undefined
			way_points.map((point) => {
				const location = locationLookup[point][0]
				if (!location) {
					return
				}
				const position: LatLngTuple = [parseFloat(location.lat), parseFloat(location.lon)]
				if (!firstLocation) {
					firstLocation = position
				}
				L.circle(position, {
					color: colors[0],
					fillColor: colors[0],
					radius: 200
				}).addTo(markerLayer);
			})
			if (!!firstLocation) {
				map?.flyTo(firstLocation, 12)
			}
		})
	}, [event, locationLookup, map, markerLayer])

	useEffect(() => {
		import('leaflet').then(L => {
			const map = L.map('map').setView(berlinCenter, 13);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap contributors'
			}).addTo(map);
			setMarkerLayer(L.layerGroup().addTo(map));
			setMap(map)
			return () => {
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

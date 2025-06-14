import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Event } from "./EventExplorer";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(mod => mod.Circle), { ssr: false });

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
	const [pointsToMark, setPointsToMark] = useState<Array<Array<{ position: number[], key: string }>>>([])

	useEffect(() => {
		// Beispiel: JSON lokal importieren
		import("./locations.json").then((data) => {
			setLocationLookup(data.default || data);
		});
	}, []);
	// Example bounds for Berlin (adjust as needed)
	const berlinBounds = [
		[52.3383, 13.0884], // Southwest corner
		[52.6755, 13.7611], // Northeast corner
	];

	// Center of Berlin
	const berlinCenter = [52.5200, 13.4050];

	useEffect(() => {
		if (!event) {
			return
		}
		const { way_points: ways } = event;
		const locations = ways.map((way, way_index) => way.map((point, index) => {
			const location = locationLookup[point][0]
			if (!location) {
				return
			}
			return { key: `${way_index}-${index}`, position: [parseFloat(location.lat), parseFloat(location.lon)] }
		}).filter(entry => entry !== undefined))
		setPointsToMark(locations)
	}, [event, locationLookup])

	return (
		<div className="w-full h-40">
			<MapContainer
				center={berlinCenter}
				zoom={12}
				minZoom={10}
				maxZoom={16}
				maxBounds={berlinBounds}
				maxBoundsViscosity={1.0} // Prevents panning outside bounds
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				/>
				{pointsToMark.map((points, index) => points.map(({ position, key }) => (
					<Circle key={key} center={position} radius={200} pathOptions={{ color: colors[index] }} />
				)))}
			</MapContainer>
		</div>
	);
};

export default MapComponent;

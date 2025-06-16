import { WayPoint } from "./useEvents";

export const detectLocationOutliers = (
	locations: WayPoint[],
	stdMultiplier: number = 2
): WayPoint[] => {
	if (locations.length === 0) return [];

	const centroid = locations.reduce(
		(acc, { position: loc }) => ([
			acc[0] + loc[0] / locations.length,
			acc[1] + loc[1] / locations.length,
		]),
		[0, 0]
	);

	const R = 6371000; // Earth radius in meters

	function toRad(deg: number): number {
		return (deg * Math.PI) / 180;
	}

	function haversineDistance(a: number[], b: number[]): number {
		const dLat = toRad(b[0] - a[0]);
		const dLng = toRad(b[1] - a[1]);
		const lat1 = toRad(a[0]);
		const lat2 = toRad(b[0]);

		const h =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

		return 2 * R * Math.asin(Math.sqrt(h));
	}

	const distances = locations.map(({ position, text }) => ({
		location: position,
		text: text,
		distance: haversineDistance(position as number[], centroid)
	}));

	const mean =
		distances.reduce((sum, d) => sum + d.distance, 0) / distances.length;

	const variance =
		distances.reduce((sum, d) => sum + Math.pow(d.distance - mean, 2), 0) /
		distances.length;

	const stdDev = Math.sqrt(variance);

	return distances.filter(d =>
		d.distance <= mean + stdMultiplier * stdDev
	).map(d => ({ position: d.location, text: d.text }))
}

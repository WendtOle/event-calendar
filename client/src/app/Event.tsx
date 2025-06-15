import { Event as EventType } from "./EventExplorer"

interface EventProps {
	event: EventType,
	selected: boolean,
	onClick: () => void,
}

export const Event = ({ selected, event, onClick }: EventProps) => {
	const dateString = (date: string[]) => {
		if (date.length === 1) {
			return date[0]
		}
		return `${date[0]} und ${date.length - 1} weitere`
	}
	const shorten = (value: string, limit: number) => {
		if (value.length > limit && !selected) {
			return value.slice(0, limit) + " ..."
		}
		return value
	}
	const shortLocationString = event.way_points.length > 1 ? `${event.way_points.length} Wegpunkte` : event.location
	const expandedLocation = event.way_points.length === 1 ? (<p>{event.location}</p>) : (<>
		<p>Original text: </p>
		<p>{event.location}</p>
		<p>{event.way_points.length} Wegpunkte erkannt: </p>
		<p>{event.way_points.map(({ text }) => `"${text}"`).join(", ")}</p>
	</>)
	return (
		<button
			onClick={onClick}
			className={`w-full border grid gap-2 text-left rounded p-2 hover:shadow transition cursor-pointer ${selected ? 'bg-blue-50' : ''}`}
		>
			<div className="font-semibold">{shorten(event.thema, 80) || "Kein Thema"}</div>
			<div className="text-sm text-gray-600">
				{dateString(event.date)} {event.time}
			</div>
			{!selected && <div className="text-sm">
				{shortLocationString}
			</div>}
			{selected && expandedLocation}
		</button>
	)
}

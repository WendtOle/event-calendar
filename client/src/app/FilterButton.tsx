import { ReactNode } from "react";

interface FilterButtonProps {
	onClick: () => void;
	children: ReactNode;
	enabled: boolean;
}
export const FilterButton = ({ onClick, children, enabled }: FilterButtonProps) => {
	return (<button
		onClick={onClick}
		className={`px-2 py-1 text-sm rounded-full flex items-center gapx-2 ${enabled ? "bg-blue-500 text-white" : "bg-white border"
			}`}
	>
		<div>{children}</div>
		{enabled && <span className="material-icons text-white" style={{ fontSize: '16px' }}>
			close
		</span>}
	</button>
	)
}

import { formatVes, formatUsd } from "@/lib/formatters";

interface TotalsDisplayProps {
    totalVES: number;
    totalUSD: number;
}

export function TotalsDisplay({ totalVES, totalUSD }: TotalsDisplayProps) {
    return (
        <div className="p-4">
            <div className="flex justify-between gap-x-6 py-2">
                <p className="text-[#4e7097] text-sm font-normal leading-normal">Bolívares</p>
                <p className="text-[#0e141b] text-sm font-normal leading-normal text-right">{formatVes(totalVES)}</p>
            </div>
            <div className="flex justify-between gap-x-6 py-2">
                <p className="text-[#4e7097] text-sm font-normal leading-normal">Dólares</p>
                <p className="text-[#0e141b] text-sm font-normal leading-normal text-right">{formatUsd(totalUSD)}</p>
            </div>
        </div>
    );
}

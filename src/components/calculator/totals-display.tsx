import { formatVes, formatUsd } from "@/lib/formatters";

interface TotalsDisplayProps {
    totalVES: number;
    totalUSD: number;
}

export function TotalsDisplay({ totalVES, totalUSD }: TotalsDisplayProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Total Bolívares</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 break-all">{formatVes(totalVES)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Total Dólares</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 break-all">{formatUsd(totalUSD)}</p>
            </div>
        </div>
    );
}

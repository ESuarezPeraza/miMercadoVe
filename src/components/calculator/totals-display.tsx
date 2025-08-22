import { formatVes, formatUsd } from "@/lib/formatters";

interface TotalsDisplayProps {
    totalVES: number;
    totalUSD: number;
}

export function TotalsDisplay({ totalVES, totalUSD }: TotalsDisplayProps) {
    return (
        <div className="grid grid-cols-2 gap-4 px-4">
            <div className="flex flex-col gap-1 rounded-lg bg-accent p-4">
                <p className="text-sm text-muted-foreground">Total Bolívares</p>
                <p className="text-2xl font-bold text-foreground">{formatVes(totalVES)}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-accent p-4">
                <p className="text-sm text-muted-foreground">Total Dólares</p>
                <p className="text-2xl font-bold text-foreground">{formatUsd(totalUSD)}</p>
            </div>
        </div>
    );
}

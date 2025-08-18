import { formatVes, formatUsd } from "@/lib/formatters";

export interface Transaction {
    description: string;
    ves: number;
    usd: number;
}

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    if (transactions.length === 0) {
        return null;
    }

    return (
        <div className="px-4 py-3">
             <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] pb-2">
                Historial
            </h3>
            <ul className="space-y-2">
                {transactions.map((t, index) => (
                    <li key={index} className="flex justify-between items-center bg-[#e7edf3] p-3 rounded-lg">
                        <span className="text-[#0e141b] text-sm">{t.description}</span>
                        <div className="text-right">
                             <p className="text-[#0e141b] text-sm font-semibold">{formatVes(t.ves)}</p>
                             <p className="text-[#4e7097] text-xs">{formatUsd(t.usd)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

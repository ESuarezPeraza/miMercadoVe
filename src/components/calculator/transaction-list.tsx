import { formatVes, formatUsd } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type Big from "big.js";

export interface Transaction {
    id: string;
    description: string;
    ves: Big;
    usd: Big;
    isWeightBased: boolean;
    // For unit-based
    quantity?: number;
    unitVes?: Big;
    unitUsd?: Big;
    // For weight-based
    weight?: Big; 
    pricePerKgVes?: Big;
    pricePerKgUsd?: Big;
}


interface TransactionListProps {
    transactions: Transaction[];
    onRemoveTransaction: (id: string) => void;
    onEditTransaction: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onRemoveTransaction, onEditTransaction }: TransactionListProps) {
    if (transactions.length === 0) {
        return null;
    }

    const renderSubtext = (t: Transaction) => {
        if (t.isWeightBased && t.weight && t.pricePerKgVes && t.pricePerKgUsd) {
            return `${t.weight.toString()} kg | ${formatVes(t.pricePerKgVes.toNumber())}/kg`;
        }
        if (!t.isWeightBased && t.quantity && t.unitVes && t.unitUsd) {
            return `${t.quantity} x ${formatVes(t.unitVes.toNumber())} / ${formatUsd(t.unitUsd.toNumber())}`;
        }
        return '';
    }

    return (
        <div className="px-4 py-3">
             <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] pb-2">
                Carrito
            </h3>
            <ul className="space-y-2">
                {transactions.map((t) => (
                    <li key={t.id} className="flex justify-between items-center bg-[#e7edf3] p-3 rounded-lg cursor-pointer" onClick={() => onEditTransaction(t)}>
                        <div>
                            <p className="text-[#0e141b] text-sm font-semibold">{t.description}</p>
                            <p className="text-[#4e7097] text-xs">
                                {renderSubtext(t)}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[#0e141b] text-sm font-semibold">{formatVes(t.ves.toNumber())}</p>
                                <p className="text-[#4e7097] text-xs">{formatUsd(t.usd.toNumber())}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    onRemoveTransaction(t.id);
                                }} 
                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

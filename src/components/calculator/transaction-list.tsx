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
        return (
            <section className="text-center py-8">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                    <p className="text-slate-500 text-sm">No hay productos en el carrito</p>
                </div>
            </section>
        );
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
        <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
                Carrito
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                {transactions.map((t) => (
                    <div 
                        key={t.id} 
                        className="flex justify-between items-center p-4 hover:bg-slate-50 cursor-pointer transition-colors" 
                        onClick={() => onEditTransaction(t)}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{t.description}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {renderSubtext(t)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                            <div className="text-right min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{formatVes(t.ves.toNumber())}</p>
                                <p className="text-xs text-slate-500 truncate">{formatUsd(t.usd.toNumber())}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    onRemoveTransaction(t.id);
                                }} 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

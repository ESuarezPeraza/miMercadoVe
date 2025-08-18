"use client";

import { useState, useEffect } from "react";
import { TotalsDisplay } from "./totals-display";
import { AmountForm } from "./amount-form";
import { ResetDialog } from "./reset-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionList, type Transaction } from "./transaction-list";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const LOCAL_STORAGE_KEY = "exchangeRate";

export function CalculatorScreen() {
    const [rateInput, setRateInput] = useState("");
    const [persistedRate, setPersistedRate] = useState<number | null>(null);
    const [totalVES, setTotalVES] = useState(0);
    const [totalUSD, setTotalUSD] = useState(0);
    const [vesInput, setVesInput] = useState("");
    const [usdInput, setUsdInput] = useState("");
    const [description, setDescription] = useState("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedRate = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedRate) {
                const rate = parseFloat(savedRate);
                if (!isNaN(rate) && rate > 0) {
                    setPersistedRate(rate);
                    setRateInput(rate.toString());
                }
            } else {
                setIsRateDialogOpen(true);
            }
        } catch (error) {
            console.error("Could not read from localStorage", error);
        }
        setIsInitialized(true);
    }, []);

    const handleSaveRate = () => {
        const newRate = parseFloat(rateInput);
        if (isNaN(newRate) || newRate <= 0) {
            toast({
                title: "Error",
                description: "Por favor, introduce una tasa de cambio válida y positiva.",
                variant: "destructive",
            });
            return;
        }
        setPersistedRate(newRate);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, newRate.toString());
            setIsRateDialogOpen(false);
        } catch (error) {
             console.error("Could not write to localStorage", error);
             toast({
                title: "Error",
                description: "No se pudo guardar la tasa de cambio.",
                variant: "destructive",
            });
        }
    };

    const addAmount = () => {
        if (!persistedRate) {
            toast({
                title: "Acción requerida",
                description: "Primero debes guardar una tasa de cambio.",
                variant: "destructive",
            });
            setIsRateDialogOpen(true);
            return;
        }

        const vesAmount = parseFloat(vesInput);
        const usdAmount = parseFloat(usdInput);

        if ((isNaN(vesAmount) || vesAmount <= 0) && (isNaN(usdAmount) || usdAmount <= 0)) {
             toast({
                title: "Error",
                description: "Por favor, introduce un monto válido en Bolívares o Dólares.",
                variant: "destructive",
            });
            return;
        }

        let vesToAdd = 0;
        let usdToAdd = 0;

        if (!isNaN(vesAmount) && vesAmount > 0) {
            vesToAdd = vesAmount;
            usdToAdd = vesAmount / persistedRate;
        } else if (!isNaN(usdAmount) && usdAmount > 0) {
            usdToAdd = usdAmount;
            vesToAdd = usdAmount * persistedRate;
        }
        
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            description: description || "Sin descripción",
            ves: vesToAdd,
            usd: usdToAdd,
        };

        setTransactions(prev => [newTransaction, ...prev]);
        setTotalVES(prev => parseFloat((prev + vesToAdd).toFixed(2)));
        setTotalUSD(prev => parseFloat((prev + usdToAdd).toFixed(2)));

        setVesInput("");
        setUsdInput("");
        setDescription("");
    };

    const handleReset = () => {
        setTotalVES(0);
        setTotalUSD(0);
        setVesInput("");
        setUsdInput("");
        setDescription("");
        setTransactions([]);
        setIsResetDialogOpen(false);
    };

    const removeTransaction = (transactionId: string) => {
        const transactionToRemove = transactions.find(t => t.id === transactionId);
        if (!transactionToRemove) return;

        setTotalVES(prev => parseFloat((prev - transactionToRemove.ves).toFixed(2)));
        setTotalUSD(prev => parseFloat((prev - transactionToRemove.usd).toFixed(2)));
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };


    if (!isInitialized) {
        return (
            <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
                 <header className="flex items-center bg-slate-50 p-4 pb-2 justify-between">
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-7 w-36 mx-auto" />
                    <Skeleton className="h-7 w-24" />
                </header>
                <div className="space-y-6 p-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
             <header className="flex items-center bg-slate-50 p-4 pb-2 justify-between">
                <h2 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-left">Mi Mercado VE</h2>
                <div className="flex w-auto items-center justify-end">
                    <button onClick={() => setIsRateDialogOpen(true)} className="text-[#4e7097] text-sm font-bold leading-normal tracking-[0.015em] shrink-0 whitespace-nowrap">
                        Tasa: Bs. {parseFloat(rateInput || '0').toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </button>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto">
                <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Totales</h2>
                <TotalsDisplay totalVES={totalVES} totalUSD={totalUSD} />

                <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Montos</h2>
                <AmountForm 
                    vesInput={vesInput}
                    setVesInput={setVesInput}
                    usdInput={usdInput}
                    setUsdInput={setUsdInput}
                    description={description}
                    setDescription={setDescription}
                    onAdd={addAmount}
                />
                <TransactionList transactions={transactions} onRemoveTransaction={removeTransaction} />
                 <div className="px-4 py-3">
                    <button 
                        onClick={() => setIsResetDialogOpen(true)}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-transparent text-[#0e141b] text-sm font-bold leading-normal tracking-[-0.015em] w-full"
                    >
                        <span className="truncate">Resetear</span>
                    </button>
                </div>
            </main>

            
            <ResetDialog
                isOpen={isResetDialogOpen}
                onOpenChange={setIsResetDialogOpen}
                onConfirm={handleReset}
            />

            <Dialog open={isRateDialogOpen} onOpenChange={persistedRate ? setIsRateDialogOpen : undefined}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Establecer Tasa de Cambio</DialogTitle>
                    </DialogHeader>
                    <Input
                        type="number"
                        placeholder="Tasa de cambio"
                        value={rateInput}
                        onChange={(e) => setRateInput(e.target.value)}
                        className="form-input mt-4 flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7097] p-4 text-base font-normal leading-normal"
                    />
                    <DialogFooter>
                        <Button onClick={handleSaveRate}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <footer className="shrink-0">
                <div className="flex gap-2 border-t border-[#e7edf3] bg-slate-50 px-4 pt-2 pb-safe-or-2">
                    <a className="just flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-[#0e141b]" href="#">
                        <div className="text-[#0e141b] flex h-8 items-center justify-center" data-icon="House" data-size="24px" data-weight="fill">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
                            </svg>
                        </div>
                    </a>
                </div>
            </footer>
        </div>
    );
}

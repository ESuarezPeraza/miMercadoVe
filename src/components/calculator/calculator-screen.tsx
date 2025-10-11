"use client";

import { useState, useEffect } from "react";
import Big from "big.js";
import Link from 'next/link';
import { TotalsDisplay } from "./totals-display";
import { AmountForm } from "./amount-form";
import { ResetDialog } from "./reset-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionList, type Transaction } from "./transaction-list";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { SaveCartDialog } from "./save-cart-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Home, Save, History, RefreshCw, Settings } from "lucide-react";

const LOCAL_STORAGE_RATE_KEY = "exchangeRate";
const LOCAL_STORAGE_RATE_DATE_KEY = "exchangeRateDate";
const LOCAL_STORAGE_TRANSACTIONS_KEY = "transactionsList";
const LOCAL_STORAGE_SAVED_CARTS_KEY = "savedCarts";

const DEFAULT_RATE = "193.30";
const DEFAULT_RATE_DATE = "2024-10-11"; // Viernes anterior

const fetchExchangeRate = async (): Promise<{ tasa: number; fecha: string } | null> => {
    try {
        const response = await fetch(`https://bcvapi.tech/api/v1/dolar?t=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to fetch rate");
        const data = await response.json();
        return { tasa: data.tasa, fecha: data.fecha };
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return null;
    }
};

const getCurrentDateTimeVenezuela = () => {
    const now = new Date();
    // Venezuela is UTC-4
    const venezuelaTime = new Date(now.getTime() - (4 * 60 * 60 * 1000));
    const date = venezuelaTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const day = venezuelaTime.getUTCDay(); // 0=Sunday, 1=Monday, etc.
    const hour = venezuelaTime.getUTCHours();
    return { date, day, hour };
};

const getCurrentDateVenezuela = (): string => {
    return getCurrentDateTimeVenezuela().date;
};

const shouldUpdateRate = (day: number, hour: number): boolean => {
    if (day === 1) return true; // Monday
    if (day >= 2 && day <= 5) return hour < 16; // Tue-Fri before 4 PM
    return false; // Sat-Sun
};

export interface SavedCart {
    id: string;
    name: string;
    type: 'purchase' | 'budget';
    createdAt: string;
    transactions: Transaction[];
    totalVES: number;
    totalUSD: number;
    exchangeRate: number;
}

export function CalculatorScreen() {
    const [rateInput, setRateInput] = useState("");
    const [rateDate, setRateDate] = useState<string>("");
    const [persistedRate, setPersistedRate] = useState<Big | null>(null);
    const [totalVES, setTotalVES] = useState(new Big(0));
    const [totalUSD, setTotalUSD] = useState(new Big(0));
    const [vesInput, setVesInput] = useState("");
    const [usdInput, setUsdInput] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isSaveCartDialogOpen, setIsSaveCartDialogOpen] = useState(false);
    const [isCustomRateDialogOpen, setIsCustomRateDialogOpen] = useState(false);
    const [customRateInput, setCustomRateInput] = useState("");
    
    const [isWeightBased, setIsWeightBased] = useState(false);
    const [weight, setWeight] = useState("");

    const { toast } = useToast();

    useEffect(() => {
        const loadExchangeRate = async () => {
            try {
                let savedRate = localStorage.getItem(LOCAL_STORAGE_RATE_KEY);
                let savedDate = localStorage.getItem(LOCAL_STORAGE_RATE_DATE_KEY);

                // Initialize with default rate if none exists
                if (!savedRate) {
                    localStorage.setItem(LOCAL_STORAGE_RATE_KEY, DEFAULT_RATE);
                    localStorage.setItem(LOCAL_STORAGE_RATE_DATE_KEY, DEFAULT_RATE_DATE);
                    savedRate = DEFAULT_RATE;
                    savedDate = DEFAULT_RATE_DATE;
                }

                const { date: currentDate, day: currentDay, hour: currentHour } = getCurrentDateTimeVenezuela();

                if (savedRate && savedDate === currentDate) {
                    const rate = new Big(savedRate);
                    if (rate.gt(0)) {
                        setPersistedRate(rate);
                        setRateInput(rate.toString());
                        setRateDate(savedDate);
                    }
                } else {
                    // Check if should update
                    if (shouldUpdateRate(currentDay, currentHour)) {
                        const data = await fetchExchangeRate();
                        if (data) {
                            const rate = new Big(data.tasa);
                            setPersistedRate(rate);
                            setRateInput(rate.toString());
                            setRateDate(currentDate);
                            localStorage.setItem(LOCAL_STORAGE_RATE_KEY, rate.toString());
                            localStorage.setItem(LOCAL_STORAGE_RATE_DATE_KEY, currentDate);
                        } else if (savedRate) {
                            // Fallback to saved rate if fetch fails
                            const rate = new Big(savedRate);
                            setPersistedRate(rate);
                            setRateInput(rate.toString());
                            setRateDate(savedDate || "");
                            toast({
                                title: "Error de conexión",
                                description: "No se pudo actualizar la tasa. Usando tasa guardada.",
                                variant: "destructive",
                            });
                        } else {
                            toast({
                                title: "Error",
                                description: "No se pudo obtener la tasa de cambio.",
                                variant: "destructive",
                            });
                        }
                    } else {
                        // Use saved rate
                        if (savedRate) {
                            const rate = new Big(savedRate);
                            setPersistedRate(rate);
                            setRateInput(rate.toString());
                            setRateDate(savedDate || "");
                        } else {
                            toast({
                                title: "Error",
                                description: "No hay tasa guardada disponible. Actualiza durante la semana.",
                                variant: "destructive",
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Could not load exchange rate", error);
                toast({
                    title: "Error de Carga",
                    description: "No se pudo cargar la tasa de cambio.",
                    variant: "destructive",
                });
            }
        };

        const loadTransactions = () => {
            try {
                // Load transactions
                const savedTransactions = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
                if (savedTransactions) {
                    const parsedTransactions = JSON.parse(savedTransactions).map((t: any) => ({
                        ...t,
                        ves: new Big(t.ves),
                        usd: new Big(t.usd),
                        // Reconstruct Big.js instances for details
                        ...(t.unitVes && { unitVes: new Big(t.unitVes) }),
                        ...(t.unitUsd && { unitUsd: new Big(t.unitUsd) }),
                        ...(t.weight && { weight: new Big(t.weight) }),
                        ...(t.pricePerKgVes && { pricePerKgVes: new Big(t.pricePerKgVes) }),
                        ...(t.pricePerKgUsd && { pricePerKgUsd: new Big(t.pricePerKgUsd) }),
                    }));
                    setTransactions(parsedTransactions);

                    // Recalculate totals from loaded transactions
                    const newTotalVES = parsedTransactions.reduce((acc: Big, t: Transaction) => acc.plus(t.ves), new Big(0));
                    const newTotalUSD = parsedTransactions.reduce((acc: Big, t: Transaction) => acc.plus(t.usd), new Big(0));
                    setTotalVES(newTotalVES);
                    setTotalUSD(newTotalUSD);
                }
            } catch (error) {
                console.error("Could not read from localStorage", error);
                toast({
                    title: "Error de Carga",
                    description: "No se pudieron cargar los datos guardados. Empezando desde cero.",
                    variant: "destructive",
                });
            }
        };

        loadExchangeRate();
        loadTransactions();
        setIsInitialized(true);
    }, []);

    // Effect to save transactions to localStorage whenever they change
    useEffect(() => {
        if (!isInitialized) return; // Do not save during initial hydration
        try {
            // localStorage only stores strings, so we serialize the Big.js objects
            const serializableTransactions = transactions.map(t => ({
                ...t,
                ves: t.ves.toString(),
                usd: t.usd.toString(),
                ...(t.unitVes && { unitVes: t.unitVes.toString() }),
                ...(t.unitUsd && { unitUsd: t.unitUsd.toString() }),
                ...(t.weight && { weight: t.weight.toString() }),
                ...(t.pricePerKgVes && { pricePerKgVes: t.pricePerKgVes.toString() }),
                ...(t.pricePerKgUsd && { pricePerKgUsd: t.pricePerKgUsd.toString() }),
            }))
            localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(serializableTransactions));
        } catch (error) {
            console.error("Could not write transactions to localStorage", error);
            toast({
                title: "Error de Guardado",
                description: "No se pudo guardar el carrito.",
                variant: "destructive",
            });
        }
    }, [transactions, isInitialized]);



    const addAmount = () => {
        if (!persistedRate) {
            toast({
                title: "Error",
                description: "La tasa de cambio no está disponible. Intenta recargar la página.",
                variant: "destructive",
            });
            return;
        }

        let vesAmount: Big | null = null;
        try {
            if (vesInput) vesAmount = new Big(vesInput);
        } catch (e) { /* ignore */ }
        
        let usdAmount: Big | null = null;
        try {
            if (usdInput) usdAmount = new Big(usdInput);
        } catch (e) { /* ignore */ }


        if ((!vesAmount || vesAmount.lte(0)) && (!usdAmount || usdAmount.lte(0))) {
             toast({
                title: "Error",
                description: "Por favor, introduce un monto válido.",
                variant: "destructive",
            });
            return;
        }

        let newTransaction: Transaction;

        if (isWeightBased) {
            const weightValue = parseFloat(weight);
            if(isNaN(weightValue) || weightValue <= 0) {
                toast({ title: "Error", description: "Por favor, introduce un peso válido.", variant: "destructive" });
                return;
            }

            let pricePerKgVes: Big;
            let pricePerKgUsd: Big;

            if (vesAmount && vesAmount.gt(0)) {
                pricePerKgVes = vesAmount;
                pricePerKgUsd = vesAmount.div(persistedRate);
            } else if (usdAmount && usdAmount.gt(0)) {
                pricePerKgUsd = usdAmount;
                pricePerKgVes = usdAmount.times(persistedRate);
            } else {
                return;
            }

            const weightBig = new Big(weightValue);
            const vesToAdd = weightBig.times(pricePerKgVes);
            const usdToAdd = weightBig.times(pricePerKgUsd);

            newTransaction = {
                id: Date.now().toString(),
                description: description || "Sin descripción",
                ves: vesToAdd,
                usd: usdToAdd,
                isWeightBased: true,
                weight: weightBig,
                pricePerKgVes,
                pricePerKgUsd
            };
        } else {
            const qty = parseInt(quantity, 10);
            if(isNaN(qty) || qty <= 0) {
                toast({ title: "Error", description: "Por favor, introduce una cantidad válida.", variant: "destructive" });
                return;
            }

            let unitVes: Big;
            let unitUsd: Big;

            if (vesAmount && vesAmount.gt(0)) {
                unitVes = vesAmount;
                unitUsd = vesAmount.div(persistedRate);
            } else if (usdAmount && usdAmount.gt(0)) {
                unitUsd = usdAmount;
                unitVes = usdAmount.times(persistedRate);
            } else {
                return; 
            }
            
            const vesToAdd = unitVes.times(qty);
            const usdToAdd = unitUsd.times(qty);

            newTransaction = {
                id: Date.now().toString(),
                description: description || "Sin descripción",
                ves: vesToAdd,
                usd: usdToAdd,
                quantity: qty,
                unitVes: unitVes,
                unitUsd: unitUsd,
                isWeightBased: false
            };
        }

        setTransactions(prev => [newTransaction, ...prev]);
        setTotalVES(prev => prev.plus(newTransaction.ves));
        setTotalUSD(prev => prev.plus(newTransaction.usd));

        setVesInput("");
        setUsdInput("");
        setDescription("");
        setQuantity("1");
        setWeight("");
        // Keep isWeightBased as is
    };

    const handleReset = () => {
        setTotalVES(new Big(0));
        setTotalUSD(new Big(0));
        setVesInput("");
        setUsdInput("");
        setDescription("");
        setQuantity("1");
        setWeight("");
        setIsWeightBased(false);
        setTransactions([]);
        setIsResetDialogOpen(false);
        // Also clear from localStorage
        try {
            localStorage.removeItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
        } catch (error) {
            console.error("Could not remove transactions from localStorage", error);
        }
    };

    const removeTransaction = (transactionId: string) => {
        const transactionToRemove = transactions.find(t => t.id === transactionId);
        if (!transactionToRemove) return;

        setTotalVES(prev => prev.minus(transactionToRemove.ves));
        setTotalUSD(prev => prev.minus(transactionToRemove.usd));
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
    };

    const handleUpdateTransaction = (
        id: string,
        newDescription: string,
        newQuantity: string, // For unit-based
        newWeight: string, // For weight-based
        newPrice: string,
        priceCurrency: 'ves' | 'usd'
    ) => {
        if (!persistedRate) return;
        const originalTransaction = transactions.find(t => t.id === id);
        if (!originalTransaction) return;

        let updatedTransaction: Transaction;

        if (originalTransaction.isWeightBased) {
            const weightValue = parseFloat(newWeight);
            if (isNaN(weightValue) || weightValue <= 0) {
                toast({ title: "Error", description: "Peso inválido.", variant: "destructive" });
                return;
            }
            const weightBig = new Big(weightValue);

            let price: Big;
            try {
                price = new Big(newPrice);
                if (price.lte(0)) throw new Error();
            } catch (e) {
                toast({ title: "Error", description: "Precio por kg inválido.", variant: "destructive" });
                return;
            }

            let pricePerKgVes: Big;
            let pricePerKgUsd: Big;

            if (priceCurrency === 'ves') {
                pricePerKgVes = price;
                pricePerKgUsd = price.div(persistedRate);
            } else {
                pricePerKgUsd = price;
                pricePerKgVes = price.times(persistedRate);
            }

            updatedTransaction = {
                ...originalTransaction,
                description: newDescription,
                weight: weightBig,
                pricePerKgVes,
                pricePerKgUsd,
                ves: weightBig.times(pricePerKgVes),
                usd: weightBig.times(pricePerKgUsd),
            };

        } else {
             const qty = parseInt(newQuantity, 10);
            if (isNaN(qty) || qty <= 0) {
                toast({ title: "Error", description: "Cantidad inválida.", variant: "destructive" });
                return;
            }

            let price: Big;
            try {
                price = new Big(newPrice);
                if (price.lte(0)) throw new Error();
            } catch (e) {
                toast({ title: "Error", description: "Precio inválido.", variant: "destructive" });
                return;
            }
            
            let unitVes: Big;
            let unitUsd: Big;

            if(priceCurrency === 'ves') {
                unitVes = price;
                unitUsd = price.div(persistedRate);
            } else {
                unitUsd = price;
                unitVes = price.times(persistedRate);
            }

            updatedTransaction = {
                ...originalTransaction,
                description: newDescription,
                quantity: qty,
                unitVes,
                unitUsd,
                ves: unitVes.times(qty),
                usd: unitUsd.times(qty),
            };
        }


        const updatedTransactions = transactions.map(t => t.id === id ? updatedTransaction : t);
        setTransactions(updatedTransactions);
        
        const newTotalVES = updatedTransactions.reduce((acc, t) => acc.plus(t.ves), new Big(0));
        const newTotalUSD = updatedTransactions.reduce((acc, t) => acc.plus(t.usd), new Big(0));
        setTotalVES(newTotalVES);
        setTotalUSD(newTotalUSD);

        setEditingTransaction(null);
    };

    const handleSaveCart = (name: string, type: 'purchase' | 'budget') => {
        if (transactions.length === 0) {
            toast({
                title: "Carrito vacío",
                description: "No hay productos en el carrito para guardar.",
                variant: "destructive",
            });
            return;
        }

        if (!persistedRate) {
            toast({
                title: "Error",
                description: "No hay tasa de cambio configurada.",
                variant: "destructive",
            });
            return;
        }

        const newSavedCart: SavedCart = {
            id: Date.now().toString(),
            name,
            type,
            createdAt: new Date().toISOString(),
            transactions: [...transactions],
            totalVES: totalVES.toNumber(),
            totalUSD: totalUSD.toNumber(),
            exchangeRate: persistedRate.toNumber(),
        };

        try {
            const savedCartsData = localStorage.getItem(LOCAL_STORAGE_SAVED_CARTS_KEY);
            const savedCarts = savedCartsData ? JSON.parse(savedCartsData) : [];
            savedCarts.push(newSavedCart);
            localStorage.setItem(LOCAL_STORAGE_SAVED_CARTS_KEY, JSON.stringify(savedCarts));

            toast({
                title: "Carrito guardado",
                description: `${type === 'budget' ? 'Presupuesto' : 'Compra'} "${name}" guardado exitosamente.`,
            });
        } catch (error) {
             console.error("Could not write saved carts to localStorage", error);
             toast({
                title: "Error de Guardado",
                description: "No se pudo guardar el carrito.",
                variant: "destructive",
            });
        }
    };

    const refreshRate = async () => {
        try {
            const data = await fetchExchangeRate();
            if (data) {
                const rate = new Big(data.tasa);
                setPersistedRate(rate);
                setRateInput(rate.toString());
                const currentDate = getCurrentDateVenezuela();
                setRateDate(currentDate);
                localStorage.setItem(LOCAL_STORAGE_RATE_KEY, rate.toString());
                localStorage.setItem(LOCAL_STORAGE_RATE_DATE_KEY, currentDate);
                toast({
                    title: "Tasa actualizada",
                    description: "La tasa del dólar ha sido actualizada.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "No se pudo obtener la nueva tasa.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error refreshing rate:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar la tasa.",
                variant: "destructive",
            });
        }
    };

    const handleCustomRate = () => {
        try {
            const rate = new Big(customRateInput);
            if (rate.lte(0)) throw new Error();
            setPersistedRate(rate);
            setRateInput(rate.toString());
            setRateDate("");
            localStorage.setItem(LOCAL_STORAGE_RATE_KEY, rate.toString());
            localStorage.removeItem(LOCAL_STORAGE_RATE_DATE_KEY);
            setIsCustomRateDialogOpen(false);
            setCustomRateInput("");
            toast({
                title: "Tasa personalizada",
                description: "La tasa ha sido configurada manualmente.",
            });
        } catch (e) {
            toast({
                title: "Error",
                description: "Por favor, introduce una tasa válida.",
                variant: "destructive",
            });
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="container mx-auto max-w-md px-4 py-6">
                    <header className="flex items-center justify-between mb-6">
                    <Skeleton className="h-7 w-36" />
                    <Skeleton className="h-7 w-24" />
                    </header>
                    <div className="space-y-6">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" suppressHydrationWarning>
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Mi Mercado VE</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm text-slate-600">Tasa del día</div>
                            <div className="text-lg font-semibold text-slate-900">
                                {parseFloat(rateInput || '0').toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {rateDate && (
                                <div className="text-xs text-slate-500">
                                    {new Date(rateDate).toLocaleDateString('es-VE', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col space-y-1">
                            <Button variant="outline" size="sm" onClick={refreshRate} title="Actualizar tasa">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsCustomRateDialogOpen(true)} title="Tasa personalizada">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 pb-24 space-y-6">
                {/* Totals Section */}
                <section className="pt-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Totales</h2>
                    <TotalsDisplay totalVES={totalVES.toNumber()} totalUSD={totalUSD.toNumber()} />
                </section>

                {/* Product Form Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Producto</h2>
                        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                            <Label htmlFor="weight-switch" className="text-sm text-slate-600">Unidad</Label>
                            <Switch
                                id="weight-switch"
                                checked={isWeightBased}
                                onCheckedChange={setIsWeightBased}
                            />
                            <Label htmlFor="weight-switch" className="text-sm text-slate-600">Peso</Label>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <AmountForm 
                            vesInput={vesInput}
                            setVesInput={setVesInput}
                            usdInput={usdInput}
                            setUsdInput={setUsdInput}
                            description={description}
                            setDescription={setDescription}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            onAdd={addAmount}
                            isWeightBased={isWeightBased}
                            weight={weight}
                            setWeight={setWeight}
                        />
                    </div>
                </section>

                {/* Transaction List */}
                <TransactionList 
                    transactions={transactions} 
                    onRemoveTransaction={removeTransaction}
                    onEditTransaction={handleEditTransaction}
                />
                
                {/* Reset Button */}
                <div className="pt-4">
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsSaveCartDialogOpen(true)}
                            disabled={transactions.length === 0}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                        >
                            <Save className="h-4 w-4" />
                            Guardar
                        </button>
                        <button 
                            onClick={() => setIsResetDialogOpen(true)}
                            className="px-4 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors border border-slate-200 rounded-lg hover:bg-white"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200">
                <div className="container mx-auto max-w-md px-4">
                    <div className="flex items-center justify-around py-3">
                         <button className="flex flex-col items-center gap-1 text-primary">
                            <Home className="h-5 w-5" />
                            <span className="text-xs font-medium">Inicio</span>
                        </button>
                        <Link href="/history" passHref className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary transition-colors">
                            <History className="h-5 w-5" />
                            <span className="text-xs font-medium">Historial</span>
                        </Link>
                    </div>
                </div>
            </footer>

            {/* Dialogs */}
            <ResetDialog
                isOpen={isResetDialogOpen}
                onOpenChange={setIsResetDialogOpen}
                onConfirm={handleReset}
            />


            <SaveCartDialog
                isOpen={isSaveCartDialogOpen}
                onOpenChange={setIsSaveCartDialogOpen}
                onSave={handleSaveCart}
            />

            {editingTransaction && (
                <EditTransactionDialog
                    transaction={editingTransaction}
                    onSave={handleUpdateTransaction}
                    onClose={() => setEditingTransaction(null)}
                />
            )}

            <Dialog open={isCustomRateDialogOpen} onOpenChange={setIsCustomRateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configurar tasa personalizada</DialogTitle>
                        <DialogDescription>
                            Introduce la tasa del dólar que deseas usar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Label htmlFor="custom-rate">Tasa (VES/USD)</Label>
                        <Input
                            id="custom-rate"
                            type="number"
                            step="0.01"
                            value={customRateInput}
                            onChange={(e) => setCustomRateInput(e.target.value)}
                            placeholder="Ej: 36.50"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCustomRateDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCustomRate}>
                            Aplicar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

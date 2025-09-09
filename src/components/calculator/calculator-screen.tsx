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
import { Home, Save, History } from "lucide-react";

const LOCAL_STORAGE_RATE_KEY = "exchangeRate";
const LOCAL_STORAGE_TRANSACTIONS_KEY = "transactionsList";
const LOCAL_STORAGE_SAVED_CARTS_KEY = "savedCarts";

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
    const [persistedRate, setPersistedRate] = useState<Big | null>(null);
    const [totalVES, setTotalVES] = useState(new Big(0));
    const [totalUSD, setTotalUSD] = useState(new Big(0));
    const [vesInput, setVesInput] = useState("");
    const [usdInput, setUsdInput] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isSaveCartDialogOpen, setIsSaveCartDialogOpen] = useState(false);
    
    const [isWeightBased, setIsWeightBased] = useState(false);
    const [weight, setWeight] = useState("");

    const { toast } = useToast();

    useEffect(() => {
        try {
            // Load exchange rate
            const savedRate = localStorage.getItem(LOCAL_STORAGE_RATE_KEY);
            if (savedRate) {
                const rate = new Big(savedRate);
                if (rate.gt(0)) {
                    setPersistedRate(rate);
                    setRateInput(rate.toString());
                }
            } else {
                setIsRateDialogOpen(true);
            }

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


    const handleSaveRate = () => {
        try {
            const newRate = new Big(rateInput);
            if (newRate.lte(0)) {
                toast({
                    title: "Error",
                    description: "Por favor, introduce una tasa de cambio válida y positiva.",
                    variant: "destructive",
                });
                return;
            }
            setPersistedRate(newRate);
            localStorage.setItem(LOCAL_STORAGE_RATE_KEY, newRate.toString());
            setIsRateDialogOpen(false);
        } catch (error) {
             console.error("Could not write to localStorage or invalid Big number", error);
             toast({
                title: "Error",
                description: "No se pudo guardar la tasa de cambio. Introduce un número válido.",
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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 py-4">
                <div className="h-10 flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Mi Mercado VE</h1>
                    <button 
                        onClick={() => setIsRateDialogOpen(true)} 
                        className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                        <span className="hidden sm:inline">Tasa: </span>
                        {parseFloat(rateInput || '0').toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
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

            <Dialog open={isRateDialogOpen} onOpenChange={persistedRate ? setIsRateDialogOpen : undefined}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Establecer Tasa de Cambio</DialogTitle>
                        <DialogDescription>Introduce la tasa de cambio actual entre Bolívares y Dólares.</DialogDescription>
                    </DialogHeader>
                    <Input
                        type="number"
                        placeholder="Tasa de cambio"
                        value={rateInput}
                        onChange={(e) => setRateInput(e.target.value)}
                        className="mt-4"
                    />
                    <DialogFooter>
                        <Button onClick={handleSaveRate}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
        </div>
    );
}

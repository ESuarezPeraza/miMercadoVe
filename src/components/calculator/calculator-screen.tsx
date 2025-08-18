"use client";

import { useState, useEffect } from "react";
import { ExchangeRateForm } from "./exchange-rate-form";
import { TotalsDisplay } from "./totals-display";
import { AmountForm } from "./amount-form";
import { ResetDialog } from "./reset-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const LOCAL_STORAGE_KEY = "exchangeRate";

export function CalculatorScreen() {
    const [rateInput, setRateInput] = useState("");
    const [persistedRate, setPersistedRate] = useState<number | null>(null);
    const [totalVES, setTotalVES] = useState(0);
    const [totalUSD, setTotalUSD] = useState(0);
    const [vesInput, setVesInput] = useState("");
    const [usdInput, setUsdInput] = useState("");
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
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
            toast({
                title: "Éxito",
                description: "Tasa de cambio guardada correctamente.",
            });
        } catch (error) {
             console.error("Could not write to localStorage", error);
             toast({
                title: "Error",
                description: "No se pudo guardar la tasa de cambio.",
                variant: "destructive",
            });
        }
    };

    const addAmount = (amountStr: string, currency: 'VES' | 'USD') => {
        if (!persistedRate) {
            toast({
                title: "Acción requerida",
                description: "Primero debes guardar una tasa de cambio.",
                variant: "destructive",
            });
            return;
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            toast({
                title: "Error",
                description: "Por favor, introduce un monto válido y positivo.",
                variant: "destructive",
            });
            return;
        }

        let vesToAdd = 0;
        let usdToAdd = 0;

        if (currency === 'VES') {
            vesToAdd = amount;
            usdToAdd = amount / persistedRate;
            setVesInput("");
        } else {
            usdToAdd = amount;
            vesToAdd = amount * persistedRate;
            setUsdInput("");
        }

        setTotalVES(prev => parseFloat((prev + vesToAdd).toFixed(4)));
        setTotalUSD(prev => parseFloat((prev + usdToAdd).toFixed(4)));
    };

    const handleReset = () => {
        setTotalVES(0);
        setTotalUSD(0);
        setVesInput("");
        setUsdInput("");
        setIsResetDialogOpen(false);
        toast({
            title: "Totales reseteados",
            description: "Los montos totales han sido borrados.",
        });
    };

    if (!isInitialized) {
        return (
            <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 font-body">
                <header className="text-center mb-8">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-4" />
                </header>
                <div className="space-y-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <div className="flex justify-center pt-4">
                        <Skeleton className="h-10 w-36" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 font-body">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-headline font-bold text-primary">Calculadora Bi-Moneda</h1>
                <p className="text-muted-foreground mt-2">Gestiona tus gastos en Bolívares y Dólares fácilmente.</p>
            </header>

            <div className="space-y-6">
                <TotalsDisplay totalVES={totalVES} totalUSD={totalUSD} />

                <Card>
                    <CardHeader>
                        <CardTitle>Configuración</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ExchangeRateForm
                            rateInput={rateInput}
                            setRateInput={setRateInput}
                            onSave={handleSaveRate}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Añadir Montos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <AmountForm
                            currencyLabel="Monto en Bolívares (VES)"
                            value={vesInput}
                            onValueChange={setVesInput}
                            onAdd={() => addAmount(vesInput, 'VES')}
                            isDisabled={!persistedRate}
                            placeholder="Ej: 1500.50"
                        />
                         <Separator />
                         <AmountForm
                            currencyLabel="Monto en Dólares (USD)"
                            value={usdInput}
                            onValueChange={setUsdInput}
                            onAdd={() => addAmount(usdInput, 'USD')}
                            isDisabled={!persistedRate}
                            placeholder="Ej: 50.25"
                        />
                    </CardContent>
                </Card>
                
                <div className="flex justify-center pt-4">
                    <Button variant="destructive" onClick={() => setIsResetDialogOpen(true)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Resetear Totales
                    </Button>
                </div>
            </div>

            <ResetDialog
                isOpen={isResetDialogOpen}
                onOpenChange={setIsResetDialogOpen}
                onConfirm={handleReset}
            />
        </div>
    );
}

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatVes, formatUsd } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Receipt, Trash2, Eye, Calendar, ArrowLeft, Home, History } from 'lucide-react';
import type { SavedCart } from '@/components/calculator/calculator-screen';

const LOCAL_STORAGE_SAVED_CARTS_KEY = "savedCarts";

export default function HistoryPage() {
    const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedTab, setSelectedTab] = useState('all');
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        try {
            const savedCartsData = localStorage.getItem(LOCAL_STORAGE_SAVED_CARTS_KEY);
            if (savedCartsData) {
                const parsedSavedCarts: SavedCart[] = JSON.parse(savedCartsData);
                parsedSavedCarts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setSavedCarts(parsedSavedCarts);
            }
        } catch (error) {
            console.error("Could not read saved carts from localStorage", error);
            toast({
                title: "Error de Carga",
                description: "No se pudieron cargar los carritos guardados.",
                variant: "destructive",
            });
        }
        setIsInitialized(true);
    }, [toast]);

    useEffect(() => {
        if (!isInitialized) return;
        try {
            localStorage.setItem(LOCAL_STORAGE_SAVED_CARTS_KEY, JSON.stringify(savedCarts));
        } catch (error) {
            console.error("Could not write saved carts to localStorage", error);
            toast({
                title: "Error de Guardado",
                description: "Los cambios en el historial no se pudieron guardar.",
                variant: "destructive",
            });
        }
    }, [savedCarts, isInitialized, toast]);

    const handleViewCart = (cartId: string) => {
        router.push(`/history/${cartId}`);
    };
    
    const handleDeleteCart = (cartId: string) => {
        setSavedCarts(prev => prev.filter(cart => cart.id !== cartId));
        toast({
            title: "Eliminado",
            description: "El carrito ha sido eliminado del historial.",
        });
    };

    const filteredCarts = savedCarts.filter(cart => {
        if (selectedTab === 'all') return true;
        return cart.type === selectedTab;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-VE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isInitialized) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p>Cargando...</p></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto max-w-md">
                <header className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 py-4 px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" passHref>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Historial</h1>
                    </div>
                </header>

                <main className="pb-24 space-y-6 px-4">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full pt-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">Todos ({savedCarts.length})</TabsTrigger>
                            <TabsTrigger value="budget">
                                Presupuestos ({savedCarts.filter(c => c.type === 'budget').length})
                            </TabsTrigger>
                            <TabsTrigger value="purchase">
                                Compras ({savedCarts.filter(c => c.type === 'purchase').length})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    
                    <div className="space-y-4">
                        {filteredCarts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                                    <p className="text-slate-500">
                                        {selectedTab === 'all' 
                                            ? 'No tienes carritos guardados' 
                                            : selectedTab === 'budget'
                                            ? 'No tienes presupuestos guardados'
                                            : 'No tienes compras registradas'
                                        }
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredCarts.map((cart) => (
                                    <div key={cart.id} className="bg-white border rounded-lg p-4 hover:bg-slate-50/50 shadow-sm transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {cart.type === 'budget' ? (
                                                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <Receipt className="h-4 w-4 text-green-600" />
                                                    )}
                                                    <h3 className="font-medium text-slate-900 truncate">
                                                        {cart.name}
                                                    </h3>
                                                    <Badge variant={cart.type === 'budget' ? 'secondary' : 'default'} className="ml-auto sm:ml-0">
                                                        {cart.type === 'budget' ? 'Presupuesto' : 'Compra'}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-slate-600 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(cart.createdAt)}
                                                    </div>
                                                    <span>{cart.transactions.length} productos</span>
                                                </div>
                                                <div className="flex gap-4 text-sm">
                                                    <span className="font-semibold text-slate-900">
                                                        {formatVes(cart.totalVES)}
                                                    </span>
                                                    <span className="text-slate-600">
                                                        {formatUsd(cart.totalUSD)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleViewCart(cart.id)}
                                                    className="h-8 w-8"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Ver</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteCart(cart.id)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200">
                <div className="container mx-auto max-w-md">
                    <div className="flex items-center justify-around px-4 py-3">
                        <Link href="/" passHref className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary transition-colors">
                            <Home className="h-5 w-5" />
                            <span className="text-xs font-medium">Inicio</span>
                        </Link>
                        <button className="flex flex-col items-center gap-1 text-primary">
                            <History className="h-5 w-5" />
                            <span className="text-xs font-medium">Historial</span>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

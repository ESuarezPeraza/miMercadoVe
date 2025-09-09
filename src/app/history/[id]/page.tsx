
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Tag, Repeat } from 'lucide-react';
import { formatVes, formatUsd } from '@/lib/formatters';
import type { SavedCart, Transaction as OriginalTransaction } from '@/components/calculator/calculator-screen';
import Big from 'big.js';

// Re-define Transaction type here to avoid circular dependencies if we move it
type Transaction = OriginalTransaction;

const LOCAL_STORAGE_SAVED_CARTS_KEY = "savedCarts";

export default function CartDetailPage() {
    const [cart, setCart] = useState<SavedCart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    useEffect(() => {
        if (id) {
            try {
                const savedCartsData = localStorage.getItem(LOCAL_STORAGE_SAVED_CARTS_KEY);
                if (savedCartsData) {
                    const savedCarts: SavedCart[] = JSON.parse(savedCartsData);
                    const foundCart = savedCarts.find(c => c.id === id);
                    if (foundCart) {
                        // Re-hydrate Big.js instances for display formatting consistency
                        const hydratedTransactions = foundCart.transactions.map((t: any) => ({
                            ...t,
                            ves: new Big(t.ves),
                            usd: new Big(t.usd),
                            ...(t.unitVes && { unitVes: new Big(t.unitVes) }),
                            ...(t.unitUsd && { unitUsd: new Big(t.unitUsd) }),
                            ...(t.weight && { weight: new Big(t.weight) }),
                            ...(t.pricePerKgVes && { pricePerKgVes: new Big(t.pricePerKgVes) }),
                            ...(t.pricePerKgUsd && { pricePerKgUsd: new Big(t.pricePerKgUsd) }),
                        }));
                        setCart({ ...foundCart, transactions: hydratedTransactions });
                    }
                }
            } catch (error) {
                console.error("Could not read cart from localStorage", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-VE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderSubtext = (t: Transaction) => {
        if (t.isWeightBased && t.weight && t.pricePerKgVes) {
            return `${new Big(t.weight).toString()} kg | ${formatVes(new Big(t.pricePerKgVes).toNumber())}/kg`;
        }
        if (!t.isWeightBased && t.quantity && t.unitVes) {
            return `${t.quantity} x ${formatVes(new Big(t.unitVes).toNumber())}`;
        }
        return '';
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p>Cargando detalle...</p></div>;
    }

    if (!cart) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Carrito no encontrado</h2>
                <p className="text-slate-600 mb-6">No se pudo encontrar el carrito que buscas. Es posible que haya sido eliminado.</p>
                <Link href="/history" passHref>
                    <Button>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Historial
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto max-w-md">
                <header className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 py-4 px-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{cart.name}</h1>
                    </div>
                </header>

                <main className="pb-8 space-y-6 px-4">
                    {/* Cart Metadata */}
                    <section className="pt-6 space-y-4">
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                               <h2 className="text-lg font-semibold text-slate-800">Detalles</h2>
                               <Badge variant={cart.type === 'budget' ? 'secondary' : 'default'}>
                                   {cart.type === 'budget' ? 'Presupuesto' : 'Compra'}
                               </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(cart.createdAt)}</span>
                                </div>
                                 <div className="flex items-center gap-3">
                                    <Repeat className="h-4 w-4" />
                                    <span>Tasa: {formatVes(cart.exchangeRate)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Tag className="h-4 w-4" />
                                    <span>{cart.transactions.length} productos</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Totals */}
                     <section>
                         <h3 className="text-lg font-semibold text-slate-900 mb-2">Totales de la Compra</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Bolívares</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 break-all">{formatVes(cart.totalVES)}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Dólares</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 break-all">{formatUsd(cart.totalUSD)}</p>
                            </div>
                        </div>
                    </section>

                    {/* Transaction List */}
                    <section>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Productos</h3>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                           {cart.transactions.map((t: Transaction) => (
                                <div key={t.id} className="flex justify-between items-center p-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{t.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {renderSubtext(t)}
                                        </p>
                                    </div>
                                    <div className="text-right min-w-0 ml-4">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{formatVes(new Big(t.ves).toNumber())}</p>
                                        <p className="text-xs text-slate-500 truncate">{formatUsd(new Big(t.usd).toNumber())}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}


import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatVes, formatUsd } from "@/lib/formatters";
import { ShoppingCart, Receipt, Trash2, Eye, Calendar } from 'lucide-react';
import type { SavedCart } from './calculator-screen';

interface SavedCartsDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    savedCarts: SavedCart[];
    onLoadCart: (cart: SavedCart) => void;
    onDeleteCart: (id: string) => void;
}

export function SavedCartsDialog({ 
    isOpen, 
    onOpenChange, 
    savedCarts, 
    onLoadCart, 
    onDeleteCart 
}: SavedCartsDialogProps) {
    const [selectedTab, setSelectedTab] = useState('all');

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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Carritos Guardados</DialogTitle>
                    <DialogDescription>
                        Revisa tus compras realizadas y presupuestos guardados.
                    </DialogDescription>
                </DialogHeader>
                
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">Todos ({savedCarts.length})</TabsTrigger>
                        <TabsTrigger value="budget">
                            Presupuestos ({savedCarts.filter(c => c.type === 'budget').length})
                        </TabsTrigger>
                        <TabsTrigger value="purchase">
                            Compras ({savedCarts.filter(c => c.type === 'purchase').length})
                        </TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-4 max-h-[400px] overflow-y-auto">
                        {filteredCarts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="bg-slate-50 rounded-xl p-8">
                                    <p className="text-slate-500 text-sm">
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
                                    <div key={cart.id} className="border rounded-lg p-4 hover:bg-slate-50">
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
                                                    <Badge variant={cart.type === 'budget' ? 'secondary' : 'default'}>
                                                        {cart.type === 'budget' ? 'Presupuesto' : 'Compra'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(cart.createdAt)}
                                                    </div>
                                                    <span>{cart.transactions.length} productos</span>
                                                </div>
                                                <div className="flex gap-4 text-sm">
                                                    <span className="font-medium text-slate-900">
                                                        {formatVes(cart.totalVES)}
                                                    </span>
                                                    <span className="text-slate-600">
                                                        {formatUsd(cart.totalUSD)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onLoadCart(cart)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDeleteCart(cart.id)}
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
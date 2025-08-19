import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Transaction } from './transaction-list';

interface EditTransactionDialogProps {
    transaction: Transaction;
    onSave: (
        id: string,
        newDescription: string,
        newQuantity: string,
        newPrice: string,
        priceCurrency: 'ves' | 'usd'
    ) => void;
    onClose: () => void;
}

export function EditTransactionDialog({ transaction, onSave, onClose }: EditTransactionDialogProps) {
    const [description, setDescription] = useState(transaction.description);
    const [quantity, setQuantity] = useState(transaction.quantity.toString());
    const [price, setPrice] = useState(transaction.unitVes.toString());
    const [priceCurrency, setPriceCurrency] = useState<'ves' | 'usd'>('ves');

    useEffect(() => {
        setDescription(transaction.description);
        setQuantity(transaction.quantity.toString());
        if (priceCurrency === 'ves') {
            setPrice(transaction.unitVes.toFixed(2));
        } else {
            setPrice(transaction.unitUsd.toFixed(2));
        }
    }, [transaction, priceCurrency]);
    
    const handleSave = () => {
        onSave(transaction.id, description, quantity, price, priceCurrency);
    };

    const handleCurrencyChange = (value: string) => {
        setPriceCurrency(value as 'ves' | 'usd');
    };

    return (
        <Dialog open={!!transaction} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Producto</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del producto. Haz clic en "Guardar Cambios" cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Descripción
                        </Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3 h-10 bg-[#e7edf3] border-none"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Cantidad
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="col-span-3 h-10 bg-[#e7edf3] border-none"
                        />
                    </div>
                    <Tabs value={priceCurrency} onValueChange={handleCurrencyChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ves">Bolívares (Bs.)</TabsTrigger>
                            <TabsTrigger value="usd">Dólares ($)</TabsTrigger>
                        </TabsList>
                        <TabsContent value="ves">
                            <div className="grid grid-cols-4 items-center gap-4 pt-4">
                                 <Label htmlFor="price-ves" className="text-right">
                                    Precio
                                </Label>
                                <Input
                                    id="price-ves"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="col-span-3 h-10 bg-[#e7edf3] border-none"
                                />
                            </div>
                        </TabsContent>
                         <TabsContent value="usd">
                            <div className="grid grid-cols-4 items-center gap-4 pt-4">
                                <Label htmlFor="price-usd" className="text-right">
                                    Precio
                                </Label>
                                <Input
                                    id="price-usd"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="col-span-3 h-10 bg-[#e7edf3] border-none"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
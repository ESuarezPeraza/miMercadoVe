import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

    return (
        <Dialog open={!!transaction} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Producto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7097] p-4 text-base font-normal leading-normal"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                             className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7097] p-4 text-base font-normal leading-normal"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Moneda del Precio</Label>
                        <RadioGroup defaultValue="ves" onValueChange={(value: 'ves' | 'usd') => setPriceCurrency(value)} className="flex gap-4">
                            <div>
                                <RadioGroupItem value="ves" id="ves" />
                                <Label htmlFor="ves" className="pl-2">Bolívares</Label>
                            </div>
                             <div>
                                <RadioGroupItem value="usd" id="usd" />
                                <Label htmlFor="usd" className="pl-2">Dólares</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio Unitario</Label>
                        <Input
                            id="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                             className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7097] p-4 text-base font-normal leading-normal"
                        />
                    </div>
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

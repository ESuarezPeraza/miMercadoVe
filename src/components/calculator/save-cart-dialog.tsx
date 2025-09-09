import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart, Receipt } from 'lucide-react';

interface SaveCartDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (name: string, type: 'purchase' | 'budget') => void;
}

export function SaveCartDialog({ isOpen, onOpenChange, onSave }: SaveCartDialogProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<'purchase' | 'budget'>('budget');

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name.trim(), type);
        setName('');
        setType('budget');
        onOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Guardar Carrito</DialogTitle>
                    <DialogDescription>
                        Guarda tu carrito actual como una compra realizada o un presupuesto para el futuro.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cart-name" className="text-right">
                            Nombre
                        </Label>
                        <Input
                            id="cart-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ej: Compra del supermercado"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                            Tipo
                        </Label>
                        <RadioGroup value={type} onValueChange={(value) => setType(value as 'purchase' | 'budget')} className="col-span-3">
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                                <RadioGroupItem value="budget" id="budget" />
                                <ShoppingCart className="h-4 w-4 text-blue-600" />
                                <div className="flex-1">
                                    <Label htmlFor="budget" className="font-medium cursor-pointer">Presupuesto</Label>
                                    <p className="text-xs text-slate-500">Para planificar compras futuras</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                                <RadioGroupItem value="purchase" id="purchase" />
                                <Receipt className="h-4 w-4 text-green-600" />
                                <div className="flex-1">
                                    <Label htmlFor="purchase" className="font-medium cursor-pointer">Compra Realizada</Label>
                                    <p className="text-xs text-slate-500">Registro de compra completada</p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim()}>
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
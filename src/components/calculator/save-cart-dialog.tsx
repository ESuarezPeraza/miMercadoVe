import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Receipt, Save } from 'lucide-react';

interface SaveCartDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (name: string, type: 'purchase' | 'budget') => void;
}

export function SaveCartDialog({ isOpen, onOpenChange, onSave }: SaveCartDialogProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<'budget'>('budget');

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
    
    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setName('');
            setType('budget');
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white relative">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Save className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white mb-1">
                                Guardar Carrito
                            </DialogTitle>
                            <DialogDescription className="text-blue-100 text-sm">
                                Guarda tu carrito como una compra realizada o un presupuesto futuro
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Name Input */}
                    <div className="space-y-3">
                        <Label htmlFor="cart-name" className="text-sm font-semibold text-slate-700">
                            Nombre del carrito
                        </Label>
                        <div className="relative">
                            <Input
                                id="cart-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ej: Compra del supermercado"
                                className="h-12 pl-4 pr-4 text-base border-2 border-slate-200 focus:border-blue-500 focus:ring-0 rounded-xl transition-colors"
                            />
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">
                            Tipo de registro
                        </Label>
                        <div className="space-y-3">
                            {/* Budget Option */}
                            <button
                                onClick={() => setType('budget')}
                                className={`w-full relative rounded-xl border-2 transition-all cursor-pointer hover:shadow-md block text-left ${
                                    type === 'budget' 
                                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center p-4">
                                    <div className={`p-2 rounded-lg mr-4 ${ type === 'budget' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                        <ShoppingCart className={`h-6 w-6 ${
                                            type === 'budget' ? 'text-blue-600' : 'text-slate-600'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-base font-semibold cursor-pointer text-slate-900">
                                            Presupuesto
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Para planificar y estimar compras futuras
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Purchase Option */}
                             <button
                                onClick={() => setType('purchase')}
                                className={`w-full relative rounded-xl border-2 transition-all cursor-pointer hover:shadow-md block text-left ${
                                    type === 'purchase' 
                                        ? 'border-green-500 bg-green-50 shadow-sm' 
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center p-4">
                                    <div className={`p-2 rounded-lg mr-4 ${ type === 'purchase' ? 'bg-green-100' : 'bg-slate-100'}`}>
                                        <Receipt className={`h-6 w-6 ${
                                            type === 'purchase' ? 'text-green-600' : 'text-slate-600'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-base font-semibold cursor-pointer text-slate-900">
                                            Compra Realizada
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Registro de una compra ya completada
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-11 font-medium border-2 hover:bg-slate-100"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={!name.trim()}
                        className={`flex-1 h-11 font-semibold transition-all ${
                            type === 'budget' 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-green-600 hover:bg-green-700'
                        } disabled:bg-slate-300 disabled:cursor-not-allowed`}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

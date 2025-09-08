import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AmountFormProps {
    vesInput: string;
    setVesInput: (value: string) => void;
    usdInput: string;
    setUsdInput: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    quantity: string;
    setQuantity: (value: string) => void;
    onAdd: () => void;
    isWeightBased: boolean;
    weight: string;
    setWeight: (value: string) => void;
}

export function AmountForm({ 
    vesInput, setVesInput, 
    usdInput, setUsdInput, 
    description, setDescription,
    quantity, setQuantity,
    onAdd,
    isWeightBased,
    weight, setWeight
}: AmountFormProps) {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAdd();
        }
    };

    const handleQuantityChange = (amount: number) => {
        const currentQuantity = parseInt(quantity, 10) || 0;
        const newQuantity = Math.max(1, currentQuantity + amount);
        setQuantity(newQuantity.toString());
    };
    
    return (
        <>
            <div className="space-y-4">
                {/* Description Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Descripción
                    </label>
                    <input
                        placeholder="Descripción"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Quantity/Weight Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {isWeightBased ? "Peso (kg)" : "Cantidad"}
                    </label>
                    {!isWeightBased ? (
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                            <button 
                                onClick={() => handleQuantityChange(-1)} 
                                className="flex items-center justify-center w-12 h-12 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <input
                                placeholder="1"
                                className="flex-1 px-4 py-3 text-center border-0 focus:ring-0 focus:outline-none"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                                onKeyDown={handleKeyDown}
                                type="text"
                                pattern="[0-9]*"
                            />
                            <button 
                                onClick={() => handleQuantityChange(1)} 
                                className="flex items-center justify-center w-12 h-12 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <input
                            placeholder="Peso (kg)"
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            onKeyDown={handleKeyDown}
                            type="number"
                            step="0.01"
                        />
                    )}
                </div>

                {/* Price Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {isWeightBased ? "Precio por kg (Bs)" : "Precio en Bs"}
                        </label>
                        <input
                        placeholder={isWeightBased ? "Precio por kg (Bs)" : "Precio en Bs"}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                        value={vesInput}
                        onChange={(e) => setVesInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="number"
                        step="0.01"
                    />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {isWeightBased ? "Precio por kg ($)" : "Precio en $"}
                        </label>
                        <input
                        placeholder={isWeightBased ? "Precio por kg ($)" : "Precio en $"}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                        value={usdInput}
                        onChange={(e) => setUsdInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="number"
                        step="0.01"
                    />
                    </div>
                </div>

                {/* Add Button */}
                <button 
                    onClick={onAdd} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Añadir al Carrito
                </button>
            </div>
        </>
    );
}

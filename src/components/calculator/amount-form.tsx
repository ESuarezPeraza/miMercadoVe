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
    setIsWeightBased: (value: boolean) => void;
    weight: string;
    setWeight: (value: string) => void;
}

export function AmountForm({ 
    vesInput, setVesInput, 
    usdInput, setUsdInput, 
    description, setDescription,
    quantity, setQuantity,
    onAdd,
    isWeightBased, setIsWeightBased,
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
            <div className="flex items-center space-x-2 px-4 py-3">
              <Label htmlFor="weight-switch">Por Unidad</Label>
              <Switch 
                id="weight-switch"
                checked={isWeightBased}
                onCheckedChange={setIsWeightBased}
              />
              <Label htmlFor="weight-switch">Por Peso</Label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col flex-1">
                    <input
                        placeholder="Descripción"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7097] p-4 text-base font-normal leading-normal"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </label>
                 {!isWeightBased ? (
                    <div className="flex items-center bg-[#e7edf3] rounded-lg h-14">
                        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} className="h-full hover:bg-[#dbe1e8]">
                            <Minus className="h-4 w-4" />
                        </Button>
                        <input
                            placeholder="Cant."
                            className="form-input w-12 text-center text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-[#4e7097] p-0 text-base font-normal leading-normal"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                            onKeyDown={handleKeyDown}
                            type="text"
                            pattern="[0-9]*"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} className="h-full hover:bg-[#dbe1e8]">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                 ) : (
                    <label className="flex flex-col">
                         <input
                            placeholder="Peso (kg)"
                            className="form-input flex w-28 min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7097] p-4 text-base font-normal leading-normal"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            onKeyDown={handleKeyDown}
                            type="number"
                            step="0.01"
                        />
                    </label>
                 )}
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                     <input
                        placeholder={isWeightBased ? "Precio por kg (Bs)" : "Precio en Bs"}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7097] p-4 text-base font-normal leading-normal"
                        value={vesInput}
                        onChange={(e) => setVesInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="number"
                        step="0.01"
                    />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                     <input
                        placeholder={isWeightBased ? "Precio por kg ($)" : "Precio en $"}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7097] p-4 text-base font-normal leading-normal"
                        value={usdInput}
                        onChange={(e) => setUsdInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="number"
                        step="0.01"
                    />
                </label>
            </div>
             <div className="flex px-4 py-3">
                <button onClick={onAdd} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Añadir</span>
                </button>
            </div>
        </>
    );
}
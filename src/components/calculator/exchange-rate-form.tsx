import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface ExchangeRateFormProps {
    rateInput: string;
    setRateInput: (value: string) => void;
    onSave: () => void;
}

export function ExchangeRateForm({ rateInput, setRateInput, onSave }: ExchangeRateFormProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSave();
        }
    };
    
    return (
        <div className="space-y-2">
            <Label htmlFor="exchange-rate">Tasa de cambio Bs/USD</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Input
                    id="exchange-rate"
                    type="number"
                    step="0.01"
                    placeholder="Tasa actual"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow"
                />
                <Button onClick={onSave} className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                </Button>
            </div>
        </div>
    );
}

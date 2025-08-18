import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

interface AmountFormProps {
    currencyLabel: string;
    value: string;
    onValueChange: (value: string) => void;
    onAdd: () => void;
    isDisabled: boolean;
    placeholder: string;
}

export function AmountForm({ currencyLabel, value, onValueChange, onAdd, isDisabled, placeholder }: AmountFormProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isDisabled) {
            e.preventDefault();
            onAdd();
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={currencyLabel}>{currencyLabel}</Label>
            <div className="flex items-center space-x-2">
                <Input
                    id={currencyLabel}
                    type="number"
                    step="0.01"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    aria-label={currencyLabel}
                />
                <Button onClick={onAdd} disabled={isDisabled} className="whitespace-nowrap">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir
                </Button>
            </div>
        </div>
    );
}

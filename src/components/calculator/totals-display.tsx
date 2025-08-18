import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TotalsDisplayProps {
    totalVES: number;
    totalUSD: number;
}

const formatVes = (amount: number) => {
    return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatUsd = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};


export function TotalsDisplay({ totalVES, totalUSD }: TotalsDisplayProps) {
    return (
        <Card className="bg-primary/5 border-primary/20 shadow-lg">
            <CardContent className="p-6 flex flex-col sm:flex-row justify-around items-center text-center gap-4 sm:gap-6">
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Total en Bolívares</p>
                    <p className="text-3xl font-bold text-primary tracking-tight">
                        {formatVes(totalVES)}
                    </p>
                </div>
                <Separator orientation="vertical" className="h-16 hidden sm:block bg-primary/20" />
                <Separator orientation="horizontal" className="w-full sm:hidden bg-primary/20" />
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Total en Dólares</p>
                    <p className="text-3xl font-bold text-primary tracking-tight">
                        {formatUsd(totalUSD)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

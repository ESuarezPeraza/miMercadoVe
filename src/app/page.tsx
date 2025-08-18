import { CalculatorScreen } from '@/components/calculator/calculator-screen';
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <CalculatorScreen />
      <Toaster />
    </main>
  );
}

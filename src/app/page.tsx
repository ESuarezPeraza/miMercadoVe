import { CalculatorScreen } from '@/components/calculator/calculator-screen';
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="flex-1 flex flex-col">
        <CalculatorScreen />
      </div>
      <Toaster />
    </main>
  );
}

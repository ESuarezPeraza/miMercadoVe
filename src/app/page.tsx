import { CalculatorScreen } from '@/components/calculator/calculator-screen';
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="container mx-auto max-w-md px-4">
        <CalculatorScreen />
      </div>
      <Toaster />
    </main>
  );
}

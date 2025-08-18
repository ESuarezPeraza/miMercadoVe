import { Input } from "@/components/ui/input";

interface AmountFormProps {
    vesInput: string;
    setVesInput: (value: string) => void;
    usdInput: string;
    setUsdInput: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    onAdd: () => void;
}

export function AmountForm({ 
    vesInput, setVesInput, 
    usdInput, setUsdInput, 
    description, setDescription,
    onAdd 
}: AmountFormProps) {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAdd();
        }
    };
    
    return (
        <>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                    <input
                        placeholder="Descripción"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7097] p-4 text-base font-normal leading-normal"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                     <input
                        placeholder="Monto en Bs"
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
                        placeholder="Monto en $"
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

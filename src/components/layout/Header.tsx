import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
    return (
        <header className="border-b border-border bg-background/70 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <img src="/images/logo-textura-removedbg.png" alt="Textura Logo" className="h-10 w-auto object-contain" />
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-foreground">Textura</h1>
                        <p className="text-xs text-muted-foreground">Transform images into text art</p>
                    </div>
                </div>
                <ModeToggle />
            </div>
        </header>
    );
}

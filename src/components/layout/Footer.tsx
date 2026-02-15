export function Footer() {
    return (
        <footer className="border-t border-border bg-background/70 mt-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Textura &mdash; Typographic art, made simple.</p>
                <p className="text-xs text-muted-foreground opacity-60">
                    &copy; {new Date().getFullYear()} Textura. All rights reserved. Build with 💙 by <a href="https://github.com/Dani9809" target="_blank" rel="noopener noreferrer">Dani9809</a>
                </p>
            </div>
        </footer>
    );
}

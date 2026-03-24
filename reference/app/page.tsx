import { PasswordGenerator } from "@/components/password-generator"
import { Shield } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-balance">
            Gerador de Senhas Fortes
          </h1>
        </header>

        {/* Generator */}
        <PasswordGenerator />
      </div>
    </main>
  )
}

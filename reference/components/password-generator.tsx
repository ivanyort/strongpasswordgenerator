"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, Check, Shield, RefreshCw, Info } from "lucide-react"

// Symbol presets
const SYMBOL_PRESETS = {
  "basico": { label: "Básico especial: ! @ #", symbols: "!@#" },
  "essenciais": { label: "Essenciais seguros: ! @ # $ % & * ?", symbols: "!@#$%&*?" },
  "estendido": { label: "Estendido: ! @ # $ % & * ( ) - _ = + [ ] { } ?", symbols: "!@#$%&*()-_=+[]{}?" },
  "colchetes": { label: "Colchetes e agrupadores: ( ) [ ] { } < >", symbols: "()[]{}<>" },
  "operadores": { label: "Operadores: + - * / = % ^ ~", symbols: "+-*/=%^~" },
  "personalizado": { label: "Personalizar totalmente", symbols: "" },
} as const

type SymbolPreset = keyof typeof SYMBOL_PRESETS

// Start mode options
const START_MODES = {
  "aleatorio": "Totalmente aleatória",
  "maiuscula": "Com letra maiúscula",
  "minuscula": "Com letra minúscula",
  "numero": "Com número",
  "simbolo": "Com símbolo",
} as const

type StartMode = keyof typeof START_MODES

// Character sets
const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ"
const LOWERCASE = "abcdefghjkmnpqrstuvwxyz"
const NUMBERS = "23456789"
const AMBIGUOUS_UPPERCASE = "OI"
const AMBIGUOUS_LOWERCASE = "ol"
const AMBIGUOUS_NUMBERS = "01"

interface GeneratorSettings {
  length: number
  startMode: StartMode
  useUppercase: boolean
  useLowercase: boolean
  useNumbers: boolean
  useSymbols: boolean
  excludeAmbiguous: boolean
  symbolPreset: SymbolPreset
  customSymbols: string
}

const DEFAULT_SETTINGS: GeneratorSettings = {
  length: 16,
  startMode: "aleatorio",
  useUppercase: true,
  useLowercase: true,
  useNumbers: true,
  useSymbols: true,
  excludeAmbiguous: false,
  symbolPreset: "basico",
  customSymbols: "",
}

const STORAGE_KEY = "password-generator-settings"

function getCharacterSet(settings: GeneratorSettings): {
  all: string
  uppercase: string
  lowercase: string
  numbers: string
  symbols: string
} {
  let uppercase = settings.useUppercase ? UPPERCASE : ""
  let lowercase = settings.useLowercase ? LOWERCASE : ""
  let numbers = settings.useNumbers ? NUMBERS : ""
  let symbols = ""

  if (settings.useSymbols) {
    if (settings.symbolPreset === "personalizado") {
      symbols = settings.customSymbols
    } else {
      symbols = SYMBOL_PRESETS[settings.symbolPreset].symbols
    }
  }

  if (!settings.excludeAmbiguous) {
    if (settings.useUppercase) uppercase += AMBIGUOUS_UPPERCASE
    if (settings.useLowercase) lowercase += AMBIGUOUS_LOWERCASE
    if (settings.useNumbers) numbers += AMBIGUOUS_NUMBERS
  }

  return {
    all: uppercase + lowercase + numbers + symbols,
    uppercase,
    lowercase,
    numbers,
    symbols,
  }
}

function generatePassword(settings: GeneratorSettings): string {
  const chars = getCharacterSet(settings)
  
  if (chars.all.length === 0) return ""

  const length = Math.max(settings.length, 1)
  let password = ""

  // Handle start mode
  let startChar = ""
  switch (settings.startMode) {
    case "maiuscula":
      if (chars.uppercase.length > 0) {
        startChar = chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)]
      }
      break
    case "minuscula":
      if (chars.lowercase.length > 0) {
        startChar = chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)]
      }
      break
    case "numero":
      if (chars.numbers.length > 0) {
        startChar = chars.numbers[Math.floor(Math.random() * chars.numbers.length)]
      }
      break
    case "simbolo":
      if (chars.symbols.length > 0) {
        startChar = chars.symbols[Math.floor(Math.random() * chars.symbols.length)]
      }
      break
  }

  if (startChar) {
    password = startChar
  }

  // Fill the rest
  while (password.length < length) {
    password += chars.all[Math.floor(Math.random() * chars.all.length)]
  }

  return password
}

function calculateStrength(password: string, settings: GeneratorSettings): {
  score: number
  label: string
  description: string
} {
  if (!password) {
    return { score: 0, label: "Sem senha", description: "Configure as opções e gere uma senha" }
  }

  let score = 0
  const length = password.length

  // Length scoring
  if (length >= 8) score += 1
  if (length >= 12) score += 1
  if (length >= 16) score += 1
  if (length >= 20) score += 1

  // Character variety scoring
  if (settings.useUppercase) score += 0.5
  if (settings.useLowercase) score += 0.5
  if (settings.useNumbers) score += 0.5
  if (settings.useSymbols) score += 1

  // Normalize to 0-4 scale
  score = Math.min(score, 4)

  if (score < 1.5) {
    return { score, label: "Fraca", description: "Adicione mais caracteres ou opções para fortalecer" }
  } else if (score < 2.5) {
    return { score, label: "Média", description: "Considere aumentar o tamanho ou adicionar símbolos" }
  } else if (score < 3.5) {
    return { score, label: "Forte", description: "Boa combinação de tamanho e variedade de caracteres" }
  } else {
    return { score, label: "Muito forte", description: "Excelente proteção contra ataques de força bruta" }
  }
}

export function PasswordGenerator() {
  const [settings, setSettings] = useState<GeneratorSettings>(DEFAULT_SETTINGS)
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch {
      // Ignore errors
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      } catch {
        // Ignore errors
      }
    }
  }, [settings, mounted])

  // Generate initial password
  useEffect(() => {
    if (mounted) {
      setPassword(generatePassword(settings))
    }
  }, [mounted, settings])

  const handleGenerate = useCallback(() => {
    setPassword(generatePassword(settings))
    setCopied(false)
  }, [settings])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement("textarea")
      textarea.value = password
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [password])

  const updateSetting = <K extends keyof GeneratorSettings>(
    key: K,
    value: GeneratorSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const strength = calculateStrength(password, settings)
  const strengthPercent = (strength.score / 4) * 100

  const getStrengthColor = () => {
    if (strength.score < 1.5) return "bg-strength-weak"
    if (strength.score < 2.5) return "bg-strength-medium"
    if (strength.score < 3.5) return "bg-strength-strong"
    return "bg-strength-very-strong"
  }

  const currentSymbols = settings.symbolPreset === "personalizado"
    ? settings.customSymbols || "Nenhum definido"
    : SYMBOL_PRESETS[settings.symbolPreset].symbols

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Column 1: Basic Settings */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Configurações</h2>
          </div>

          {/* Length Input */}
          <div className="space-y-2">
            <Label htmlFor="length" className="text-sm font-medium text-foreground">
              Tamanho mínimo da senha
            </Label>
            <Input
              id="length"
              type="number"
              min={4}
              max={128}
              value={settings.length}
              onChange={(e) => updateSetting("length", Math.max(4, Math.min(128, parseInt(e.target.value) || 4)))}
              className="bg-input border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Start Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Como a senha deve começar
            </Label>
            <Select
              value={settings.startMode}
              onValueChange={(value: StartMode) => updateSetting("startMode", value)}
            >
              <SelectTrigger className="bg-input border-border/50 focus:border-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {Object.entries(START_MODES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Gerar senha
          </Button>
        </CardContent>
      </Card>

      {/* Column 2: Character Options */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Caracteres</h2>
          </div>

          {/* Character Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase" className="text-sm text-muted-foreground cursor-pointer">
                Maiúsculas (A-Z)
              </Label>
              <Switch
                id="uppercase"
                checked={settings.useUppercase}
                onCheckedChange={(checked) => updateSetting("useUppercase", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase" className="text-sm text-muted-foreground cursor-pointer">
                Minúsculas (a-z)
              </Label>
              <Switch
                id="lowercase"
                checked={settings.useLowercase}
                onCheckedChange={(checked) => updateSetting("useLowercase", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="numbers" className="text-sm text-muted-foreground cursor-pointer">
                Números (0-9)
              </Label>
              <Switch
                id="numbers"
                checked={settings.useNumbers}
                onCheckedChange={(checked) => updateSetting("useNumbers", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="symbols" className="text-sm text-muted-foreground cursor-pointer">
                Incluir símbolos
              </Label>
              <Switch
                id="symbols"
                checked={settings.useSymbols}
                onCheckedChange={(checked) => updateSetting("useSymbols", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="ambiguous" className="text-sm text-muted-foreground cursor-pointer">
                  Excluir ambíguos
                </Label>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-md text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    Exclui: O, 0, I, l, 1 (difíceis de distinguir)
                  </div>
                </div>
              </div>
              <Switch
                id="ambiguous"
                checked={settings.excludeAmbiguous}
                onCheckedChange={(checked) => updateSetting("excludeAmbiguous", checked)}
              />
            </div>
          </div>

          {/* Symbol Preset */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Grupo de símbolos
            </Label>
            <Select
              value={settings.symbolPreset}
              onValueChange={(value: SymbolPreset) => updateSetting("symbolPreset", value)}
              disabled={!settings.useSymbols}
            >
              <SelectTrigger className="bg-input border-border/50 focus:border-primary/50 disabled:opacity-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {Object.entries(SYMBOL_PRESETS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {settings.useSymbols && (
              <p className="text-xs text-muted-foreground">
                Símbolos: <span className="font-mono text-primary">{currentSymbols}</span>
              </p>
            )}
          </div>

          {/* Custom Symbols */}
          {settings.symbolPreset === "personalizado" && settings.useSymbols && (
            <div className="space-y-2">
              <Label htmlFor="customSymbols" className="text-sm font-medium text-foreground">
                Símbolos personalizados
              </Label>
              <Input
                id="customSymbols"
                type="text"
                placeholder="Digite os símbolos..."
                value={settings.customSymbols}
                onChange={(e) => updateSetting("customSymbols", e.target.value)}
                className="bg-input border-border/50 focus:border-primary/50 font-mono"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column 3: Result */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl md:col-span-2 lg:col-span-1">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Resultado</h2>
          </div>

          {/* Password Output */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Sua senha gerada</Label>
            <div className="relative">
              <Input
                readOnly
                value={password}
                className="bg-background/50 border-border/50 font-mono text-lg pr-12 h-14 tracking-wider"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 hover:bg-primary/10"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-strength-strong" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Strength Meter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Força da senha</Label>
              <span className={`text-sm font-semibold ${getStrengthColor().replace('bg-', 'text-')}`}>
                {strength.label}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`}
                style={{ width: `${strengthPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {strength.description}
            </p>
          </div>

          {/* Storage Note */}
          <p className="text-xs text-muted-foreground/60 text-center">
            Configurações salvas localmente
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

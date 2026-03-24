const STORAGE_KEY = "strong-password-generator:last-run";
const DEFAULT_SYMBOL_PRESET = "basic";
const DEFAULT_CUSTOM_SYMBOLS = "!@#";
const DEFAULT_PASSWORD_START = "random";
const AMBIGUOUS_CHARACTERS = "O0oIl1|`'\"";

const CHARACTER_GROUPS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
};

const SYMBOL_PRESETS = {
  basic: "!@#",
  safe: "!@#$%&*?",
  extended: "!@#$%&*()-_=+[]{}?",
  brackets: "()[]{}<>",
  math: "+-*/=%^~",
};

const SYMBOL_PRESET_LABELS = {
  basic: "Básico especial",
  safe: "Essenciais seguros",
  extended: "Estendido",
  brackets: "Colchetes e agrupadores",
  math: "Operadores",
  custom: "Personalizado",
};

const elements = {
  length: document.querySelector("#password-length"),
  passwordStart: document.querySelector("#password-start"),
  uppercase: document.querySelector("#include-uppercase"),
  lowercase: document.querySelector("#include-lowercase"),
  numbers: document.querySelector("#include-numbers"),
  symbols: document.querySelector("#include-symbols"),
  symbolPreset: document.querySelector("#symbol-preset"),
  customSymbolsGroup: document.querySelector("#custom-symbols-group"),
  allowedSymbols: document.querySelector("#allowed-symbols"),
  symbolPresetHint: document.querySelector("#symbol-preset-hint"),
  excludeAmbiguous: document.querySelector("#exclude-ambiguous"),
  generateButton: document.querySelector("#generate-button"),
  copyButton: document.querySelector("#copy-button"),
  password: document.querySelector("#generated-password"),
  message: document.querySelector("#form-message"),
  strengthLabel: document.querySelector("#strength-label"),
  strengthFill: document.querySelector("#strength-fill"),
  strengthDescription: document.querySelector("#strength-description"),
};

elements.allowedSymbols.dataset.customSymbols = DEFAULT_CUSTOM_SYMBOLS;
elements.allowedSymbols.value = DEFAULT_CUSTOM_SYMBOLS;

function uniqueCharacters(value) {
  return [...new Set(value.split(""))].join("");
}

function removeAmbiguousCharacters(value) {
  return value
    .split("")
    .filter((character) => !AMBIGUOUS_CHARACTERS.includes(character))
    .join("");
}

function getResolvedSymbols(symbolPreset, customSymbols, excludeAmbiguous) {
  const presetValue = symbolPreset === "custom"
    ? customSymbols
    : (SYMBOL_PRESETS[symbolPreset] ?? SYMBOL_PRESETS[DEFAULT_SYMBOL_PRESET]);
  const uniqueValue = uniqueCharacters(presetValue);

  return excludeAmbiguous ? removeAmbiguousCharacters(uniqueValue) : uniqueValue;
}

function getStoredCustomSymbols() {
  return uniqueCharacters(elements.allowedSymbols.dataset.customSymbols || DEFAULT_CUSTOM_SYMBOLS);
}

function normalizeSymbolPreset(value) {
  return value === "custom" || Object.hasOwn(SYMBOL_PRESETS, value)
    ? value
    : DEFAULT_SYMBOL_PRESET;
}

function normalizePasswordStart(value) {
  return ["random", "uppercase", "lowercase", "numbers", "symbols"].includes(value)
    ? value
    : DEFAULT_PASSWORD_START;
}

function syncSymbolInputValue() {
  if (elements.symbolPreset.value === "custom") {
    elements.allowedSymbols.value = getStoredCustomSymbols();
    updateSymbolPresetHint();
    return;
  }

  elements.allowedSymbols.value = SYMBOL_PRESETS[elements.symbolPreset.value] ?? SYMBOL_PRESETS[DEFAULT_SYMBOL_PRESET];
  updateSymbolPresetHint();
}

function formatSymbolsForDisplay(value) {
  return value.split("").join(" ");
}

function updateSymbolPresetHint() {
  const preset = normalizeSymbolPreset(elements.symbolPreset.value);
  const rawSymbols = preset === "custom"
    ? getStoredCustomSymbols()
    : (SYMBOL_PRESETS[preset] ?? SYMBOL_PRESETS[DEFAULT_SYMBOL_PRESET]);
  const effectiveSymbols = getResolvedSymbols(preset, getStoredCustomSymbols(), elements.excludeAmbiguous.checked);

  if (preset === "custom") {
    elements.symbolPresetHint.textContent = effectiveSymbols
      ? `Modo personalizado. Símbolos atuais: ${formatSymbolsForDisplay(effectiveSymbols)}`
      : "Modo personalizado. Informe quais símbolos podem ser usados.";
    return;
  }

  if (elements.excludeAmbiguous.checked && rawSymbols !== effectiveSymbols) {
    elements.symbolPresetHint.textContent = `${SYMBOL_PRESET_LABELS[preset]}: ${formatSymbolsForDisplay(rawSymbols)}. Após remover ambíguos: ${formatSymbolsForDisplay(effectiveSymbols)}.`;
    return;
  }

  elements.symbolPresetHint.textContent = `${SYMBOL_PRESET_LABELS[preset]}: ${formatSymbolsForDisplay(rawSymbols)}.`;
}

function secureRandomIndex(max) {
  const randomValues = new Uint32Array(1);
  window.crypto.getRandomValues(randomValues);
  return randomValues[0] % max;
}

function pickRandomCharacter(pool) {
  return pool[secureRandomIndex(pool.length)];
}

function shuffleCharacters(characters) {
  const array = [...characters];

  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = secureRandomIndex(index + 1);
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }

  return array.join("");
}

function getSettingsFromForm() {
  const lengthValue = Number.parseInt(elements.length.value, 10);
  const normalizedLength = Number.isNaN(lengthValue) ? 16 : Math.min(Math.max(lengthValue, 4), 128);
  const symbolPreset = normalizeSymbolPreset(elements.symbolPreset.value);
  const customSymbols = symbolPreset === "custom"
    ? uniqueCharacters(elements.allowedSymbols.value.trim())
    : getStoredCustomSymbols();
  const excludeAmbiguous = elements.excludeAmbiguous.checked;
  const allowedSymbols = getResolvedSymbols(symbolPreset, customSymbols, excludeAmbiguous);

  return {
    length: normalizedLength,
    passwordStart: normalizePasswordStart(elements.passwordStart.value),
    uppercase: elements.uppercase.checked,
    lowercase: elements.lowercase.checked,
    numbers: elements.numbers.checked,
    symbolsEnabled: elements.symbols.checked,
    symbolPreset,
    customSymbols,
    allowedSymbols,
    excludeAmbiguous,
    password: elements.password.value,
  };
}

function setMessage(text, type = "") {
  elements.message.textContent = text;
  elements.message.className = "message";

  if (type) {
    elements.message.classList.add(type);
  }
}

function updateSymbolsFieldState() {
  const enabled = elements.symbols.checked;
  const isCustomPreset = elements.symbolPreset.value === "custom";
  elements.symbolPreset.disabled = !enabled;
  elements.allowedSymbols.disabled = !enabled || !isCustomPreset;
  elements.customSymbolsGroup.classList.toggle("hidden", !enabled || !isCustomPreset);

  if (enabled) {
    syncSymbolInputValue();
  } else {
    elements.symbolPresetHint.textContent = "Símbolos desativados.";
  }

  if (!enabled) {
    setMessage("", "");
  }
}

function saveState() {
  const state = getSettingsFromForm();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyStrengthMeter(password, settings) {
  const result = evaluatePasswordStrength(password, settings);
  elements.strengthLabel.textContent = result.label;
  elements.strengthFill.style.width = `${result.score}%`;
  elements.strengthFill.style.backgroundColor = result.color;
  elements.strengthLabel.style.color = result.color;
  elements.strengthDescription.textContent = result.description;
}

function evaluatePasswordStrength(password, settings) {
  if (!password) {
    return {
      score: 0,
      label: "Aguardando geração",
      color: "#64748b",
      description: "O medidor considera tamanho, variedade de caracteres e uso de símbolos.",
    };
  }

  let score = 0;
  const length = password.length;
  const categoryCount = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    settings.symbolsEnabled && settings.allowedSymbols.length > 0 && new RegExp(`[${escapeForCharacterClass(settings.allowedSymbols)}]`).test(password),
  ].filter(Boolean).length;

  score += Math.min(length * 4, 40);
  score += categoryCount * 12;

  if (settings.symbolsEnabled && settings.allowedSymbols.length > 0) {
    score += 8;
  }

  if (length >= 16) {
    score += 12;
  } else if (length >= 12) {
    score += 6;
  }

  if (length < 8) {
    score -= 18;
  }

  if (categoryCount <= 1) {
    score -= 14;
  } else if (categoryCount === 2) {
    score -= 4;
  }

  score = Math.max(0, Math.min(score, 100));

  if (score < 35) {
    return {
      score,
      label: "Fraca",
      color: "#ef4444",
      description: "Aumente o tamanho e misture mais tipos de caracteres.",
    };
  }

  if (score < 60) {
    return {
      score,
      label: "Média",
      color: "#f59e0b",
      description: "Boa base, mas ainda vale ampliar a variedade ou o tamanho.",
    };
  }

  if (score < 80) {
    return {
      score,
      label: "Forte",
      color: "#84cc16",
      description: "A senha combina boa variedade e comprimento consistente.",
    };
  }

  return {
    score,
    label: "Muito forte",
    color: "#22c55e",
    description: "Senha robusta para uso geral, com alta diversidade e bom comprimento.",
  };
}

function escapeForCharacterClass(value) {
  return value.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
}

function buildCharacterPools(settings) {
  const pools = [];
  const uppercasePool = settings.excludeAmbiguous
    ? removeAmbiguousCharacters(CHARACTER_GROUPS.uppercase)
    : CHARACTER_GROUPS.uppercase;
  const lowercasePool = settings.excludeAmbiguous
    ? removeAmbiguousCharacters(CHARACTER_GROUPS.lowercase)
    : CHARACTER_GROUPS.lowercase;
  const numbersPool = settings.excludeAmbiguous
    ? removeAmbiguousCharacters(CHARACTER_GROUPS.numbers)
    : CHARACTER_GROUPS.numbers;

  if (settings.uppercase && uppercasePool) {
    pools.push(uppercasePool);
  }

  if (settings.lowercase && lowercasePool) {
    pools.push(lowercasePool);
  }

  if (settings.numbers && numbersPool) {
    pools.push(numbersPool);
  }

  if (settings.symbolsEnabled && settings.allowedSymbols) {
    pools.push(settings.allowedSymbols);
  }

  return pools;
}

function getStartingPool(settings) {
  const uppercasePool = settings.excludeAmbiguous
    ? removeAmbiguousCharacters(CHARACTER_GROUPS.uppercase)
    : CHARACTER_GROUPS.uppercase;
  const lowercasePool = settings.excludeAmbiguous
    ? removeAmbiguousCharacters(CHARACTER_GROUPS.lowercase)
    : CHARACTER_GROUPS.lowercase;
  const numbersPool = settings.excludeAmbiguous
    ? removeAmbiguousCharacters(CHARACTER_GROUPS.numbers)
    : CHARACTER_GROUPS.numbers;

  if (settings.passwordStart === "uppercase") {
    return settings.uppercase ? uppercasePool : "";
  }

  if (settings.passwordStart === "lowercase") {
    return settings.lowercase ? lowercasePool : "";
  }

  if (settings.passwordStart === "numbers") {
    return settings.numbers ? numbersPool : "";
  }

  if (settings.passwordStart === "symbols") {
    return settings.symbolsEnabled ? settings.allowedSymbols : "";
  }

  return "";
}

function generatePassword() {
  const settings = getSettingsFromForm();
  elements.length.value = settings.length;
  elements.passwordStart.value = settings.passwordStart;
  elements.allowedSymbols.dataset.customSymbols = settings.customSymbols;
  elements.copyButton.classList.remove("copied");
  syncSymbolInputValue();

  const pools = buildCharacterPools(settings);
  const startingPool = getStartingPool(settings);

  if (pools.length === 0) {
    setMessage("Selecione pelo menos um tipo de caractere.", "error");
    elements.password.value = "";
    applyStrengthMeter("", settings);
    saveState();
    return;
  }

  if (settings.symbolsEnabled && settings.allowedSymbols.length === 0) {
    setMessage("Defina ao menos um símbolo permitido para usar esta opção.", "error");
    elements.password.value = "";
    applyStrengthMeter("", settings);
    saveState();
    return;
  }

  if (settings.passwordStart !== "random" && !startingPool) {
    setMessage("A regra de inicio escolhida nao combina com os tipos de caracteres habilitados.", "error");
    elements.password.value = "";
    applyStrengthMeter("", settings);
    saveState();
    return;
  }

  const passwordCharacters = pools.map((pool) => pickRandomCharacter(pool));
  const combinedPool = pools.join("");

  if (settings.passwordStart !== "random") {
    const startingCharacter = pickRandomCharacter(startingPool);
    const matchingIndex = passwordCharacters.findIndex((character) => startingPool.includes(character));

    if (matchingIndex >= 0) {
      passwordCharacters.splice(matchingIndex, 1);
    }

    passwordCharacters.unshift(startingCharacter);
  }

  while (passwordCharacters.length < settings.length) {
    passwordCharacters.push(pickRandomCharacter(combinedPool));
  }

  const middleCharacters = settings.passwordStart === "random"
    ? passwordCharacters
    : passwordCharacters.slice(1);
  const password = settings.passwordStart === "random"
    ? shuffleCharacters(passwordCharacters)
    : `${passwordCharacters[0]}${shuffleCharacters(middleCharacters)}`;
  elements.password.value = password;
  setMessage("Senha gerada com sucesso.", "success");
  saveState();
  applyStrengthMeter(password, { ...settings, password });
}

async function copyPassword() {
  const password = elements.password.value;

  if (!password) {
    setMessage("Gere uma senha antes de copiar.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(password);
    setMessage("Senha copiada para a área de transferência.", "success");
    elements.copyButton.classList.add("copied");
    window.setTimeout(() => {
      elements.copyButton.classList.remove("copied");
    }, 2000);
  } catch (error) {
    setMessage("Não foi possível copiar automaticamente. Copie manualmente.", "error");
    elements.copyButton.classList.remove("copied");
  }
}

function applyState(state) {
  if (!state || typeof state !== "object") {
    elements.copyButton.classList.remove("copied");
    updateSymbolsFieldState();
    applyStrengthMeter("", getSettingsFromForm());
    return;
  }

  elements.length.value = state.length ?? 16;
  elements.passwordStart.value = normalizePasswordStart(state.passwordStart);
  elements.uppercase.checked = Boolean(state.uppercase);
  elements.lowercase.checked = Boolean(state.lowercase);
  elements.numbers.checked = Boolean(state.numbers);
  elements.symbols.checked = Boolean(state.symbolsEnabled);
  elements.symbolPreset.value = normalizeSymbolPreset(state.symbolPreset);
  elements.excludeAmbiguous.checked = Boolean(state.excludeAmbiguous);
  elements.allowedSymbols.dataset.customSymbols = typeof state.customSymbols === "string" && state.customSymbols.length > 0
    ? uniqueCharacters(state.customSymbols)
    : DEFAULT_CUSTOM_SYMBOLS;
  elements.password.value = state.password ?? "";
  elements.copyButton.classList.remove("copied");

  updateSymbolsFieldState();
  applyStrengthMeter(elements.password.value, getSettingsFromForm());
}

function loadState() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      updateSymbolsFieldState();
      applyStrengthMeter("", getSettingsFromForm());
      return;
    }

    applyState(JSON.parse(rawValue));
    setMessage("Última execução restaurada do navegador.", "success");
  } catch (error) {
    updateSymbolsFieldState();
    applyStrengthMeter("", getSettingsFromForm());
    setMessage("Não foi possível restaurar a última execução salva.", "error");
  }
}

function handleConfigurationChange() {
  if (elements.symbolPreset.value === "custom") {
    elements.allowedSymbols.dataset.customSymbols = uniqueCharacters(elements.allowedSymbols.value.trim()) || DEFAULT_CUSTOM_SYMBOLS;
  }

  if (elements.symbolPreset.value !== "custom") {
    syncSymbolInputValue();
  }

  updateSymbolsFieldState();
  saveState();
  applyStrengthMeter(elements.password.value, getSettingsFromForm());
}

elements.generateButton.addEventListener("click", generatePassword);
elements.copyButton.addEventListener("click", copyPassword);

[
  elements.length,
  elements.passwordStart,
  elements.uppercase,
  elements.lowercase,
  elements.numbers,
  elements.symbols,
  elements.symbolPreset,
  elements.allowedSymbols,
  elements.excludeAmbiguous,
].forEach((element) => {
  element.addEventListener("input", handleConfigurationChange);
  element.addEventListener("change", handleConfigurationChange);
});

loadState();

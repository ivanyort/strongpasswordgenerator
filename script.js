const STORAGE_KEY = "strong-password-generator:last-run";
const DEFAULT_SYMBOL_PRESET = "basic";
const DEFAULT_CUSTOM_SYMBOLS = "!@#";
const DEFAULT_PASSWORD_START = "random";
const AMBIGUOUS_CHARACTERS = "O0oIl1|`'\"";
const HISTORY_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});
const VERSION_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

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
  clearHistoryButton: document.querySelector("#clear-history-button"),
  password: document.querySelector("#generated-password"),
  message: document.querySelector("#form-message"),
  strengthLabel: document.querySelector("#strength-label"),
  strengthFill: document.querySelector("#strength-fill"),
  strengthDescription: document.querySelector("#strength-description"),
  historyList: document.querySelector("#password-history"),
  historyEmptyState: document.querySelector("#history-empty-state"),
  versionLabel: document.querySelector("#version-label"),
  versionDate: document.querySelector("#version-date"),
};

elements.allowedSymbols.dataset.customSymbols = DEFAULT_CUSTOM_SYMBOLS;
elements.allowedSymbols.value = DEFAULT_CUSTOM_SYMBOLS;
let passwordHistory = [];

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
    history: passwordHistory,
  };
}

function normalizeHistoryEntry(entry) {
  if (!entry || typeof entry !== "object" || typeof entry.password !== "string" || entry.password.length === 0) {
    return null;
  }

  const copiedAt = typeof entry.copiedAt === "string" && !Number.isNaN(Date.parse(entry.copiedAt))
    ? entry.copiedAt
    : new Date().toISOString();

  return {
    password: entry.password,
    copiedAt,
  };
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  const uniqueEntries = [];
  const seenPasswords = new Set();

  history.forEach((entry) => {
    const normalizedEntry = normalizeHistoryEntry(entry);

    if (!normalizedEntry || seenPasswords.has(normalizedEntry.password)) {
      return;
    }

    seenPasswords.add(normalizedEntry.password);
    uniqueEntries.push(normalizedEntry);
  });

  return uniqueEntries.sort((current, next) => new Date(next.copiedAt).getTime() - new Date(current.copiedAt).getTime());
}

function formatVersionDate(value) {
  return VERSION_DATE_FORMATTER.format(new Date(value));
}

function applyVersionInfo(version) {
  if (!version || typeof version !== "object") {
    elements.versionLabel.textContent = "Versão indisponível";
    elements.versionDate.textContent = "Não foi possível carregar o deploy atual";
    return;
  }

  const commit = typeof version.commit === "string" && version.commit.length > 0
    ? version.commit.slice(0, 7)
    : "local";
  const deployedAt = typeof version.deployedAt === "string" && !Number.isNaN(Date.parse(version.deployedAt))
    ? formatVersionDate(version.deployedAt)
    : "Sem data de deploy";

  elements.versionLabel.textContent = `Versão ${commit}`;
  elements.versionDate.textContent = deployedAt;
}

async function loadVersionInfo() {
  try {
    const response = await window.fetch(`./version.json?ts=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("version-unavailable");
    }

    applyVersionInfo(await response.json());
  } catch (error) {
    applyVersionInfo({
      commit: "local",
      deployedAt: null,
    });
  }
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

function formatCopiedAt(value) {
  return HISTORY_DATE_FORMATTER.format(new Date(value));
}

function renderHistory() {
  elements.historyList.innerHTML = "";

  if (passwordHistory.length === 0) {
    elements.historyEmptyState.classList.remove("hidden");
    elements.clearHistoryButton.disabled = true;
    return;
  }

  elements.historyEmptyState.classList.add("hidden");
  elements.clearHistoryButton.disabled = false;

  const fragment = document.createDocumentFragment();

  passwordHistory.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "history-item";
    item.dataset.password = entry.password;

    const header = document.createElement("div");
    header.className = "history-item-head";

    const passwordBlock = document.createElement("div");

    const passwordValue = document.createElement("p");
    passwordValue.className = "history-password";
    passwordValue.textContent = entry.password;

    const meta = document.createElement("p");
    meta.className = "history-meta";
    meta.textContent = `Copiada em ${formatCopiedAt(entry.copiedAt)}`;

    passwordBlock.append(passwordValue, meta);

    const actions = document.createElement("div");
    actions.className = "history-actions";

    const copyAction = document.createElement("button");
    copyAction.type = "button";
    copyAction.className = "history-action-button";
    copyAction.dataset.action = "copy-history-item";
    copyAction.dataset.password = entry.password;
    copyAction.setAttribute("aria-label", "Copiar senha do histórico");
    copyAction.innerHTML = `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1Zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H10V7h9v14Z"></path>
      </svg>
    `;

    const removeAction = document.createElement("button");
    removeAction.type = "button";
    removeAction.className = "history-action-button danger";
    removeAction.dataset.action = "remove-history-item";
    removeAction.dataset.password = entry.password;
    removeAction.setAttribute("aria-label", "Remover senha do histórico");
    removeAction.innerHTML = `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Zm-1 12a2 2 0 0 1-2-2V8h16v11a2 2 0 0 1-2 2H6Z"></path>
      </svg>
    `;

    actions.append(copyAction, removeAction);
    header.append(passwordBlock, actions);
    item.append(header);
    fragment.append(item);
  });

  elements.historyList.append(fragment);
}

function updateHistory(password) {
  const copiedAt = new Date().toISOString();
  passwordHistory = [
    { password, copiedAt },
    ...passwordHistory.filter((entry) => entry.password !== password),
  ];
  renderHistory();
  saveState();
}

function removeHistoryItem(password) {
  passwordHistory = passwordHistory.filter((entry) => entry.password !== password);
  renderHistory();
  saveState();
}

function clearHistory() {
  passwordHistory = [];
  renderHistory();
  saveState();
}

function copyWithExecCommand(text, sourceElement = null) {
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selection = window.getSelection();
  let helperField = null;
  const target = sourceElement ?? (() => {
    helperField = document.createElement("textarea");
    helperField.value = text;
    helperField.setAttribute("aria-hidden", "true");
    helperField.style.position = "fixed";
    helperField.style.inset = "0 auto auto 0";
    helperField.style.width = "1px";
    helperField.style.height = "1px";
    helperField.style.padding = "0";
    helperField.style.border = "0";
    helperField.style.opacity = "0";
    helperField.style.pointerEvents = "none";
    document.body.append(helperField);
    return helperField;
  })();

  if (!sourceElement) {
    target.value = text;
  }

  target.focus();
  target.select();

  if (typeof target.setSelectionRange === "function") {
    target.setSelectionRange(0, target.value.length);
  }

  let wasCopied = false;

  try {
    wasCopied = document.execCommand("copy");
  } catch (error) {
    wasCopied = false;
  }

  target.blur();

  if (helperField) {
    helperField.remove();
  }

  if (selection) {
    selection.removeAllRanges();
  }

  if (activeElement && document.contains(activeElement)) {
    activeElement.focus({ preventScroll: true });
  }

  return wasCopied;
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

async function copyTextToClipboard(text, sourceElement = null) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Falls back to execCommand for contexts where Clipboard API is denied.
    }
  }

  return copyWithExecCommand(text, sourceElement);
}

async function copyPassword() {
  const password = elements.password.value;

  if (!password) {
    setMessage("Gere uma senha antes de copiar.", "error");
    return;
  }

  try {
    const wasCopied = await copyTextToClipboard(password, elements.password);

    if (!wasCopied) {
      throw new Error("copy-failed");
    }

    updateHistory(password);
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

async function copyHistoryPassword(password) {
  try {
    const wasCopied = await copyTextToClipboard(password);

    if (!wasCopied) {
      throw new Error("copy-failed");
    }

    setMessage("Senha do histórico copiada para a área de transferência.", "success");
  } catch (error) {
    setMessage("Não foi possível copiar automaticamente. Copie manualmente.", "error");
  }
}

function applyState(state) {
  if (!state || typeof state !== "object") {
    passwordHistory = [];
    elements.copyButton.classList.remove("copied");
    updateSymbolsFieldState();
    renderHistory();
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
  passwordHistory = normalizeHistory(state.history);
  elements.copyButton.classList.remove("copied");

  updateSymbolsFieldState();
  renderHistory();
  applyStrengthMeter(elements.password.value, getSettingsFromForm());
}

function loadState() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      passwordHistory = [];
      updateSymbolsFieldState();
      renderHistory();
      applyStrengthMeter("", getSettingsFromForm());
      return;
    }

    applyState(JSON.parse(rawValue));
    setMessage("Última execução restaurada do navegador.", "success");
  } catch (error) {
    passwordHistory = [];
    updateSymbolsFieldState();
    renderHistory();
    applyStrengthMeter("", getSettingsFromForm());
    setMessage("Não foi possível restaurar a última execução salva.", "error");
  }
}

function handleHistoryClick(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const { action, password } = actionButton.dataset;

  if (action === "copy-history-item" && password) {
    copyHistoryPassword(password);
    return;
  }

  if (action === "remove-history-item" && password) {
    removeHistoryItem(password);
    setMessage("Senha removida do histórico.", "success");
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
elements.clearHistoryButton.addEventListener("click", () => {
  clearHistory();
  setMessage("Histórico limpo com sucesso.", "success");
});
elements.historyList.addEventListener("click", handleHistoryClick);

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
loadVersionInfo();

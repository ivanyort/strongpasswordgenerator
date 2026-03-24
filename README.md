# Strong Password Generator

Gerador de senhas fortes e seguras feito com `HTML`, `CSS` e `JavaScript` puro, pronto para abrir localmente ou publicar no GitHub Pages.

## Funcionalidades
- Definição de comprimento mínimo da senha
- Escolha de como a senha deve começar:
  - totalmente aleatória
  - com letra maiúscula
  - com letra minúscula
  - com número
  - com símbolo
- Ativação de grupos de caracteres:
  - maiúsculas
  - minúsculas
  - números
  - símbolos
- Exclusão opcional de caracteres ambíguos
- Presets de símbolos:
  - `Básico especial: ! @ #`
  - `Essenciais seguros`
  - `Estendido`
  - `Colchetes e agrupadores`
  - `Operadores`
  - `Personalizar totalmente`
- Campo para símbolos personalizados
- Medidor visual de força da senha
- Cópia rápida da senha gerada
- Persistência da última execução no `localStorage`

## Persistência local
O app salva o último estado usando a chave:

```text
strong-password-generator:last-run
```

Os dados persistidos incluem configurações e a última senha gerada.

## Estrutura do projeto
```text
.
├── index.html
├── style.css
├── script.js
├── AGENTS.md
├── README.md
└── reference/
```

## Tipografia
- Interface principal: `Geist`
- Campo de senha gerada: `Geist Mono`

Essas fontes foram mantidas para aproximar a versão estática do design presente em `reference/`.

## Desenvolvimento
Não há dependências nem etapa obrigatória de build para rodar a aplicação principal.

Basta abrir `index.html` no navegador.

## Referência visual
O diretório `reference/` contém o design de referência usado para guiar a interface atual. A aplicação principal continua sendo a versão estática da raiz do projeto.

## Próximas sessões com IA
- O arquivo `AGENTS.md` mantém o contexto técnico e operacional do projeto.
- Ele deve ser atualizado junto com este `README.md` sempre que houver uma nova entrega relevante.

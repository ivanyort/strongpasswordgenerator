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
├── .gitattributes
├── .gitignore
├── .nojekyll
├── index.html
├── style.css
├── script.js
├── AGENTS.md
└── README.md
```

## Publicação no GitHub Pages
O projeto é publicado sem etapa de build, usando os arquivos estáticos da raiz do repositório.

O arquivo `.nojekyll` foi adicionado para garantir que o GitHub Pages entregue o conteúdo diretamente, sem tentar processar o projeto com Jekyll.

## Versionamento
O repositório inclui:

- `.gitignore` para evitar versionar arquivos locais de sistema, editor e diretórios auxiliares não publicados
- `.gitattributes` com `LF` normalizado para manter finais de linha consistentes entre ambientes

## Tipografia
- Interface principal: `Geist`
- Campo de senha gerada: `Geist Mono`

Essas fontes foram mantidas para preservar a identidade visual atual da aplicação estática.

## Desenvolvimento
Não há dependências nem etapa obrigatória de build para rodar a aplicação principal.

Basta abrir `index.html` no navegador.

## Próximas sessões com IA
- O arquivo `AGENTS.md` mantém o contexto técnico e operacional do projeto.
- Ele deve ser atualizado junto com este `README.md` sempre que houver uma nova entrega relevante.

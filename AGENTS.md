# AGENTS.md

## Objetivo do projeto
- Aplicação estática em `HTML`, `CSS` e `JavaScript` puro.
- O projeto é um gerador de senhas fortes compatível com GitHub Pages.
- A interface atual foi adaptada para seguir o design presente no diretório `reference/`, mas sem migrar para Next.js ou React.

## Arquitetura atual
- `.gitattributes`: normaliza finais de linha com `LF` no repositório.
- `.gitignore`: evita versionar arquivos locais e artefatos gerados em `reference/`.
- `index.html`: estrutura principal da página.
- `style.css`: tema visual dark premium, layout em 3 cards, switches, campo de resultado e medidor. A tipografia deve seguir o `reference` com `Geist` para interface e `Geist Mono` para a senha.
- `script.js`: geração de senha, persistência no `localStorage`, restauração de estado, cópia e medidor de força.
- `.nojekyll`: garante publicação direta no GitHub Pages sem processamento por Jekyll.
- `reference/`: fonte visual de referência. Não é a implementação ativa publicada.

## Comportamento atual
- Persiste a última execução em `localStorage` com a chave `strong-password-generator:last-run`.
- Salva:
  - comprimento
  - regra de início da senha
  - flags de maiúsculas, minúsculas, números e símbolos
  - preset de símbolos
  - símbolos customizados
  - exclusão de ambíguos
  - senha gerada
- Opções atuais:
  - comprimento mínimo
  - início da senha: aleatória, maiúscula, minúscula, número ou símbolo
  - grupos de caracteres
  - preset de símbolos
  - símbolos customizados
  - excluir caracteres ambíguos
- Grupo de símbolos básico atual: `!@#`

## Regras de produto já definidas
- O comportamento atual do projeto prevalece quando houver conflito com `reference/`.
- O visual deve continuar alinhado ao `reference/`.
- A página deve continuar abrindo sem build e ser publicável via GitHub Pages.
- A publicação no GitHub Pages deve continuar sendo feita a partir da raiz do repositório, com `.nojekyll` presente para evitar processamento por Jekyll.
- O repositório deve manter `.gitattributes` com normalização de `LF` e `.gitignore` cobrindo arquivos locais comuns e artefatos gerados em `reference/`.
- `AGENTS.md` deve ser mantido atualizado a cada entrega futura.
- `README.md` deve ser mantido atualizado a cada entrega futura.

## Regras operacionais para futuras sessões
- Antes de alterar comportamento, verificar se o pedido muda alguma regra já consolidada neste arquivo.
- Ao entregar mudanças, atualizar este arquivo com:
  - estado atual da interface
  - opções disponíveis
  - defaults relevantes
  - decisões novas de produto
- Ao entregar mudanças, atualizar também o `README.md`.

## Regras de commit e push
- Só fazer `commit` e `push` quando o usuário pedir explicitamente.
- Ao fazer commit:
  - usar commit conventions na mensagem
  - criar uma mensagem de commit detalhada
  - adicionar todos os arquivos alterados/incluídos/removidos, respeitando `.gitignore`
  - sempre executar `push` após o commit

## Observações para implementação
- Preferir manter ids estáveis do DOM sempre que possível para reduzir impacto no `script.js`.
- Mudanças visuais devem tentar reproduzir o `reference/` no máximo possível dentro da stack estática.
- Tipografia também faz parte da fidelidade ao `reference`; não substituir `Geist`/`Geist Mono` por fontes genéricas sem necessidade.
- Não substituir a implementação atual por Next.js/React sem pedido explícito.

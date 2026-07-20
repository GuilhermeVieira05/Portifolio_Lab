# Remover Chat da UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remover o botão flutuante de chat (`PersonalChat`) de todas as páginas do site, sem apagar o código-fonte do componente.

**Architecture:** Remoção pontual de JSX e imports em 5 arquivos de página. Nenhuma mudança de lógica, nenhum arquivo novo.

**Tech Stack:** React 19, TypeScript, Vite.

---

### Task 1: Remover `PersonalChat` de todas as páginas

**Files:**
- Modify: `portifolio/src/pages/Home.tsx`
- Modify: `portifolio/src/pages/Sobre.tsx`
- Modify: `portifolio/src/pages/Contato.tsx`
- Modify: `portifolio/src/pages/Habilidades.tsx`
- Modify: `portifolio/src/pages/Projetos.tsx`

- [ ] **Step 1: Remover import e uso em `Home.tsx`**

Em `portifolio/src/pages/Home.tsx`, remover a linha do import:

```tsx
import { PersonalChat } from "../components/PersonalChat";
```

E remover o bloco JSX (linhas 272-276 no arquivo atual):

```tsx
      <PersonalChat
        avatarUrl={profileImg}
        avatarAlt="Foto do meu perfil"
        initials="GV"
      />
```

Se `profileImg` (import de `../assets/profile.jpeg`) não for usado em mais nenhum lugar do arquivo após essa remoção, remover também esse import.

- [ ] **Step 2: Remover import e uso em `Sobre.tsx`**

Ler o arquivo `portifolio/src/pages/Sobre.tsx` primeiro para localizar o bloco exato (linha ~7 o import, linha ~33 o uso). Remover a linha:

```tsx
import { PersonalChat } from "../components/PersonalChat"
```

E remover o elemento `<PersonalChat ... />` correspondente, incluindo quaisquer props passadas a ele.

- [ ] **Step 3: Remover import e uso em `Contato.tsx`**

Ler o arquivo `portifolio/src/pages/Contato.tsx` primeiro (import na linha ~6, uso na linha ~26). Remover a linha:

```tsx
import { PersonalChat } from "../components/PersonalChat";
```

E remover o elemento `<PersonalChat ... />` correspondente.

- [ ] **Step 4: Remover import e uso em `Habilidades.tsx`**

Ler o arquivo `portifolio/src/pages/Habilidades.tsx` primeiro (import na linha ~4, uso na linha ~28). Remover a linha:

```tsx
import { PersonalChat } from "../components/PersonalChat"
```

E remover o elemento `<PersonalChat ... />` correspondente.

- [ ] **Step 5: Remover import e uso em `Projetos.tsx`**

Ler o arquivo `portifolio/src/pages/Projetos.tsx` primeiro (import na linha ~7, uso na linha ~32). Remover a linha:

```tsx
import { PersonalChat } from "../components/PersonalChat";
```

E remover o elemento `<PersonalChat ... />` correspondente.

- [ ] **Step 6: Verificar que `PersonalChat.tsx`, `Chat.tsx` e `chatApi.ts` continuam intactos**

```bash
git status portifolio/src/components/PersonalChat.tsx portifolio/src/components/Chat.tsx portifolio/src/api/chatApi.ts
```

Expected: nenhuma alteração listada para esses 3 arquivos (working tree limpo neles).

- [ ] **Step 7: Rodar o typecheck e lint**

```bash
cd portifolio && npx tsc -b --noEmit && npx eslint .
```

Expected: sem erros. Se aparecer erro de "unused import" em alguma das 5 páginas, remover o import não utilizado apontado.

- [ ] **Step 8: Rodar o build**

```bash
cd portifolio && npm run build
```

Expected: build conclui sem erros.

- [ ] **Step 9: Commit**

```bash
git add portifolio/src/pages/Home.tsx portifolio/src/pages/Sobre.tsx portifolio/src/pages/Contato.tsx portifolio/src/pages/Habilidades.tsx portifolio/src/pages/Projetos.tsx
git commit -m "feat: remove chat widget from all pages"
```

---

## Critério de pronto

- Nenhuma página exibe o botão flutuante de chat ao navegar pelo site (`npm run dev` e visitar `/`, `/sobre`, `/contato`, `/habilidades`, `/projetos`).
- `PersonalChat.tsx`, `Chat.tsx`, `chatApi.ts` continuam no repositório sem modificação.
- Build e typecheck passam sem warnings de import não utilizado.

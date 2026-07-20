# Corrigir Animação de Digitação no Hero — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a lib `react-typed` (causa de sobreposição visual de letras) pelo hook próprio `useTypewriter` no Hero da Home, e unificar os dois blocos JSX duplicados (pt/en) em um só.

**Architecture:** `useTypewriter` já existe e não é usado em nenhum lugar — passa a alimentar um `<Box component="span">` cujo conteúdo é `text` (mais um cursor CSS). O bloco condicional `i18n.language === "pt" ? (...) : (...)` em `Home.tsx` — hoje duas árvores JSX quase idênticas com a ordem dos filhos invertida — vira uma única árvore que reordena via `flexDirection: row | row-reverse`.

**Tech Stack:** React 19, TypeScript, MUI, i18next.

---

### Task 1: Adicionar suporte a cursor piscante no `useTypewriter`

O hook atual retorna `{ text, deleting, index }` mas não indica se a animação já começou (`started`), que é necessário para não piscar o cursor antes do delay inicial. Vamos expor esse estado também.

**Files:**
- Modify: `portifolio/src/hooks/useTypewriter.ts`

- [ ] **Step 1: Expor `started` no retorno do hook**

Em `portifolio/src/hooks/useTypewriter.ts`, localizar a linha final:

```ts
  const text = safeWords[index]?.slice(0, subIndex) ?? "";

  return { text, deleting, index };
```

Substituir por:

```ts
  const text = safeWords[index]?.slice(0, subIndex) ?? "";

  return { text, deleting, index, started };
```

- [ ] **Step 2: Rodar o typecheck**

```bash
cd portifolio && npx tsc -b --noEmit
```

Expected: sem erros (mudança é apenas adicionar um campo ao objeto retornado).

- [ ] **Step 3: Commit**

```bash
git add portifolio/src/hooks/useTypewriter.ts
git commit -m "feat: expose started state from useTypewriter"
```

---

### Task 2: Unificar o Hero de `Home.tsx` em um único bloco JSX usando `useTypewriter`

**Files:**
- Modify: `portifolio/src/pages/Home.tsx`

- [ ] **Step 1: Trocar o import de `react-typed` pelo hook local**

Em `portifolio/src/pages/Home.tsx`, remover:

```tsx
import { ReactTyped } from "react-typed";
```

Adicionar:

```tsx
import { useTypewriter } from "../hooks/useTypewriter";
```

- [ ] **Step 2: Obter o texto animado via hook dentro do componente**

Dentro de `export const Home: React.FC = () => {`, logo após a linha `const palavrasTraduzidas = user.caracteristicas.map((c) => t(c));`, adicionar:

```tsx
  const { text: typedText, started: typedStarted } = useTypewriter(palavrasTraduzidas, {
    typingSpeed: 70,
    deletingSpeed: 50,
    pauseTime: 1500,
    startDelay: 300,
    loop: true,
  });
```

- [ ] **Step 3: Substituir os dois blocos condicionais (pt/en) por um único bloco**

Localizar o trecho completo entre `{/* Linha 2: "Desenvolvedor " + palavra animada */}` e o fechamento do `{i18n.language === "pt" ? (...) : (...)}` (linhas 96 a 191 do arquivo original). Substituir todo esse trecho por:

```tsx
              {/* Linha 2: "Desenvolvedor " + palavra animada */}
              <Typography
                variant="h5"
                component="h2"
                color="#F5F5F5"
                sx={{
                  fontWeight: 600,
                  display: "flex",
                  flexDirection: i18n.language === "pt" ? "row" : "row-reverse",
                  justifyContent: "center",
                  alignItems: "center",
                  lineHeight: 1,
                  gap: 1,
                  fontSize: { xs: "clamp(1.125rem, 5vw, 2rem)", md: "2rem" },
                  textShadow: `
      0 0 4px rgba(245, 245, 245, 0.2),
      0 0 8px rgba(245, 245, 245, 0.15)
    `
                }}
                aria-live="polite"
                aria-atomic="true"
              >
                <Box component="span">{t("home.desenvolvedor")}</Box>
                <Box
                  component="span"
                  sx={{
                    fontFamily: "Ubuntu, monospace",
                    fontWeight: 700,
                    color: "#36BCF7FF",
                    textShadow: `
        0 0 5px rgba(54, 188, 247, 0.7),
        0 0 10px rgba(54, 188, 247, 0.6),
        0 0 20px rgba(54, 188, 247, 0.5),
        0 0 40px rgba(54, 188, 247, 0.4)
      `,
                    "&::after": {
                      content: '"|"',
                      marginLeft: "2px",
                      opacity: typedStarted ? 1 : 0,
                      animation: "blink 1s step-end infinite",
                    },
                    "@keyframes blink": {
                      "50%": { opacity: 0 },
                    },
                  }}
                >
                  {typedText}
                </Box>
              </Typography>
```

Note que o `Box` de texto fixo (`{t("home.desenvolvedor")}`) sempre vem primeiro no JSX agora; a inversão visual para inglês (onde a palavra animada vem antes de "Developer") é feita puramente via `flexDirection: "row-reverse"`, não duplicando a árvore.

- [ ] **Step 4: Remover a dependência `react-typed` do `package.json`**

```bash
cd portifolio && npm uninstall react-typed
```

Expected: `react-typed` removido de `dependencies` em `portifolio/package.json` e de `package-lock.json`.

- [ ] **Step 5: Confirmar que não sobrou nenhum uso de `react-typed` no código**

```bash
grep -rn "react-typed\|ReactTyped" portifolio/src
```

Expected: nenhum resultado.

- [ ] **Step 6: Rodar typecheck e lint**

```bash
cd portifolio && npx tsc -b --noEmit && npx eslint .
```

Expected: sem erros.

- [ ] **Step 7: Rodar o build**

```bash
cd portifolio && npm run build
```

Expected: build conclui sem erros.

- [ ] **Step 8: Testar manualmente no navegador**

```bash
cd portifolio && npm run dev
```

Abrir `http://localhost:5173/` no navegador. Verificar:
- A palavra animada digita e apaga em loop, sem letras sobrepostas.
- Redimensionar a janela para uma largura de celular (ex: 375px via DevTools) — texto não deve sobrepor nem cortar.
- Trocar o idioma no seletor de pt para en e voltar — a animação continua fluida, sem glitch visual, e a ordem "Developer <palavra>" (en) / "Desenvolvedor <palavra>" (pt) aparece corretamente.

- [ ] **Step 9: Commit**

```bash
git add portifolio/src/pages/Home.tsx portifolio/package.json portifolio/package-lock.json
git commit -m "fix: replace react-typed with local useTypewriter hook to fix text overlap glitch"
```

---

## Critério de pronto

- A palavra animada no Hero digita/apaga corretamente em pt e en, sem sobreposição de caracteres, em desktop e em viewport mobile.
- Trocar o idioma no seletor não causa glitch visual.
- `react-typed` não é mais uma dependência do projeto.
- Um único bloco JSX no Hero cobre pt e en (sem duplicação de árvore).

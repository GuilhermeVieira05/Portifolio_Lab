# Melhorias do Portfólio — Design

Três sub-projetos independentes, cada um com seu próprio escopo e critério de pronto. Podem ser implementados em qualquer ordem; não há dependência entre eles.

## 1. Remover o chat da interface

**Problema:** o chat pessoal (`PersonalChat` + `ChatWindow`) depende de um backend Python (Render + Gemini API) que não funciona mais no free tier. Reativar o backend não é objetivo deste projeto.

**Solução:** remover apenas o uso visual do componente, sem apagar o código-fonte (pode ser reativado no futuro).

- Remover `<PersonalChat ... />` das 5 páginas que o renderizam: `Home.tsx`, `Sobre.tsx`, `Contato.tsx`, `Habilidades.tsx`, `Projetos.tsx`.
- Remover os `import { PersonalChat } from "../components/PersonalChat"` correspondentes.
- Manter `PersonalChat.tsx`, `Chat.tsx` e `chatApi.ts` intactos no repositório.
- Não mexer no backend Python nem no deploy do Render — fica como está, apenas não é mais chamado pelo frontend.

**Critério de pronto:** nenhuma página exibe o botão flutuante de chat; build e typecheck passam sem imports não utilizados.

## 2. Corrigir a animação da palavra digitada (Home)

**Problema:** no `Home.tsx`, a palavra animada (ex: "Fullstack", "Backend") usa o componente `ReactTyped` da lib `react-typed` (^2.0.12, não mantida há anos, manipula o DOM diretamente fora do ciclo do React). Em conjunto com o React 19 (que monta/desmonta componentes duas vezes em Strict Mode) isso causa sobreposição visual de letras — sintoma relatado como texto "montando" de forma "avacalhada", tanto no mobile quanto ao trocar pt/en. Trocar de idioma agrava o problema porque o JSX de pt e en são dois blocos praticamente duplicados (só a ordem dos elementos filhos muda), então a troca desmonta e remonta a instância do `ReactTyped` de um jeito que expõe ainda mais o bug da lib.

**Solução:** substituir `ReactTyped`/`react-typed` pelo hook `useTypewriter` (`src/hooks/useTypewriter.ts`), que já existe no projeto mas não é usado em lugar nenhum hoje. É implementado com `useState`/`useEffect` puros — sem tocar o DOM fora do React — o que elimina a causa raiz do conflito com Strict Mode.

Também unificar os dois blocos JSX quase-idênticos (`i18n.language === "pt" ? (...) : (...)`) em um único bloco, controlando a ordem visual dos dois `<Box>` (texto fixo "Desenvolvedor" e palavra animada) via `flexDirection: row | row-reverse` conforme o idioma, em vez de duplicar todo o JSX. Isso remove a duplicação de estilos e reduz a superfície de bugs futuros nessa seção.

**Detalhes de implementação:**
- `palavrasTraduzidas` (lista de palavras já traduzidas) continua sendo passada para o hook no lugar de `strings` do `ReactTyped`.
- Cursor piscante: reimplementar com CSS simples (`::after` com `animation: blink`) já que `useTypewriter` não inclui cursor.
- Remover a dependência `react-typed` do `package.json` após a migração (não fica mais nenhum uso no código).

**Critério de pronto:** a palavra animada digita/apaga corretamente em pt e en, sem sobreposição de caracteres, tanto em desktop quanto em viewport mobile; trocar o idioma no seletor não causa glitch visual.

## 3. Dados dinâmicos via JSON + rota /admin

**Problema:** experiências, projetos, skills, serviços e dados pessoais estão hardcoded em arquivos `.ts` no repositório. Qualquer atualização exige editar código e fazer deploy manual. O usuário quer um jeito de atualizar esses dados sem precisar programar, mas sem depender de um banco de dados gerenciado (ex: Supabase) que ficaria ocioso a maior parte do tempo — preocupação real, já que uso pouco frequente é justamente o padrão de acesso esperado aqui.

**Restrição chave:** o frontend está hospedado na Vercel, cujas funções serverless têm sistema de arquivos somente-leitura em produção. Não é possível que uma rota `/admin` escreva diretamente em um arquivo `.json` do projeto em runtime.

**Solução: GitHub como fonte de verdade, via commits pela API do GitHub.**

A rota `/admin` (autenticada) permite editar os dados através de formulários. Ao salvar, uma função serverless chama a GitHub Contents API para criar um commit direto na branch `main`, atualizando o(s) arquivo(s) JSON correspondente(s) no próprio repositório. A Vercel já está configurada para redeploy automático a cada push em `main`, então a alteração aparece no site ao vivo em torno de 1 minuto — sem infraestrutura nova, sem banco de dados para manter ativo, e com histórico de mudanças gratuito via `git log`.

Como o `/admin` só é acessível com uma senha que só o usuário conhece, commitar direto na `main` (sem passar por um PR de revisão) é aceitável — a fricção de revisar cada edição não compensa o baixo risco.

### 3.1 Estrutura de dados

Novo diretório `portifolio/src/data/json/`:
- `experiences.json`
- `projects.json`
- `skills.json`
- `services.json`
- `user.json`

Cada campo de texto hoje representado por uma chave de tradução (`"experiencias.experiencia01.papel"`) passa a ser um objeto bilíngue embutido diretamente no registro:

```json
{
  "id": "exp-01",
  "role": { "pt": "Desenvolvedor Fullstack", "en": "Fullstack Developer" },
  "company": { "pt": "Puc Minas", "en": "Puc Minas" },
  "startDate": "01/2025",
  "finalDate": null,
  "description": { "pt": "...", "en": "..." },
  "type": { "pt": "Trabalho", "en": "Work" }
}
```

Isso remove a dependência das chaves `experiencias.*`, `projects.*`, `servicos.*` em `locales/pt/translation.json` e `locales/en/translation.json` — esses blocos são removidos dos arquivos de tradução (o restante do `translation.json`, referente a textos fixos de UI, continua como está).

Os componentes de exibição (`ExperienceSection`, `ProjectsSection`, `SkillsSection`, `ServicesSection`, e os pontos que leem `userData`) passam a importar o JSON correspondente e ler `campo[i18n.language]` em vez de `t("chave")`.

**Skills — ícones:** o campo `icon` de cada skill no JSON armazena uma **string identificadora** (ex: `"SiReact"`), não o componente React. Um mapa fixo `iconMap: Record<string, ElementType>` no código do frontend (mantendo a lista atual de ícones já importados de `react-icons/si` e `fa6`) resolve a string pro componente na hora de renderizar. O `/admin` oferece um `<select>` com essa mesma lista de nomes — não permite ícone arbitrário, evitando ter que resolver upload/import dinâmico de ícones.

**Projetos — imagens/vídeos:** continuam fora do escopo do `/admin` nesta primeira versão. O campo `image`/`video` no JSON guarda o caminho do asset (ex: `/assets/projectsImages/voogle.png`), e adicionar um projeto novo com mídia nova ainda exige um commit de código manual para incluir o arquivo em `src/assets/`. O `/admin` permite editar todos os outros campos de um projeto existente, e criar projetos novos referenciando assets já existentes no repositório.

**Currículo (PDF):** único upload binário suportado. Handled à parte (ver 3.3).

### 3.2 Autenticação

- Senha única, guardada em variável de ambiente da Vercel (`ADMIN_PASSWORD`), nunca exposta ao client.
- `POST /api/admin/login` recebe a senha, compara (comparação de tempo constante), e se correta emite um cookie `httpOnly`, `secure`, `sameSite=strict` contendo um JWT assinado com `ADMIN_JWT_SECRET` (outra env var), validade de 12 horas.
- Toda rota de escrita (`PUT /api/admin/data/[resource]`, `POST /api/admin/upload-resume`) valida esse cookie antes de prosseguir; sem cookie válido, responde 401.
- Rate limiting simples no endpoint de login: bloquear IP após 5 tentativas incorretas em 15 minutos (contador em memória da function é aceitável dado o baixo tráfego esperado; reinicia a cada cold start, o que é uma limitação conhecida e aceita para este caso de uso).
- `GET /api/admin/data/[resource]` (leitura para popular os formulários) também exige o cookie — os dados em si já são públicos no site, mas a rota de admin não expõe nada além disso.

### 3.3 Endpoints (Vercel serverless functions, `portifolio/api/admin/`)

- `POST /api/admin/login` — `{ password }` → seta cookie de sessão ou 401.
- `POST /api/admin/logout` — limpa o cookie.
- `GET /api/admin/data/:resource` — retorna o JSON atual do recurso (lido via GitHub Contents API, sempre a versão mais recente da `main`, evitando servir uma cópia em cache desatualizada do bundle).
- `PUT /api/admin/data/:resource` — recebe o array completo atualizado do recurso, faz commit no GitHub sobrescrevendo `src/data/json/<resource>.json`.
- `POST /api/admin/upload-resume` — recebe o PDF como base64, comita substituindo `src/assets/curriculo.pdf`.

`resource` ∈ `{ experiences, projects, skills, services, user }`.

A integração com o GitHub usa um Personal Access Token (`GITHUB_TOKEN`, escopo `repo`, restrito a este repositório) guardado como env var da Vercel, e a GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`) para criar cada commit — que exige o SHA do blob atual, obtido via `GET` do mesmo endpoint antes de escrever (evita sobrescrever mudanças concorrentes de forma silenciosa; um conflito de SHA retorna erro que a UI exibe como "os dados mudaram, recarregue e tente de novo").

### 3.4 Frontend `/admin`

Novas páginas em `src/pages/admin/`, roteadas via `react-router-dom` (já em uso):
- `/admin/login` — formulário de senha.
- `/admin` — dashboard com navegação para as 5 seções.
- Uma view de lista + formulário de criar/editar por recurso, reaproveitando componentes MUI já usados no restante do site (mesma linguagem visual, sem introduzir nova lib de UI).
- Campos de texto bilíngues (role, description, etc.) exibidos como dois campos lado a lado (PT / EN) no mesmo formulário.
- Acesso a `/admin` sem sessão válida redireciona para `/admin/login` (checagem client-side apenas para UX; a autorização real acontece nas API routes).

**Critério de pronto:**
- Login com a senha correta concede acesso; senha errada nega.
- Criar/editar/excluir um item em cada uma das 5 categorias resulta em um commit visível no GitHub e a mudança aparece no site após o redeploy automático da Vercel.
- Upload de um novo currículo substitui o PDF servido pelo site.
- O site público (fora do `/admin`) continua funcionando exatamente como hoje — mesma navegação, sem chamadas de API novas para visitantes comuns, apenas lendo os JSONs em build-time.
- Trocar entre pt/en no site público mostra corretamente os textos bilíngues vindos dos novos JSONs.

## Fora de escopo (explicitamente adiado)

- Conserto do backend Python/chat — decidido remover a UI em vez de consertar.
- Upload de imagens/vídeos de projetos pelo `/admin` — mídia de projetos continua sendo adicionada via código.
- Upload de ícones arbitrários para skills — restrito à lista de ícones já presente no código.
- Revisão via Pull Request antes do deploy — commits vão direto para `main`.

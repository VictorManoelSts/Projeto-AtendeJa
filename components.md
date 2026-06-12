# AtendeJá — componentes

Padrões visuais e de comportamento. Tokens em `design.md`.
Paleta: Slate neutro — tema claro fixo, sidebar escura.

---

## Layout geral

Todas as áreas internas (exceto login) seguem o mesmo layout:

```
┌──────────────────────────────────────────────┐
│  Sidebar (240px, fixa, fundo #0F172A)         │
│  ──────────────────────────────────────────   │
│  Logo · Avatar · Links · Logout               │
├──────────────────────────────────────────────┤
│  Conteúdo (flex: 1, fundo --color-bg-page)   │
│  padding: --space-8                           │
└──────────────────────────────────────────────┘
```

---

## Sidebar

Fundo fixo `#0F172A` — não usar variável de tema aqui.

| Elemento | Estilo |
|---|---|
| Container | `width: 240px`, `background: #0F172A`, `border-right: 0.5px solid #1E293B` |
| Logo | `color: #CBD5E1`, `font-size: --text-base`, `font-weight: --font-bold` |
| Avatar | círculo 36px, `background: #1E293B`, `color: #94A3B8`, iniciais em `--font-bold` |
| Nome do usuário | `color: #E2E8F0`, `font-size: --text-xs` |
| Perfil do usuário | `color: #64748B`, `font-size: --text-xs` |
| Link inativo | `color: #64748B`, ícone Lucide 16px |
| Link ativo | `background: #1E293B`, `color: #CBD5E1`, `border-right: 2px solid #94A3B8` |
| Logout | `color: #475569`, ícone LogOut |

---

## Tela de login

| Elemento | Estilo |
|---|---|
| Fundo externo | `background: #E2E8F0` |
| Card | `background: #F8FAFC`, `border: 0.5px solid #CBD5E1`, `border-radius: --radius-lg` |
| Logo | `color: #1E293B`, `font-size: --text-lg`, `font-weight: --font-bold` |
| Subtítulo | `color: #64748B`, `font-size: --text-xs` |
| Inputs | fundo branco, borda `#E2E8F0` — ver fix de autofill em `design.md` |
| Botão entrar | `background: #1E293B`, `color: #FFFFFF`, `width: 100%` |
| Links | `color: #475569`, `font-size: --text-xs` |

**Regra crítica:** sempre usar o fix de autofill em todos os inputs de login:
```css
-webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
-webkit-text-fill-color: #1E293B !important;
```

---

## Cards

### Card padrão
- `background: #FFFFFF`
- `border: 0.5px solid #E2E8F0`
- `border-radius: --radius-lg`
- `padding: --space-4 --space-6`

### Card de métrica (dashboard)
- `background: #FFFFFF`
- `border: 0.5px solid #E2E8F0`
- `border-radius: --radius-md`
- `padding: --space-2 --space-3`
- Label: `--text-xs`, `#64748B`
- Valor: `--text-2xl`, `--font-bold`, `#1E293B`
- Sublabel: `--text-xs`, `#94A3B8`

### Card de próximo paciente (médico)
- `background: #FFFFFF`
- `border: 0.5px solid #E2E8F0`
- `border-left: 3px solid #1E293B`
- `border-radius: 0 --radius-md --radius-md 0`

---

## Botões

### Primário
- `background: #1E293B` | hover: `#0F172A`
- `color: #FFFFFF`
- `border: none`
- `border-radius: --radius-md`
- `padding: --space-2 --space-4`
- `font-size: --text-sm`, `font-weight: --font-medium`

### Secundário / outline
- `background: #FFFFFF` | hover: `#F8FAFC`
- `border: 0.5px solid #E2E8F0`
- `color: #334155`
- `border-radius: --radius-md`

### Destrutivo
- `background: #FFFFFF`
- `border: 0.5px solid #FECACA`
- `color: #DC2626`

---

## Badges

`border-radius: --radius-full`, `padding: 2px 8px`, `font-size: --text-xs`, `font-weight: --font-medium`

| Variante      | Fundo          | Texto     |
|---------------|----------------|-----------|
| neutral       | `#F1F5F9`      | `#475569` |
| success       | `#DCFCE7`      | `#15803D` |
| warning       | `#FEF9C3`      | `#854D0E` |
| danger        | `#FEE2E2`      | `#B91C1C` |
| orange        | `#FFEDD5`      | `#9A3412` |

---

## Pulseiras — protocolo Manchester

Círculo 12px + label. Cores fixas — usar `--color-pulseira-{1-5}`.
**Nunca parametrizar as cores das pulseiras.**

| Nível | Cor do círculo | Badge fundo | Badge texto |
|---|---|---|---|
| 1 — Emergência | `#DC2626` | `#FEE2E2` | `#B91C1C` |
| 2 — Muito urgente | `#EA580C` | `#FFEDD5` | `#9A3412` |
| 3 — Urgente | `#CA8A04` | `#FEF9C3` | `#854D0E` |
| 4 — Pouco urgente | `#16A34A` | `#DCFCE7` | `#15803D` |
| 5 — Não urgente | `#475569` | `#F1F5F9` | `#475569` |

---

## Senha de fila

- `font-family: --font-mono`
- `font-size: --text-2xl`
- `font-weight: --font-bold`
- `color: #1E293B`
- `letter-spacing: 0.05em`

---

## Inputs e formulários

- Label: `--text-xs`, `--font-medium`, `#334155`, `margin-bottom: --space-1`
- Input: `background: #FFFFFF`, `border: 0.5px solid #E2E8F0`, `border-radius: --radius-md`, `padding: --space-1 --space-2`, `color: #1E293B`
- Input focus: `border-color: #1E293B`, sem outline
- Mensagem de erro: `--text-xs`, `#DC2626`, `margin-top: --space-1`
- Todo input deve ter `<label>` via `htmlFor`
- Aplicar sempre o fix de autofill do `design.md`

---

## Tabelas

- `background: #FFFFFF`
- Header: `background: #F8FAFC`, texto `#64748B`, `font-size: --text-xs`, `font-weight: --font-bold`
- Células: `padding: --space-2 --space-3`, `color: #1E293B`, `border-bottom: 0.5px solid #F1F5F9`
- Linha SLA preventivo (80%): `background: #FFFBEB`
- Última linha sem borda inferior

---

## Status da fila

| Status | Badge fundo | Badge texto |
|---|---|---|
| AGUARDANDO | `#F1F5F9` | `#475569` |
| CHAMADO | `#FEF9C3` | `#854D0E` |
| EM_ATENDIMENTO | `#DCFCE7` | `#15803D` |
| FINALIZADO | `#F1F5F9` | `#94A3B8` |
| CANCELADO | `#F1F5F9` | `#94A3B8` |
| AUSENTE | `#FEE2E2` | `#B91C1C` |

---

## Alertas de SLA

**Preventivo (80% do tempo):** linha da tabela com `background: #FFFBEB`, ícone AlertTriangle + tempo em `#CA8A04`.

**Crítico (SLA excedido):** card com `border-left: 3px solid #DC2626`, label "Excedido" em `#DC2626`.

Em ambos: `role="alert"` para acessibilidade.

---

## Barras de ocupação de fila

- Container: `background: #F1F5F9`, `height: 5px`, `border-radius: --radius-full`
- Preenchimento normal (< 80%): `background: #334155`
- Preenchimento em alerta (≥ 80%): `background: #CA8A04`
- Preenchimento crítico (emergência): `background: #DC2626`

---

## Acessibilidade

- Ícones decorativos: `aria-hidden="true"`
- Botões sem texto: `aria-label` descritivo
- Inputs: sempre com `<label>` via `htmlFor`
- Alertas de SLA e erros: `role="alert"`
- Contraste mínimo 4.5:1 — garantido pelos tokens acima

---

## Responsividade

### Breakpoints

| Nome | Largura | Contexto |
|---|---|---|
| `sm` | ≥ 640px | Celular landscape |
| `md` | ≥ 768px | Tablet portrait |
| `lg` | ≥ 1024px | Tablet landscape / notebook pequeno |
| `xl` | ≥ 1280px | Desktop padrão |

Usar Tailwind com prefixos de breakpoint: `sm:`, `md:`, `lg:`, `xl:`.

---

### Layout por breakpoint

**Mobile (< 768px)**
- Sidebar vira gaveta (drawer) oculta por padrão, aberta via botão hamburguer no topo
- Header fixo com logo, hamburguer e sino de notificações
- Conteúdo ocupa 100% da largura
- Padding reduzido: `--space-4` lateral

**Tablet (768px – 1023px)**
- Sidebar recolhida: apenas ícones, sem labels (width: 56px)
- Hover no ícone exibe tooltip com o nome do item
- Grid de métricas: 2 colunas

**Desktop (≥ 1024px)**
- Sidebar expandida com ícones + labels (width: 240px)
- Grid de métricas: 3 colunas
- Tabelas exibem todas as colunas

---

### Sidebar responsiva

```jsx
// Mobile: drawer
<aside className="
  fixed inset-y-0 left-0 z-50 w-64
  transform -translate-x-full md:translate-x-0
  transition-transform duration-200
  bg-[#0F172A]
">

// Tablet: apenas ícones
<aside className="
  w-14 lg:w-60
  bg-[#0F172A]
">
  <span className="hidden lg:inline">Dashboard</span>
```

**Overlay mobile:** ao abrir o drawer, exibir fundo semitransparente `rgba(0,0,0,0.4)` cobrindo o conteúdo. Clicar fora fecha a sidebar.

---

### Header mobile

Visível apenas em telas `< md`. Altura 52px, fundo `#0F172A`.

```jsx
<header className="
  md:hidden fixed top-0 left-0 right-0 h-[52px]
  bg-[#0F172A] border-b border-[#1E293B]
  flex items-center justify-between px-4 z-40
">
  <button aria-label="Abrir menu">☰</button>
  <span>AtendeJá</span>
  <button aria-label="Notificações">🔔</button>
</header>
```

O conteúdo principal deve ter `padding-top: 52px` em mobile para não ficar atrás do header.

---

### Grids responsivos

**Métricas do dashboard:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
```

**Vitais da triagem:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

**Cards administrativos:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
```

---

### Tabelas responsivas

Em mobile e tablet, tabelas com muitas colunas devem rolar horizontalmente:

```jsx
<div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
  <table className="min-w-[600px] w-full">
```

Colunas a esconder em telas menores (prioridade de exibição):

| Coluna | Mobile | Tablet | Desktop |
|---|---|---|---|
| Senha | ✅ | ✅ | ✅ |
| Paciente | ✅ | ✅ | ✅ |
| Status | ✅ | ✅ | ✅ |
| Espera | ❌ | ✅ | ✅ |
| Prioridade | ❌ | ❌ | ✅ |
| Ações | ✅ | ✅ | ✅ |

```jsx
<th className="hidden md:table-cell">Espera</th>
<th className="hidden lg:table-cell">Prioridade</th>
```

---

### Formulários responsivos

Em mobile: todos os campos em coluna única.
Em tablet+: campos curtos (temperatura, pressão) em 2 colunas.

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label>Temperatura</label>
    <input type="text" />
  </div>
  <div>
    <label>Pressão arterial</label>
    <input type="text" />
  </div>
</div>
```

---

### Tela de login responsiva

- Mobile: card ocupa `width: 100%`, padding lateral `--space-4`
- Tablet+: card fixo em `max-width: 380px`, centralizado
- Fundo externo `#E2E8F0` em todos os tamanhos

```jsx
<div className="min-h-screen bg-[#E2E8F0] flex items-center justify-center p-4">
  <div className="w-full max-w-sm bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] p-6">
```

---

### Fila do paciente responsiva

- Mobile: FilaCard ocupa largura total, senha em destaque centralizada
- Tablet+: card centralizado com `max-width: 420px`

---

### Regras gerais

- Nunca usar `px` fixo para larguras de layout — usar `%`, `fr`, ou classes Tailwind responsivas
- `min-width: 0` em filhos de grid/flex para evitar overflow
- Testar sempre em 375px (iPhone SE), 768px (iPad) e 1280px (desktop padrão)
- Touch targets mínimos: 44px de altura em botões e links de navegação mobile

/* AtendeJá — design tokens */
/* Arquivo: src/styles/tokens.css  */
/* Paleta: Slate neutro + sidebar escura */

:root {

  /* Cor principal — Slate */
  --color-primary:       #1E293B;
  --color-primary-dark:  #0F172A;
  --color-primary-light: #475569;
  --color-primary-bg:    #F1F5F9;

  /* Fundos */
  --color-bg-page:       #F8FAFC;
  --color-bg-surface:    #F1F5F9;
  --color-bg-white:      #FFFFFF;
  --color-bg-login:      #E2E8F0;

  /* Bordas */
  --color-border:        #E2E8F0;
  --color-border-strong: #CBD5E1;

  /* Textos */
  --color-text-muted:     #94A3B8;
  --color-text-secondary: #64748B;
  --color-text-primary:   #334155;
  --color-text-heading:   #1E293B;
  --color-text-dark:      #0F172A;

  /* Sidebar escura (fixo — não usar em outras áreas) */
  --color-sidebar-bg:          #0F172A;
  --color-sidebar-border:      #1E293B;
  --color-sidebar-item-active: #1E293B;
  --color-sidebar-text-active: #CBD5E1;
  --color-sidebar-text:        #64748B;
  --color-sidebar-bar:         #94A3B8;
  --color-sidebar-logo:        #CBD5E1;
  --color-sidebar-avatar-bg:   #1E293B;
  --color-sidebar-avatar-text: #94A3B8;
  --color-sidebar-logout:      #475569;

  /* Semânticas */
  --color-success:     #16A34A;
  --color-success-bg:  #DCFCE7;
  --color-success-text:#15803D;
  --color-warning:     #CA8A04;
  --color-warning-bg:  #FEF9C3;
  --color-warning-text:#854D0E;
  --color-danger:      #DC2626;
  --color-danger-bg:   #FEE2E2;
  --color-danger-text: #B91C1C;
  --color-orange:      #EA580C;
  --color-orange-bg:   #FFEDD5;
  --color-orange-text: #9A3412;

  /* Pulseiras — protocolo Manchester (NÃO ALTERAR) */
  --color-pulseira-1:  #DC2626; /* vermelho  — emergência     */
  --color-pulseira-2:  #EA580C; /* laranja   — muito urgente  */
  --color-pulseira-3:  #CA8A04; /* âmbar     — urgente        */
  --color-pulseira-4:  #16A34A; /* verde     — pouco urgente  */
  --color-pulseira-5:  #475569; /* slate     — não urgente    */

  /* Pulseiras — fundos de badge */
  --color-pulseira-1-bg: #FEE2E2;
  --color-pulseira-2-bg: #FFEDD5;
  --color-pulseira-3-bg: #FEF9C3;
  --color-pulseira-4-bg: #DCFCE7;
  --color-pulseira-5-bg: #F1F5F9;

  /* Tipografia */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 15px;
  --text-lg:   18px;
  --text-xl:   22px;
  --text-2xl:  28px;

  --font-normal: 400;
  --font-medium: 500;
  --font-bold:   600;

  /* Bordas e raios */
  --border-width: 0.5px;
  --radius-sm:    6px;
  --radius-md:    8px;
  --radius-lg:    12px;
  --radius-full:  9999px;

  /* Espaçamento */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
}

/* Fix obrigatório para inputs — previne autofill escuro do browser */
input, textarea, select {
  background-color: #FFFFFF !important;
  color: #1E293B !important;
  -webkit-text-fill-color: #1E293B !important;
  -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
  box-shadow: 0 0 0 1000px #FFFFFF inset !important;
}

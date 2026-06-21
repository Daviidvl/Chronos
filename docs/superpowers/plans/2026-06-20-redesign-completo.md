# Chronos — Redesign Completo

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task.

**Goal:** Repaginar completamente o Chronos para uso pessoal — premium, sem emojis, sem cara de IA, intuitivo.

**Architecture:** 6-page nav (Hoje/Agenda/Tarefas/Hábitos/Metas/Insights). Today = tasks first → habits compact → next event. Design token refinado, active state por borda esquerda, sem gamificação visível.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, Framer Motion, Zustand persist.

## Global Constraints
- Zero emojis em qualquer arquivo
- Acento `#5E6AD2` usado APENAS em: estado ativo nav, botão primário, progress fills
- Sem gradientes em cards, sem glow, sem sombras coloridas
- Inline styles apenas quando Tailwind não cobre (ex: CSS vars)
- max-w-2xl nas páginas, coluna única
- ptBR locale em todas as datas

---

### Task 1: globals.css — tokens refinados
**Modify:** `app/globals.css`

- [ ] Atualizar tokens: bg-base #0A0A0B, bg-elevated #111113, text-secondary #6B7280, text-tertiary #3D4050
- [ ] Remover: .gradient-text, .glow-accent, .accent-gradient, .bg-cat-*, .cat-*
- [ ] Adicionar: --bg-card: #161618, --radius-xs: 4px
- [ ] Commit: `refactor: refine design tokens`

### Task 2: Sidebar — left border active state, sem LevelBadge
**Modify:** `components/layout/Sidebar.tsx`

- [ ] Remover LevelBadge component e imports (Zap)
- [ ] Novo NAV_ITEMS: Hoje/Agenda/Tarefas/Hábitos/Metas/Insights
- [ ] Active state: sem bg, só text-primary + barra 2px esquerda accent
- [ ] Commit: `refactor: sidebar clean nav`

### Task 3: Today page — tasks first, habits compact, next event
**Modify:** `app/(app)/today/page.tsx`
**Modify:** `components/dashboard/TodayHabits.tsx`

- [ ] Reescrever página: header (date + greeting sem emoji), tarefas, hábitos, próximo evento
- [ ] Remover: DayStats, StreakCard (emoji), ReflectionCard, ActiveGoals
- [ ] Commit: `feat: today page redesign`

### Task 4: Tasks page — grupos em vez de tabs
**Modify:** `app/(app)/tasks/page.tsx`

- [ ] Remover tabs (4 abas → 3 grupos: Hoje / Esta semana / Mais tarde)
- [ ] Concluídas: seção colapsável ao final
- [ ] Add task: campo sempre visível no topo
- [ ] Commit: `feat: tasks page redesign`

### Task 5: Habits page + HabitCard sem emojis
**Modify:** `app/(app)/habits/page.tsx`
**Modify:** `components/habits/HabitCard.tsx`
**Modify:** `components/habits/AddHabitModal.tsx`
**Modify:** `lib/store/useHabitsStore.ts`

- [ ] Substituir emoji icons por dot colorido (cor da categoria)
- [ ] HabitCard → HabitRow simplificado: dot + nome + checkbox hoje + 7 pontos
- [ ] AddHabitModal: remover emoji picker, usar color picker de categoria
- [ ] Seed data: remover emoji do campo icon, usar abreviação 2 letras
- [ ] Commit: `feat: habits redesign no-emoji`

### Task 6: Goals page — sem emojis, cards limpos
**Modify:** `app/(app)/goals/page.tsx`

- [ ] Remover CATEGORY_ICONS de todos os cards e cabeçalhos
- [ ] GoalCard: sem icon box, título + progress bar + days remaining
- [ ] Commit: `feat: goals page redesign`

### Task 7: Calendar/Agenda — week view padrão
**Modify:** `app/(app)/calendar/page.tsx`

- [ ] Default view: 'week' em vez de 'day'
- [ ] Week header: mostrar 7 dias com dot de eventos
- [ ] Limpar event blocks (remover borderLeft colorido excessivo → só left border sutil)
- [ ] Commit: `feat: calendar week-first redesign`

### Task 8: Insights page — sem emojis, texto limpo
**Modify:** `app/(app)/insights/page.tsx`

- [ ] Remover emoji icons de todos os insights
- [ ] Substituir por: barra colorida esquerda (2px) + tipo de insight
- [ ] Adicionar mini sumário semanal de hábitos sem emoji
- [ ] Commit: `feat: insights redesign no-emoji`

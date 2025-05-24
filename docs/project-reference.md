# Bolão da Sorte - Referência do Projeto

## Visão Geral

Bolão da Sorte é uma aplicação web para gerenciar bolões de loterias. Usuários podem criar, administrar e participar de bolões para diferentes modalidades de loteria, como Mega-Sena, Lotofácil, Quina, entre outras.

---

## 1. Arquitetura Visual e Fluxo de Dados

**Frontend:**
- React + TypeScript (Vite)
- Tailwind CSS + shadcn/ui
- React Router v6
- Context API para autenticação e estados globais
- Toast notifications para feedback

**Backend:**
- Supabase (PostgreSQL, Auth, RLS)
- Supabase JS Client para integração

**Fluxo Resumido:**
1. Usuário acessa o frontend, faz login (Supabase Auth)
2. Frontend consome dados via Supabase Client (respeitando RLS)
3. Dados trafegam entre frontend e banco via API do Supabase
4. Políticas RLS garantem que cada usuário só veja/edite o que pode

---

## 2. Estrutura de Dados e Relacionamentos

### Tabelas Principais

#### `pools` (Bolões)
- `id`: UUID (PK)
- `name`: TEXT
- `lottery_type`: TEXT (megasena, lotofacil, etc.)
- `draw_date`: TIMESTAMP
- `num_tickets`: INTEGER
- `max_participants`: INTEGER
- `contribution_amount`: NUMERIC
- `admin_id`: UUID (FK para profiles)
- `status`: TEXT ('ativo', 'finalizado')
- `created_at`: TIMESTAMP

#### `participants` (Participantes)
- `id`: UUID (PK)
- `user_id`: UUID (FK para profiles, pode ser NULL)
- `pool_id`: UUID (FK para pools)
- `name`: TEXT
- `email`: TEXT
- `status`: TEXT ('confirmado', 'pago', 'pendente')
- `created_at`: TIMESTAMP

#### `tickets` (Bilhetes)
- `id`: UUID (PK)
- `pool_id`: UUID (FK para pools)
- `ticket_number`: TEXT
- `numbers`: INTEGER[]
- `created_at`: TIMESTAMP

#### `profiles` (Perfis)
- `id`: UUID (PK, referencia auth.users)
- `name`: TEXT
- `email`: TEXT
- `created_at`: TIMESTAMP

**Relacionamentos:**
- Um pool tem vários participantes e bilhetes
- Participante pode ou não estar vinculado a um usuário (user_id pode ser NULL)
- Bilhete pertence a um pool

---

## 3. Fluxos Principais (Exemplos)

### Criação de Bolão
1. Usuário logado acessa "Criar Novo Bolão"
2. Preenche nome, tipo, data, valor, etc.
3. Submete formulário
4. Backend cria pool, define admin_id e adiciona usuário como participante

### Adição de Participante
1. Admin acessa detalhes do bolão
2. Clica em "Adicionar Participante", preenche nome/email
3. Participante é criado com status 'pendente', user_id NULL
4. Lista de participantes é atualizada (timeout de 500ms pode ser necessário)

### Confirmação de Participante
1. Admin clica em "Confirmar" ao lado do participante
2. Status é atualizado para 'confirmado'
3. Participante pode ser vinculado a um usuário posteriormente (quando aceitar convite)

### Adição de Bilhete
1. Admin acessa aba "Bilhetes" do bolão
2. Clica em "Adicionar Bilhete", seleciona números
3. Bilhete é criado e vinculado ao pool

---

## 4. Padrão Visual e Experiência do Usuário

- **Containers e cards são sempre neutros** (ex: `bg-card`, `bg-white`).
- **Apenas as bolas dos números dos bilhetes e resultados recebem cor temática** (verde, azul, etc.), conforme o tipo de loteria.
- **Efeitos de hover:**
  - Apenas em tabelas de participantes e listas, usando `hover:bg-muted/20`.
  - Não usar hover em cards de resultados, estatísticas ou containers principais.
- **Feedback visual imediato:** Toasts para sucesso, erro e loading.
- **Consistência visual:** Siga o padrão para evitar divergências e facilitar o onboarding.

---

## 5. Exemplos Visuais

### Bilhete de Mega-Sena (bolas verdes)
```jsx
<LotteryNumbers type="megasena" numbers={[5, 12, 23, 34, 45, 56]} />
// Todas as bolas aparecem verdes
```

### Bilhete de Quina (bolas azuis)
```jsx
<LotteryNumbers type="quina" numbers={[7, 14, 21, 28, 35]} />
// Todas as bolas aparecem azuis
```

### Resultado com acertos destacados
```jsx
<LotteryNumbers type="megasena" numbers={[5, 12, 23, 34, 45, 56]} winningNumbers={[5, 23, 56]} />
// Bolas acertadas ficam coloridas, as demais ficam neutras
```

---

## 6. Glossário de Termos e Entidades

- **Bolão (Pool):** Grupo organizado para apostar em conjunto
- **Participante:** Pessoa convidada ou inscrita em um bolão
- **Bilhete (Ticket):** Aposta registrada com números escolhidos
- **Admin:** Usuário que criou e gerencia o bolão
- **Status:** Estado do participante ou bolão (pendente, confirmado, pago, ativo, finalizado)
- **RLS:** Row Level Security, política de acesso por linha no banco

---

## 7. Recomendações para Extensões Futuras

- Sistema de convites por email
- Página de aceitação de convites
- Integração com APIs de resultados de loteria
- Geração de relatórios/exportação
- Integração de pagamentos
- Estatísticas e dashboards

---

## 8. Checklist para Onboarding de Novos Devs

- [ ] Leu este documento e o developer-guidelines.md?
- [ ] Conseguiu rodar o projeto localmente?
- [ ] Entendeu os fluxos principais?
- [ ] Sabe como testar políticas RLS?
- [ ] Sabe como converter dados do Supabase para camelCase?
- [ ] Sabe onde ficam os componentes principais?
- [ ] Validou entradas e tratou erros?
- [ ] Seguiu o padrão visual (containers neutros, cor só nas bolas)?

---

## 9. Observações sobre Versionamento e Migrações

- Use migrations do Supabase para alterar o banco
- Sempre teste migrações em ambiente de desenvolvimento
- Documente mudanças de schema neste arquivo
- Evite alterações destrutivas sem backup

---

## 10. Checklist Visual para PRs

- [ ] Containers e cards estão neutros?
- [ ] Apenas as bolas dos números estão coloridas?
- [ ] Efeitos de hover apenas em tabelas?
- [ ] Feedback visual para todas as ações?
- [ ] Conversão de dados snake_case para camelCase?
- [ ] Documentação atualizada?

---

## 11. Referências Rápidas

- [Supabase Docs](https://supabase.com/docs)
- [React + TypeScript Cheatsheets](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

---

Este documento serve como referência viva do projeto. Atualize sempre que houver mudanças relevantes!

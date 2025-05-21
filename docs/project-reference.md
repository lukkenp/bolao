# Bolão da Sorte - Referência do Projeto

## Visão Geral

Bolão da Sorte é uma aplicação web para gerenciar bolões de loterias. A plataforma permite que usuários criem e participem de bolões para diferentes modalidades de loteria, como Mega-Sena, Lotofácil, Quina, entre outras.

## Arquitetura

### Frontend
- **Framework**: React com TypeScript
- **Build Tool**: Vite
- **Estilo**: Tailwind CSS com shadcn/ui
- **Roteamento**: React Router v6
- **Gerenciamento de Estado**: React Context API (AuthContext)
- **Notificações**: Toast notifications
- **Ícones**: Lucide React

### Backend
- **Banco de Dados**: PostgreSQL via Supabase
- **Autenticação**: Supabase Auth
- **Segurança**: Row Level Security (RLS)
- **API**: Supabase JavaScript Client

## Estrutura de Dados

### Tabelas no Supabase

#### 1. `pools` (Bolões)
- `id`: UUID (chave primária)
- `name`: TEXT (nome do bolão)
- `lottery_type`: TEXT (tipo de loteria)
- `draw_date`: TIMESTAMP (data do sorteio)
- `num_tickets`: INTEGER (número de bilhetes)
- `max_participants`: INTEGER (máximo de participantes)
- `contribution_amount`: NUMERIC (valor da contribuição)
- `admin_id`: UUID (ID do administrador)
- `status`: TEXT (status do bolão: 'ativo' ou 'finalizado')
- `created_at`: TIMESTAMP (data de criação)

#### 2. `participants` (Participantes)
- `id`: UUID (chave primária)
- `user_id`: UUID (ID do usuário, pode ser NULL para convites pendentes)
- `pool_id`: UUID (ID do bolão)
- `name`: TEXT (nome do participante)
- `email`: TEXT (email do participante)
- `status`: TEXT (status do pagamento: 'confirmado', 'pago' ou 'pendente')
- `created_at`: TIMESTAMP (data de criação)

#### 3. `tickets` (Bilhetes)
- `id`: UUID (chave primária)
- `pool_id`: UUID (ID do bolão)
- `ticket_number`: TEXT (número do bilhete)
- `numbers`: INTEGER[] (números escolhidos, array de inteiros)
- `created_at`: TIMESTAMP (data de criação)

#### 4. `profiles` (Perfis)
- `id`: UUID (chave primária, referencia auth.users)
- `name`: TEXT (nome do usuário)
- `email`: TEXT (email do usuário)
- `created_at`: TIMESTAMP (data de criação)

## Tipos de Loteria

A aplicação suporta os seguintes tipos de loteria:
- Mega-Sena (`megasena`): 6 números de 1 a 60
- Lotofácil (`lotofacil`): 15 números de 1 a 25
- Quina (`quina`): 5 números de 1 a 80
- Lotomania (`lotomania`): 50 números de 1 a 100
- Timemania (`timemania`): 10 números de 1 a 80
- Dupla Sena (`duplasena`): 6 números de 1 a 50

## Políticas de Segurança (RLS)

Para garantir segurança dos dados, as seguintes políticas são implementadas:

### Pools (Bolões)
- **SELECT**: Usuários podem ver apenas bolões que administram
  ```sql
  CREATE POLICY "RLS: pools_select" ON public.pools
  FOR SELECT TO authenticated USING (admin_id = auth.uid());
  ```
- **INSERT**: Usuários podem criar bolões, definindo-se como administradores
  ```sql
  CREATE POLICY "Usuários podem criar bolões" ON public.pools
  FOR INSERT WITH CHECK (auth.uid() = admin_id);
  ```
- **UPDATE/DELETE**: Apenas o administrador pode modificar ou deletar seus bolões
  ```sql
  CREATE POLICY "Usuários admins podem atualizar seus bolões" ON public.pools
  FOR UPDATE USING (auth.uid() = admin_id);
  ```

### Participants (Participantes)
- **SELECT**: Administradores podem ver participantes dos seus bolões
  ```sql
  CREATE POLICY "RLS: participants_select_admin" ON public.participants
  FOR SELECT USING (pool_id IN (SELECT id FROM pools WHERE admin_id = auth.uid()));
  ```
- **SELECT para o próprio usuário**: Usuários podem ver participações onde eles são o participante
  ```sql
  CREATE POLICY "RLS: participants_select_own" ON public.participants
  FOR SELECT USING (user_id = auth.uid());
  ```
- **INSERT**: Usuários podem adicionar participantes em bolões que administram
  ```sql
  CREATE POLICY "Permitir adicionar participantes" ON public.participants
  FOR INSERT WITH CHECK (pool_id IN (SELECT id FROM pools WHERE admin_id = auth.uid()));
  ```
- **UPDATE**: Apenas administradores podem atualizar o status dos participantes
  ```sql
  CREATE POLICY "Atualizar status de participantes" ON public.participants
  FOR UPDATE USING (pool_id IN (SELECT id FROM pools WHERE admin_id = auth.uid()));
  ```
- **UPDATE próprio**: Usuários podem atualizar sua própria participação (para aceitar convites)
  ```sql
  CREATE POLICY "Usuários podem aceitar convites" ON public.participants
  FOR UPDATE USING (email = auth.jwt() -> 'email')
  WITH CHECK (email = auth.jwt() -> 'email');
  ```

### Tickets (Bilhetes)
- **SELECT**: Administradores podem ver os bilhetes dos seus bolões
  ```sql
  CREATE POLICY "RLS: tickets_select" ON public.tickets
  FOR SELECT USING (pool_id IN (SELECT id FROM pools WHERE admin_id = auth.uid()));
  ```
- **SELECT para participantes**: Participantes podem ver os bilhetes dos bolões onde participam
  ```sql
  CREATE POLICY "RLS: tickets_select_participant" ON public.tickets
  FOR SELECT USING (
    pool_id IN (
      SELECT pool_id FROM participants 
      WHERE user_id = auth.uid() AND status IN ('confirmado', 'pago')
    )
  );
  ```
- **INSERT**: Administradores podem adicionar bilhetes aos seus bolões
  ```sql
  CREATE POLICY "Permitir adicionar bilhetes" ON public.tickets
  FOR INSERT WITH CHECK (pool_id IN (SELECT id FROM pools WHERE admin_id = auth.uid()));
  ```

## Fluxos Principais

### Criação de Bolão
1. Usuário autentica na plataforma
2. Acessa o Dashboard ou Meus Bolões
3. Clica em "Criar Novo Bolão"
4. Preenche informações como nome, tipo de loteria, data do sorteio, etc.
5. Submete o formulário
6. Sistema cria o bolão e adiciona o usuário como administrador e participante

### Gerenciamento de Participantes
1. O administrador acessa a página de detalhes do bolão
2. Na aba "Participantes", clica em "Adicionar Participante"
3. Preenche o nome e email do novo participante
4. Sistema adiciona o participante com status "pendente"
5. O administrador pode confirmar participantes pendentes com o botão "Confirmar"

### Gerenciamento de Bilhetes
1. O administrador acessa a página de detalhes do bolão
2. Na aba "Bilhetes", clica em "Adicionar Bilhete"
3. Seleciona os números do bilhete ou clica em "Números Aleatórios"
4. Sistema registra o bilhete com um número único

### Visualização de Resultados
1. Usuário acessa página de resultados
2. Seleciona tipo de loteria e número do concurso
3. Sistema exibe o resultado do sorteio

## Componentes Principais

### Componentes de Participantes
- `ParticipantList`: Exibe a lista de participantes de um bolão
  - Propriedades:
    - `participants`: Array de participantes
    - `isAdmin`: Se o usuário atual é admin do bolão
    - `onParticipantUpdated`: Callback para atualização

- `AddParticipantForm`: Formulário para adicionar novos participantes
  - Propriedades:
    - `poolId`: ID do bolão
    - `onParticipantAdded`: Callback após adição bem-sucedida
  - Implementação:
    - Adiciona participantes com status 'pendente'
    - Define `user_id` como NULL inicialmente
    - Usa timeout para garantir atualização da lista

- `ConfirmParticipant`: Botão para confirmar a participação de um usuário
  - Propriedades:
    - `participantId`: ID do participante
    - `participantName`: Nome para feedback
    - `onConfirmed`: Callback após confirmação
  - Implementação:
    - Atualiza o status para 'confirmado'
    - Mostra feedback visual durante a operação

### Componentes de Loteria
- `LotteryNumbers`: Exibe os números selecionados em formato visual
  - Propriedades:
    - `type`: Tipo de loteria
    - `numbers`: Array de números
    - `className`: Classes CSS adicionais

- `LotteryNumbersSelector`: Componente para selecionar números de loteria
  - Propriedades:
    - `type`: Tipo de loteria
    - `selectedNumbers`: Números já selecionados
    - `onChange`: Callback para mudanças na seleção
  - Funcionalidades:
    - Limitação automática do número máximo de seleções
    - Geração de números aleatórios
    - Visualização dos números selecionados

- `AddTicketForm`: Formulário para adicionar novos bilhetes
  - Propriedades:
    - `poolId`: ID do bolão
    - `lotteryType`: Tipo de loteria
    - `onTicketAdded`: Callback após adição
  - Implementação:
    - Gera número de bilhete aleatório
    - Integra o LotteryNumbersSelector
    - Validações específicas para cada tipo de loteria

- `LotteryTicket`: Exibe os detalhes de um bilhete
  - Propriedades:
    - `ticket`: Dados do bilhete
    - `type`: Tipo de loteria para estilização

### Componentes UI
- `StatusBadge`: Badge visual para status (confirmado, pendente, pago)
  - Código de cores: verde para confirmado, amarelo para pendente, azul para pago
- Componentes do shadcn/ui como Button, Dialog, Card, etc.

## Conversores de Tipos

Para manter a consistência entre os dados do banco (snake_case) e do frontend (camelCase), são utilizados os seguintes conversores:

- `convertSupabasePoolToPool`: Converte dados de bolões
  ```tsx
  // Exemplo:
  const poolData = await supabase.from('pools').select('*').single();
  const convertedPool = convertSupabasePoolToPool(poolData.data);
  ```

- `convertSupabaseParticipantToParticipant`: Converte dados de participantes
  ```tsx
  // Exemplo:
  const participantsData = await supabase.from('participants').select('*');
  const convertedParticipants = participantsData.data.map(
    p => convertSupabaseParticipantToParticipant(p)
  );
  ```

- `convertSupabaseTicketToTicket`: Converte dados de bilhetes
  ```tsx
  // Exemplo:
  const ticketsData = await supabase.from('tickets').select('*');
  const convertedTickets = ticketsData.data.map(
    t => convertSupabaseTicketToTicket(t)
  );
  ```

## Utilitários de Loteria

A biblioteca `lib/lottery.ts` contém funções para manipular dados de loteria:

- `getRequiredNumbersCount`: Retorna o número de números necessários para cada tipo
  - Mega-Sena: 6 números
  - Lotofácil: 15 números
  - Quina: 5 números
  - Lotomania: 50 números
  - Timemania: 10 números
  - Dupla Sena: 6 números

- `getMaxNumber`: Retorna o número máximo para cada tipo de loteria
  - Mega-Sena: 1-60
  - Lotofácil: 1-25
  - Quina: 1-80
  - Lotomania: 1-100
  - Timemania: 1-80
  - Dupla Sena: 1-50

- `generateDefaultNumbers`: Gera números iniciais para um tipo de loteria
- `isValidSelectionCount`: Verifica se a quantidade selecionada é válida
- `getLotteryColor`: Retorna a cor associada ao tipo de loteria
- `getLotteryName`: Retorna o nome formatado do tipo de loteria

## Páginas Principais

- `/auth`: Autenticação (login/cadastro)
- `/dashboard`: Visão geral dos bolões e estatísticas
- `/meus-boloes`: Lista de bolões do usuário
- `/boloes/:id`: Detalhes de um bolão específico
- `/pesquisar-resultados`: Busca de resultados de loterias
- `/perfil`: Dados do perfil do usuário

## Problemas Comuns e Soluções

### Recursão em Políticas RLS
Evite criar políticas que referenciam mutuamente tabelas relacionadas. Isso pode causar erros de "infinite recursion detected in policy for relation". Use políticas simples como `admin_id = auth.uid()` sempre que possível.

**Sintomas comuns**: 
- Erro no console: "infinite recursion detected in policy for relation..."
- Consultas que funcionam isoladamente falham quando combinadas
- Operações SELECT funcionam, mas INSERT/UPDATE falham com o mesmo erro

**Solução**:
1. Simplifique políticas para evitar consultas circulares
2. Se precisar de políticas complexas, divida-as em múltiplas políticas mais simples
3. Teste cada política individualmente antes de combinar
4. Em casos extremos, considere usar funções PostgreSQL personalizadas para lógica mais complexa

### Retornos Nulos
Quando um participante é adicionado pelo administrador, o campo `user_id` é NULL até que o usuário aceite o convite. Considere isso ao exibir e processar dados de participantes.

**Solução**:
```tsx
// Verifica se userId existe antes de comparar
const isCurrentUserParticipant = participants.some(
  p => p.userId && p.userId === user.id
);

// Em uma política RLS
CREATE POLICY "..." ON public.participants
FOR SELECT USING (
  user_id = auth.uid() OR 
  (user_id IS NULL AND pool_id IN (SELECT id FROM pools WHERE admin_id = auth.uid()))
);
```

### Atualização Assíncrona
Após operações como adicionar um participante ou bilhete, atualize a interface com um pequeno timeout para garantir que o Supabase tenha processado a operação:

```tsx
setTimeout(() => {
  onParticipantAdded();
}, 500);
```

**Razão**: O Supabase pode ter um pequeno atraso na propagação das mudanças, especialmente com políticas RLS complexas.

### Tratamento de Erros
Sempre forneça mensagens de erro claras e específicas:

```tsx
try {
  // operação...
} catch (error: any) {
  console.error('Erro completo:', error);
  toast({
    title: "Erro específico para esta operação",
    description: error.message || 'Ocorreu um erro desconhecido',
    variant: "destructive",
  });
}
```

## Extensões Futuras Recomendadas

### Sistema de Convites
- Implementar envio de emails de convite
- Página de aceitação de convites para novos participantes

### Verificação de Resultados
- Integração com APIs de resultados de loterias
- Verificação automática de bilhetes vencedores

### Geração de Relatórios
- Exportação de dados de bolões
- Estatísticas de desempenho de bilhetes

### Integração de Pagamentos
- Sistema para pagamento de contribuições
- Rastreamento e distribuição de prêmios

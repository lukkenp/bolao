# Diretrizes para Desenvolvimento - Bolão da Sorte

Este documento fornece diretrizes para desenvolvedores que contribuem para o projeto Bolão da Sorte. O objetivo é manter consistência no código, estilo e arquitetura à medida que o projeto evolui.

## Stack Tecnológica

### Frontend
- **React 18+ com TypeScript**: Utilize tipos estáticos sempre que possível para garantir segurança de tipos.
- **Vite**: Como bundler e ferramenta de desenvolvimento.
- **Tailwind CSS**: Para todo o estilo, evite CSS/SCSS inline ou arquivos separados.
- **shadcn/ui**: Como biblioteca de componentes base, personalizados com Tailwind.
- **React Router v6**: Para gerenciamento de rotas.
- **React Context API**: Para gerenciamento de estado global.
- **Toast notifications**: Para feedback ao usuário.

### Backend
- **Supabase**: Para autenticação, banco de dados PostgreSQL e Row Level Security (RLS).

## Estrutura de Arquivos

```
src/
  ├── components/       # Componentes reutilizáveis
  │   ├── ui/           # Componentes de UI básicos (shadcn)
  │   ├── dashboard/    # Componentes específicos do dashboard
  │   ├── lottery/      # Componentes relacionados às loterias
  │   ├── participants/ # Componentes relacionados aos participantes
  │   └── pools/        # Componentes específicos para bolões
  ├── contexts/         # Contextos React (AuthContext, etc)
  ├── hooks/            # Custom hooks
  ├── integrations/     # Integrações com serviços externos
  │   └── supabase/     # Cliente e tipos do Supabase
  ├── layout/           # Componentes de layout
  ├── lib/              # Funções e utilitários
  │   ├── lottery.ts    # Funções específicas para loterias
  │   ├── converters.ts # Conversores de tipos do Supabase
  │   └── utils.ts      # Utilidades gerais
  ├── pages/            # Componentes de página
  ├── services/         # Serviços para interação com APIs
  └── types/            # Definições de tipos TypeScript
```

## Diretrizes de Código

### Padrões de Componentes

1. **Componentes Funcionais**: Use sempre componentes funcionais com hooks, não classes.

```tsx
// Correto
const MyComponent = () => {
  return <div>...</div>;
};

// Evitar
class MyComponent extends React.Component {
  render() {
    return <div>...</div>;
  }
}
```

2. **Props com TypeScript**: Defina interfaces para as props de componentes.

```tsx
interface ButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button = ({ variant = 'default', children, onClick }: ButtonProps) => {
  // ...
};
```

3. **Componentes Pequenos e Focados**: Mantenha componentes com uma única responsabilidade e tamanho reduzido (< 200 linhas).

### Estilo e UI

1. **Tailwind CSS**: Use classes Tailwind para todo o estilo. Evite CSS inline ou arquivos separados.

```tsx
// Correto
<div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">

// Evitar
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
```

2. **Tema de Cores**: Utilize as variáveis de cor do tema definidas no `tailwind.config.ts`. Por exemplo:
   - Background: `bg-background`, `bg-card`
   - Texto: `text-foreground`, `text-muted-foreground`
   - Bordas: `border-border`
   - Primário: `bg-primary`, `text-primary-foreground`

3. **Componentes shadcn/ui**: Use os componentes existentes do shadcn/ui e personalize-os com Tailwind quando necessário.

### Supabase e Row Level Security (RLS)

1. **Políticas Simplificadas**: Mantenha as políticas RLS tão simples quanto possível para evitar recursão infinita. Aqui está um exemplo seguro para visualização de bolões:

```sql
-- Política para visualizar bolões (SELECT)
CREATE POLICY "RLS: pools_select" ON public.pools
FOR SELECT TO authenticated
USING (
  -- Admin do bolão pode ver seus próprios bolões
  admin_id = auth.uid()
);
```

2. **Evite Referências Circulares**: Ao criar políticas para tabelas relacionadas, tenha muito cuidado para não criar dependências circulares, que podem causar erro de "infinite recursion detected in policy".

```sql
-- Exemplo correto para participantes
CREATE POLICY "RLS: participants_select_admin" ON public.participants
FOR SELECT TO authenticated
USING (
  pool_id IN (
    SELECT id FROM pools
    WHERE admin_id = auth.uid()
  )
);
```

3. **Teste as Políticas**: Sempre teste suas políticas RLS com diferentes usuários e cenários para garantir que funcionam conforme esperado e não causam recursão.

4. **Tratamento de NULL em user_id**: Quando um participante é adicionado sem um usuário associado (convite pendente), o campo `user_id` será NULL. Sua política RLS precisa lidar adequadamente com esses casos.

```sql
-- Política que lida corretamente com valores NULL em user_id
CREATE POLICY "RLS: participants_select_for_users" ON public.participants
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR 
  pool_id IN (SELECT id FROM pools WHERE admin_id = auth.uid())
);
```

5. **Desativação de Políticas para Depuração**: Durante o desenvolvimento, se você encontrar erros de recursão, pode desativar temporariamente as políticas para isolar o problema:

```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- Depois de depurar, não se esqueça de reativar
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Requisições e Estado

1. **Supabase Client**: Importe o cliente da seguinte forma:

```tsx
import { supabase } from "@/integrations/supabase/client";
```

2. **Padrão de Requisições**: Ao fazer requisições ao Supabase:

```tsx
// Exemplo de busca
const fetchData = async () => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('column', value);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error:', error);
    toast({
      title: "Erro ao buscar dados",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

3. **Logs para Depuração**: Adicione logs estratégicos ao interagir com o Supabase para facilitar a depuração:

```tsx
console.log('Iniciando busca de dados');
const { data, error } = await supabase.from('table_name').select('*');
console.log('Resposta recebida:', { data, error });
```

4. **Tratamento de Erros Completo**: Sempre inclua um tratamento de erro adequado com mensagens informativas:

```tsx
try {
  // Operações do Supabase...
} catch (error: any) {
  console.error('Erro completo:', error);
  toast({
    title: "Erro na operação",
    description: error.message || 'Erro desconhecido',
    variant: "destructive",
  });
} finally {
  setLoading(false);
}
```

5. **Refresh de Dados**: Após operações que modificam dados, sempre atualize os dados exibidos. Use um pequeno timeout para garantir que as mudanças foram processadas:

```tsx
setTimeout(() => {
  fetchPoolData();
}, 500);
```

### Conversão de Tipos

1. **Convertendo Formato Snake_Case para CamelCase**: Sempre use os conversores no arquivo `/lib/converters.ts` para transformar dados do Supabase:

```tsx
import { convertSupabasePoolToPool } from '@/lib/converters';

// Em uma função de busca
const { data } = await supabase.from('pools').select('*');
const convertedPools = data.map(pool => convertSupabasePoolToPool(pool));
```

2. **Tipagem dos Dados**: Ao buscar dados do Supabase, use conversores de tipo para garantir consistência.

### Autenticação

1. **Contexto de Autenticação**: Use o `AuthContext` para acessar dados do usuário autenticado:

```tsx
const { user } = useAuth();
```

2. **Proteção de Rotas**: Use o componente `AuthGuard` para proteger rotas que requerem autenticação:

```tsx
<Route path="/protected" element={<AuthGuard><ProtectedComponent /></AuthGuard>} />
```

## Componentes de Participantes e Bilhetes

### AddParticipantForm

Este componente é responsável por adicionar novos participantes a um bolão:

```tsx
<AddParticipantForm
  poolId={id} 
  onParticipantAdded={fetchPoolData}
/>
```

Propriedades:
- `poolId`: ID do bolão onde o participante será adicionado
- `onParticipantAdded`: Callback executado quando um participante é adicionado com sucesso

O componente adiciona participantes com status 'pendente' e `user_id` como NULL inicialmente.

### ConfirmParticipant

Use o componente ConfirmParticipant para permitir que administradores confirmem a participação:

```tsx
<ConfirmParticipant
  participantId={participant.id}
  participantName={participant.name}
  onConfirmed={onParticipantUpdated}
/>
```

Propriedades:
- `participantId`: ID do participante a ser confirmado
- `participantName`: Nome do participante para exibição em mensagens
- `onConfirmed`: Callback executado quando um participante é confirmado

### ParticipantList

Este componente exibe uma lista de participantes do bolão:

```tsx
<ParticipantList 
  participants={participants} 
  isAdmin={isAdmin} 
  onParticipantUpdated={fetchPoolData}
/>
```

Propriedades:
- `participants`: Array de objetos Participant
- `isAdmin`: Boolean que indica se o usuário atual é administrador do bolão
- `onParticipantUpdated`: Callback executado quando um participante é atualizado

### AddTicketForm e LotteryNumbersSelector

Para adicionar bilhetes com números de loteria, use:

```tsx
<AddTicketForm 
  poolId={id} 
  lotteryType={pool.lotteryType as LotteryType}
  onTicketAdded={fetchPoolData}
/>
```

Propriedades:
- `poolId`: ID do bolão onde o bilhete será adicionado
- `lotteryType`: Tipo de loteria (megasena, lotofacil, etc.)
- `onTicketAdded`: Callback executado quando um bilhete é adicionado

O componente LotteryNumbersSelector permite a seleção interativa de números:

```tsx
<LotteryNumbersSelector
  type={lotteryType}
  selectedNumbers={numbers}
  onChange={setNumbers}
/>
```

Propriedades:
- `type`: Tipo de loteria
- `selectedNumbers`: Array de números selecionados
- `onChange`: Callback para atualizar os números selecionados

### LotteryNumbers e LotteryTicket

Para exibir números de loteria e bilhetes:

```tsx
<LotteryNumbers type="megasena" numbers={[1, 2, 3, 4, 5, 6]} />

<LotteryTicket ticket={ticket} type="megasena" />
```

## Tratando Participantes Pendentes

Quando um participante é adicionado por um administrador, seu estado inicial é:
- `status: 'pendente'`
- `user_id: null` (será definido quando o participante aceitar o convite)

Ao implementar a confirmação, atualize o status para 'confirmado':

```tsx
await supabase
  .from('participants')
  .update({ status: 'confirmado' })
  .eq('id', participantId);
```

Posteriormente, quando implementar a funcionalidade de aceitar convites, você deverá vincular o usuário:

```tsx
await supabase
  .from('participants')
  .update({ 
    user_id: currentUser.id,
    status: 'confirmado' 
  })
  .eq('id', participantId);
```

## Gestão de Erros e Navegação

1. **Toast para Notificações**: Use o hook `useToast` para exibir mensagens de erro e sucesso:

```tsx
const { toast } = useToast();

try {
  // operação...
  toast({
    title: "Operação bem-sucedida",
    description: "Os dados foram atualizados com sucesso.",
  });
} catch (error) {
  toast({
    title: "Erro na operação",
    description: error.message,
    variant: "destructive",
  });
}
```

2. **Estados de Carregamento**: Sempre informe ao usuário quando uma operação estiver em andamento:

```tsx
const [loading, setLoading] = useState(false);

const handleOperation = async () => {
  setLoading(true);
  try {
    // operação...
  } catch (error) {
    // tratamento de erro...
  } finally {
    setLoading(false);
  }
};

// No JSX
{loading ? <Loader2 className="animate-spin" /> : "Confirmar"}
```

## Prevenção de Problemas Comuns

1. **Recursão em Políticas RLS**:
   - Evite políticas que criam dependências circulares entre tabelas
   - Teste cada política individualmente antes de combiná-las
   - Use políticas simples como `admin_id = auth.uid()` quando possível
   - Evite subconsultas muito complexas ou aninhadas

2. **Problemas com valores NULL**:
   - Sempre verifique e trate adequadamente valores NULL, especialmente em `user_id` para participantes pendentes
   - Ao escrever políticas RLS, use condições que tratam corretamente valores NULL
   - Em componentes, verifique se `userId` existe antes de comparar

3. **Atualização Assíncrona**:
   - Para garantir que os dados sejam exibidos após uma adição/atualização, implemente timeouts curtos:
   ```tsx
   setTimeout(() => {
     onParticipantAdded();
   }, 500);
   ```

4. **Validação de Dados**:
   - Sempre valide os dados antes de enviá-los ao Supabase:
   ```tsx
   if (!name || !email) {
     toast({
       title: "Dados incompletos",
       description: "Por favor, preencha todos os campos.",
       variant: "destructive",
     });
     return;
   }
   ```

5. **Conversões de Tipos**:
   - Certifique-se que a tipagem no front-end corresponde ao esquema do Supabase
   - Converta explicitamente tipos numéricos: `Number(pool.contribution_amount)`
   - Use os conversores apropriados para transformar snake_case em camelCase

## Conclusão

Siga estas diretrizes para manter consistência e qualidade no código do projeto Bolão da Sorte. Lembre-se que código limpo, organizado e bem tipado facilita a manutenção e evolução do projeto. A segurança de dados através das políticas RLS é crucial para o funcionamento adequado da aplicação.

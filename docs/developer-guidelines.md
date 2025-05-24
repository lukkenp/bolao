# Diretrizes para Desenvolvimento - Bolão da Sorte

Este documento é o guia principal para desenvolvedores do Bolão da Sorte. Ele detalha a stack, arquitetura, padrões de código, práticas de segurança e dicas para evitar bugs e retrabalho. Siga estas orientações para garantir consistência, qualidade e evolução saudável do projeto.

---

## 1. Motivação da Stack e Decisões de Arquitetura

### Por que usamos essa stack?
- **React 18+ com TypeScript**: Permite desenvolvimento rápido, com tipagem estática para evitar bugs comuns e facilitar refatorações.
- **Vite**: Build tool moderna, extremamente rápida para desenvolvimento local e builds de produção.
- **Tailwind CSS**: Padroniza o visual, acelera a prototipação e evita divergências de estilo. Não use CSS inline ou arquivos separados.
- **shadcn/ui**: Componentes acessíveis, prontos para customização com Tailwind, garantindo consistência visual.
- **React Router v6**: Roteamento declarativo, fácil de proteger rotas e criar navegação dinâmica.
- **React Context API**: Para estados globais como autenticação, evitando prop drilling.
- **Supabase**: Backend serverless, com autenticação, banco PostgreSQL e RLS para máxima segurança.

> **Dica:** Se precisar adicionar novas libs, justifique no PR e explique como ela se encaixa na arquitetura.

---

## 2. Estrutura de Pastas e Organização

Mantenha a estrutura modular e clara. Cada pasta tem um propósito:
- `components/`: Componentes reutilizáveis, separados por domínio (UI, dashboard, lottery, participants, pools).
- `contexts/`: Contextos React para estados globais.
- `hooks/`: Custom hooks reutilizáveis.
- `integrations/`: Integrações externas (ex: Supabase client).
- `layout/`: Componentes de layout e wrappers.
- `lib/`: Funções utilitárias e conversores de tipos.
- `pages/`: Componentes de página (rotas).
- `services/`: Serviços para APIs e lógica de negócio.
- `types/`: Tipos TypeScript globais.

> **Nunca** misture responsabilidades. Se um componente crescer demais, quebre em subcomponentes.

---

## 3. Padrões de Código e Componentes

- **Sempre use componentes funcionais e hooks.**
- **Tipagem explícita:** Defina interfaces para todas as props e dados vindos do backend.
- **Componentes pequenos:** < 200 linhas, responsabilidade única.
- **Tailwind para tudo:** Não use CSS externo ou inline.
- **shadcn/ui:** Prefira componentes prontos e só crie do zero se realmente necessário.
- **Conversão de tipos:** Sempre converta snake_case (Supabase) para camelCase (frontend) usando os conversores em `lib/converters.ts`.

---

## 4. Padronização Visual e Boas Práticas de UI

- **Containers e cards devem ser sempre neutros** (ex: `bg-card`, `bg-white`).
- **Cor temática (verde, azul, etc.) só nas bolas dos números das loterias.** Nunca aplique cor de loteria em containers, títulos, badges ou botões.
- **Efeitos de hover:**
  - Use apenas efeitos sutis em tabelas (ex: `hover:bg-muted/20`).
  - Não use hover em cards de resultados, estatísticas ou containers principais.
- **Feedback visual:** Sempre use toast para informar sucesso, erro ou loading.
- **Consistência:** Siga o padrão visual do projeto para evitar divergências e retrabalho.

---

## 5. Segurança e Boas Práticas

- **Valide e sanitize todas as entradas do usuário.**
- **Nunca exponha dados sensíveis no frontend.**
- **Use variáveis de ambiente para chaves e URLs.**
- **Implemente autenticação e autorização em todas as rotas protegidas.**
- **RLS no Supabase:**
  - Políticas simples, sem dependências circulares.
  - Teste cada política isoladamente antes de combinar.
  - Trate casos de `user_id` NULL.
  - Use logs para depuração de políticas.
- **Evite requisições desnecessárias:** Sempre cheque se os dados já estão em cache/contexto antes de buscar novamente.
- **Nunca confie apenas no frontend para regras de negócio.**

---

## 6. Requisições, Estado e Tratamento de Erros

- **Supabase Client:** Sempre importe de `@/integrations/supabase/client`.
- **Padrão de fetch:**
```tsx
  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };
```
- **Logs estratégicos:**
```tsx
  console.log('Buscando dados...');
  // ...
  console.log('Resposta:', { data, error });
```
- **Tratamento de loading:**
```tsx
  const [loading, setLoading] = useState(false);
  // ...
  {loading ? <Loader2 className="animate-spin" /> : 'Confirmar'}
```
- **Atualização assíncrona:** Após mutações, use `setTimeout(() => fetchData(), 500);` para garantir atualização.
- **Validação de dados:**
  ```tsx
  if (!name || !email) {
    toast({ title: 'Dados incompletos', description: 'Preencha todos os campos.', variant: 'destructive' });
    return;
  }
  ```
- **Conversão de dados:**
  ```tsx
  // Exemplo de conversão usando utilitário
  import { convertParticipant } from '@/lib/converters';
  const participant = convertParticipant(dataFromSupabase);
  ```

---

## 7. Integração com Supabase e RLS

- **Nunca altere políticas RLS sem testar em ambiente de desenvolvimento.**
- **Evite subconsultas aninhadas e dependências circulares.**
- **Para participantes pendentes:**
  - `user_id` pode ser NULL. Trate isso nas queries e políticas.
  - Exemplo de política segura:
```sql
CREATE POLICY "RLS: participants_select_for_users" ON public.participants
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR 
  pool_id IN (SELECT id FROM pools WHERE admin_id = auth.uid())
);
```
- **Sempre converta dados do Supabase antes de usar no frontend.**
- **Use transações para operações relacionadas.**

---

## 8. Testes e Debugging

- **Teste manual:** Sempre teste fluxos principais (criar bolão, adicionar participante, confirmar, adicionar bilhete).
- **Logs:** Use `console.log` para depurar, mas remova logs sensíveis antes de subir para produção.
- **Toast para feedback:** Sempre informe o usuário sobre sucesso ou erro.
- **Teste políticas RLS com diferentes tipos de usuário.**
- **Se possível, escreva testes unitários para funções críticas em `lib/` e hooks.**

---

## 9. Dicas para Novos Desenvolvedores

- Leia este documento antes de começar!
- Pergunte se tiver dúvidas sobre regras de negócio ou arquitetura.
- Antes de criar um novo componente, veja se já existe algo parecido.
- Siga os exemplos de código e mantenha o padrão visual.
- Documente funções utilitárias e hooks.
- Prefira clareza à "esperteza" no código.
- Se algo parecer estranho ou difícil, provavelmente pode ser simplificado.

---

## 10. Checklist de Pull Request (Visual e Funcional)

- [ ] O código está tipado e sem warnings?
- [ ] Seguiu a estrutura de pastas?
- [ ] Usou Tailwind e shadcn/ui?
- [ ] Containers e cards estão neutros? (sem cor de loteria)
- [ ] Apenas as bolas dos números estão coloridas?
- [ ] Validou entradas do usuário?
- [ ] Testou fluxos principais?
- [ ] Não quebrou nenhuma política RLS?
- [ ] Adicionou feedback visual para o usuário?
- [ ] Não expôs dados sensíveis?
- [ ] Atualizou este documento se necessário?

---

## 11. Referências Rápidas

- [Documentação Supabase](https://supabase.com/docs)
- [React + TypeScript Cheatsheets](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

---

Siga estas diretrizes para manter o Bolão da Sorte seguro, consistente e fácil de evoluir. Qualquer dúvida, consulte este documento ou pergunte para o time!

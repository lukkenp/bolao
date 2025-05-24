import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LotteryType } from '@/types';
import { usePoolEdit } from '@/hooks/usePoolEdit';

const formSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  lottery_type: z.enum(['megasena', 'lotofacil', 'quina', 'lotomania', 'timemania', 'duplasena'] as const),
  draw_date: z.string().min(1, 'Data do sorteio é obrigatória'),
  draw_time: z.string().min(1, 'Hora do sorteio é obrigatória'),
  entry_fee: z.coerce
    .number()
    .min(1, 'Valor da entrada deve ser maior que zero')
    .max(1000, 'Valor da entrada não pode ser maior que R$ 1.000'),
  max_participants: z.coerce
    .number()
    .min(2, 'Mínimo de 2 participantes')
    .max(100, 'Máximo de 100 participantes'),
  is_open: z.boolean(),
}).required();

interface EditPoolDialogProps {
  poolId: string;
  initialData: z.infer<typeof formSchema>;
  onPoolUpdated?: () => void;
  trigger?: React.ReactNode;
}

export function EditPoolDialog({
  poolId,
  initialData,
  onPoolUpdated,
  trigger,
}: EditPoolDialogProps) {
  const [open, setOpen] = useState(false);
  const { loading, updatePool } = usePoolEdit({
    poolId,
    onSuccess: () => {
      setOpen(false);
      if (onPoolUpdated) {
        onPoolUpdated();
      }
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updatePool(values);
      form.reset(values);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Editar Bolão</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Bolão</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias no seu bolão. Alguns campos não podem
            ser alterados após a criação.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do bolão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o seu bolão"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lottery_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Loteria</FormLabel>
                    <Select
                      disabled
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a loteria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="megasena">Mega-Sena</SelectItem>
                        <SelectItem value="lotofacil">Lotofácil</SelectItem>
                        <SelectItem value="quina">Quina</SelectItem>
                        <SelectItem value="lotomania">Lotomania</SelectItem>
                        <SelectItem value="timemania">Timemania</SelectItem>
                        <SelectItem value="duplasena">Dupla Sena</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entry_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Entrada</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        placeholder="R$ 10,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="draw_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Sorteio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="draw_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora do Sorteio</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número Máximo de Participantes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2}
                        max={100}
                        placeholder="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_open"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Aberto para Participação</FormLabel>
                      <FormDescription>
                        Permite que novos participantes entrem no bolão
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
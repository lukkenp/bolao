import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';

type AddParticipantFormProps = {
  poolId: string;
  onParticipantAdded: () => void;
};

export default function AddParticipantForm({ poolId, onParticipantAdded }: AddParticipantFormProps) {
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha o nome e o email do participante.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Adicionando participante:', { pool_id: poolId, name, email });
      
      const { data, error } = await supabase.from('participants').insert([
        {
          pool_id: poolId,
          name,
          email,
          status: 'pendente',
          // O user_id será definido quando o participante aceitar o convite
        }
      ]).select();

      if (error) {
        console.error('Erro ao adicionar participante:', error);
        throw error;
      }

      console.log('Participante adicionado com sucesso:', data);

      toast({
        title: "Participante adicionado com sucesso!",
        description: `${name} foi adicionado ao bolão.`,
      });

      resetForm();
      setOpen(false);

      // Espera um curto período para o Supabase processar a inserção
      setTimeout(() => {
        onParticipantAdded();
      }, 500);
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao adicionar participante",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Participante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Participante</DialogTitle>
          <DialogDescription>
            Adicione um novo participante ao bolão. Ele receberá um convite por email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddParticipant}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do participante"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
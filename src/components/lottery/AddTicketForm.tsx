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
import { Label } from '@/components/ui/label';
import { Loader2, Ticket } from 'lucide-react';
import { LotteryType } from '@/types';
import { generateDefaultNumbers } from '@/lib/lottery';
import { randomId } from '@/lib/utils';
import { LotteryNumbersSelector } from './LotteryNumbersSelector';

type AddTicketFormProps = {
  poolId: string;
  lotteryType: LotteryType;
  onTicketAdded: () => void;
};

export default function AddTicketForm({ poolId, lotteryType, onTicketAdded }: AddTicketFormProps) {
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [numbers, setNumbers] = useState<number[]>(generateDefaultNumbers(lotteryType));
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNumbers(generateDefaultNumbers(lotteryType));
  };

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!numbers || numbers.length === 0) {
      toast({
        title: "Erro ao adicionar bilhete",
        description: "Selecione pelo menos um número para o bilhete.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Gera um ID para o bilhete
      const ticketNumber = randomId(6).toUpperCase();

      const { error } = await supabase.from('tickets').insert([
        {
          pool_id: poolId,
          ticket_number: ticketNumber,
          numbers
        }
      ]);

      if (error) throw error;

      toast({
        title: "Bilhete adicionado com sucesso!",
        description: `Bilhete #${ticketNumber} foi adicionado ao bolão.`,
      });

      resetForm();
      setOpen(false);
      onTicketAdded();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar bilhete",
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
          <Ticket className="h-4 w-4 mr-2" />
          Adicionar Bilhete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Bilhete</DialogTitle>
          <DialogDescription>
            Escolha os números para o novo bilhete.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddTicket}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Selecione os números</Label>
              <LotteryNumbersSelector
                type={lotteryType}
                selectedNumbers={numbers}
                onChange={setNumbers}
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
                "Adicionar Bilhete"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
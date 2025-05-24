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
import { Loader2, Ticket, Clipboard } from 'lucide-react';
import { LotteryType } from '@/types';
import { generateDefaultNumbers, getRequiredNumbersCount, getLotteryColor } from '@/lib/lottery';
import { randomId } from '@/lib/utils';
import { LotteryNumbersSelector } from './LotteryNumbersSelector';
import { cn } from '@/lib/utils';

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
  const baseColorClass = getLotteryColor(lotteryType);
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');
  const borderColorClass = baseColorClass.replace('bg-', 'border-').replace('-600', '-500');
  const hoverColorClass = baseColorClass.replace('bg-', 'hover:bg-').replace('-600', '-500');

  const resetForm = () => {
    setNumbers(generateDefaultNumbers(lotteryType));
  };

  const handlePasteNumbers = async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      // Remove todos os caracteres especiais e espaços extras
      const cleanText = text
        .replace(/[^0-9,\s]/g, '') // Remove tudo exceto números, vírgulas e espaços
        .trim();
      
      // Tenta diferentes formatos de separadores
      let pastedNumbers: number[] = [];
      
      if (cleanText.includes(',')) {
        // Formato: "01, 02, 03, 04, 05, 06" ou "1,2,3,4,5,6"
        pastedNumbers = cleanText.split(',')
          .map(num => parseInt(num.trim()))
          .filter(num => !isNaN(num));
      } else {
        // Formato: "01 02 03 04 05 06" ou "1 2 3 4 5 6"
        pastedNumbers = cleanText.split(/\s+/)
          .map(num => parseInt(num.trim()))
          .filter(num => !isNaN(num));
      }
      
      const requiredCount = getRequiredNumbersCount(lotteryType);
      
      if (pastedNumbers.length === 0) {
        toast({
          title: "Formato inválido",
          description: "Não foi possível identificar números válidos no texto colado.",
          variant: "destructive",
        });
        return;
      }
      
      if (pastedNumbers.length !== requiredCount) {
        toast({
          title: "Quantidade incorreta de números",
          description: `Você precisa colar exatamente ${requiredCount} números. Você colou ${pastedNumbers.length} números.`,
          variant: "destructive",
        });
        return;
      }

      // Verifica se todos os números são válidos para o tipo de loteria
      const invalidNumbers = pastedNumbers.filter(num => num < 1 || num > 60);
      if (invalidNumbers.length > 0) {
        toast({
          title: "Números inválidos",
          description: `Os números ${invalidNumbers.join(', ')} são inválidos. Os números devem estar entre 1 e 60.`,
          variant: "destructive",
        });
        return;
      }

      // Remove duplicatas e ordena
      const uniqueNumbers = [...new Set(pastedNumbers)].sort((a, b) => a - b);
      if (uniqueNumbers.length !== pastedNumbers.length) {
        toast({
          title: "Números duplicados",
          description: "Você não pode usar o mesmo número mais de uma vez.",
          variant: "destructive",
        });
        return;
      }

      setNumbers(uniqueNumbers);
      toast({
        title: "Números colados com sucesso!",
        description: `Os números ${uniqueNumbers.map(n => n.toString().padStart(2, '0')).join(', ')} foram adicionados.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao colar números",
        description: "Cole os números separados por vírgula ou espaço (ex: 01, 02, 03, 04, 05, 06 ou 01 02 03 04 05 06).",
        variant: "destructive",
      });
    }
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
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "ml-auto",
            textColorClass,
            borderColorClass,
            `hover:${baseColorClass.replace('bg-', 'bg-opacity-10')}`
          )}
        >
          <Ticket className="h-4 w-4 mr-2" />
          Adicionar Bilhete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={textColorClass}>Adicionar Bilhete</DialogTitle>
          <DialogDescription>
            Escolha os números para o novo bilhete.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddTicket}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className={textColorClass}>Selecione os números</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePasteNumbers}
                  className={cn(
                    textColorClass,
                    borderColorClass,
                    `hover:${baseColorClass.replace('bg-', 'bg-opacity-10')}`
                  )}
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Colar números
                </Button>
              </div>
              <LotteryNumbersSelector
                type={lotteryType}
                selectedNumbers={numbers}
                onChange={setNumbers}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className={cn(
                textColorClass,
                borderColorClass,
                `hover:${baseColorClass.replace('bg-', 'bg-opacity-10')}`
              )}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={cn(baseColorClass, hoverColorClass)}
            >
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
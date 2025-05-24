import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LotteryType } from '@/types';
import { useNumberSelection } from '@/hooks/useNumberSelection';
import { getLotteryColor } from '@/lib/lottery';
import { cn } from '@/lib/utils';

interface SelectNumbersDialogProps {
  poolId: string;
  participantId: string;
  lotteryType: LotteryType;
  onNumbersSelected?: () => void;
  trigger?: React.ReactNode;
}

export function SelectNumbersDialog({
  poolId,
  participantId,
  lotteryType,
  onNumbersSelected,
  trigger,
}: SelectNumbersDialogProps) {
  const [open, setOpen] = useState(false);
  const { selectedNumbers, config, toggleNumber, clearSelection } = useNumberSelection(poolId, participantId);
  const baseColorClass = getLotteryColor(lotteryType);
  const hoverColorClass = baseColorClass.replace('bg-', 'hover:bg-').replace('-600', '-500');
  const borderColorClass = baseColorClass.replace('bg-', 'border-').replace('-600', '-500');
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');

  const handleClose = () => {
    setOpen(false);
    onNumbersSelected?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">Escolher Números</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Escolha seus números</DialogTitle>
          <DialogDescription>
            Selecione {config.maxNumbers} números para seu jogo
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: config.maxValue }, (_, i) => i + 1).map(number => (
              <Button
                key={number}
                type="button"
                variant="ghost"
                onClick={() => toggleNumber(number)}
                className={cn(
                  "h-10 w-10 p-0 rounded-full transition-all duration-200 ease-in-out",
                  "border-2 text-sm font-bold",
                  `hover:scale-110 hover:${borderColorClass} ${textColorClass}`,
                  selectedNumbers.includes(number)
                    ? `${baseColorClass} text-white border-transparent shadow-lg scale-105`
                    : `border-gray-300 text-gray-700 hover:${baseColorClass.replace('bg-', 'bg-opacity-10')}`
                )}
              >
                {number.toString().padStart(2, '0')}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedNumbers.length} de {config.maxNumbers} números selecionados
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={clearSelection}
              className={cn(
                textColorClass,
                borderColorClass,
                `hover:${baseColorClass.replace('bg-', 'bg-opacity-10')}`
              )}
            >
              Limpar
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              className={cn(baseColorClass, hoverColorClass)}
            >
              Confirmar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
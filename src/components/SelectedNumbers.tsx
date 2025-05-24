import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SelectedNumbersProps {
  numbers: number[];
  selectedNumbers?: number[];
  maxNumbers: number;
  onSelect?: (number: number) => void;
  disabled?: boolean;
}

export function SelectedNumbers({
  numbers,
  selectedNumbers = [],
  maxNumbers,
  onSelect,
  disabled = false
}: SelectedNumbersProps) {
  const isSelected = (number: number) => selectedNumbers.includes(number);
  const canSelect = selectedNumbers.length < maxNumbers;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Seus Números</span>
          <Badge variant="secondary">
            {selectedNumbers.length}/{maxNumbers}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-5 gap-2">
            {numbers.map((number) => {
              const selected = isSelected(number);
              return (
                <button
                  key={number}
                  className={cn(
                    'relative h-12 rounded-lg border-2 font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted bg-background hover:border-primary/50',
                    (disabled || (!selected && !canSelect)) &&
                      'cursor-not-allowed opacity-50'
                  )}
                  disabled={disabled || (!selected && !canSelect)}
                  onClick={() => onSelect?.(number)}
                >
                  {number.toString().padStart(2, '0')}
                  {selected && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground ring-2 ring-background">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Números Selecionados */}
        {selectedNumbers.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Números Selecionados</h4>
            <div className="flex flex-wrap gap-2">
              {[...selectedNumbers].sort((a, b) => a - b).map((number) => (
                <Badge
                  key={number}
                  variant="outline"
                  className="text-sm font-medium"
                >
                  {number.toString().padStart(2, '0')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem de Ajuda */}
        <p className="text-sm text-muted-foreground mt-4">
          {disabled
            ? 'Você não pode mais alterar seus números.'
            : canSelect
            ? `Selecione mais ${maxNumbers - selectedNumbers.length} número${
                maxNumbers - selectedNumbers.length !== 1 ? 's' : ''
              }.`
            : 'Você já selecionou todos os números.'}
        </p>
      </CardContent>
    </Card>
  );
} 
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getMaxNumber, getRequiredNumbersCount, getLotteryColor } from '@/lib/lottery';
import { LotteryType } from '@/types';
import { cn } from '@/lib/utils';

type LotteryNumbersSelectorProps = {
  type: LotteryType;
  selectedNumbers: number[];
  onChange: (numbers: number[]) => void;
  maxNumbers?: number; // Número máximo de números que podem ser selecionados
};

export function LotteryNumbersSelector({ 
  type, 
  selectedNumbers, 
  onChange,
  maxNumbers 
}: LotteryNumbersSelectorProps) {
  const maxNumber = getMaxNumber(type);
  const requiredCount = maxNumbers || getRequiredNumbersCount(type);
  const baseColorClass = getLotteryColor(type);
  const hoverColorClass = baseColorClass.replace('bg-', 'hover:bg-').replace('-600', '-500');
  const borderColorClass = baseColorClass.replace('bg-', 'border-').replace('-600', '-500');
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');
  const hoverTextColorClass = baseColorClass.replace('bg-', 'hover:text-').replace('-600', '-700');
  
  const toggleNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      // Remove o número
      onChange(selectedNumbers.filter(n => n !== number));
    } else {
      // Adiciona o número se não exceder o limite
      if (selectedNumbers.length < requiredCount) {
        onChange([...selectedNumbers, number].sort((a, b) => a - b));
      } else {
        // Substituir o primeiro número se exceder o limite
        const newNumbers = [...selectedNumbers.slice(1), number];
        onChange(newNumbers.sort((a, b) => a - b));
      }
    }
  };

  const generateNumbers = () => {
    const allNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
    let remaining = requiredCount;
    const selected: number[] = [];
    
    while (remaining > 0 && allNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * allNumbers.length);
      const randomNumber = allNumbers.splice(randomIndex, 1)[0];
      selected.push(randomNumber);
      remaining--;
    }
    
    onChange(selected.sort((a, b) => a - b));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: maxNumber }, (_, i) => i + 1).map(number => (
          <Button
            key={number}
            type="button"
            variant="ghost"
            onClick={() => toggleNumber(number)}
            className={cn(
              "h-10 w-10 p-0 rounded-full transition-all duration-200 ease-in-out",
              "border-2 text-sm font-bold",
              `hover:scale-110 hover:${borderColorClass} ${hoverTextColorClass}`,
              selectedNumbers.includes(number)
                ? `${baseColorClass} text-white border-transparent shadow-lg scale-105`
                : `border-gray-300 text-gray-700 hover:${baseColorClass.replace('bg-', 'bg-opacity-10')}`
            )}
          >
            {number}
          </Button>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-muted-foreground">
          {selectedNumbers.length} de {requiredCount} números selecionados
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateNumbers}
          className={cn(
            textColorClass,
            borderColorClass,
            `hover:${baseColorClass.replace('bg-', 'bg-opacity-10')}`,
            hoverTextColorClass
          )}
        >
          Números aleatórios
        </Button>
      </div>
    </div>
  );
} 
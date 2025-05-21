import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getMaxNumber, getRequiredNumbersCount } from '@/lib/lottery';
import { LotteryType } from '@/types';

type LotteryNumbersSelectorProps = {
  type: LotteryType;
  selectedNumbers: number[];
  onChange: (numbers: number[]) => void;
};

export function LotteryNumbersSelector({ type, selectedNumbers, onChange }: LotteryNumbersSelectorProps) {
  const maxNumber = getMaxNumber(type);
  const requiredCount = getRequiredNumbersCount(type);
  
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
            size="sm"
            variant={selectedNumbers.includes(number) ? "default" : "outline"}
            onClick={() => toggleNumber(number)}
            className="h-8 w-8 p-0"
          >
            {number}
          </Button>
        ))}
      </div>
      <div className="flex justify-between">
        <div className="text-sm">
          {selectedNumbers.length} de {requiredCount} números selecionados
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateNumbers}
        >
          Números aleatórios
        </Button>
      </div>
    </div>
  );
} 
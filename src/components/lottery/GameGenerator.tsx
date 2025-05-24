'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useToast } from '../ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, RefreshCw, Copy, Check } from 'lucide-react'
import { LotteryNumbersSelector } from './LotteryNumbersSelector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LotteryType } from '@/types'
import { getLotteryColor } from '@/lib/lottery'
import { cn } from '@/lib/utils'

interface GameGeneratorProps {
  onGamesGenerated?: (games: number[][]) => void;
}

export function GameGenerator({ onGamesGenerated }: GameGeneratorProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [numbersPerGame, setNumbersPerGame] = useState(6)
  const [numGames, setNumGames] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatedGames, setGeneratedGames] = useState<number[][]>([])
  const [copiedGameIndex, setCopiedGameIndex] = useState<number | null>(null);
  const lotteryType: LotteryType = 'megasena'
  const baseColorClass = getLotteryColor(lotteryType)
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700')
  const borderColorClass = baseColorClass.replace('bg-', 'border-').replace('-600', '-500')
  const hoverColorClass = baseColorClass.replace('bg-', 'hover:bg-').replace('-600', '-500')

  // Preços oficiais da Mega Sena para referência
  const PRECOS_MEGA_SENA = {
    6: 5.00,
    7: 35.00,
    8: 140.00,
    9: 420.00,
    10: 1050.00,
    11: 2310.00,
    12: 4620.00,
    13: 8580.00,
    14: 15015.00,
    15: 25025.00,
    16: 40040.00,
    17: 61880.00,
    18: 92820.00,
    19: 135660.00,
    20: 193800.00
  } as const

  // Função para calcular o número total de combinações possíveis
  const calculateTotalCombinations = (n: number, r: number): number => {
    if (r > n) return 0
    let result = 1
    for (let i = 1; i <= r; i++) {
      result *= (n - i + 1) / i
    }
    return Math.floor(result)
  }

  // Função para verificar se já existem jogos gerados
  const checkExistingGames = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_games')
        .select('generated_combinations')
        .eq('user_id', user?.id)
        .eq('numbers_per_game', numbersPerGame)
        .gt('expires_at', new Date().toISOString())
        .contains('selected_numbers', selectedNumbers) // Usando contains para array PostgreSQL

      if (error) {
        console.error('Erro ao verificar jogos existentes:', error);
        return null;
      }
      
      return data?.[0]?.generated_combinations || null;
    } catch (error) {
      console.error('Erro ao verificar jogos existentes:', error);
      return null;
    }
  }

  // Função para gerar novas combinações
  const generateNewCombinations = (count: number): number[][] => {
    const combinations: number[][] = []
    const maxAttempts = 1000 // Evita loop infinito

    let attempts = 0
    while (combinations.length < count && attempts < maxAttempts) {
      const shuffled = [...selectedNumbers].sort(() => Math.random() - 0.5)
      const combination = shuffled.slice(0, numbersPerGame).sort((a, b) => a - b)
      
      // Verifica se esta combinação já existe
      const exists = combinations.some(existing =>
        existing.every((num, idx) => num === combination[idx])
      )

      if (!exists) {
        combinations.push(combination)
      }
      attempts++
    }

    return combinations
  }

  const handleGenerateGames = async () => {
    if (selectedNumbers.length < numbersPerGame) {
      toast({
        title: `Selecione pelo menos ${numbersPerGame} números`,
        description: `Para gerar jogos com ${numbersPerGame} números, você precisa selecionar pelo menos essa quantidade.`,
        variant: "destructive"
      })
      return
    }

    if (selectedNumbers.length > 20) {
      toast({
        title: "Selecione no máximo 20 números",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Verifica o total de combinações possíveis
      const totalPossible = calculateTotalCombinations(selectedNumbers.length, numbersPerGame)
      if (numGames > totalPossible) {
        toast({
          title: "Limite de combinações excedido",
          description: `Com ${selectedNumbers.length} números selecionados, é possível gerar no máximo ${totalPossible} jogos diferentes com ${numbersPerGame} números cada.`,
          variant: "destructive"
        })
        return
      }

      // Verifica se já existem jogos gerados
      const existingGames = await checkExistingGames()
      if (existingGames) {
        // Verifica se ainda há combinações disponíveis
        if (existingGames.length + numGames > totalPossible) {
          toast({
            title: "Limite de combinações atingido",
            description: `Você já gerou todas as combinações possíveis com ${numbersPerGame} números usando estas dezenas.`,
            variant: "destructive"
          })
          return
        }
        
        // Gera novas combinações excluindo as existentes
        const newGames = generateNewCombinations(numGames)
        
        // Atualiza no banco
        const { error: updateError } = await supabase
          .from('generated_games')
          .update({
            generated_combinations: [...existingGames, ...newGames],
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('user_id', user?.id)
          .eq('numbers_per_game', numbersPerGame)
          .contains('selected_numbers', selectedNumbers);

        if (updateError) throw updateError;

        setGeneratedGames(newGames)
      } else {
        // Primeira geração para estes números
        const newGames = generateNewCombinations(numGames)
        
        const { error: insertError } = await supabase
          .from('generated_games')
          .insert({
            user_id: user?.id,
            selected_numbers: selectedNumbers,
            numbers_per_game: numbersPerGame,
            generated_combinations: newGames,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });

        if (insertError) throw insertError;

        setGeneratedGames(newGames)
      }

      if (onGamesGenerated) {
        onGamesGenerated(generatedGames)
      }

    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao gerar jogos",
        description: error.message || "Não foi possível gerar os jogos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false)
    }
  }

  const copyGameToClipboard = (game: number[], index: number) => {
    // Garante que os números são formatados corretamente
    const gameText = game.map(num => num.toString().padStart(2, '0')).join(', ');
    navigator.clipboard.writeText(gameText).then(() => {
      setCopiedGameIndex(index);
      toast({
        title: "Números copiados!",
        description: `Os números ${gameText} foram copiados para sua área de transferência.`,
      });
      // Reset o ícone de copiado após 2 segundos
      setTimeout(() => {
        setCopiedGameIndex(null);
      }, 2000);
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar os números para a área de transferência.",
        variant: "destructive"
      });
    });
  };

  const maxPossibleCombinations = calculateTotalCombinations(selectedNumbers.length, numbersPerGame)

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label className={textColorClass}>Selecione até 20 números</Label>
          <LotteryNumbersSelector
            type={lotteryType}
            selectedNumbers={selectedNumbers}
            onChange={setSelectedNumbers}
            maxNumbers={20}
          />
          <p className="text-sm text-muted-foreground">
            Números selecionados: {selectedNumbers.length}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numbersPerGame" className={textColorClass}>Números por jogo</Label>
          <Select
            value={numbersPerGame.toString()}
            onValueChange={(value) => setNumbersPerGame(Number(value))}
          >
            <SelectTrigger className={cn(
              borderColorClass,
              textColorClass,
              `hover:${baseColorClass.replace('bg-', 'bg-opacity-10')}`
            )}>
              <SelectValue placeholder="Selecione quantos números por jogo" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 15 }, (_, i) => i + 6).map((num) => (
                <SelectItem 
                  key={num} 
                  value={num.toString()}
                  disabled={num > selectedNumbers.length}
                  className={cn(
                    "cursor-pointer",
                    num === numbersPerGame && baseColorClass + " text-white"
                  )}
                >
                  {num} números - {PRECOS_MEGA_SENA[num as keyof typeof PRECOS_MEGA_SENA].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numGames">Quantidade de jogos a gerar</Label>
          <Input
            id="numGames"
            type="number"
            min="1"
            value={numGames}
            onChange={(e) => setNumGames(Math.max(1, parseInt(e.target.value) || 1))}
          />
          {selectedNumbers.length >= numbersPerGame && (
            <p className="text-sm text-muted-foreground">
              Máximo possível: {maxPossibleCombinations} combinações
            </p>
          )}
        </div>

        <Button 
          onClick={handleGenerateGames} 
          disabled={loading || selectedNumbers.length < numbersPerGame}
          className={cn(baseColorClass, hoverColorClass, "w-full")}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar Jogos
            </>
          )}
        </Button>

        {generatedGames.length > 0 && (
          <div className="space-y-2">
            <Label>Jogos Gerados</Label>
            <div className="grid gap-2">
              {generatedGames.map((game, index) => (
                <div 
                  key={index}
                  className="p-3 bg-muted rounded-lg flex items-center justify-between"
                >
                  <div className="flex gap-2 flex-wrap">
                    {game.map(number => (
                      <span 
                        key={number}
                        className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-sm"
                      >
                        {number}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Jogo {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-500"
                      onClick={() => copyGameToClipboard(game, index)}
                    >
                      {copiedGameIndex === index ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
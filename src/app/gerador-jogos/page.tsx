import { Metadata } from 'next';
import { LotteryNumbersSelector } from '@/components/lottery/LotteryNumbersSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LotteryNumbers } from '@/components/lottery/LotteryNumbers';
import { useState } from 'react';
import { LotteryType } from '@/types';
import { generateRandomNumbers, getRequiredNumbersCount, getLotteryName } from '@/lib/lottery';
import { insertMultipleTickets } from '@/lib/lottery';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gerador de Jogos',
  description: 'Gere combinações únicas para seus jogos da loteria',
};

export default function GameGeneratorPage() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [lotteryType, setLotteryType] = useState<LotteryType>('megasena');
  const [quantity, setQuantity] = useState(1);
  const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateGames = () => {
    if (selectedNumbers.length < getRequiredNumbersCount(lotteryType)) {
      toast({
        title: "Seleção incompleta",
        description: `Selecione ${getRequiredNumbersCount(lotteryType)} números para gerar os jogos.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const games: number[][] = [];
      const maxCombinations = Math.min(
        quantity,
        calculateMaxCombinations(selectedNumbers.length, getRequiredNumbersCount(lotteryType))
      );

      while (games.length < maxCombinations) {
        const game = generateRandomCombination(selectedNumbers, getRequiredNumbersCount(lotteryType));
        if (!gameExists(game, games)) {
          games.push(game);
        }
      }

      setGeneratedGames(games);
    } catch (error) {
      console.error('Erro ao gerar jogos:', error);
      toast({
        title: "Erro ao gerar jogos",
        description: "Ocorreu um erro ao gerar as combinações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMaxCombinations = (total: number, required: number): number => {
    let result = 1;
    for (let i = 0; i < required; i++) {
      result *= (total - i) / (i + 1);
    }
    return Math.floor(result);
  };

  const generateRandomCombination = (numbers: number[], count: number): number[] => {
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).sort((a, b) => a - b);
  };

  const gameExists = (game: number[], games: number[][]): boolean => {
    return games.some(existingGame => 
      existingGame.length === game.length && 
      existingGame.every((num, idx) => num === game[idx])
    );
  };

  const maxPossibleCombinations = calculateMaxCombinations(
    selectedNumbers.length,
    getRequiredNumbersCount(lotteryType)
  );

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerador de Jogos</h1>
        <p className="text-muted-foreground">
          Selecione até 20 números e gere combinações únicas para seus jogos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seleção de Números</CardTitle>
            <CardDescription>
              Selecione os números que você quer incluir nas combinações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Loteria</label>
              <Select
                value={lotteryType}
                onValueChange={(value: LotteryType) => {
                  setLotteryType(value);
                  setSelectedNumbers([]);
                  setGeneratedGames([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="megasena">{getLotteryName('megasena')}</SelectItem>
                  <SelectItem value="lotofacil">{getLotteryName('lotofacil')}</SelectItem>
                  <SelectItem value="quina">{getLotteryName('quina')}</SelectItem>
                  <SelectItem value="lotomania">{getLotteryName('lotomania')}</SelectItem>
                  <SelectItem value="timemania">{getLotteryName('timemania')}</SelectItem>
                  <SelectItem value="duplasena">{getLotteryName('duplasena')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <LotteryNumbersSelector
              type={lotteryType}
              selectedNumbers={selectedNumbers}
              onChange={setSelectedNumbers}
              maxNumbers={20}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade de Jogos</label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={maxPossibleCombinations}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, maxPossibleCombinations))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  Máximo possível: {maxPossibleCombinations} combinações
                </span>
              </div>
            </div>

            <Button
              onClick={handleGenerateGames}
              disabled={loading || selectedNumbers.length < getRequiredNumbersCount(lotteryType)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Jogos...
                </>
              ) : (
                'Gerar Jogos'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jogos Gerados</CardTitle>
            <CardDescription>
              {generatedGames.length
                ? `${generatedGames.length} ${generatedGames.length === 1 ? 'jogo gerado' : 'jogos gerados'}`
                : 'Os jogos gerados aparecerão aqui'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedGames.length > 0 ? (
              <LotteryNumbers
                type={lotteryType}
                numbers={generatedGames.flat()}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum jogo gerado ainda.</p>
                <p className="text-sm">
                  Selecione os números e clique em "Gerar Jogos" para criar combinações únicas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LotteryNumbers } from '@/components/lottery/LotteryNumbers';
import { LotteryNumbersSelector } from '@/components/lottery/LotteryNumbersSelector';
import { useState } from 'react';
import { LotteryType } from '@/types';
import { getRequiredNumbersCount, getLotteryName } from '@/lib/lottery';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Simulador de Jogos',
  description: 'Simule jogos da loteria e veja suas chances de ganhar',
};

export default function SimulatorPage() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [lotteryType, setLotteryType] = useState<LotteryType>('megasena');
  const [simulations, setSimulations] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    hits: { [key: number]: number };
    totalGames: number;
    averageHits: number;
  } | null>(null);
  const { toast } = useToast();

  const handleSimulate = () => {
    if (selectedNumbers.length !== getRequiredNumbersCount(lotteryType)) {
      toast({
        title: "Seleção inválida",
        description: `Selecione exatamente ${getRequiredNumbersCount(lotteryType)} números para simular.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const hits: { [key: number]: number } = {};
      let totalHits = 0;

      for (let i = 0; i < simulations; i++) {
        const drawnNumbers = generateRandomNumbers(lotteryType);
        const matchCount = countMatches(selectedNumbers, drawnNumbers);
        hits[matchCount] = (hits[matchCount] || 0) + 1;
        totalHits += matchCount;
      }

      setResults({
        hits,
        totalGames: simulations,
        averageHits: totalHits / simulations,
      });
    } catch (error) {
      console.error('Erro ao simular jogos:', error);
      toast({
        title: "Erro na simulação",
        description: "Ocorreu um erro ao simular os jogos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomNumbers = (type: LotteryType): number[] => {
    const count = getRequiredNumbersCount(type);
    const maxNumber = getMaxNumber(type);
    const numbers: number[] = [];

    while (numbers.length < count) {
      const number = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(number)) {
        numbers.push(number);
      }
    }

    return numbers.sort((a, b) => a - b);
  };

  const getMaxNumber = (type: LotteryType): number => {
    switch (type) {
      case 'megasena':
        return 60;
      case 'lotofacil':
        return 25;
      case 'quina':
        return 80;
      case 'lotomania':
        return 100;
      case 'timemania':
        return 80;
      case 'duplasena':
        return 50;
      default:
        return 60;
    }
  };

  const countMatches = (numbers: number[], drawnNumbers: number[]): number => {
    return numbers.filter(n => drawnNumbers.includes(n)).length;
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Simulador de Jogos</h1>
        <p className="text-muted-foreground">
          Simule jogos e descubra suas chances de ganhar
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuração da Simulação</CardTitle>
            <CardDescription>
              Escolha os números e a quantidade de simulações
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
                  setResults(null);
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
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade de Simulações</label>
              <Input
                type="number"
                min={100}
                max={1000000}
                value={simulations}
                onChange={(e) => setSimulations(Math.min(1000000, Math.max(100, parseInt(e.target.value) || 100)))}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo: 100 | Máximo: 1.000.000
              </p>
            </div>

            <Button
              onClick={handleSimulate}
              disabled={loading || selectedNumbers.length !== getRequiredNumbersCount(lotteryType)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulando...
                </>
              ) : (
                'Simular'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados da Simulação</CardTitle>
            <CardDescription>
              {results
                ? `${results.totalGames.toLocaleString()} jogos simulados`
                : 'Os resultados aparecerão aqui'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Seu Jogo</h3>
                  <LotteryNumbers
                    type={lotteryType}
                    numbers={selectedNumbers}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Distribuição de Acertos</h3>
                  <div className="space-y-2">
                    {Array.from({ length: getRequiredNumbersCount(lotteryType) + 1 }, (_, i) => i)
                      .filter(hits => results.hits[hits])
                      .map(hits => {
                        const count = results.hits[hits];
                        const percentage = (count / results.totalGames) * 100;
                        return (
                          <div key={hits} className="flex items-center gap-2">
                            <div className="w-16 text-sm">{hits} acertos:</div>
                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="w-24 text-sm text-right">
                              {percentage.toFixed(2)}%
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">Média de Acertos</dt>
                      <dd className="text-2xl font-bold">
                        {results.averageHits.toFixed(2)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Chance de Ganhar</dt>
                      <dd className="text-2xl font-bold">
                        {((results.hits[getRequiredNumbersCount(lotteryType)] || 0) / results.totalGames * 100).toFixed(6)}%
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma simulação realizada.</p>
                <p className="text-sm">
                  Configure seu jogo e clique em "Simular" para ver os resultados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
import { LotteryType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { randomId } from '@/lib/utils';

/**
 * Retorna a quantidade de números que precisam ser escolhidos para cada tipo de loteria
 */
export function getRequiredNumbersCount(lotteryType: LotteryType): number {
  switch (lotteryType) {
    case 'megasena':
      return 6;
    case 'lotofacil':
      return 15;
    case 'quina':
      return 5;
    case 'lotomania':
      return 50;
    case 'timemania':
      return 10;
    case 'duplasena':
      return 6;
    default:
      return 6;
  }
}

/**
 * Retorna o número máximo que pode ser escolhido para cada tipo de loteria
 */
export function getMaxNumber(lotteryType: LotteryType): number {
  switch (lotteryType) {
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
}

/**
 * Retorna o nome da loteria em português
 */
export function getLotteryName(lotteryType: LotteryType): string {
  switch (lotteryType) {
    case 'megasena':
      return 'Mega-Sena';
    case 'lotofacil':
      return 'Lotofácil';
    case 'quina':
      return 'Quina';
    case 'lotomania':
      return 'Lotomania';
    case 'timemania':
      return 'Timemania';
    case 'duplasena':
      return 'Dupla Sena';
    default:
      return 'Loteria';
  }
}

/**
 * Retorna a cor da loteria em formato de classe do Tailwind
 */
export function getLotteryColor(lotteryType: LotteryType): string {
  switch (lotteryType) {
    case 'megasena':
      return 'bg-emerald-600 hover:bg-emerald-700';
    case 'lotofacil':
      return 'bg-violet-600 hover:bg-violet-700';
    case 'quina':
      return 'bg-blue-600 hover:bg-blue-700';
    case 'lotomania':
      return 'bg-rose-600 hover:bg-rose-700';
    case 'timemania':
      return 'bg-amber-600 hover:bg-amber-700';
    case 'duplasena':
      return 'bg-pink-600 hover:bg-pink-700';
    default:
      return 'bg-primary hover:bg-primary/90';
  }
}

/**
 * Gera números aleatórios para um jogo
 */
export function generateRandomNumbers(lotteryType: LotteryType): number[] {
  const maxNumber = getMaxNumber(lotteryType);
  const requiredCount = getRequiredNumbersCount(lotteryType);
  
  const allNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
  let remaining = requiredCount;
  const selected: number[] = [];
  
  while (remaining > 0 && allNumbers.length > 0) {
    const randomIndex = Math.floor(Math.random() * allNumbers.length);
    const randomNumber = allNumbers.splice(randomIndex, 1)[0];
    selected.push(randomNumber);
    remaining--;
  }
  
  return selected.sort((a, b) => a - b);
}

/**
 * Gera números padrão para um jogo (1, 2, 3, 4, 5, 6...)
 */
export function generateDefaultNumbers(lotteryType: LotteryType): number[] {
  const requiredCount = getRequiredNumbersCount(lotteryType);
  return Array.from({ length: requiredCount }, (_, i) => i + 1);
}

/**
 * Verifica se a quantidade de números selecionados é válida para o tipo de loteria
 */
export function isValidSelectionCount(count: number, lotteryType: LotteryType): boolean {
  const required = getRequiredNumbersCount(lotteryType);
  return count === required;
}

/**
 * Insere múltiplos bilhetes no banco de dados
 */
export async function insertMultipleTickets(
  poolId: string,
  tickets: number[][]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('lottery_type')
      .eq('id', poolId)
      .single();

    if (poolError) throw poolError;

    const ticketsToInsert = tickets.map(numbers => ({
      id: randomId(),
      pool_id: poolId,
      numbers,
      ticket_number: randomId(8).toUpperCase(),
    }));

    const { error } = await supabase
      .from('tickets')
      .insert(ticketsToInsert);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao inserir bilhetes:', error);
    return {
      success: false,
      error: error.message || 'Erro ao inserir bilhetes'
    };
  }
} 
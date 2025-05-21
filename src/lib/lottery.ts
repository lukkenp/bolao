import { LotteryType } from '@/types';

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
 * Retorna o número máximo para cada tipo de loteria
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
 * Gera um array de números default para cada tipo de loteria
 */
export function generateDefaultNumbers(lotteryType: LotteryType): number[] {
  // Por padrão, vamos apenas retornar um array vazio para o usuário preencher
  return [];
}

/**
 * Verifica se a quantidade de números selecionados é válida para o tipo de loteria
 */
export function isValidSelectionCount(count: number, lotteryType: LotteryType): boolean {
  const required = getRequiredNumbersCount(lotteryType);
  return count === required;
}

/**
 * Retorna uma cor para o tipo de loteria
 */
export function getLotteryColor(lotteryType: LotteryType): string {
  switch (lotteryType) {
    case 'megasena':
      return 'bg-green-600';
    case 'lotofacil':
      return 'bg-purple-600';
    case 'quina':
      return 'bg-blue-600';
    case 'lotomania':
      return 'bg-orange-600';
    case 'timemania':
      return 'bg-emerald-600';
    case 'duplasena':
      return 'bg-red-600';
    default:
      return 'bg-slate-600';
  }
}

/**
 * Retorna o nome formatado do tipo de loteria
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
      return lotteryType.charAt(0).toUpperCase() + lotteryType.slice(1);
  }
} 
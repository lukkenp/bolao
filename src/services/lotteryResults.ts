import { supabase } from '@/integrations/supabase/client';
import { 
  LotteryType, 
  LotteryResult, 
  TicketResult
} from '@/types';
import { Database } from '@/types/database.types';

// Função para calcular o prêmio baseado no tipo de loteria e acertos
function calculatePrizeByLotteryType(
  lotteryType: LotteryType,
  hits: number,
  apiResponse: any
): number {
  try {
    const premiacoes = apiResponse.premiacoes || [];
    switch (lotteryType) {
      case 'megasena': {
        const premio = premiacoes.find((p: any) => {
          switch (hits) {
            case 6: return p.acertos === 'Sena';
            case 5: return p.acertos === 'Quina';
            case 4: return p.acertos === 'Quadra';
            default: return false;
          }
        });
        return premio?.valorPremio || 0;
      }
      case 'lotofacil':
      case 'quina':
      case 'lotomania':
      case 'timemania': {
        const premio = premiacoes.find((p: any) => p.acertos === hits.toString());
        return premio?.valorPremio || 0;
      }
      case 'duplasena': {
        const premio1 = premiacoes.find((p: any) => p.acertos === hits.toString());
        const premio2 = apiResponse.premiacoes2?.find((p: any) => p.acertos === hits.toString());
        return Math.max(premio1?.valorPremio || 0, premio2?.valorPremio || 0);
      }
      default:
        return 0;
    }
  } catch (error) {
    console.error('Erro ao calcular prêmio:', error);
    return 0;
  }
}

type CheckTicketResultData = Database['public']['Functions']['check_ticket_results']['Returns'][number];

// Função para buscar resultado da API da loteria
export async function fetchLotteryResult(lotteryType: LotteryType, drawNumber: number): Promise<LotteryResult | null> {
  try {
    // Primeiro verifica se já temos o resultado no cache
    const { data: cachedResult } = await supabase
      .from('lottery_results_cache')
      .select('*')
      .eq('lottery_type', lotteryType)
      .eq('draw_number', drawNumber.toString())
      .single();

    if (cachedResult) {
      const response = cachedResult.response;
      return {
        id: cachedResult.id,
        lotteryType: cachedResult.lottery_type as LotteryType,
        drawNumber: parseInt(cachedResult.draw_number),
        drawDate: response.data,
        numbers: response.dezenas.map((n: string) => parseInt(n, 10)),
        winners: response.ganhadores || 0,
        accumulated: response.acumulou || false,
        prizes: response.premiacoes?.map((p: any) => ({
          hits: p.acertos,
          winners: p.ganhadores,
          prize: p.valorPremio
        })) || [],
        timeCoracao: response.timeCoracao,
        mesSorte: response.mesSorte,
        acumuladaProxConcurso: response.acumuladaProxConcurso,
        dataProxConcurso: response.dataProxConcurso,
        proxConcurso: response.proxConcurso
      };
    }

    // Se não temos, busca da API
    const apiUrl = `https://loteriascaixa-api.herokuapp.com/api/${lotteryType}/${drawNumber}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || !data.dezenas) {
      throw new Error('Resultado não encontrado');
    }

    // Salva no cache
    const { data: savedCache, error: cacheError } = await supabase
      .from('lottery_results_cache')
      .insert([{
        lottery_type: lotteryType,
        draw_number: drawNumber.toString(),
        draw_date: new Date(data.data).toISOString().split('T')[0],
        response: data
      }])
      .select()
      .single();

    if (cacheError) throw cacheError;

    return {
      id: savedCache.id,
      lotteryType,
      drawNumber,
      drawDate: data.data,
      numbers: data.dezenas.map((n: string) => parseInt(n, 10)),
      winners: data.ganhadores || 0,
      accumulated: data.acumulou || false,
      prizes: data.premiacoes?.map((p: any) => ({
        hits: p.acertos,
        winners: p.ganhadores,
        prize: p.valorPremio
      })) || [],
      timeCoracao: data.timeCoracao,
      mesSorte: data.mesSorte,
      acumuladaProxConcurso: data.acumuladaProxConcurso,
      dataProxConcurso: data.dataProxConcurso,
      proxConcurso: data.proxConcurso
    };
  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
    return null;
  }
}

// Função para verificar acertos de um ticket
function checkTicketHits(ticketNumbers: number[], resultNumbers: number[]): number {
  return ticketNumbers.filter(n => resultNumbers.includes(n)).length;
}

// Função para verificar resultado de um ticket
export const checkTicketResult = async (ticketId: string, drawNumber: number): Promise<TicketResult> => {
  try {
    console.log(`Verificando resultado do ticket ${ticketId} para o concurso ${drawNumber}`);
    const { data, error } = await supabase
      .rpc('check_ticket_results', {
        p_ticket_id: ticketId,
        p_draw_number: drawNumber
      });

    if (error) {
      console.error('Erro ao verificar ticket:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Nenhum resultado encontrado');
    }

    const result = data[0];
    return {
      id: result.id,
      ticketNumber: result.ticket_number,
      numbers: result.numbers,
      matchedNumbers: result.matched_numbers || [],
      hits: result.hits,
      prize: result.prize
    };
  } catch (error) {
    console.error('Erro ao verificar ticket:', error);
    throw error;
  }
};

// Função para verificar resultados de todos os tickets de um bolão
export async function checkPoolResults(poolId: string, drawNumber: number): Promise<TicketResult[]> {
  try {
    console.log(`Verificando resultados do bolão ${poolId} para o concurso ${drawNumber}`);

    // Busca todos os tickets do bolão
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id')
      .eq('pool_id', poolId);

    if (ticketsError) {
      console.error('Erro ao buscar tickets do bolão:', ticketsError);
      throw ticketsError;
    }

    if (!tickets || tickets.length === 0) {
      console.log('Nenhum ticket encontrado para o bolão');
      return [];
    }

    console.log(`Encontrados ${tickets.length} tickets para verificar`);

    // Verifica o resultado de cada ticket
    const results = await Promise.allSettled(
      tickets.map(ticket => checkTicketResult(ticket.id, drawNumber))
    );

    // Filtra apenas os resultados bem-sucedidos
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<TicketResult> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    console.log(`Verificação concluída. ${successfulResults.length} resultados processados`);
    return successfulResults;
  } catch (error) {
    console.error('Erro ao verificar resultados do bolão:', error);
    throw error;
  }
} 
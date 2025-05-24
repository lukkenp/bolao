import { LotteryType, LotteryResult } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Mapeamento dos tipos de loteria para os nomes usados na API da Caixa
const caixaLotteryTypeMapping: Record<LotteryType, string> = {
  megasena: 'mega-sena',
  lotofacil: 'lotofacil',
  quina: 'quina',
  lotomania: 'lotomania',
  timemania: 'timemania',
  duplasena: 'dupla-sena'
};

// Interface para a resposta da API da Caixa
export interface LoteriasApiResponse {
  loteria: string;
  concurso: number;
  data: string;
  local: string;
  dezenasOrdemSorteio: string[];
  dezenas: string[];
  trevos: string[];
  timeCoracao: string | null;
  mesSorte: string | null;
  premiacoes: {
    descricao: string;
    faixa: number;
    ganhadores: number;
    valorPremio: number;
  }[];
  estadosPremiados: string[];
  observacao: string;
  acumulou: boolean;
  proximoConcurso: number;
  dataProximoConcurso: string;
  localGanhadores: {
    ganhadores: number;
    municipio: string;
    nomeFatansiaUL: string;
    serie: string;
    posicao: number;
    uf: string;
  }[];
  valorArrecadado: number;
  valorAcumuladoConcurso_0_5: number;
  valorAcumuladoConcursoEspecial: number;
  valorAcumuladoProximoConcurso: number;
  valorEstimadoProximoConcurso: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(endpoint: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await fetch(`https://loteriascaixa-api.herokuapp.com${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error('No data received from API');
    }
    
    return data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry attempt remaining: ${retries}. Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(endpoint, retries - 1);
    }
    throw error;
  }
}

// Função para verificar cache no Supabase
async function checkCache(lotteryType: LotteryType, drawNumber?: string, drawDate?: string) {
  try {
    let query = supabase
      .from('lottery_results_cache')
      .select('*')
      .eq('lottery_type', lotteryType);

    if (drawNumber) {
      query = query.eq('draw_number', drawNumber);
    }
    if (drawDate) {
      query = query.eq('draw_date', drawDate);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code !== 'PGRST116') { // Não encontrado
        console.error('Erro ao verificar cache:', error);
      }
      return null;
    }

    console.log('Resultado encontrado no cache:', data);
    return data.response;
  } catch (error) {
    console.error('Erro ao acessar cache:', error);
    return null;
  }
}

// Função para salvar no cache
async function saveToCache(lotteryType: LotteryType, drawNumber: string, drawDate: string, response: any) {
  try {
    const { error } = await supabase
      .from('lottery_results_cache')
      .upsert({
        lottery_type: lotteryType,
        draw_number: drawNumber,
        draw_date: drawDate,
        response
      });

    if (error) {
      console.error('Erro ao salvar no cache:', error);
    } else {
      console.log('Resultado salvo no cache com sucesso');
    }
  } catch (error) {
    console.error('Erro ao salvar no cache:', error);
  }
}

const API_BASE_URL = 'https://loteriascaixa-api.herokuapp.com/api';

/**
 * Busca o resultado de uma loteria específica pelo número do concurso
 */
export async function fetchLotteryResult(
  lotteryType: LotteryType,
  drawNumber: string
): Promise<LotteryResult | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${lotteryType}/${drawNumber}`
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar resultado');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
    return null;
  }
}

/**
 * Busca o último resultado de uma loteria específica
 */
export async function fetchLatestLotteryResult(lotteryType: LotteryType): Promise<LotteryResult | null> {
  console.log(`Buscando último resultado para ${lotteryType}`);
  
  try {
    const apiLotteryName = caixaLotteryTypeMapping[lotteryType];
    
    try {
      console.log('Buscando último resultado na API da Caixa...');
      const data = await fetchWithRetry(`/loteria-api/api/${apiLotteryName}/latest`);
      console.log('Último resultado encontrado:', data);
      
      if (!data) {
        throw new Error('Nenhum dado retornado da API');
      }

      // Transforma os dados da API no formato LotteryResult
      const result: LotteryResult = {
        id: data.concurso.toString(),
        lotteryType: lotteryType,
        drawNumber: data.concurso,
        drawDate: data.data,
        numbers: data.dezenas.map((n: string) => parseInt(n, 10)),
        winners: data.ganhadores || 0,
        accumulated: data.acumulou || false,
        prizes: data.premiacoes?.map((p: any) => ({
          hits: p.acertos,
          winners: p.ganhadores,
          prize: p.valorPremio
        })) || [],
        nextPrize: data.acumuladaProxConcurso || 0,
        timeCoracao: data.timeCoracao,
        mesSorte: data.mesSorte,
        acumuladaProxConcurso: data.acumuladaProxConcurso,
        dataProxConcurso: data.dataProxConcurso,
        proxConcurso: data.proxConcurso
      };
      
      // Salva no cache
      if (data.data) {
        const dateParts = data.data.split('/');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        await saveToCache(lotteryType, data.concurso.toString(), formattedDate, data);
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar último resultado:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Erro ao buscar último resultado da loteria:', error);
    toast({
      title: "Erro ao buscar último resultado",
      description: error.message || "Não foi possível buscar o último resultado. Tente novamente mais tarde.",
      variant: "destructive",
    });
    return null;
  }
}

/**
 * Converte uma data no formato DD/MM/YYYY para YYYY-MM-DD
 */
function convertBrazilianDateToISO(date: string): string {
  const [day, month, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Busca o número do concurso baseado na data do sorteio
 */
export async function findDrawNumberByDate(
  lotteryType: LotteryType,
  date: string
): Promise<number | null> {
  try {
    // Converte a data de entrada para um objeto Date
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Data inválida');
    }

    // Busca o último concurso
    const response = await fetch(`${API_BASE_URL}/${lotteryType}/latest`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar concurso');
    }

    const data = await response.json();
    const latestDrawNumber = data.concurso;
    
    // Trata a data do último sorteio
    const latestDrawDate = new Date(data.data.split('/').reverse().join('-'));
    if (isNaN(latestDrawDate.getTime())) {
      throw new Error('Data do último sorteio inválida');
    }

    // Formata as datas para comparação (apenas data, sem hora)
    const formattedTargetDate = targetDate.toISOString().split('T')[0];
    const formattedLatestDate = latestDrawDate.toISOString().split('T')[0];

    // Se a data desejada é posterior ou igual à data do último sorteio,
    // retorna o número do último concurso
    if (formattedTargetDate >= formattedLatestDate) {
      return latestDrawNumber;
    }

    // Se a data desejada é anterior à data do último sorteio,
    // busca o concurso mais próximo
    let currentDrawNumber = latestDrawNumber;
    let currentDrawDate = formattedLatestDate;

    while (currentDrawDate > formattedTargetDate && currentDrawNumber > 1) {
      currentDrawNumber--;
      const response = await fetch(
        `${API_BASE_URL}/${lotteryType}/${currentDrawNumber}`
      );
      
      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      // Converte a data do formato DD/MM/YYYY para YYYY-MM-DD
      const drawDate = new Date(data.data.split('/').reverse().join('-'));
      if (isNaN(drawDate.getTime())) {
        continue;
      }
      
      currentDrawDate = drawDate.toISOString().split('T')[0];

      if (currentDrawDate <= formattedTargetDate) {
        return currentDrawNumber;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar número do concurso:', error);
    return null;
  }
}

/**
 * Converte a resposta da API para o formato usado pela aplicação
 */
export function convertApiResponseToLotteryResult(response: LoteriasApiResponse) {
  try {
    console.log('Convertendo resposta da API:', response);
    
    // Encontra o número total de ganhadores
    const totalWinners = response.premiacoes.reduce((sum, prize) => sum + prize.ganhadores, 0);
    
    // Converte as dezenas de string para número
    const numbers = response.dezenas.map(num => parseInt(num, 10));
    
    // Converte o formato de data
    const dateParts = response.data.split('/');
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    
    const result = {
      id: response.concurso.toString(),
      lotteryType: response.loteria as LotteryType,
      drawNumber: response.concurso.toString(),
      drawDate: formattedDate,
      numbers,
      winners: totalWinners,
      accumulated: response.acumulou,
      prizes: response.premiacoes.map(prize => ({
        hits: prize.descricao,
        winners: prize.ganhadores,
        prize: prize.valorPremio.toFixed(2)
      }))
    };

    console.log('Resultado convertido:', result);
    return result;
  } catch (error: any) {
    console.error('Erro ao converter resposta da API:', error);
    toast({
      title: "Erro ao processar resultado",
      description: "Formato de resposta inválido da API.",
      variant: "destructive",
    });
    throw error;
  }
}

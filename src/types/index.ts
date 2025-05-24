import { Database } from './database.types';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'participant';
};

export type LotteryType = 'megasena' | 'lotofacil' | 'quina' | 'lotomania' | 'timemania' | 'duplasena';

export type PaymentStatus = 'confirmado' | 'pago' | 'pendente';

export type Pool = {
  id: string;
  name: string;
  lotteryType: LotteryType;
  drawDate: string;
  numTickets: number;
  maxParticipants: number;
  contributionAmount: number;
  adminId: string;
  status: string;
  createdAt: string;
};

export type Participant = {
  id: string;
  userId: string | null;
  poolId: string;
  name: string;
  email: string;
  status: PaymentStatus | string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  poolId: string;
  ticketNumber: string;
  numbers: number[];
  createdAt: string;
  lotteryType?: LotteryType;
};

export type LotteryResult = {
  id: string;
  lotteryType: LotteryType;
  drawNumber: number;
  drawDate: string;
  numbers: number[];
  winners: number;
  accumulated: boolean;
  prizes: {
    hits: string;
    winners: number;
    prize: number;
  }[];
  nextPrize: number;
  timeCoracao?: string;
  mesSorte?: string;
  acumuladaProxConcurso?: number;
  dataProxConcurso?: string;
  proxConcurso?: number;
};

export interface TicketResult {
  id: string;
  ticketNumber: string;
  numbers: number[];
  matchedNumbers: number[];
  hits: number;
  prize: number;
}

export type Prize = {
  id: string;
  poolId: string;
  totalAmount: number;
  distributionPerParticipant: number;
  distributed: boolean;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type SupabasePool = {
  id: string;
  name: string;
  lottery_type: LotteryType; // Corrigido para usar o tipo LotteryType em vez de string
  draw_date: string;
  num_tickets: number;
  max_participants: number;
  contribution_amount: number;
  admin_id: string;
  status: 'ativo' | 'finalizado';
  created_at: string;
};

export type SupabaseParticipant = {
  id: string;
  user_id: string;
  pool_id: string;
  name: string;
  email: string;
  status: PaymentStatus;
  created_at: string;
};

export type SupabaseTicket = {
  id: string;
  pool_id: string;
  ticket_number: string;
  numbers: number[];
  created_at: string;
};

export interface FavoriteTicket {
  id: string;
  ticketId: string;
  ticketNumber: string;
  numbers: number[];
  lotteryType: LotteryType;
  poolId: string;
  drawDate: string;
}

export interface SupabaseFavoriteTicket {
  id: string;
  ticket_id: string;
  tickets: {
    id: string;
    ticket_number: string;
    numbers: number[];
    pool: {
      id: string;
      lottery_type: string;
    };
  };
}

export interface MegaSenaResult extends LotteryResult {}
export interface LotofacilResult extends LotteryResult {}
export interface QuinaResult extends LotteryResult {}
export interface LotomaniaResult extends LotteryResult {}
export interface TimemaniaResult extends LotteryResult {
  timeCoracao: string;
}
export interface DuplaSenaResult extends LotteryResult {}

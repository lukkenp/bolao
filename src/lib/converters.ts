import { Pool, Participant, Ticket, SupabasePool, SupabaseParticipant, SupabaseTicket } from '@/types';

/**
 * Converte um objeto SupabasePool para Pool
 */
export const convertSupabasePoolToPool = (pool: SupabasePool): Pool => {
  return {
    id: pool.id,
    name: pool.name,
    lotteryType: pool.lottery_type,
    drawDate: pool.draw_date,
    numTickets: pool.num_tickets,
    maxParticipants: pool.max_participants,
    contributionAmount: Number(pool.contribution_amount),
    adminId: pool.admin_id,
    status: pool.status,
    createdAt: pool.created_at,
  };
};

/**
 * Converte um objeto SupabaseParticipant para Participant
 */
export const convertSupabaseParticipantToParticipant = (participant: SupabaseParticipant): Participant => {
  return {
    id: participant.id,
    userId: participant.user_id,
    poolId: participant.pool_id,
    name: participant.name,
    email: participant.email,
    status: participant.status,
  };
};

/**
 * Converte um objeto SupabaseTicket para Ticket
 */
export const convertSupabaseTicketToTicket = (ticket: SupabaseTicket): Ticket => {
  return {
    id: ticket.id,
    poolId: ticket.pool_id,
    ticketNumber: ticket.ticket_number,
    numbers: ticket.numbers,
  };
}; 
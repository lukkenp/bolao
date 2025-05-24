import { Metadata } from 'next';
import { LotteryTicket } from '@/components/lottery/LotteryTicket';
import { getFavoriteTickets } from '@/services/tickets';

export const metadata: Metadata = {
  title: 'Meus Bilhetes Favoritos',
  description: 'Visualize seus bilhetes favoritos',
};

export default async function FavoritesPage() {
  const tickets = await getFavoriteTickets();

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meus Bilhetes Favoritos</h1>
        <p className="text-muted-foreground">
          {tickets.length} {tickets.length === 1 ? 'bilhete favoritado' : 'bilhetes favoritados'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <LotteryTicket
            key={ticket.id}
            id={ticket.id}
            type={ticket.type}
            numbers={ticket.numbers}
            ticketNumber={ticket.ticket_number}
            poolId={ticket.pool_id}
            drawDate={ticket.draw_date}
            onFavoriteChange={() => {}}
          />
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Você ainda não tem bilhetes favoritos.</p>
          <p className="text-sm text-muted-foreground">
            Favorite seus bilhetes para acompanhar os resultados mais facilmente.
          </p>
        </div>
      )}
    </div>
  );
} 
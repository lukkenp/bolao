import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FavoriteTicket, LotteryType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/layout/MainLayout';
import LotteryTicket from '@/components/lottery/LotteryTicket';
import { Loader2 } from 'lucide-react';
import { PostgrestResponse } from '@supabase/supabase-js';

interface SupabaseFavoriteTicket {
  id: string;
  ticket_id: string;
  tickets: {
    id: string;
    ticket_number: string;
    numbers: number[];
    pool: {
      id: string;
      lottery_type: string;
      draw_date: string;
    };
  };
}

export default function FavoriteTickets() {
  const [favorites, setFavorites] = useState<FavoriteTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadFavorites = async () => {
    if (!user?.id) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorite_tickets')
        .select(`
          id,
          ticket_id,
          tickets (
            id,
            ticket_number,
            numbers,
            pool:pools (
              id,
              lottery_type,
              draw_date
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as PostgrestResponse<SupabaseFavoriteTicket>;

      if (error) throw error;

      if (!data) {
        setFavorites([]);
        return;
      }

      const favoriteTickets = data
        .filter(favorite => favorite.tickets) // Filtra tickets nulos
        .map(favorite => ({
          id: favorite.id,
          ticketId: favorite.tickets.id,
          ticketNumber: favorite.tickets.ticket_number,
          numbers: favorite.tickets.numbers,
          lotteryType: favorite.tickets.pool.lottery_type as LotteryType,
          poolId: favorite.tickets.pool.id,
          drawDate: favorite.tickets.pool.draw_date
        }));

      setFavorites(favoriteTickets);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus bilhetes favoritos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  if (!user) {
    return (
      <MainLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Você precisa estar logado para ver seus bilhetes favoritos.
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Meus Bilhetes Favoritos
          </h1>
          <p className="text-muted-foreground mt-1">
            {favorites.length} {favorites.length === 1 ? 'bilhete favoritado' : 'bilhetes favoritados'}
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Nenhum bilhete favoritado</p>
                <p className="text-muted-foreground">
                  Você ainda não tem bilhetes favoritos. Favorite alguns bilhetes para vê-los aqui.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <LotteryTicket
                key={favorite.id}
                id={favorite.ticketId}
                type={favorite.lotteryType}
                numbers={favorite.numbers}
                ticketNumber={favorite.ticketNumber}
                poolId={favorite.poolId}
                drawDate={favorite.drawDate}
                onFavoriteChange={loadFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Pool, Participant, Ticket, LotteryType } from '@/types';
import { 
  convertSupabasePoolToPool, 
  convertSupabaseParticipantToParticipant, 
  convertSupabaseTicketToTicket
} from '@/lib/converters';
import type { SupabasePool, SupabaseParticipant, SupabaseTicket } from '@/types/supabase';
import ParticipantList from '@/components/participants/ParticipantList';
import AddParticipantForm from '@/components/participants/AddParticipantForm';
import LotteryTicket from '@/components/lottery/LotteryTicket';
import AddTicketForm from '@/components/lottery/AddTicketForm';
import { PoolResults } from '@/components/lottery/PoolResults';

export default function PoolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState<Pool | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('participantes');

  useEffect(() => {
    if (!id) {
      navigate('/meus-boloes');
      return;
    }

    fetchPoolData();
  }, [id]);

  const fetchPoolData = async () => {
    try {
      setLoading(true);

      // Buscar dados do bolão
      const { data: poolData, error: poolError } = await supabase
        .from('pools')
        .select('*')
        .eq('id', id)
        .single();

      if (poolError) throw poolError;
      if (!poolData) throw new Error('Bolão não encontrado');

      const convertedPool = convertSupabasePoolToPool(poolData);
      setPool(convertedPool);
      setIsAdmin(user?.id === poolData.admin_id);

      // Buscar participantes do bolão
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('pool_id', id)
        .order('created_at', { ascending: false });

      if (participantsError) throw participantsError;
      
      if (participantsData && participantsData.length > 0) {
        const convertedParticipants = participantsData.map((p: SupabaseParticipant) => 
          convertSupabaseParticipantToParticipant(p)
        );
        setParticipants(convertedParticipants);
      } else {
        setParticipants([]);
      }

      // Buscar bilhetes do bolão
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          pool:pools (
            lottery_type
          )
        `)
        .eq('pool_id', id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      
      setTickets(
        (ticketsData || []).map((t: any) => ({
          ...convertSupabaseTicketToTicket(t),
          lotteryType: t.pool.lottery_type as LotteryType
        }))
      );

    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
      navigate('/meus-boloes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!pool) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold">Bolão não encontrado</h2>
          <p className="text-muted-foreground mt-2">O bolão solicitado não existe ou você não tem acesso a ele.</p>
        </div>
      </MainLayout>
    );
  }

  const lotteryNames: Record<string, string> = {
    megasena: 'Mega-Sena',
    lotofacil: 'Lotofácil',
    quina: 'Quina',
    lotomania: 'Lotomania',
    timemania: 'Timemania',
    duplasena: 'Dupla Sena'
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{pool.name}</h1>
            <Badge variant="outline" className={pool.status === 'ativo' ? 
              "bg-green-100 text-green-800" : 
              "bg-gray-100 text-gray-800"
            }>
              {pool.status === 'ativo' ? 'Ativo' : 'Finalizado'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {lotteryNames[pool.lotteryType] || pool.lotteryType} • Sorteio: {new Date(pool.drawDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participants.length} / {pool.maxParticipants}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Contribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {pool.contributionAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Bilhetes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets.length} / {pool.numTickets}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <PoolResults 
            poolId={id!} 
            poolName={pool.name} 
            drawDate={new Date(pool.drawDate).toISOString().split('T')[0]}
            lotteryType={pool.lotteryType as LotteryType}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="bilhetes">Bilhetes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="participantes" className="space-y-4">
            {isAdmin && (
              <AddParticipantForm 
                poolId={id!} 
                onParticipantAdded={fetchPoolData}
              />
            )}
            
            <ParticipantList 
              participants={participants}
              isAdmin={isAdmin}
              onParticipantUpdated={fetchPoolData}
            />
          </TabsContent>
          
          <TabsContent value="bilhetes" className="space-y-4">
            {isAdmin && tickets.length < pool.numTickets && (
              <AddTicketForm 
                poolId={id!}
                lotteryType={pool.lotteryType as LotteryType}
                onTicketAdded={fetchPoolData}
              />
            )}
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <LotteryTicket
                  key={ticket.id}
                  id={ticket.id}
                  type={ticket.lotteryType || pool.lotteryType}
                  numbers={ticket.numbers}
                  ticketNumber={ticket.ticketNumber}
                  poolId={pool.id}
                  drawDate={pool.drawDate}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

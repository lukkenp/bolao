import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import type { SupabasePool, SupabaseParticipant, SupabaseTicket } from '@/types';
import ParticipantList from '@/components/participants/ParticipantList';
import AddParticipantForm from '@/components/participants/AddParticipantForm';
import LotteryTicket from '@/components/lottery/LotteryTicket';
import AddTicketForm from '@/components/lottery/AddTicketForm';

export default function PoolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('participantes');
  
  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState<Pool | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchPoolData();
    }
  }, [id, user]);

  const fetchPoolData = async () => {
    if (!id || !user) return;

    setLoading(true);
    try {
      // Buscar informações do bolão
      const { data: poolData, error: poolError } = await supabase
        .from('pools')
        .select('*')
        .eq('id', id)
        .single();

      if (poolError) throw poolError;
      if (!poolData) {
        toast({
          title: "Bolão não encontrado",
          description: "O bolão solicitado não existe ou você não tem acesso a ele.",
          variant: "destructive",
        });
        navigate('/meus-boloes');
        return;
      }

      const convertedPool = convertSupabasePoolToPool(poolData as SupabasePool);
      setPool(convertedPool);
      setIsAdmin(poolData.admin_id === user.id);

      // Buscar participantes do bolão
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('pool_id', id)
        .order('created_at', { ascending: false });

      if (participantsError) {
        console.error('Erro ao buscar participantes:', participantsError);
        throw participantsError;
      }
      
      console.log('Participantes encontrados:', participantsData);
      
      if (participantsData && participantsData.length > 0) {
        const convertedParticipants = participantsData.map((p: SupabaseParticipant) => 
          convertSupabaseParticipantToParticipant(p)
        );
        console.log('Participantes convertidos:', convertedParticipants);
        setParticipants(convertedParticipants);
      } else {
        setParticipants([]);
      }

      // Buscar bilhetes do bolão
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('pool_id', id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      
      setTickets(
        (ticketsData || []).map((t: SupabaseTicket) => 
          convertSupabaseTicketToTicket(t)
        )
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
              "bg-green-100 text-green-800 hover:bg-green-100" : 
              "bg-gray-100 text-gray-800 hover:bg-gray-100"
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="bilhetes">Bilhetes</TabsTrigger>
            <TabsTrigger value="premios">Prêmios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="participantes" className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Lista de Participantes</h3>
              {isAdmin && pool.status === 'ativo' && participants.length < pool.maxParticipants && (
                <AddParticipantForm 
                  poolId={id!} 
                  onParticipantAdded={fetchPoolData}
                />
              )}
            </div>
            <Card>
              <CardContent className="p-0">
                <ParticipantList 
                  participants={participants} 
                  isAdmin={isAdmin} 
                  onParticipantUpdated={fetchPoolData}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bilhetes" className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bilhetes</h3>
              {isAdmin && pool.status === 'ativo' && tickets.length < pool.numTickets && (
                <AddTicketForm 
                  poolId={id!} 
                  lotteryType={pool.lotteryType as LotteryType}
                  onTicketAdded={fetchPoolData}
                />
              )}
            </div>
            {tickets.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                {tickets.map(ticket => (
                  <LotteryTicket key={ticket.id} ticket={ticket} type={pool.lotteryType as LotteryType} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Nenhum bilhete registrado para este bolão ainda.
                    {isAdmin && pool.status === 'ativo' && (
                      <span className="block mt-2">
                        Clique em "Adicionar Bilhete" para começar.
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="premios" className="pt-6">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Nenhum prêmio registrado para este bolão ainda.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

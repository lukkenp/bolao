import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Trophy, Users } from 'lucide-react';

interface PoolStatusProps {
  participantsCount: number;
  maxParticipants: number;
  entryFee: number;
  totalPrize: number;
  isOpen: boolean;
}

export function PoolStatus({
  participantsCount,
  maxParticipants,
  entryFee,
  totalPrize,
  isOpen
}: PoolStatusProps) {
  const progress = (participantsCount / maxParticipants) * 100;
  const availableSpots = maxParticipants - participantsCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Status do Bolão
          <Badge variant={isOpen ? 'default' : 'secondary'}>
            {isOpen ? 'Aberto' : 'Fechado'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progresso de Participantes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Participantes</span>
            </div>
            <span className="font-medium">
              {participantsCount}/{maxParticipants}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {availableSpots > 0 && (
            <p className="text-sm text-muted-foreground">
              Ainda {availableSpots} {availableSpots === 1 ? 'vaga' : 'vagas'} disponível
              {availableSpots !== 1 && 'is'}!
            </p>
          )}
        </div>

        {/* Informações do Prêmio */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium">Prêmio</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor por Cota</p>
              <p className="text-lg font-medium">{formatCurrency(entryFee)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prêmio Total</p>
              <p className="text-lg font-medium text-green-600">
                {formatCurrency(totalPrize)}
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de Status */}
        {isOpen ? (
          availableSpots > 0 ? (
            <p className="text-sm text-center text-muted-foreground">
              Convide seus amigos para participar do bolão!
            </p>
          ) : (
            <p className="text-sm text-center font-medium text-green-600">
              Bolão completo! Boa sorte a todos!
            </p>
          )
        ) : (
          <p className="text-sm text-center text-muted-foreground">
            Este bolão já está fechado para novos participantes.
          </p>
        )}
      </CardContent>
    </Card>
  );
} 
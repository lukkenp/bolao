import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Clock, DollarSign, Users } from 'lucide-react';

interface PoolInfoProps {
  title: string;
  description?: string;
  drawDate: string;
  drawTime: string;
  entryFee: number;
  participantsCount: number;
  maxParticipants: number;
  isAdmin: boolean;
  onShare?: () => void;
  onEdit?: () => void;
}

export function PoolInfo({
  title,
  description,
  drawDate,
  drawTime,
  entryFee,
  participantsCount,
  maxParticipants,
  isAdmin,
  onShare,
  onEdit
}: PoolInfoProps) {
  const formattedDate = drawDate ? new Date(drawDate + 'T00:00:00').toLocaleDateString('pt-BR') : '';
  const availableSpots = maxParticipants - participantsCount;
  const totalPrize = entryFee * maxParticipants;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-2">{description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                Compartilhar
              </Button>
            )}
            {isAdmin && onEdit && (
              <Button size="sm" onClick={onEdit}>
                Editar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações do Sorteio */}
          <div className="space-y-4">
            <h3 className="font-medium">Informações do Sorteio</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{drawTime}</span>
              </div>
            </div>
          </div>

          <Separator className="md:hidden" />

          {/* Informações do Bolão */}
          <div className="space-y-4">
            <h3 className="font-medium">Informações do Bolão</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span>Participantes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{participantsCount}/{maxParticipants}</span>
                  {availableSpots > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {availableSpots} {availableSpots === 1 ? 'vaga' : 'vagas'}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Valor por Cota</span>
                </div>
                <span className="font-medium">{formatCurrency(entryFee)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prêmio Total */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Prêmio Total</h4>
              <p className="text-sm text-muted-foreground">
                {maxParticipants} {maxParticipants === 1 ? 'cota' : 'cotas'} x {formatCurrency(entryFee)}
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalPrize)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
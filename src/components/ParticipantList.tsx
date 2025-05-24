import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Crown, Plus, UserPlus, X } from 'lucide-react';
import { SelectNumbersDialog } from '@/components/SelectNumbersDialog';
import { LotteryType } from '@/types';
import { useParticipantsList } from '@/hooks/useParticipantsList';
import { getLotteryColor } from '@/lib/lottery';
import { cn } from '@/lib/utils';

interface ParticipantListProps {
  poolId: string;
  maxParticipants: number;
  isAdmin: boolean;
  lotteryType: LotteryType;
  currentUserId?: string;
  onAddParticipant?: () => void;
  onRemoveParticipant?: (id: string) => void;
  onConfirmParticipant?: (id: string) => void;
  onNumbersSelected?: () => void;
}

export function ParticipantList({
  poolId,
  maxParticipants,
  isAdmin,
  lotteryType,
  currentUserId,
  onAddParticipant,
  onRemoveParticipant,
  onConfirmParticipant,
  onNumbersSelected
}: ParticipantListProps) {
  const [showConfirmed, setShowConfirmed] = useState(true);
  const { confirmedParticipants, pendingParticipants } = useParticipantsList(poolId);
  const baseColorClass = getLotteryColor(lotteryType);

  const handleRemoveParticipant = (participantId: string) => {
    if (onRemoveParticipant) {
      onRemoveParticipant(participantId);
    }
  };

  const handleConfirmParticipant = (participantId: string) => {
    if (onConfirmParticipant) {
      onConfirmParticipant(participantId);
    }
  };

  const handleNumbersSelected = () => {
    if (onNumbersSelected) {
      onNumbersSelected();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Participantes</CardTitle>
            <CardDescription>
              {confirmedParticipants.length} de {maxParticipants} participantes
            </CardDescription>
          </div>
          {onAddParticipant && confirmedParticipants.length < maxParticipants && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddParticipant}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Adicionar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Participantes Confirmados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Confirmados</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmed(!showConfirmed)}
              >
                {showConfirmed ? 'Esconder' : 'Mostrar'}
              </Button>
            </div>
            {showConfirmed && (
              <div className="space-y-2">
                {confirmedParticipants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between bg-muted/50 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={participant.avatarUrl}
                                  alt={participant.name}
                                />
                                <AvatarFallback>
                                  {participant.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {index === 0 && (
                                <Crown className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{participant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {participant.email}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div>
                        <p className="text-sm font-medium">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {participant.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.numbers ? (
                        <div className="flex gap-1">
                          {participant.numbers.map((number, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                baseColorClass.replace('bg-', 'border-').replace('-600', '-500'),
                                baseColorClass.replace('bg-', 'text-').replace('-600', '-700')
                              )}
                            >
                              {number.toString().padStart(2, '0')}
                            </Badge>
                          ))}
                        </div>
                      ) : participant.id === currentUserId && (
                        <SelectNumbersDialog
                          poolId={poolId}
                          participantId={participant.id}
                          lotteryType={lotteryType}
                          onNumbersSelected={handleNumbersSelected}
                          trigger={
                            <Button variant="outline" size="sm">
                              Escolher Números
                            </Button>
                          }
                        />
                      )}
                      {isAdmin && onRemoveParticipant && index !== 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveParticipant(participant.id)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Participantes Pendentes */}
          {pendingParticipants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Aguardando Confirmação</h3>
              <div className="space-y-2">
                {pendingParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between bg-muted/50 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={participant.avatarUrl}
                          alt={participant.name}
                        />
                        <AvatarFallback>
                          {participant.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {participant.email}
                        </p>
                      </div>
                    </div>
                    {isAdmin && onConfirmParticipant && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleConfirmParticipant(participant.id)}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
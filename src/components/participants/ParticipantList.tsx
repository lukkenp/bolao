import { Participant } from '@/types';
import StatusBadge from '../ui/StatusBadge';
import { Card, CardContent } from '../ui/card';
import ConfirmParticipant from './ConfirmParticipant';

type ParticipantListProps = {
  participants: Participant[];
  isAdmin?: boolean;
  onParticipantUpdated?: () => void;
};

export default function ParticipantList({ 
  participants, 
  isAdmin = false,
  onParticipantUpdated = () => {} 
}: ParticipantListProps) {
  // Verificação de segurança para participantes
  const hasParticipants = Array.isArray(participants) && participants.length > 0;
  
  console.log('Renderizando ParticipantList:', { participantsCount: participants?.length, isAdmin });

  return (
    <div className="overflow-x-auto">
      {hasParticipants ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              {isAdmin && (
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={participant.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">{participant.name}</td>
                <td className="px-4 py-3">{participant.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={participant.status} />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    {participant.status === 'pendente' && (
                      <ConfirmParticipant
                        participantId={participant.id}
                        participantName={participant.name}
                        onConfirmed={onParticipantUpdated}
                      />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhum participante registrado neste bolão ainda.
            {isAdmin && (
              <span className="block mt-2">
                Clique em "Adicionar Participante" para começar.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { PoolInfo } from '@/components/PoolInfo';
import { PoolResults } from '@/components/lottery/PoolResults';
import { ParticipantList } from '@/components/ParticipantList';
import { PoolStatus } from '@/components/PoolStatus';
import { LoadingPool } from '@/components/LoadingPool';
import { AddParticipantDialog } from '@/components/AddParticipantDialog';
import { usePool } from '@/hooks/usePool';
import { useParticipantsList } from '@/hooks/useParticipantsList';

export default function PoolPage() {
  const { id } = useParams<{ id: string }>();
  const {
    loading: poolLoading,
    error: poolError,
    pool,
    isAdmin,
    currentUserId,
    handleShare,
    handleRemoveParticipant,
    handleConfirmParticipant,
  } = usePool({ poolId: id! });

  const {
    loading: participantsLoading,
    error: participantsError,
    participants,
    totalParticipants,
    refresh: refreshParticipants,
  } = useParticipantsList({ poolId: id! });

  if (poolLoading || !pool) {
    return <LoadingPool />;
  }

  if (poolError) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          <h2 className="text-lg font-semibold">Erro ao carregar bolão</h2>
          <p>{poolError}</p>
        </div>
      </div>
    );
  }

  const totalPrize = pool.contribution_amount * pool.max_participants;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda */}
        <div className="lg:col-span-2 space-y-6">
          <PoolInfo
            title={pool.name}
            description={pool.description}
            drawDate={pool.draw_date}
            drawTime={pool.draw_time}
            entryFee={pool.contribution_amount}
            participantsCount={totalParticipants}
            maxParticipants={pool.max_participants}
            isAdmin={isAdmin}
            onShare={handleShare}
            onEdit={isAdmin ? () => {} : undefined}
          />
          <PoolResults
            poolId={pool.id}
            poolName={pool.name}
            drawDate={pool.draw_date}
            lotteryType={pool.lottery_type}
          />
        </div>

        {/* Coluna da Direita */}
        <div className="space-y-6">
          <PoolStatus
            participantsCount={totalParticipants}
            maxParticipants={pool.max_participants}
            entryFee={pool.contribution_amount}
            totalPrize={totalPrize}
            isOpen={pool.is_open}
          />
          <ParticipantList
            poolId={pool.id}
            maxParticipants={pool.max_participants}
            isAdmin={isAdmin}
            lotteryType={pool.lottery_type}
            currentUserId={currentUserId}
            onAddParticipant={isAdmin && pool.is_open ? () => {} : undefined}
            onRemoveParticipant={handleRemoveParticipant}
            onConfirmParticipant={handleConfirmParticipant}
            onNumbersSelected={refreshParticipants}
          />
          {isAdmin && pool.is_open && (
            <AddParticipantDialog
              poolId={pool.id}
              onParticipantAdded={refreshParticipants}
            />
          )}
        </div>
      </div>
    </div>
  );
} 
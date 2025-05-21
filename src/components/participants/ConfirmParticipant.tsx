import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type ConfirmParticipantProps = {
  participantId: string;
  participantName: string;
  onConfirmed: () => void;
};

export default function ConfirmParticipant({ 
  participantId, 
  participantName, 
  onConfirmed 
}: ConfirmParticipantProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!participantId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('participants')
        .update({ status: 'confirmado' })
        .eq('id', participantId);

      if (error) throw error;

      toast({
        title: "Participante confirmado!",
        description: `${participantName} foi confirmado no bolão.`,
      });

      onConfirmed();
    } catch (error: any) {
      console.error('Erro ao confirmar participante:', error);
      toast({
        title: "Erro ao confirmar participante",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleConfirm}
      disabled={loading}
      className="text-sm font-medium text-primary hover:text-primary/80 p-0 h-auto"
    >
      {loading ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Confirmando...
        </>
      ) : (
        "Confirmar"
      )}
    </Button>
  );
} 
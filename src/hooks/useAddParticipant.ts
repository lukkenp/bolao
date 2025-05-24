import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UseAddParticipantProps {
  poolId: string;
  onSuccess?: () => void;
}

interface AddParticipantData {
  email: string;
  name: string;
}

export function useAddParticipant({ poolId, onSuccess }: UseAddParticipantProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addParticipant = async (data: AddParticipantData) => {
    try {
      setLoading(true);

      // Verifica se o usuário já existe
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Cria um novo usuário
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: data.email,
            name: data.name,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        if (!newUser) throw new Error('Erro ao criar usuário');

        userId = newUser.id;
      }

      // Verifica se o usuário já está no bolão
      const { data: existingParticipant, error: participantError } = await supabase
        .from('pool_participants')
        .select('id')
        .eq('pool_id', poolId)
        .eq('user_id', userId)
        .single();

      if (participantError && participantError.code !== 'PGRST116') {
        throw participantError;
      }

      if (existingParticipant) {
        throw new Error('Este participante já está no bolão');
      }

      // Adiciona o participante ao bolão
      const { error: addError } = await supabase
        .from('pool_participants')
        .insert({
          pool_id: poolId,
          user_id: userId,
          status: 'pending',
        });

      if (addError) throw addError;

      toast({
        title: 'Participante adicionado',
        description: 'O participante foi adicionado com sucesso.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao adicionar participante:', error);
      toast({
        title: 'Erro ao adicionar participante',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addParticipant,
  };
} 
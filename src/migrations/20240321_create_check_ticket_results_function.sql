-- Função para verificar resultados dos bilhetes
CREATE OR REPLACE FUNCTION check_ticket_results(
  p_ticket_id UUID,
  p_draw_number INTEGER
)
RETURNS TABLE (
  id UUID,
  ticket_number TEXT,
  numbers INTEGER[],
  winning_numbers INTEGER[],
  hits INTEGER,
  prize NUMERIC
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket_data RECORD;
  v_lottery_result RECORD;
  v_hits INTEGER;
  v_prize NUMERIC;
BEGIN
  -- Busca os dados do ticket e do bolão
  SELECT t.*, p.lottery_type
  INTO v_ticket_data
  FROM tickets t
  JOIN pools p ON t.pool_id = p.id
  WHERE t.id = p_ticket_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket não encontrado';
  END IF;

  -- Busca o resultado do sorteio
  SELECT *
  INTO v_lottery_result
  FROM lottery_results_cache
  WHERE lottery_type = v_ticket_data.lottery_type
    AND draw_number = p_draw_number::TEXT;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Resultado não encontrado';
  END IF;

  -- Calcula os acertos
  SELECT COUNT(*)
  INTO v_hits
  FROM unnest(v_ticket_data.numbers) n
  WHERE n = ANY(ARRAY(SELECT DISTINCT (jsonb_array_elements_text(v_lottery_result.response->'dezenas'))::INTEGER));

  -- Calcula o prêmio baseado nos acertos
  v_prize := COALESCE((
    SELECT (premios.value->>'valorPremio')::NUMERIC
    FROM jsonb_array_elements(v_lottery_result.response->'premiacoes') premios
    WHERE (
      CASE 
        WHEN v_ticket_data.lottery_type = 'megasena' THEN
          CASE v_hits
            WHEN 6 THEN premios.value->>'acertos' = 'Sena'
            WHEN 5 THEN premios.value->>'acertos' = 'Quina'
            WHEN 4 THEN premios.value->>'acertos' = 'Quadra'
            ELSE FALSE
          END
        ELSE
          (premios.value->>'acertos')::INTEGER = v_hits
      END
    )
  ), 0);

  -- Salva o resultado
  INSERT INTO ticket_results (
    ticket_id,
    draw_number,
    hits,
    prize_value,
    created_at
  ) VALUES (
    p_ticket_id,
    p_draw_number,
    v_hits,
    v_prize,
    NOW()
  );

  -- Retorna o resultado
  RETURN QUERY
  SELECT 
    v_ticket_data.id,
    v_ticket_data.ticket_number,
    v_ticket_data.numbers,
    ARRAY(SELECT DISTINCT (jsonb_array_elements_text(v_lottery_result.response->'dezenas'))::INTEGER),
    v_hits,
    v_prize;
END;
$$ LANGUAGE plpgsql; 
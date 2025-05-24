-- Enable RLS on ticket_results table
ALTER TABLE ticket_results ENABLE ROW LEVEL SECURITY;

-- Policy for inserting results (via function)
CREATE POLICY "Enable insert for authenticated users executing function"
ON ticket_results FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets t
    JOIN pools p ON t.pool_id = p.id
    WHERE t.id = ticket_results.ticket_id
    AND (
      -- Allow if user is pool admin
      p.admin_id = auth.uid()
      OR
      -- Allow if user is participant
      EXISTS (
        SELECT 1 FROM participants
        WHERE pool_id = p.id
        AND user_id = auth.uid()
        AND status = 'confirmado'
      )
    )
  )
);

-- Policy for viewing results
CREATE POLICY "Enable read access for users in pool"
ON ticket_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    JOIN pools p ON t.pool_id = p.id
    WHERE t.id = ticket_results.ticket_id
    AND (
      -- Allow if user is pool admin
      p.admin_id = auth.uid()
      OR
      -- Allow if user is participant
      EXISTS (
        SELECT 1 FROM participants
        WHERE pool_id = p.id
        AND user_id = auth.uid()
        AND status = 'confirmado'
      )
    )
  )
);

-- Policy for updating results
CREATE POLICY "Enable update for pool admin"
ON ticket_results FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    JOIN pools p ON t.pool_id = p.id
    WHERE t.id = ticket_results.ticket_id
    AND p.admin_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets t
    JOIN pools p ON t.pool_id = p.id
    WHERE t.id = ticket_results.ticket_id
    AND p.admin_id = auth.uid()
  )
);

-- Policy for deleting results
CREATE POLICY "Enable delete for pool admin"
ON ticket_results FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tickets t
    JOIN pools p ON t.pool_id = p.id
    WHERE t.id = ticket_results.ticket_id
    AND p.admin_id = auth.uid()
  )
); 
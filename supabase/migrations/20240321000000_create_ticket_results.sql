-- Create the ticket_results table
CREATE TABLE IF NOT EXISTS public.ticket_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.tickets(id) NOT NULL,
    draw_number INTEGER NOT NULL,
    hits INTEGER NOT NULL,
    prize_value DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(ticket_id, draw_number)
);

-- Enable RLS
ALTER TABLE public.ticket_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "RLS: ticket_results_select" 
    ON public.ticket_results
    FOR SELECT 
    TO authenticated 
    USING (
        ticket_id IN (
            SELECT t.id 
            FROM tickets t 
            JOIN pools p ON t.pool_id = p.id 
            WHERE p.admin_id = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM participants 
                WHERE pool_id = p.id 
                AND user_id = auth.uid()
            )
        )
    );

CREATE POLICY "RLS: ticket_results_insert" 
    ON public.ticket_results
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        ticket_id IN (
            SELECT t.id 
            FROM tickets t 
            JOIN pools p ON t.pool_id = p.id 
            WHERE p.admin_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX idx_ticket_results_ticket_id ON public.ticket_results(ticket_id);
CREATE INDEX idx_ticket_results_draw_number ON public.ticket_results(draw_number); 
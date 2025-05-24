-- Create the favorite_tickets table
CREATE TABLE IF NOT EXISTS public.favorite_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    lottery_type TEXT NOT NULL,
    numbers INTEGER[] NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_lottery_type CHECK (lottery_type IN ('megasena', 'lotofacil', 'quina', 'lotomania', 'timemania', 'duplasena'))
);

-- Enable RLS
ALTER TABLE public.favorite_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "RLS: favorite_tickets_select" 
    ON public.favorite_tickets
    FOR SELECT 
    TO authenticated 
    USING (user_id = auth.uid());

CREATE POLICY "RLS: favorite_tickets_insert" 
    ON public.favorite_tickets
    FOR INSERT 
    TO authenticated 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "RLS: favorite_tickets_delete" 
    ON public.favorite_tickets
    FOR DELETE 
    TO authenticated 
    USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_favorite_tickets_user_id ON public.favorite_tickets(user_id);
CREATE INDEX idx_favorite_tickets_lottery_type ON public.favorite_tickets(lottery_type); 
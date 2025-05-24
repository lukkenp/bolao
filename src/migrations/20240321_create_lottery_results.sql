-- Create lottery_results table
CREATE TABLE IF NOT EXISTS lottery_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lottery_type TEXT NOT NULL,
  draw_number INTEGER NOT NULL,
  draw_date DATE NOT NULL,
  numbers INTEGER[] NOT NULL,
  winners INTEGER NOT NULL DEFAULT 0,
  accumulated BOOLEAN NOT NULL DEFAULT false,
  prizes JSONB NOT NULL DEFAULT '[]',
  time_coracao TEXT,
  mes_sorte TEXT,
  acumulada_prox_concurso NUMERIC(15,2),
  data_prox_concurso DATE,
  prox_concurso INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lottery_type, draw_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lottery_results_lookup 
ON lottery_results(lottery_type, draw_number);

-- Create index for date-based lookups
CREATE INDEX IF NOT EXISTS idx_lottery_results_date 
ON lottery_results(lottery_type, draw_date);

-- Add RLS policies
ALTER TABLE lottery_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON lottery_results
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON lottery_results
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON lottery_results
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lottery_results_updated_at
  BEFORE UPDATE ON lottery_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    due_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Other',
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid')),
    reminder_email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
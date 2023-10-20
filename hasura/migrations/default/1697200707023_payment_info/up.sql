CREATE TABLE accounting.payment_info (
    id SERIAL PRIMARY KEY,
    contractor_id INT REFERENCES public.contractor(id) ON DELETE CASCADE,

    method text NOT NULL DEFAULT 'swift',

    swift text,
    swift_iban text,

    ach_routing text,
    ach_account text,

    usdt_wallet text,

    UNIQUE (contractor_id)
);

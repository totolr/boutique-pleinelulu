-- Pleine Lulu : schéma Supabase.
-- À exécuter dans Supabase Dashboard > SQL Editor.

-- Table stock : une ligne par produit/couleur/taille.

CREATE TABLE IF NOT EXISTS stock (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id  TEXT NOT NULL,
  color       TEXT NOT NULL,
  size        TEXT NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, color, size)
);

CREATE INDEX IF NOT EXISTS idx_stock_product ON stock (product_id);

-- Table orders : historique des commandes.

CREATE TABLE IF NOT EXISTS orders (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email    TEXT,
  amount_total      INTEGER NOT NULL,
  items             JSONB NOT NULL,
  status            TEXT DEFAULT 'paid',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Colonnes additionnelles (idempotent : ne casse rien si déjà présentes)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number    TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes           TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name   TEXT;
-- 'delivery' (livraison La Poste) ou 'pickup' (retrait sur place) : deduit du montant de port a la commande
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
-- Horodatage d'envoi du mail d'expedition/retrait : garde-fou anti double-envoi
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_email_sent_at TIMESTAMPTZ;
-- Coordonnees de livraison (nom + adresse) telles que collectees par Stripe, pour le dashboard
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
-- Adresse de facturation (collectee pour tous, utile en retrait et pour la facture)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- Contrainte sur les statuts autorisés
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD  CONSTRAINT orders_status_check
  CHECK (status IN ('paid', 'preparing', 'shipped', 'delivered', 'cancelled'));

-- Numérotation des commandes (PL-YYYY-NNNN).
-- Compteur global croissant, jamais remis à zéro : garantit l'unicité sans
-- verrou applicatif.

CREATE SEQUENCE IF NOT EXISTS order_number_seq;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'PL-' || to_char(NOW(), 'YYYY')
                     || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_set_number ON orders;
CREATE TRIGGER orders_set_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);

-- Fonction : décrémentation atomique du stock.
-- Empêche la survente même si deux commandes arrivent en même temps.

CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id TEXT,
  p_color      TEXT,
  p_size       TEXT,
  p_quantity   INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  current_qty INTEGER;
BEGIN
  SELECT quantity INTO current_qty
  FROM stock
  WHERE product_id = p_product_id AND color = p_color AND size = p_size
  FOR UPDATE;

  IF current_qty IS NULL OR current_qty < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE stock
  SET quantity = quantity - p_quantity, updated_at = NOW()
  WHERE product_id = p_product_id AND color = p_color AND size = p_size;

  RETURN TRUE;
END;
$$;

-- Row Level Security

ALTER TABLE stock  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Le stock est lisible publiquement (affichage boutique)
DROP POLICY IF EXISTS "stock lisible par tous" ON stock;
CREATE POLICY "stock lisible par tous"
  ON stock FOR SELECT USING (true);

-- Écritures réservées au service_role (les functions Netlify)
-- Le service_role bypasse RLS automatiquement, donc pas besoin
-- de policy d'écriture : seul le serveur peut modifier.

-- Stock initial : adapter les quantités au stock réel.

INSERT INTO stock (product_id, color, size, quantity) VALUES
  -- T-Shirt Coupe du Monde 2026 (édition limitée)
  ('tee-coupe-monde-2026', '#0055A4', 'S', 8),
  ('tee-coupe-monde-2026', '#0055A4', 'M', 15),
  ('tee-coupe-monde-2026', '#0055A4', 'L', 15),
  ('tee-coupe-monde-2026', '#0055A4', 'XL', 8),
  ('tee-coupe-monde-2026', '#ffffff', 'S', 8),
  ('tee-coupe-monde-2026', '#ffffff', 'M', 15),
  ('tee-coupe-monde-2026', '#ffffff', 'L', 15),
  ('tee-coupe-monde-2026', '#ffffff', 'XL', 8)
ON CONFLICT (product_id, color, size) DO NOTHING;

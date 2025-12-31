# Supabase Database Schema

Please fill in your table details below. This will help connect the frontend to your Supabase database.

## Tables

-- =========================
-- SCHEMA 1: Users
-- =========================
-- USER METADATA TABLE


CREATE TABLE public.user_metadata (
  user_id uuid PRIMARY KEY
    REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  company_name text,
  profile_info jsonb DEFAULT '{}'::jsonb,
  confidence_threshold float DEFAULT 0.8,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- =========================
-- SCHEMA 2: User Sessions
-- =========================

CREATE TABLE public.classification_runs
 (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid NOT NULL
      REFERENCES auth.users(id) ON DELETE CASCADE,
    status text CHECK (status IN ('in_progress', 'completed', 'cancelled')) NOT NULL,
    run_type text CHECK (run_type IN ('single', 'bulk')) NOT NULL,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);


CREATE TABLE public.saved_classification_runs
 (
    user_id uuid
        REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id bigint
        REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    saved_at timestamptz DEFAULT now(),
    notes text,
    PRIMARY KEY (user_id, session_id)
);
-- =========================
-- SCHEMA 3: User Product Data
-- =========================
CREATE TABLE public.user_products (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid
        REFERENCES auth.users(id) ON DELETE CASCADE,
    classification_run_id
 bigint
        REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    product_name varchar(255),
    product_description text,
    country_of_origin varchar(255),
    materials jsonb,
    unit_cost numeric(12,2),
    vendor varchar(255),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE TABLE public.user_product_documents (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid
        REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id bigint
        REFERENCES public.user_products(id) ON DELETE CASCADE,
    session_id bigint
        REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    document_type text
        CHECK (document_type IN ('invoice', 'spec_sheet', 'csv', 'other')),
    file_name varchar(255),
    file_type varchar(50),
    file_url text,
    uploaded_at timestamptz DEFAULT now()
);


CREATE TABLE public.user_product_classification_results (
    id BIGSERIAL PRIMARY KEY,
    product_id bigint
        REFERENCES public.user_products(id) ON DELETE CASCADE,
    session_id bigint
        REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    hts_classification varchar(50),
    alternate_classification varchar(50),
    tariff_rate numeric(6,4),
    confidence float,
    model_version varchar(50),
    unit_cost numeric(12,2),
    tariff_amount numeric(12,2),
    total_cost numeric(12,2),
    classified_at timestamptz DEFAULT now()
);
CREATE TABLE public.user_product_classification_history (
    id BIGSERIAL PRIMARY KEY,
    product_id bigint
        REFERENCES public.user_products(id) ON DELETE CASCADE,
    classification_result_id bigint
        REFERENCES public.user_product_classification_results(id) ON DELETE CASCADE,
    approved boolean,
    approved_at timestamptz
);
CREATE TABLE public.user_product_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id uuid
        REFERENCES auth.users(id) ON DELETE CASCADE,
    name varchar(255),
    description text,
    country_of_origin varchar(255),
    materials jsonb,
    unit_cost numeric(12,2),
    vendor varchar(255),
    approved_from_session bigint
        REFERENCES public.user_sessions(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);




Functions:

-- FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_metadata (
    user_id,
    email,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



CREATE OR REPLACE FUNCTION promote_approved_product()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only act when approval is TRUE
    IF NEW.approved IS TRUE THEN
        INSERT INTO public.user_product_profiles (
            user_id,
            name,
            description,
            country_of_origin,
            materials,
            unit_cost,
            vendor,
            approved_from_session,
            created_at,
            updated_at
        )
        SELECT
            up.user_id,
            up.product_name,
            up.product_description,
            up.country_of_origin,
            up.materials,
            up.unit_cost,
            up.vendor,
            ucr.session_id,
            now(),
            now()
        FROM public.user_products up
        JOIN public.user_product_classification_results ucr
            ON ucr.id = NEW.classification_result_id
        WHERE up.id = NEW.product_id
        ON CONFLICT DO NOTHING;
    END IF;
RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION close_session_on_decision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.user_sessions
    SET status = 'completed',
        completed_at = now()
    WHERE id = (
        SELECT session_id
        FROM public.user_product_classification_results
        WHERE id = NEW.classification_result_id
    );
RETURN NEW;
END;
$$;


Triggers 

-- TRIGGER
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


CREATE TRIGGER trg_promote_approved_product
AFTER INSERT ON public.user_product_classification_history
FOR EACH ROW
EXECUTE FUNCTION promote_approved_product();


CREATE TRIGGER trg_user_products_updated
BEFORE UPDATE ON public.user_products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


CREATE TRIGGER trg_user_product_profiles_updated
BEFORE UPDATE ON public.user_product_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


CREATE TRIGGER trg_close_session
AFTER INSERT ON public.user_product_classification_history
FOR EACH ROW
EXECUTE FUNCTION close_session_on_decision();

UPDATE public.user_metadata
SET last_login_at = now()
WHERE user_id = auth.uid();



Python function:

from supabase import create_client

url = "https://xyz.supabase.co"
key = "public-anon-key"
supabase = create_client(url, key)

def create_user_metadata(user_id, company_name, confidence_threshold):
    supabase.table("users_metadata").insert({
        "user_id": user_id,  # links to auth.users.id
        "company_name": company_name,
        "confidence_threshold": confidence_threshold
    }).execute()


When a user approves a classification, create (or update) a row in
user_product_profiles.


5️⃣ How Python should interact (minimal + factual)
A. Create a session
supabase.table("user_sessions").insert({
    "user_id": user_id,
    "status": "in_progress",
    "run_type": "single"
}).execute()

B. Insert product
supabase.table("user_products").insert({
    "user_id": user_id,
    "session_id": session_id,
    "product_name": name,
    "product_description": desc,
    "country_of_origin": coo,
    "materials": materials,
    "unit_cost": unit_cost
}).execute()

C. Insert classification result
supabase.table("user_product_classification_results").insert({
    "product_id": product_id,
    "session_id": session_id,
    "hts_classification": hts,
    "confidence": confidence,
    "tariff_rate": tariff_rate,
    "unit_cost": unit_cost,
    "tariff_amount": tariff_amount,
    "total_cost": total_cost,
    "model_version": model_version
}).execute()

D. User approves / cancels (this fires all triggers)
supabase.table("user_product_classification_history").insert({
    "product_id": product_id,
    "classification_result_id": result_id,
    "approved": True,
    "approved_at": datetime.utcnow().isoformat()
}).execute()


### Table 1: [Table Name]
**Purpose:** [What this table is used for]

**Columns:**
- `id` - [type] - [description]
- `created_at` - [type] - [description]
- ... (add all columns)

**Relationships:**
- [Any foreign keys or relationships]

---

### Table 2: [Table Name]
**Purpose:** [What this table is used for]

**Columns:**
- `id` - [type] - [description]
- ... (add all columns)

**Relationships:**
- [Any foreign keys or relationships]

---

### Table 3: [Table Name]
**Purpose:** [What this table is used for]

**Columns:**
- `id` - [type] - [description]
- ... (add all columns)

**Relationships:**
- [Any foreign keys or relationships]

---

## Notes
[Any a
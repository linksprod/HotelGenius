-- Migration to add a foreign key constraint on service_requests.category_id
-- Date: 2026-06-18

ALTER TABLE public.service_requests 
ADD CONSTRAINT fk_service_requests_category 
FOREIGN KEY (category_id) REFERENCES public.request_categories(id) 
ON DELETE SET NULL;

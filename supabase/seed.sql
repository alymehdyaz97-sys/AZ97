-- AZ#97 : collections et pièces de départ (la collection Love est en « bientôt disponible ») (photos livrées avec le site dans /public/img).
-- À coller dans Supabase > SQL Editor APRÈS schema.sql.

insert into public.collections (slug, name, description, quote, cover_image, sort, coming_soon) values
 ('love', 'Love', 'Une phrase au dos, le logo AZ#97 sur le cœur. Blanc sur noir, rose sur blanc, noir sur blanc, blanc sur rose.', 'À trop vouloir aimer, on finit par détester.', '/img/love-tees.jpg', 1, true),
 ('no-signal', 'No Signal', 'Un visage aux yeux masqués, la bouche couverte, les mains sur les oreilles. Le visuel occupe tout le dos, la signature AZ#97 en dessous.', null, '/img/nosignal-tees.jpg', 2, false),
 ('lips', 'Lips', 'Des lèvres en trame de points, des étoiles autour et le logo en diagonale.', null, '/img/lips-tees.jpg', 3, false),
 ('graffiti', 'Graffiti', 'Le logo répété en graffiti sur les épaules et les manches. Petit logo sur le cœur devant, grand logo au centre derrière.', null, '/img/graffiti-tees.jpg', 4, false),
 ('mona-lisa', 'Mona Lisa', 'La Joconde dans un cadre baroque au dos. « Mona Lisa » écrit en script le long des manches sur les manches longues et les pulls zippés.', null, '/img/mona-tees.jpg', 5, false)
on conflict (slug) do nothing;

-- Les 3 types de pièce x 4 coloris x 5 collections = 60 produits, tous en précommande.
insert into public.products (collection_id, piece, color_index, price, preorder, image_face, image_back, sort)
select
  c.id,
  p.piece,
  n,
  p.price,
  true,
  '/img/p/' || k.img || '-' || p.piece || '-' || n || '-face.jpg',
  '/img/p/' || k.img || '-' || p.piece || '-' || n || '-dos.jpg',
  c.sort * 100 + p.ord * 10 + n
from public.collections c
cross join lateral (select case c.slug when 'no-signal' then 'nosignal' when 'mona-lisa' then 'mona' else c.slug end as img) k
cross join (values ('tee', 10000, 1), ('ls', 12000, 2), ('zip', 20000, 3)) as p(piece, price, ord)
cross join generate_series(1, 4) as n
on conflict (collection_id, piece, color_index) do nothing;

insert into public.settings (key, value) values
 ('whatsapp', ''),
 ('currency', 'FCFA')
on conflict (key) do nothing;

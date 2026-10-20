# AZ#97 : site de la marque

Site vitrine avec intro animée, 5 collections, une photo par pièce (face et dos), prix par pièce, précommande par WhatsApp, et un espace administrateur (`/admin`) où le gérant modifie lui-même les prix, la précommande, les photos et les collections.

- **Site :** Next.js 14 (rapide et bien lu par Google)
- **Base de données, comptes admin, photos :** Supabase
- **Hébergement :** Vercel
- **Nom de domaine :** az97.com (à acheter chez un registrar)

Il y a 4 comptes à créer : Supabase, GitHub, Vercel et le registrar du domaine. Compte environ 45 minutes la première fois. Les coûts : le domaine (environ 10 à 15 € par an). Supabase et Vercel ont une offre gratuite suffisante pour démarrer.

---

## Étape 1. Supabase (base de données et comptes)

1. Va sur https://supabase.com, crée un compte puis **New project**. Choisis un mot de passe de base de données (garde-le) et la région la plus proche de tes clients (par exemple Paris).
2. Dans le menu de gauche, ouvre **SQL Editor**, puis **New query**.
3. Ouvre le fichier `supabase/schema.sql`, copie tout son contenu, colle-le dans l'éditeur et clique **Run**. Tu dois voir « Success ».
4. Fais pareil avec `supabase/seed.sql` (nouvelle requête, coller, Run). Cela crée les 5 collections et les 60 pièces, toutes en précommande, avec les bons prix.
5. Va dans **Project Settings > API** et note :
   - **Project URL** (ressemble à `https://abcdefgh.supabase.co`)
   - **anon public key** (une longue clé qui commence par `eyJ`). Cette clé peut être publique, elle est faite pour ça. Ne partage jamais la clé `service_role`.

### Créer le compte de ton ami (administrateur)

1. **Authentication > Users > Add user > Create new user**. Entre son email (par exemple `admin@az97.com`) et un mot de passe. Coche **Auto Confirm User**.
2. Retourne dans **SQL Editor** et exécute cette requête, en remplaçant l'email :

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'admin@az97.com';
```

C'est cette ligne qui donne les droits d'administrateur. Un compte qui n'est pas dans cette liste ne peut rien modifier, même s'il arrive à se connecter. Répète les deux étapes pour ajouter d'autres administrateurs.

3. Conseil : dans **Authentication > Sign In / Providers**, désactive l'inscription libre (« Allow new users to sign up ») pour que personne ne puisse créer de compte tout seul.

---

## Étape 2. Mettre le code sur GitHub

1. Crée un compte sur https://github.com, puis **New repository** (nom : `az97`, en **Private**).
2. Sur la page du dépôt, clique **uploading an existing file** et glisse-y **tout le contenu** du dossier du projet (le dossier `public`, `app`, `components`, `lib`, `supabase`, et les fichiers à la racine). Puis **Commit changes**.

---

## Étape 3. Vercel (mise en ligne)

1. Crée un compte sur https://vercel.com avec ton compte GitHub.
2. **Add New > Project**, choisis le dépôt `az97`.
3. Avant de cliquer sur Deploy, ouvre **Environment Variables** et ajoute ces 3 variables :

| Nom | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | le Project URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clé anon public |
| `NEXT_PUBLIC_SITE_URL` | `https://az97.com` |

4. Clique **Deploy**. Après 1 à 2 minutes, le site est en ligne sur une adresse en `.vercel.app`.

---

## Étape 4. Le nom de domaine

1. Achète `az97.com` chez Namecheap, Gandi ou OVH (vérifie qu'il est libre).
2. Dans Vercel : **Project > Settings > Domains > Add**. Ajoute `az97.com` et `www.az97.com`.
3. Vercel affiche les enregistrements DNS à créer (un enregistrement **A** pour `az97.com` et un **CNAME** pour `www`). Recopie exactement ces valeurs dans l'espace DNS de ton registrar. Compte de quelques minutes à quelques heures avant que ça marche. Le certificat HTTPS est automatique.
4. Si tu utilises Google Workspace pour avoir des emails en `@az97.com`, ajoute aussi les enregistrements **MX** que Google te donne. Ils ne gênent pas le site.
5. Vérifie que `NEXT_PUBLIC_SITE_URL` vaut bien `https://az97.com`, puis dans Vercel **Deployments > ... > Redeploy** pour qu'il soit pris en compte.

---

## Étape 5. Être trouvé sur Google

Le site est déjà préparé : titres et descriptions par page, plan du site (`/sitemap.xml`), `robots.txt`, données produits pour Google (prix, précommande, photos) et partage propre sur les réseaux.

1. Va sur https://search.google.com/search-console et ajoute `az97.com` (type **Domaine**). Google te demande d'ajouter un enregistrement **TXT** dans le DNS du registrar.
2. Dans **Sitemaps**, envoie `https://az97.com/sitemap.xml`.
3. Patience : Google met de quelques jours à quelques semaines pour afficher le site. Pour aller plus vite, publie le lien sur Instagram, TikTok, WhatsApp Business et tes autres pages. Plus il y a de liens vers le site, mieux c'est.

---

## Utiliser l'espace administrateur

Adresse : `https://az97.com/admin`. L'ami se connecte avec l'email et le mot de passe créés à l'étape 1. Il peut :

- **Produits et prix :** changer le prix d'une pièce, la mettre ou non en précommande, la masquer, remplacer sa photo de face ou de dos, ajouter ou supprimer une pièce.
- **Actions rapides :** changer d'un coup le prix de tous les T-shirts, de toutes les manches longues ou de tous les pulls zippés, et mettre toutes les pièces en précommande ou les retirer.
- **Collections :** modifier le nom, la description, la phrase mise en avant, l'ordre et la photo de couverture, créer une nouvelle collection ou la masquer. La case **Coming soon** met une collection en « bientôt disponible » : les photos restent visibles, mais les prix et les boutons de commande sont remplacés par « Bientôt disponible ». Au départ, la collection Love est en coming soon. Pour la lancer, il suffit de décocher la case.
- **Réglages :** le **numéro WhatsApp** qui reçoit les commandes (à renseigner au tout début) et la monnaie affichée.

Les changements apparaissent sur le site en moins d'une minute. Les photos sont réduites automatiquement avant l'envoi. Mot de passe oublié : Supabase > Authentication > Users, sur le compte, choisir de l'envoyer de nouveau ou d'en définir un nouveau.

---

## Pour un développeur

```bash
npm install
cp .env.example .env.local   # puis renseigne les 3 variables
npm run dev                  # http://localhost:3000
npm run build
```

- **Sans Supabase configuré**, le site s'affiche quand même avec les données de départ de `lib/seed.ts`. L'admin affiche alors un message d'explication.
- **`lib/catalog.ts`** lit les données. Les pages se régénèrent toutes les 30 secondes.
- **`components/Intro.tsx`** : l'intro animée. Elle ne se rejoue pas pendant la même visite.
- **`components/CollectionView.tsx`** : les pièces et la feuille de précommande WhatsApp.
- **`components/admin/`** : l'espace admin. Les droits sont appliqués par la base elle-même (Row Level Security dans `supabase/schema.sql`), pas seulement par l'interface.
- **Les 4 coloris** sont définis dans `lib/constants.ts` (et la contrainte `color_index between 1 and 4` dans le SQL). Pour en ajouter, il faut modifier les deux.
- Les photos livrées avec le site sont dans `public/img`. Celles que l'admin envoie vont dans le bucket Supabase `product-images`.

## Limites à connaître

- Il n'y a pas de paiement en ligne ni de comptes clients : les clients précommandent par WhatsApp.
- Le projet a été écrit sans pouvoir lancer `npm run build` dans l'environnement où il a été créé. Si la première mise en ligne sur Vercel affiche une erreur, copie le message du journal de build et envoie-le pour correction.
- Vérifie les droits sur les images et sur la citation de la collection Love avant de vendre.

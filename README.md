🌐 Documentation Client — Vath

Client Guide / Guide Utilisateur

🪶 Introduction

FR :
Vath est une plateforme web moderne permettant de présenter du contenu visuel et éditorial — photos, vidéos, articles de blog et journaux — dans une interface élégante et fluide.
Le site a été conçu pour être facile à utiliser, rapide, et adapté à tous les écrans (mobile, tablette, ordinateur).

EN :
Vath is a modern web platform for showcasing visual and editorial content — photos, videos, blog posts, and journals — in a sleek, smooth interface.
It is designed to be easy to use, fast, and fully responsive on all devices.

🏠 Structure du site / Website Structure
Navigation principale

FR :
Le site comporte plusieurs sections accessibles depuis la barre de navigation supérieure :

Accueil — Présente le site et les derniers contenus.

À propos — Décrit la mission, l’équipe ou le photographe.

Blog — Contient des articles ou journaux.

Galerie Photo — Présente les photographies avec zoom et visionneuse intégrée.

Vidéos — Met en avant les vidéos récentes.

Contact — Permet aux visiteurs d’envoyer un message.

Une zone Admin est accessible pour la gestion du contenu (voir plus bas).

EN :
The main navigation bar gives access to:

Home — Highlights the latest content.

About — Describes the project, team, or artist.

Blog — Lists editorial posts or diary entries.

Photo Gallery — Displays photos with a built-in lightbox viewer.

Videos — Showcases featured video content.

Contact — Allows visitors to send a message.

An Admin Area is available for managing content (see below).

🧭 Parcours utilisateur / User Flow

FR :
L’expérience utilisateur est fluide et intuitive :

En arrivant sur la page d’accueil, le visiteur découvre une mise en page épurée avec les derniers travaux.

En cliquant sur une image ou une vidéo, le contenu s’ouvre dans une visionneuse (lightbox).

Le menu reste visible pour naviguer facilement entre les sections.

Le site s’adapte automatiquement à tous les écrans (ordinateur, tablette, mobile).

EN :
The user experience is smooth and intuitive:

On the home page, visitors see the latest works in a clean layout.

Clicking an image or video opens a lightbox viewer.

The top menu remains accessible for easy navigation.

The layout automatically adjusts for desktop, tablet, and mobile.

🔑 Espace Administrateur / Admin Area

FR :
L’espace administrateur permet de gérer les contenus du site :

Ajouter, modifier ou supprimer des photos et vidéos

Publier de nouveaux articles de blog

Mettre à jour les textes des pages

Gérer l’ordre d’affichage des éléments

L’accès est sécurisé via Firebase Authentication.
Chaque utilisateur doit se connecter avec son email et mot de passe fournis.
L’interface est simple : formulaires de saisie, boutons d’envoi, aperçu immédiat des changements.

EN :
The Admin Area lets you manage site content:

Add, edit, or delete photos and videos

Publish new blog posts

Update page texts

Control the display order of items

Access is secured with Firebase Authentication.
Each user logs in with their email and password.
The interface is intuitive: input forms, save buttons, and live preview of updates.

🖼️ Gestion du contenu / Managing Content

FR :
Les fichiers (images, vidéos) sont stockés dans le service Firebase Storage.
Lorsqu’un contenu est ajouté via l’espace admin, il est automatiquement sauvegardé en ligne et affiché sur le site.
Les données textuelles (titres, descriptions, articles) sont enregistrées dans Firebase Firestore.

EN :
Media files (images, videos) are stored in Firebase Storage.
When you upload content via the admin dashboard, it’s instantly saved online and displayed on the site.
Text data (titles, descriptions, articles) are stored in Firebase Firestore.

🧩 Design et ergonomie / Design & Usability

FR :
Vath utilise un design minimaliste basé sur TailwindCSS, garantissant cohérence et lisibilité.
Les animations sont fluides, les transitions douces, et la typographie soignée (police Acid Grotesk).
Tout a été pensé pour valoriser le contenu visuel sans distraire le visiteur.

EN :
Vath uses a minimalist TailwindCSS design ensuring consistency and readability.
Animations are smooth, transitions soft, and typography elegant (Acid Grotesk font).
Everything is designed to highlight visual content without distractions.

🧱 Maintenance et évolutivité / Maintenance & Scalability

FR :
Le site peut être mis à jour à tout moment via l’espace admin, sans intervention technique.
En cas d’évolution (nouvelles pages, intégrations, fonctionnalités), la base du projet permet une extension rapide grâce à sa structure modulaire (Next.js + Firebase).

EN :
The site can be updated anytime from the admin area, with no technical skills required.
If new pages, integrations, or features are needed, the project’s modular base (Next.js + Firebase) allows fast expansion.

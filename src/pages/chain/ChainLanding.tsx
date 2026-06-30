import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Building2, MapPin, Star, Utensils, Heart, Waves } from 'lucide-react';
import { useHotel } from '@/features/hotels/context/HotelContext';

/* ─────────────────────────────────────────────────────────────────
   Static data for the two member hotels
───────────────────────────────────────────────────────────────── */
const HOTELS = [
  {
    slug: 'zahra-hotel',
    name: 'Dar Jerba Zahra',
    tagline: 'Resort Balnéaire & Spa Thalasso',
    location: 'Djerba, Tunisie Station touristique',
    stars: 3,
    description:
      "Niché sur la plage dorée de Midoun, le Zahra Hotel vous offre une expérience de luxe incomparable face à la Méditerranée. Spa thalasso, 3 restaurants gastronomiques et suites vue mer.",
    highlights: [
      { icon: <Heart className="w-4 h-4" />, label: 'Spa Thalasso' },
      { icon: <Utensils className="w-4 h-4" />, label: '3 Restaurants' },
      { icon: <Waves className="w-4 h-4" />, label: 'Plage privée' },
    ],
    vibeTags: ['Famille', 'Animation', 'Piscines & Clubs'],
    image: '/zahra-hotel.png',
    badge: '3 Étoiles',
  },
  {
    slug: 'narjes-hotel',
    name: 'Dar Jerba Narjess',
    tagline: 'Riad Traditionnel & Golf',
    location: 'Djerba, Tunisie',
    stars: 4,
    description:
      "Au cœur de la médina de Houmt Souk, le Narjes Hotel mêle charme traditionnel et confort moderne. Hammam oriental, 2 restaurants et accès privatif au golf 18 trous.",
    highlights: [
      { icon: <Heart className="w-4 h-4" />, label: 'Hammam Oriental' },
      { icon: <Utensils className="w-4 h-4" />, label: '2 Restaurants' },
      { icon: <Building2 className="w-4 h-4" />, label: 'Golf 18 trous' },
    ],
    vibeTags: ['Confort 4*', 'Calme & Détente', 'Premium'],
    image: '/narjes-hotel.png',
    badge: '4 Étoiles',
  },
];

/* ─────────────────────────────────────────────────────────────────
   Stars renderer
───────────────────────────────────────────────────────────────── */
const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < count ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
      />
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   Chain Landing Page
   — Uses a minimal custom header (logo only, no menu/notif/user)
   — No bottom nav, no floating chat bubble
───────────────────────────────────────────────────────────────── */
const ChainLanding: React.FC = () => {
  const navigate = useNavigate();
  const { hotel } = useHotel();

  return (
    <div className="min-h-screen bg-background">

      {/* ── Minimal Header: logo only ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Empty spacer to keep logo centered */}
          <div className="w-8" />
          
          <img
            src="/dar-jerba-logo.png"
            alt="Dar Jerba Hotels"
            className="h-16 w-auto object-contain max-w-[260px]"
          />

          {/* Theme switcher on the right */}
          <ThemeToggle />
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="container mx-auto px-[9px] pt-16 pb-8">

        {/* Hero Banner */}
        <div className="relative h-64 overflow-hidden rounded-b-3xl mb-6">
          <img
            src="/dar-jerba-hero.png"
            alt="Dar Jerba Hotels"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
            <p className="text-xs font-medium tracking-widest uppercase text-white/70 mb-2">
              Collection Prestige · Jerba, Tunisie
            </p>
            <h1 className="text-3xl font-bold mb-1">Dar Jerba Hotels</h1>
            <p className="text-base opacity-90">
              Deux hôtels d'exception au cœur de l'île de Jerba
            </p>
          </div>
        </div>

        {/* Welcome Card — Moved from bottom to top with customized description */}
        <section className="px-4 sm:px-6 mb-6">
          <Card className="rounded-2xl bg-card border-border p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-card-foreground mb-1 text-base">
                  Bienvenue à Dar Jerba Hotels
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Un domaine de 45 hectares au bord d'une plage dorée à Midoun. Profitez de notre formule Tout Compris, de nos 4 piscines, de nos animations et du charme tunisien authentique.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Section title */}
        <section className="px-4 sm:px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Nos Hôtels
            </h2>
            <span className="text-sm text-muted-foreground">
              {HOTELS.length} établissements
            </span>
          </div>

          {/* Hotel Cards — 2 colonnes côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            {HOTELS.map((hotel) => (
              <Card
                key={hotel.slug}
                className="overflow-hidden rounded-2xl border-border hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer bg-card flex flex-col h-full"
                onClick={() => navigate(`/${hotel.slug}/`)}
              >
                {/* Image */}
                <div className="relative h-28 sm:h-36">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Badge */}
                  <span className="absolute top-2 right-2 text-[10px] font-medium bg-primary/80 backdrop-blur-sm text-primary-foreground px-2 py-0.5 rounded-full">
                    {hotel.badge}
                  </span>

                  {/* Stars + location */}
                  <div className="absolute bottom-2 left-2 flex flex-col gap-0.5">
                    <Stars count={hotel.stars} />
                    <div className="flex items-center gap-0.5 text-white/80 text-[9px] leading-tight">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      {hotel.location}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2.5 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-card-foreground mb-0.5 leading-tight">
                    {hotel.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-1 leading-snug">
                    {hotel.tagline}
                  </p>

                  {/* Vibe Tags Indicator */}
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {hotel.vibeTags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-md"
                      >
                        • {tag}
                      </span>
                    ))}
                  </div>

                  {/* Highlights compact */}
                  <div className="flex flex-col gap-0.5 mb-2.5">
                    {hotel.highlights.map((h) => (
                      <span
                        key={h.label}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground"
                      >
                        <span className="text-primary">{h.icon}</span>
                        {h.label}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-2">
                    <Button
                      size="sm"
                      className="w-full text-[11px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${hotel.slug}/`);
                      }}
                    >
                      Découvrir {hotel.name}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default ChainLanding;

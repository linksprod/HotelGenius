
import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { useAboutData } from '@/hooks/useAboutData';
import HeroSection from '@/components/admin/about/HeroSection';
import WelcomeSection from '@/components/admin/about/WelcomeSection';
import MissionSection from '@/components/admin/about/MissionSection';
import DirectorySection from '@/components/admin/about/DirectorySection';
import FeaturesSection from '@/components/admin/about/FeaturesSection';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Maximize2, ArrowUpToLine, Wifi, Sun, Users, Presentation, MonitorPlay, Volume2, Video, SquarePlay, Layers, Sofa, UtensilsCrossed, GlassWater, Briefcase, Mic2, Settings, Zap, Coffee, FileText, ShieldCheck, Phone, Map, Music, Lightbulb, Tv, Printer, Thermometer, ParkingCircle, Clock, Star, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SeminarService } from '@/lib/types';

// Map icon name → Lucide component (mirrors AVAILABLE_ICONS in SeminarsSection)
const SEMINAR_ICON_MAP: Record<string, React.ReactNode> = {
  Wifi:            <Wifi className="h-5 w-5 text-primary" />,
  Volume2:         <Volume2 className="h-5 w-5 text-primary" />,
  Video:           <Video className="h-5 w-5 text-primary" />,
  MonitorPlay:     <MonitorPlay className="h-5 w-5 text-primary" />,
  Layers:          <Layers className="h-5 w-5 text-primary" />,
  Sun:             <Sun className="h-5 w-5 text-primary" />,
  Lightbulb:       <Lightbulb className="h-5 w-5 text-primary" />,
  Thermometer:     <Thermometer className="h-5 w-5 text-primary" />,
  GlassWater:      <GlassWater className="h-5 w-5 text-primary" />,
  Coffee:          <Coffee className="h-5 w-5 text-primary" />,
  UtensilsCrossed: <UtensilsCrossed className="h-5 w-5 text-primary" />,
  Briefcase:       <Briefcase className="h-5 w-5 text-primary" />,
  Settings:        <Settings className="h-5 w-5 text-primary" />,
  Mic2:            <Mic2 className="h-5 w-5 text-primary" />,
  Music:           <Music className="h-5 w-5 text-primary" />,
  Presentation:    <Presentation className="h-5 w-5 text-primary" />,
  Users:           <Users className="h-5 w-5 text-primary" />,
  Zap:             <Zap className="h-5 w-5 text-primary" />,
  FileText:        <FileText className="h-5 w-5 text-primary" />,
  ShieldCheck:     <ShieldCheck className="h-5 w-5 text-primary" />,
  Phone:           <Phone className="h-5 w-5 text-primary" />,
  Map:             <Map className="h-5 w-5 text-primary" />,
  ParkingCircle:   <ParkingCircle className="h-5 w-5 text-primary" />,
  Clock:           <Clock className="h-5 w-5 text-primary" />,
  Star:            <Star className="h-5 w-5 text-primary" />,
  Tv:              <Tv className="h-5 w-5 text-primary" />,
  Printer:         <Printer className="h-5 w-5 text-primary" />,
  SquarePlay:      <SquarePlay className="h-5 w-5 text-primary" />,
  CheckCircle2:    <CheckCircle2 className="h-5 w-5 text-primary" />,
};
const renderSeminarIcon = (iconName: string) => SEMINAR_ICON_MAP[iconName] ?? <CheckCircle2 className="h-5 w-5 text-primary" />;

// Safe i18n helper: only build a dynamic key if the segment is a real non-empty string
const safeT = (
  t: (key: string, fallback: string) => string,
  keySegment: string | undefined | null,
  prefix: string,
  fallback: string
): string => {
  if (!keySegment || keySegment === 'undefined' || keySegment === 'null') {
    return fallback || '';
  }
  return t(`${prefix}.${keySegment}`, fallback || '');
};

const About = () => {
  const { t } = useTranslation();
  const { aboutData, isLoadingAbout } = useAboutData();

  if (isLoadingAbout) {
    return (
      <Layout>
        <div className="container mx-auto py-8 pt-6 md:pt-8">
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!aboutData) {
    return (
      <Layout>
        <div className="container mx-auto py-8 pt-6 md:pt-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">Hotel information not available.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-6 md:pt-8">
        <HeroSection
          heroImage={aboutData.hero_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=80'}
          heroTitle={safeT(t, aboutData.id, 'about.content.heroTitle', aboutData.hero_title || 'Welcome to Our Hotel')}
          heroSubtitle={safeT(t, aboutData.id, 'about.content.heroSubtitle', aboutData.hero_subtitle || 'Discover luxury and comfort')}
        />
      </div>

      <div className="container mx-auto py-8">
        <WelcomeSection
          welcomeTitle={safeT(t, aboutData.id, 'about.content.welcomeTitle', aboutData.welcome_title || '')}
          welcomeDescription={safeT(t, aboutData.id, 'about.content.welcomeDescription', aboutData.welcome_description || '')}
          welcomeDescriptionExtended={safeT(t, aboutData.id, 'about.content.welcomeDescriptionExtended', aboutData.welcome_description_extended || '')}
        />

        {aboutData.mission && (
          <MissionSection mission={safeT(t, aboutData.id, 'about.content.mission', aboutData.mission)} />
        )}

        <FeaturesSection features={(aboutData.features || []).map(feature => ({
            ...feature,
            title: (feature.icon && feature.icon !== 'undefined' && feature.icon !== 'null')
              ? t(`about.content.features.${feature.icon}.title`, feature.title || '')
              : (feature.title || ''),
            description: (feature.icon && feature.icon !== 'undefined' && feature.icon !== 'null')
              ? t(`about.content.features.${feature.icon}.description`, feature.description || '')
              : (feature.description || '')
          }))} />

        {aboutData.has_seminars && (
          <div className="my-10 border rounded-2xl overflow-hidden shadow-sm bg-card">
            {/* === 1. Full-width hero banner image with overlay title === */}
            {aboutData.seminar_image ? (
              <div className="relative w-full h-52 sm:h-64 md:h-72 overflow-hidden">
                <img
                  src={aboutData.seminar_image}
                  alt="Seminars & Meetings"
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                {/* Title on image */}
                <div className="absolute bottom-0 left-0 p-5 md:p-8 flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 p-2 rounded-xl">
                    <Presentation className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight drop-shadow-md">
                      {t('about.seminars.title', 'Seminars & Meetings')}
                    </h2>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 drop-shadow">
                      {t('about.seminars.subtitle', 'Professional events, meetings, conferences and banquets')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* No image: elegant text header with gradient background */
              <div className="relative w-full py-12 px-6 md:px-10 bg-gradient-to-br from-primary/90 to-primary/60 text-white flex items-center gap-4">
                <div className="bg-white/20 border border-white/30 p-2.5 rounded-xl shrink-0">
                  <Presentation className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t('about.seminars.title', 'Seminars & Meetings')}
                  </h2>
                  <p className="text-white/80 text-sm mt-0.5">
                    {t('about.seminars.subtitle', 'Professional events, meetings, conferences and banquets')}
                  </p>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8 lg:p-10 space-y-10">
              {/* === 2. Description text === */}
              {aboutData.seminar_description && (
                <p className="text-foreground/80 leading-relaxed text-sm md:text-base max-w-4xl">
                  {aboutData.seminar_description}
                </p>
              )}

              {/* === 3. Services grid ("PERSONALIZED SERVICE TO GUARANTEE YOUR COMFORT") === */}
              {aboutData.seminar_services && aboutData.seminar_services.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 w-full">
                    <div className="h-px flex-1 bg-border hidden sm:block" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.15em] text-center px-2 w-full sm:w-auto break-words sm:whitespace-nowrap">
                      {t('about.seminars.included_services', 'Personalized Service to Guarantee Your Comfort')}
                    </h3>
                    <div className="h-px flex-1 bg-border hidden sm:block" />
                  </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {aboutData.seminar_services.map((service: SeminarService, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3.5 rounded-xl border bg-muted/30 hover:bg-primary/5 hover:border-primary/20 transition-colors duration-200"
                      >
                        <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                          {renderSeminarIcon(service.icon)}
                        </div>
                        <span className="text-sm font-medium text-foreground/90 leading-snug">{service.name}</span>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* === 4. Rooms specs table ("TAILOR-MADE PROFESSIONAL EVENTS") === */}
              {aboutData.seminar_rooms && aboutData.seminar_rooms.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6 w-full">
                    <div className="h-px flex-1 bg-border hidden sm:block" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.15em] text-center px-2 w-full sm:w-auto break-words sm:whitespace-nowrap">
                      {t('about.seminars.rooms_specs', 'Tailor-Made Professional Events')}
                    </h3>
                    <div className="h-px flex-1 bg-border hidden sm:block" />
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border shadow-sm">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-primary/8 border-b">
                          <th className="p-3 text-left font-semibold text-foreground">Room</th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Maximize2 className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Area</span>
                            </div>
                          </th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <ArrowUpToLine className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Ceiling</span>
                            </div>
                          </th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Sun className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Light</span>
                            </div>
                          </th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Wifi className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">WiFi</span>
                            </div>
                          </th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <SquarePlay className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Theatre</span>
                            </div>
                          </th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Layers className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Classroom</span>
                            </div>
                          </th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Sofa className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">U-Shape</span>
                            </div>
                          </th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <GlassWater className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Cocktail</span>
                            </div>
                          </th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <UtensilsCrossed className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Banquet</span>
                            </div>
                          </th>
                          <th className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Briefcase className="h-4 w-4 text-primary" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Boardroom</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {aboutData.seminar_rooms.map((room, idx) => (
                          <tr key={idx} className={`border-b last:border-b-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                            <td className="p-3 font-semibold text-foreground">{room.name}</td>
                            <td className="p-3 text-center text-muted-foreground font-mono text-xs">{room.surface ? `${room.surface} m²` : '-'}</td>
                            <td className="p-3 text-center text-muted-foreground font-mono text-xs">{room.height ? `${room.height} m` : '-'}</td>
                            <td className="p-3 text-center">
                              {room.natural_light
                                ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                : <span className="text-muted-foreground text-xs">✕</span>}
                            </td>
                            <td className="p-3 text-center">
                              {room.wifi
                                ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                : <span className="text-muted-foreground text-xs">✕</span>}
                            </td>
                            <td className="p-3 text-center font-mono text-sm font-bold text-foreground">{room.cap_theatre || '-'}</td>
                            <td className="p-3 text-center font-mono text-sm font-bold text-foreground">{room.cap_classroom || '-'}</td>
                            <td className="p-3 text-center font-mono text-sm font-bold text-foreground">{room.cap_u_shape || '-'}</td>
                            <td className="p-3 text-center font-mono text-sm font-bold text-foreground">{room.cap_cocktail || '-'}</td>
                            <td className="p-3 text-center font-mono text-sm font-bold text-foreground">{room.cap_banquet || '-'}</td>
                            <td className="p-3 text-center font-mono text-sm font-bold text-foreground">{room.cap_boardroom || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card list */}
                  <div className="grid gap-4 md:hidden">
                    {aboutData.seminar_rooms.map((room, idx) => (
                      <div key={idx} className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h4 className="font-bold text-base text-foreground">{room.name}</h4>
                          <div className="flex gap-1.5">
                            {room.wifi && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><Wifi className="h-2.5 w-2.5" />WiFi</span>}
                            {room.natural_light && <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><Sun className="h-2.5 w-2.5" />Light</span>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Maximize2 className="h-3.5 w-3.5 shrink-0" />
                            <span>Surface: <strong>{room.surface} m²</strong></span>
                          </div>
                          {room.height && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <ArrowUpToLine className="h-3.5 w-3.5 shrink-0" />
                              <span>Height: <strong>{room.height} m</strong></span>
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-2 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Capacities (Max Pax)</span>
                          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                            {room.cap_theatre && <div className="bg-muted/50 rounded p-1.5"><span className="text-[9px] text-muted-foreground block">Theatre</span><span className="font-bold font-mono">{room.cap_theatre}</span></div>}
                            {room.cap_classroom && <div className="bg-muted/50 rounded p-1.5"><span className="text-[9px] text-muted-foreground block">Classroom</span><span className="font-bold font-mono">{room.cap_classroom}</span></div>}
                            {room.cap_u_shape && <div className="bg-muted/50 rounded p-1.5"><span className="text-[9px] text-muted-foreground block">U-Shape</span><span className="font-bold font-mono">{room.cap_u_shape}</span></div>}
                            {room.cap_banquet && <div className="bg-muted/50 rounded p-1.5"><span className="text-[9px] text-muted-foreground block">Banquet</span><span className="font-bold font-mono">{room.cap_banquet}</span></div>}
                            {room.cap_cocktail && <div className="bg-muted/50 rounded p-1.5"><span className="text-[9px] text-muted-foreground block">Cocktail</span><span className="font-bold font-mono">{room.cap_cocktail}</span></div>}
                            {room.cap_boardroom && <div className="bg-muted/50 rounded p-1.5"><span className="text-[9px] text-muted-foreground block">Boardroom</span><span className="font-bold font-mono">{room.cap_boardroom}</span></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {aboutData.loyalty_enabled && aboutData.loyalty_tiers && aboutData.loyalty_tiers.length > 0 && (
          <div className="my-10 border rounded-2xl overflow-hidden shadow-sm bg-card">
            {/* Header / Banner */}
            <div className="relative w-full py-12 px-6 md:px-10 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/70 text-white flex items-center gap-4">
              <div className="bg-white/20 border border-white/30 p-2.5 rounded-xl shrink-0">
                <Award className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {aboutData.loyalty_title || t('about.loyalty.title', 'Loyalty Program')}
                </h2>
                <p className="text-white/80 text-sm mt-0.5">
                  {aboutData.loyalty_description || t('about.loyalty.subtitle', 'Unlock exclusive benefits and privileges throughout your stays')}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8 lg:p-10 space-y-8">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-xl border shadow-sm">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-primary/5 border-b">
                      <th className="p-4 text-left font-semibold text-foreground w-[300px]">Benefits</th>
                      {aboutData.loyalty_tiers.map((tier, idx) => (
                        <th key={idx} className="p-4 text-center font-bold text-foreground min-w-[120px]">
                          <span className="block text-base text-primary font-bold">{tier.name}</span>
                          <span className="block text-xs text-muted-foreground font-normal mt-0.5">{tier.points}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(aboutData.loyalty_benefits || []).map((benefit, idx) => (
                      <tr key={idx} className={`border-b last:border-b-0 hover:bg-muted/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}>
                        <td className="p-4 font-medium text-foreground">{benefit.name}</td>
                        {aboutData.loyalty_tiers.map((_, tierIdx) => {
                          const val = benefit.values[tierIdx] || '—';
                          return (
                            <td key={tierIdx} className="p-4 text-center font-semibold">
                              {val === '✓' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                              ) : val === '—' ? (
                                <span className="text-muted-foreground/45 font-normal">—</span>
                              ) : (
                                <span className="text-primary font-bold text-sm bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10 inline-block">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Grid View */}
              <div className="grid gap-6 md:hidden">
                {aboutData.loyalty_tiers.map((tier, tierIdx) => (
                  <div key={tierIdx} className="bg-card border rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary" />
                    
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-xl text-primary">{tier.name}</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">{tier.points}</span>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t text-sm">
                      {(aboutData.loyalty_benefits || []).map((benefit, idx) => {
                        const val = benefit.values[tierIdx] || '—';
                        if (val === '—') return null; // Don't show inactive benefits on mobile to keep it concise and clean
                        return (
                          <div key={idx} className="flex justify-between items-center py-1">
                            <span className="text-muted-foreground text-xs pr-4">{benefit.name}</span>
                            {val === '✓' ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                            ) : (
                              <span className="font-bold text-primary text-xs bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 shrink-0">{val}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DirectorySection
          directoryTitle={
            !aboutData.directory_title || aboutData.directory_title === 'Hotel Directory & Information'
              ? t('about.directory.title', 'Hotel Directory & Information')
              : safeT(t, aboutData.directory_title, 'about.directory.title', aboutData.directory_title)
          }
          importantNumbers={aboutData.important_numbers || []}
          facilities={aboutData.facilities || []}
          hotelPolicies={aboutData.hotel_policies || []}
          additionalInfo={aboutData.additional_info || []}
        />
      </div>
    </Layout>
  );
};

export default About;

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { useHotelConfig } from '@/hooks/useHotelConfig';
import { Loader2, LayoutDashboard, Save, RotateCcw, Plus, Trash2, Link as LinkIcon, Compass, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

const DEFAULT_EXPERIENCES = [
  {
    id: '1',
    title: 'Soins de Spa de Luxe',
    description: 'Offrez-vous nos soins signature pour une détente ultime.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Spa & Bien-être',
    path: '/spa'
  },
  {
    id: '2',
    title: 'Dégustation de Vins',
    description: 'Découvrez notre sélection exclusive de grands crus guidée par notre sommelier.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Gastronomie',
    path: '/dining'
  }
];

export default function HomePageEditor() {
  const { t } = useTranslation();
  const { config, isLoading, updateConfig } = useHotelConfig();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Sync state when config loads
  useEffect(() => {
    if (config) {
      setTitle(config.home_hero_title || '');
      setSubtitle(config.home_hero_subtitle || '');
      setImage(config.home_hero_image || '');
      
      // If none exist in database, default to the standard experiences list
      setExperiences(
        config.featured_experiences && config.featured_experiences.length > 0
          ? config.featured_experiences
          : DEFAULT_EXPERIENCES
      );
    }
  }, [config]);

  if (isLoading && !config) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Chargement de la configuration...</span>
      </div>
    );
  }

  const defaultTitle = t('home.hero.stayGuideTitle', 'Vivez Pleinement Votre Séjour');
  const defaultSubtitle = t('home.hero.stayGuideSubtitle', 'Expériences vibrantes, satisfaction totale garantie');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig({
        home_hero_title: title.trim() || null,
        home_hero_subtitle: subtitle.trim() || null,
        home_hero_image: image.trim() || null,
        featured_experiences: experiences
      });
      toast.success('Configuration de la page d\'accueil mise à jour avec succès');
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde : ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setSubtitle('');
    setImage('');
    setExperiences(DEFAULT_EXPERIENCES);
    toast.info('Champs réinitialisés aux valeurs par défaut');
  };

  // Experience Handlers
  const handleAddExperience = () => {
    const newExp = {
      id: String(Date.now()),
      title: 'Nouvelle expérience',
      description: 'Offrez-vous une expérience unique au sein de notre établissement.',
      image: '',
      category: 'Catégorie',
      path: '/spa'
    };
    setExperiences([...experiences, newExp]);
    setActivePreviewIndex(experiences.length);
    toast.success('Nouvelle expérience ajoutée');
  };

  const handleUpdateExperience = (id: string, updatedField: any) => {
    const updated = experiences.map((exp) => 
      exp.id === id ? { ...exp, ...updatedField } : exp
    );
    setExperiences(updated);
  };

  const handleDeleteExperience = (id: string) => {
    const filtered = experiences.filter((exp) => exp.id !== id);
    setExperiences(filtered);
    setActivePreviewIndex(Math.max(0, filtered.length - 1));
    toast.info('Expérience supprimée');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Personnalisation de la Page d'Accueil"
        description="Modifiez le Hero Banner et les Expériences à la Une de la page d'accueil de vos clients."
        icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Settings */}
        <div className="space-y-6">
          {/* Card 1: Hero Banner Config */}
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Contenu du Hero
              </CardTitle>
              <CardDescription>
                Personnalisez le bandeau principal en haut de la page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Titre principal</Label>
                <Input
                  id="hero-title"
                  placeholder={defaultTitle}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Description / Sous-titre</Label>
                <Input
                  id="hero-subtitle"
                  placeholder={defaultSubtitle}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-image">Image du Hero</Label>
                <ImageUpload
                  id="hero-image"
                  value={image || DEFAULT_IMAGE}
                  onChange={(url) => setImage(url)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Featured Experiences Config */}
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Expériences à la Une
                </CardTitle>
                <CardDescription>
                  Gérez la liste des expériences vedettes affichées en carrousel.
                </CardDescription>
              </div>
              <Button size="sm" type="button" onClick={handleAddExperience} className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {experiences.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-xl text-muted-foreground">
                  Aucune expérience configurée. Cliquez sur "Ajouter" pour commencer.
                </div>
              ) : (
                experiences.map((exp, idx) => (
                  <div key={exp.id} className="p-4 border rounded-xl bg-muted/20 relative space-y-4 group">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm font-bold text-primary">Expérience #{idx + 1}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteExperience(exp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Input
                          value={exp.category}
                          onChange={(e) => handleUpdateExperience(exp.id, { category: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lien de navigation</Label>
                        <Select
                          value={exp.path}
                          onValueChange={(val) => handleUpdateExperience(exp.id, { path: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une destination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="/spa">Spa & Bien-être</SelectItem>
                            <SelectItem value="/dining">Gastronomie (Dining)</SelectItem>
                            <SelectItem value="/shops">Boutiques (Shops)</SelectItem>
                            <SelectItem value="/events">Événements (Events)</SelectItem>
                            <SelectItem value="/">Page d'accueil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Titre</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => handleUpdateExperience(exp.id, { title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(exp.id, { description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Image de l'expérience</Label>
                      <ImageUpload
                        id={`exp-image-${exp.id}`}
                        value={exp.image || DEFAULT_IMAGE}
                        onChange={(url) => handleUpdateExperience(exp.id, { image: url })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer toutes les modifications
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Valeurs par défaut
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Preview */}
        <div className="space-y-6">
          <Card className="border-border/60 bg-card shadow-sm overflow-hidden flex flex-col justify-between sticky top-6">
            <div>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Prévisualisation en Direct</CardTitle>
                <CardDescription>
                  Aperçu en temps réel de la page d'accueil client (Guest).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hero Banner Preview */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bannière principale</h4>
                  <div className="relative h-48 overflow-hidden rounded-2xl border shadow-inner">
                    <img
                      src={image || DEFAULT_IMAGE}
                      alt="Aperçu Hôtel"
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/35" />
                    <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
                      <h1 className="text-xl font-bold mb-1 tracking-tight">
                        {title.trim() || defaultTitle}
                      </h1>
                      <p className="text-xs opacity-90 leading-relaxed max-w-xs">
                        {subtitle.trim() || defaultSubtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Featured Experiences Preview */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expérience à la Une</h4>
                    <div className="flex gap-1">
                      {experiences.map((_, i) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            activePreviewIndex === i ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                          onClick={() => setActivePreviewIndex(i)}
                        />
                      ))}
                    </div>
                  </div>

                  {experiences.length > 0 && experiences[activePreviewIndex] ? (
                    <Card className="overflow-hidden border shadow-sm">
                      <div className="relative h-48">
                        <img
                          src={experiences[activePreviewIndex].image || DEFAULT_IMAGE}
                          alt={experiences[activePreviewIndex].title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                          <span className="text-[10px] font-medium bg-primary/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full mb-1 inline-block">
                            {experiences[activePreviewIndex].category}
                          </span>
                          <h3 className="text-lg font-bold">{experiences[activePreviewIndex].title}</h3>
                        </div>
                      </div>
                      <div className="p-4 bg-card">
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                          {experiences[activePreviewIndex].description}
                        </p>
                        <Button size="sm" className="w-full h-8 flex items-center justify-center gap-1.5">
                          <LinkIcon className="h-3 w-3" />
                          Explorer maintenant ({experiences[activePreviewIndex].path})
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground text-sm">
                      Aucune expérience à afficher.
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
            <div className="p-6 bg-muted/30 border-t text-xs text-muted-foreground flex justify-between items-center">
              <span>Statut : Connecté à l'hôtel {config?.name}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

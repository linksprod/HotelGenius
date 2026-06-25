import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Trash2, Edit, X, Sparkles, Upload, Loader2,
  Wifi, Volume2, Video, MonitorPlay, Layers, Sun, GlassWater,
  UtensilsCrossed, Briefcase, CheckCircle2, Presentation,
  Users, Mic2, Settings, Zap, Coffee, Projector, FileText,
  ShieldCheck, Star, Clock, Phone, Map, Music, Lightbulb,
  Tv, Printer, Thermometer, ParkingCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { SeminarRoom, SeminarService } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { supabase } from '@/integrations/supabase/client';
import { compressAndConvertToWebP } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';

// All available icons for service selection
const AVAILABLE_ICONS: { name: string; label: string; component: React.ReactNode }[] = [
  { name: 'Wifi', label: 'WiFi', component: <Wifi className="h-4 w-4" /> },
  { name: 'Volume2', label: 'Sound', component: <Volume2 className="h-4 w-4" /> },
  { name: 'Video', label: 'Video', component: <Video className="h-4 w-4" /> },
  { name: 'Projector', label: 'Projector', component: <Projector className="h-4 w-4" /> },
  { name: 'MonitorPlay', label: 'Screen', component: <MonitorPlay className="h-4 w-4" /> },
  { name: 'Tv', label: 'TV', component: <Tv className="h-4 w-4" /> },
  { name: 'Layers', label: 'Whiteboard', component: <Layers className="h-4 w-4" /> },
  { name: 'Printer', label: 'Printer', component: <Printer className="h-4 w-4" /> },
  { name: 'Sun', label: 'Natural Light', component: <Sun className="h-4 w-4" /> },
  { name: 'Lightbulb', label: 'Lighting', component: <Lightbulb className="h-4 w-4" /> },
  { name: 'Thermometer', label: 'Climate', component: <Thermometer className="h-4 w-4" /> },
  { name: 'GlassWater', label: 'Drinks', component: <GlassWater className="h-4 w-4" /> },
  { name: 'Coffee', label: 'Coffee', component: <Coffee className="h-4 w-4" /> },
  { name: 'UtensilsCrossed', label: 'Catering', component: <UtensilsCrossed className="h-4 w-4" /> },
  { name: 'Briefcase', label: 'Technical Assist', component: <Briefcase className="h-4 w-4" /> },
  { name: 'Settings', label: 'Technical Setup', component: <Settings className="h-4 w-4" /> },
  { name: 'Mic2', label: 'Microphone', component: <Mic2 className="h-4 w-4" /> },
  { name: 'Music', label: 'Music', component: <Music className="h-4 w-4" /> },
  { name: 'Presentation', label: 'Presentation', component: <Presentation className="h-4 w-4" /> },
  { name: 'Users', label: 'Hosting', component: <Users className="h-4 w-4" /> },
  { name: 'Zap', label: 'Power', component: <Zap className="h-4 w-4" /> },
  { name: 'FileText', label: 'Documents', component: <FileText className="h-4 w-4" /> },
  { name: 'ShieldCheck', label: 'Security', component: <ShieldCheck className="h-4 w-4" /> },
  { name: 'Phone', label: 'Phone', component: <Phone className="h-4 w-4" /> },
  { name: 'Map', label: 'Location', component: <Map className="h-4 w-4" /> },
  { name: 'ParkingCircle', label: 'Parking', component: <ParkingCircle className="h-4 w-4" /> },
  { name: 'Clock', label: 'Schedule', component: <Clock className="h-4 w-4" /> },
  { name: 'Star', label: 'Premium', component: <Star className="h-4 w-4" /> },
  { name: 'CheckCircle2', label: 'Included', component: <CheckCircle2 className="h-4 w-4" /> },
];

// Render a lucide icon by name
const renderIcon = (iconName: string, className = "h-4 w-4") => {
  const found = AVAILABLE_ICONS.find(i => i.name === iconName);
  if (found) {
    // Clone element with new className
    return React.cloneElement(found.component as React.ReactElement, { className });
  }
  return <CheckCircle2 className={className} />;
};

interface SeminarsSectionProps {
  hasSeminars: boolean;
  seminarDescription: string;
  seminarImage: string;
  seminarServices: SeminarService[];
  seminarRooms: SeminarRoom[];
  onSave: (data: {
    has_seminars: boolean;
    seminar_description: string;
    seminar_image: string;
    seminar_services: SeminarService[];
    seminar_rooms: SeminarRoom[];
  }) => void;
}

const SeminarsSection = ({
  hasSeminars,
  seminarDescription,
  seminarImage,
  seminarServices,
  seminarRooms,
  onSave
}: SeminarsSectionProps) => {
  const { t } = useTranslation();
  const { hotelId } = useCurrentHotelId();
  const { toast } = useToast();

  // Local states
  const [localHasSeminars, setLocalHasSeminars] = useState(hasSeminars);
  const [localDescription, setLocalDescription] = useState(seminarDescription);
  const [localImage, setLocalImage] = useState(seminarImage);
  const [localServices, setLocalServices] = useState<SeminarService[]>(seminarServices || []);
  const [localRooms, setLocalRooms] = useState<SeminarRoom[]>(seminarRooms || []);
  const [isUploading, setIsUploading] = useState(false);

  // Service form state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('CheckCircle2');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 2MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `seminars/${hotelId || 'default'}/${Date.now()}_image.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('lovable-uploads')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(fileName);

      setLocalImage(urlData.publicUrl);
      toast({ title: "Image Uploaded", description: "The seminar image has been uploaded successfully." });
    } catch (error: any) {
      console.error("Storage upload failed, falling back to WebP compression:", error);
      try {
        const compressedDataUrl = await compressAndConvertToWebP(file, 40);
        setLocalImage(compressedDataUrl);
        toast({ title: "Image Processed (Fallback)", description: "Image processed locally and converted successfully." });
      } catch (err) {
        console.error("WebP compression failed:", err);
        toast({ title: "Upload Failed", description: "Failed to upload or process the image.", variant: "destructive" });
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const isDuplicate = localServices.some(s => s.name.toLowerCase() === newServiceName.trim().toLowerCase());
    if (isDuplicate) return;
    setLocalServices([...localServices, { name: newServiceName.trim(), icon: newServiceIcon }]);
    setNewServiceName('');
    setNewServiceIcon('CheckCircle2');
    setShowIconPicker(false);
  };

  const handleRemoveService = (idx: number) => {
    setLocalServices(localServices.filter((_, i) => i !== idx));
  };

  const handleChangeServiceIcon = (serviceIdx: number, iconName: string) => {
    const updated = [...localServices];
    updated[serviceIdx] = { ...updated[serviceIdx], icon: iconName };
    setLocalServices(updated);
  };

  // Room form states
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomSurface, setRoomSurface] = useState('');
  const [roomHeight, setRoomHeight] = useState('');
  const [roomNaturalLight, setRoomNaturalLight] = useState(false);
  const [roomWifi, setRoomWifi] = useState(true);
  const [roomCapUShape, setRoomCapUShape] = useState('');
  const [roomCapClassroom, setRoomCapClassroom] = useState('');
  const [roomCapTheatre, setRoomCapTheatre] = useState('');
  const [roomCapBanquet, setRoomCapBanquet] = useState('');
  const [roomCapCocktail, setRoomCapCocktail] = useState('');
  const [roomCapBoardroom, setRoomCapBoardroom] = useState('');

  const handleResetRoomForm = () => {
    setEditingRoomIndex(null);
    setRoomName('');
    setRoomSurface('');
    setRoomHeight('');
    setRoomNaturalLight(false);
    setRoomWifi(true);
    setRoomCapUShape('');
    setRoomCapClassroom('');
    setRoomCapTheatre('');
    setRoomCapBanquet('');
    setRoomCapCocktail('');
    setRoomCapBoardroom('');
  };

  const handleSaveRoom = () => {
    if (!roomName.trim() || !roomSurface) return;

    const parsedRoom: SeminarRoom = {
      name: roomName.trim(),
      surface: parseFloat(roomSurface),
      height: roomHeight ? parseFloat(roomHeight) : undefined,
      natural_light: roomNaturalLight,
      wifi: roomWifi,
      cap_u_shape: roomCapUShape ? parseInt(roomCapUShape) : undefined,
      cap_classroom: roomCapClassroom ? parseInt(roomCapClassroom) : undefined,
      cap_theatre: roomCapTheatre ? parseInt(roomCapTheatre) : undefined,
      cap_banquet: roomCapBanquet ? parseInt(roomCapBanquet) : undefined,
      cap_cocktail: roomCapCocktail ? parseInt(roomCapCocktail) : undefined,
      cap_boardroom: roomCapBoardroom ? parseInt(roomCapBoardroom) : undefined,
    };

    if (editingRoomIndex !== null) {
      const updatedRooms = [...localRooms];
      updatedRooms[editingRoomIndex] = parsedRoom;
      setLocalRooms(updatedRooms);
    } else {
      setLocalRooms([...localRooms, parsedRoom]);
    }

    handleResetRoomForm();
  };

  const handleEditRoomClick = (index: number) => {
    const room = localRooms[index];
    setEditingRoomIndex(index);
    setRoomName(room.name);
    setRoomSurface(room.surface.toString());
    setRoomHeight(room.height?.toString() || '');
    setRoomNaturalLight(room.natural_light);
    setRoomWifi(room.wifi);
    setRoomCapUShape(room.cap_u_shape?.toString() || '');
    setRoomCapClassroom(room.cap_classroom?.toString() || '');
    setRoomCapTheatre(room.cap_theatre?.toString() || '');
    setRoomCapBanquet(room.cap_banquet?.toString() || '');
    setRoomCapCocktail(room.cap_cocktail?.toString() || '');
    setRoomCapBoardroom(room.cap_boardroom?.toString() || '');
  };

  const handleDeleteRoom = (index: number) => {
    setLocalRooms(localRooms.filter((_, i) => i !== index));
    if (editingRoomIndex === index) handleResetRoomForm();
  };

  const handleSaveAll = () => {
    let finalServices = [...localServices];
    if (newServiceName.trim()) {
      const isDuplicate = finalServices.some(s => s.name.toLowerCase() === newServiceName.trim().toLowerCase());
      if (!isDuplicate) {
        finalServices.push({ name: newServiceName.trim(), icon: newServiceIcon });
        setLocalServices(finalServices);
        setNewServiceName('');
        setNewServiceIcon('CheckCircle2');
      }
    }

    let finalRooms = [...localRooms];
    if (roomName.trim() && roomSurface) {
      const parsedRoom: SeminarRoom = {
        name: roomName.trim(),
        surface: parseFloat(roomSurface),
        height: roomHeight ? parseFloat(roomHeight) : undefined,
        natural_light: roomNaturalLight,
        wifi: roomWifi,
        cap_u_shape: roomCapUShape ? parseInt(roomCapUShape) : undefined,
        cap_classroom: roomCapClassroom ? parseInt(roomCapClassroom) : undefined,
        cap_theatre: roomCapTheatre ? parseInt(roomCapTheatre) : undefined,
        cap_banquet: roomCapBanquet ? parseInt(roomCapBanquet) : undefined,
        cap_cocktail: roomCapCocktail ? parseInt(roomCapCocktail) : undefined,
        cap_boardroom: roomCapBoardroom ? parseInt(roomCapBoardroom) : undefined,
      };
      if (editingRoomIndex !== null) {
        finalRooms[editingRoomIndex] = parsedRoom;
      } else {
        finalRooms.push(parsedRoom);
      }
      setLocalRooms(finalRooms);
      handleResetRoomForm();
    }

    onSave({
      has_seminars: localHasSeminars,
      seminar_description: localDescription,
      seminar_image: localImage,
      seminar_services: finalServices,
      seminar_rooms: finalRooms
    });
  };

  // Icon picker component (inline popover)
  const IconPickerDropdown = ({
    selected,
    onSelect,
    onClose
  }: {
    selected: string;
    onSelect: (name: string) => void;
    onClose: () => void;
  }) => (
    <div className="absolute z-50 top-full mt-1 left-0 bg-popover border rounded-xl shadow-xl p-3 w-72">
      <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 tracking-wider">Choose an icon</p>
      <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1">
        {AVAILABLE_ICONS.map((icon) => (
          <button
            key={icon.name}
            type="button"
            title={icon.label}
            onClick={() => { onSelect(icon.name); onClose(); }}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-center hover:bg-primary/10 transition-colors ${selected === icon.name ? 'bg-primary/15 ring-1 ring-primary' : ''}`}
          >
            <span className="text-foreground/80">{icon.component}</span>
            <span className="text-[8px] text-muted-foreground leading-tight truncate w-full">{icon.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Seminars & Meetings</h2>
          <p className="text-sm text-muted-foreground">Configure the conferences and seminars section for your hotel.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="has_seminars" className="font-medium cursor-pointer">Enable Seminars section</Label>
          <Switch
            id="has_seminars"
            checked={localHasSeminars}
            onCheckedChange={setLocalHasSeminars}
          />
        </div>
      </div>

      {localHasSeminars && (
        <div className="space-y-6">
          {/* Section Image */}
          <div className="space-y-3">
            <Label>Section Header Image</Label>

            {localImage ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border bg-muted aspect-[21/9] max-h-60 group">
                  <img src={localImage} alt="Seminar Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('seminar-image-file')?.click()} disabled={isUploading}>
                      <Upload className="h-4 w-4 mr-2" />Change Image
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setLocalImage('')} disabled={isUploading}>
                      <Trash2 className="h-4 w-4 mr-2" />Remove
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Or paste an image URL here..."
                    value={localImage.startsWith('data:') ? '' : localImage}
                    onChange={(e) => setLocalImage(e.target.value)}
                    className="text-xs text-muted-foreground"
                  />
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => document.getElementById('seminar-image-file')?.click()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading image...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full text-primary mb-3">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold mb-1">Click to upload seminar image</p>
                    <p className="text-xs text-muted-foreground mb-4">PNG, JPG or WebP (max 2MB)</p>
                    <div className="flex gap-2 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                      <Input
                        placeholder="Or paste an image URL..."
                        value={localImage}
                        onChange={(e) => setLocalImage(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <input id="seminar-image-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
          </div>

          {/* Section Description */}
          <div className="space-y-2">
            <Label htmlFor="seminar_description">Section Description</Label>
            <Textarea
              id="seminar_description"
              placeholder="Describe the seminars, plenary rooms, and services offered..."
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* ===== Available Services with Icon Picker ===== */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-semibold">Available Services & Technical Amenities</Label>
            <p className="text-xs text-muted-foreground">Add each service and choose its icon for display on the guest page.</p>

            {/* Add new service row */}
            <div className="flex gap-2 items-start">
              {/* Icon picker trigger */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="h-10 w-10 flex items-center justify-center rounded-lg border bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  title="Choose icon"
                >
                  {renderIcon(newServiceIcon, "h-5 w-5 text-primary")}
                </button>
                {showIconPicker && (
                  <IconPickerDropdown
                    selected={newServiceIcon}
                    onSelect={setNewServiceIcon}
                    onClose={() => setShowIconPicker(false)}
                  />
                )}
              </div>

              <Input
                className="flex-1"
                placeholder="e.g. WiFi, Sound System, Projector"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddService(); }
                }}
              />
              <Button type="button" onClick={handleAddService} disabled={!newServiceName.trim()}>
                Add
              </Button>
            </div>

            {/* Services list */}
            {localServices.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No services added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {localServices.map((service, idx) => (
                  <ServiceTag
                    key={idx}
                    service={service}
                    onRemove={() => handleRemoveService(idx)}
                    onIconChange={(iconName) => handleChangeServiceIcon(idx, iconName)}
                    renderIcon={renderIcon}
                    allIcons={AVAILABLE_ICONS}
                    IconPickerDropdown={IconPickerDropdown}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Seminar Rooms Builder */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">Seminar & Meeting Rooms</Label>

            {localRooms.length > 0 && (
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-muted border-b text-xs uppercase font-semibold">
                      <th className="p-3">Room Name</th>
                      <th className="p-3">Surface (m²)</th>
                      <th className="p-3">Height (m)</th>
                      <th className="p-3">Natural Light</th>
                      <th className="p-3">WiFi</th>
                      <th className="p-3 text-center">Capacities (U-shape / Class / Theatre)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localRooms.map((room, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{room.name}</td>
                        <td className="p-3">{room.surface}</td>
                        <td className="p-3">{room.height || '-'}</td>
                        <td className="p-3">{room.natural_light ? 'Yes' : 'No'}</td>
                        <td className="p-3">{room.wifi ? 'Yes' : 'No'}</td>
                        <td className="p-3 text-center font-mono text-xs">
                          {room.cap_u_shape || '-'} / {room.cap_classroom || '-'} / {room.cap_theatre || '-'}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditRoomClick(idx)} className="p-1 h-8 w-8 text-blue-600 hover:text-blue-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRoom(idx)} className="p-1 h-8 w-8 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Room Addition/Editing Form */}
            <Card className="bg-muted/30 border border-dashed">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-1.5 text-primary">
                  <Sparkles className="h-4 w-4" />
                  {editingRoomIndex !== null ? 'Edit Room' : 'Add New Seminar Room'}
                </h4>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="room_name">Room Name *</Label>
                    <Input id="room_name" placeholder="e.g. Carthage Room" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="room_surface">Surface Area (m²) *</Label>
                    <Input id="room_surface" type="number" placeholder="e.g. 120" value={roomSurface} onChange={(e) => setRoomSurface(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="room_height">Ceiling Height (m)</Label>
                    <Input id="room_height" type="number" step="0.1" placeholder="e.g. 3.2" value={roomHeight} onChange={(e) => setRoomHeight(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-6 py-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={roomNaturalLight} onChange={(e) => setRoomNaturalLight(e.target.checked)} className="rounded text-primary focus:ring-primary h-4 w-4" />
                    Natural Light
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={roomWifi} onChange={(e) => setRoomWifi(e.target.checked)} className="rounded text-primary focus:ring-primary h-4 w-4" />
                    WiFi Available
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Max Capacities (People)</Label>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-6">
                    <div><Label htmlFor="cap_u" className="text-xs">U-Shape</Label><Input id="cap_u" type="number" placeholder="80" value={roomCapUShape} onChange={(e) => setRoomCapUShape(e.target.value)} className="h-8" /></div>
                    <div><Label htmlFor="cap_class" className="text-xs">Classroom</Label><Input id="cap_class" type="number" placeholder="120" value={roomCapClassroom} onChange={(e) => setRoomCapClassroom(e.target.value)} className="h-8" /></div>
                    <div><Label htmlFor="cap_theatre" className="text-xs">Theatre</Label><Input id="cap_theatre" type="number" placeholder="300" value={roomCapTheatre} onChange={(e) => setRoomCapTheatre(e.target.value)} className="h-8" /></div>
                    <div><Label htmlFor="cap_banquet" className="text-xs">Banquet</Label><Input id="cap_banquet" type="number" placeholder="150" value={roomCapBanquet} onChange={(e) => setRoomCapBanquet(e.target.value)} className="h-8" /></div>
                    <div><Label htmlFor="cap_cocktail" className="text-xs">Cocktail</Label><Input id="cap_cocktail" type="number" placeholder="200" value={roomCapCocktail} onChange={(e) => setRoomCapCocktail(e.target.value)} className="h-8" /></div>
                    <div><Label htmlFor="cap_boardroom" className="text-xs">Boardroom</Label><Input id="cap_boardroom" type="number" placeholder="50" value={roomCapBoardroom} onChange={(e) => setRoomCapBoardroom(e.target.value)} className="h-8" /></div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  {(editingRoomIndex !== null || roomName || roomSurface) && (
                    <Button variant="ghost" size="sm" onClick={handleResetRoomForm}>Cancel</Button>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={handleSaveRoom} disabled={!roomName.trim() || !roomSurface}>
                    {editingRoomIndex !== null ? 'Save Room' : 'Add Room'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="border-t pt-4 mt-6">
        <Button onClick={handleSaveAll} className="w-full sm:w-auto">
          Save All Changes
        </Button>
      </div>
    </Card>
  );
};

// ---- ServiceTag sub-component with inline icon picker ----
interface ServiceTagProps {
  service: SeminarService;
  onRemove: () => void;
  onIconChange: (iconName: string) => void;
  renderIcon: (name: string, className?: string) => React.ReactNode;
  allIcons: { name: string; label: string; component: React.ReactNode }[];
  IconPickerDropdown: React.ComponentType<{ selected: string; onSelect: (name: string) => void; onClose: () => void }>;
}

const ServiceTag = ({ service, onRemove, onIconChange, renderIcon, allIcons, IconPickerDropdown }: ServiceTagProps) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative flex items-center gap-2 bg-muted/40 border rounded-lg px-3 py-2 group">
      {/* Icon button - click to change */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="bg-primary/10 p-1.5 rounded-md text-primary hover:bg-primary/20 transition-colors shrink-0"
        title="Click to change icon"
      >
        {renderIcon(service.icon, "h-3.5 w-3.5")}
      </button>

      {showPicker && (
        <IconPickerDropdown
          selected={service.icon}
          onSelect={(name) => { onIconChange(name); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}

      <span className="text-sm font-medium flex-1 truncate">{service.name}</span>

      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default SeminarsSection;

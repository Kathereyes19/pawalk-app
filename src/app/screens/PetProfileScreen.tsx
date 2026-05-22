import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Check,
  X,
  Upload,
  FileText,
  Calendar,
  Syringe,
  Heart,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronRight,
  Shield,
  Loader2,
  Bell,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserData } from '@/contexts/UserDataContext';
import {
  AVATAR_OPTIONS,
  CAT_BREEDS,
  createPet,
  CUSTOM_VACCINE_OPTION,
  deletePet,
  DOG_BREEDS,
  getVaccineOptionsForSpecies,
  updatePet,
} from '@/features/pets';
import { isSupabaseConfigured } from '@/config/env';
import { addVaccination, deleteVaccination } from '@/features/vaccinations';
import { getPetAvatarProps } from '@/lib/avatars';
import type { Pet as PetType, Vaccination } from '@/types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { IconButton } from '../components/IconButton';
import { ConfirmDialog } from '../components/pets/ConfirmDialog';
import { useReminders } from '@/contexts/RemindersContext';
import { ReminderSummaryText } from '../components/reminders/ReminderSummaryText';

type Pet = PetType & { vaccinations?: Vaccination[] };

interface PetProfileScreenProps {
  onOpenReminders?: () => void;
}

export const PetProfileScreen: React.FC<PetProfileScreenProps> = ({ onOpenReminders }) => {
  const { t } = useLanguage();
  const { pets, setPets, userId, isLoading, refreshUserData } = useUserData();
  const { statusCounts } = useReminders();
  const [isSaving, setIsSaving] = useState(false);
  const [vaccineError, setVaccineError] = useState<string | null>(null);
  const [isSavingVaccine, setIsSavingVaccine] = useState(false);

  const [showPetForm, setShowPetForm] = useState(false);
  const [petFormMode, setPetFormMode] = useState<'add' | 'edit'>('add');
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [isDeletingPet, setIsDeletingPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showHealthDashboard, setShowHealthDashboard] = useState(false);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [customVaccineName, setCustomVaccineName] = useState('');
  const [vaccineForm, setVaccineForm] = useState({
    name: '',
    date: '',
    nextDue: '',
    cardImageUrl: '' as string | null,
  });
  const [formStep, setFormStep] = useState(1);
  // Form state
  const [newPet, setNewPet] = useState<Partial<Pet>>({
    name: '',
    breed: '',
    age: 0,
    weight: 0,
    behaviors: [],
    gender: 'male',
    species: 'dog',
    avatar: '',
  });

  const behaviorOptions = [
    { id: 'friendly', label: t('pet.friendly'), icon: '😊', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    { id: 'energetic', label: t('pet.energetic'), icon: '⚡', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
    { id: 'shy', label: t('pet.shy'), icon: '😌', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    { id: 'trained', label: t('pet.trained'), icon: '🎓', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    { id: 'playful', label: 'Juguetón', icon: '🎾', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
    { id: 'calm', label: 'Tranquilo', icon: '🧘', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  ];

  const dogBreeds = [...DOG_BREEDS];
  const catBreeds = [...CAT_BREEDS];
  const avatarOptions = AVATAR_OPTIONS;

  const resetPetForm = () => {
    setNewPet({
      name: '',
      breed: '',
      age: 0,
      weight: 0,
      behaviors: [],
      gender: 'male',
      species: 'dog',
      avatar: '',
    });
    setFormStep(1);
    setEditingPetId(null);
    setPetFormMode('add');
  };

  const openAddPetForm = () => {
    resetPetForm();
    setShowPetForm(true);
  };

  const openEditPetForm = (pet: Pet) => {
    setPetFormMode('edit');
    setEditingPetId(pet.id);
    setNewPet({
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      behaviors: [...pet.behaviors],
      gender: pet.gender,
      species: pet.species,
      avatar: pet.avatar,
    });
    setFormStep(1);
    setShowPetForm(true);
  };

  const closePetForm = () => {
    setShowPetForm(false);
    resetPetForm();
  };

  const toggleBehavior = (behaviorId: string) => {
    setNewPet((prev) => ({
      ...prev,
      behaviors: prev.behaviors?.includes(behaviorId)
        ? prev.behaviors.filter((b) => b !== behaviorId)
        : [...(prev.behaviors || []), behaviorId],
    }));
  };

  useEffect(() => {
    if (!selectedPet) return;
    const updated = pets.find((p) => p.id === selectedPet.id);
    if (updated) setSelectedPet(updated);
  }, [pets, selectedPet?.id]);

  const updatePetInList = (petId: string, updater: (pet: Pet) => Pet) => {
    const next = pets.map((p) => (p.id === petId ? updater(p) : p));
    setPets(next);
    return next;
  };

  const handleAddVaccine = async () => {
    const vaccineName =
      vaccineForm.name === CUSTOM_VACCINE_OPTION ? customVaccineName.trim() : vaccineForm.name;

    if (!selectedPet || !userId || !vaccineName || !vaccineForm.date) {
      setVaccineError('Completa la vacuna y la fecha de aplicación');
      return;
    }

    setIsSavingVaccine(true);
    setVaccineError(null);

    const { vaccination, pets: updatedPets, error } = await addVaccination(
      userId,
      selectedPet.id,
      {
        name: vaccineName,
        date: vaccineForm.date,
        nextDue: vaccineForm.nextDue || undefined,
        cardImageUrl: vaccineForm.cardImageUrl,
      }
    );

    if (error || !vaccination) {
      setVaccineError(error?.message ?? 'No se pudo guardar la vacuna');
      setIsSavingVaccine(false);
      return;
    }

    const nextPets = updatedPets ?? updatePetInList(selectedPet.id, (pet) => ({
      ...pet,
      vaccinated: true,
      vaccinations: [...(pet.vaccinations ?? []), vaccination],
    }));

    if (updatedPets) {
      setPets(updatedPets);
    } else if (userId) {
      await refreshUserData();
    } else {
      setPets(nextPets);
    }

    const list = updatedPets ?? nextPets;
    setSelectedPet(list.find((p) => p.id === selectedPet.id) ?? null);
    setVaccineForm({ name: '', date: '', nextDue: '', cardImageUrl: null });
    setCustomVaccineName('');
    setShowAddVaccine(false);
    setIsSavingVaccine(false);
  };

  const handleDeleteVaccine = async (vaccinationId: string) => {
    if (!selectedPet || !userId) return;

    const { error } = await deleteVaccination(userId, selectedPet.id, vaccinationId);
    if (error) {
      setVaccineError(error.message);
      return;
    }

    if (!isSupabaseConfigured()) {
      const nextPets = updatePetInList(selectedPet.id, (pet) => ({
        ...pet,
        vaccinations: (pet.vaccinations ?? []).filter((v) => v.id !== vaccinationId),
      }));
      setSelectedPet(nextPets.find((p) => p.id === selectedPet.id) ?? null);
    } else {
      await refreshUserData();
      const updated = pets.find((p) => p.id === selectedPet.id);
      if (updated) setSelectedPet(updated);
    }
  };

  const handleVaccineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setVaccineForm((prev) => ({
        ...prev,
        cardImageUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSavePet = async () => {
    if (!userId) return;

    const species = (newPet.species || 'dog') as 'dog' | 'cat';
    const petPayload = {
      name: newPet.name || '',
      avatar: newPet.avatar || avatarOptions[species][0],
      breed: newPet.breed || '',
      age: newPet.age || 0,
      weight: newPet.weight || 0,
      behaviors: newPet.behaviors || [],
      vaccinated: false,
      gender: newPet.gender || 'male',
      species,
    };

    setIsSaving(true);

    if (petFormMode === 'edit' && editingPetId) {
      const existing = pets.find((pet) => pet.id === editingPetId);
      const { pet, error } = await updatePet(userId, {
        ...petPayload,
        id: editingPetId,
        vaccinated: existing?.vaccinated ?? false,
        vaccinations: existing?.vaccinations ?? [],
      });

      if (error) {
        setIsSaving(false);
        return;
      }

      if (pet) {
        setPets(pets.map((item) => (item.id === pet.id ? pet : item)));
      } else if (isSupabaseConfigured()) {
        await refreshUserData();
      }
    } else {
      const { pet, error } = await createPet(userId, petPayload);
      if (error) {
        setIsSaving(false);
        return;
      }

      if (pet) {
        setPets([...pets, pet]);
      } else if (isSupabaseConfigured()) {
        await refreshUserData();
      }
    }

    setIsSaving(false);
    closePetForm();
  };

  const handleDeletePet = async () => {
    if (!petToDelete || !userId) return;

    setIsDeletingPet(true);
    const { error } = await deletePet(userId, petToDelete.id);

    if (error) {
      setIsDeletingPet(false);
      return;
    }

    if (isSupabaseConfigured()) {
      await refreshUserData();
    } else {
      setPets(pets.filter((pet) => pet.id !== petToDelete.id));
    }

    if (selectedPet?.id === petToDelete.id) {
      setSelectedPet(null);
      setShowHealthDashboard(false);
    }

    setIsDeletingPet(false);
    setPetToDelete(null);
    closePetForm();
  };

  const getVaccinationStatus = (vaccination: Vaccination) => {
    if (!vaccination.nextDue) {
      return { label: 'Registrada', variant: 'success' as const, icon: Check };
    }

    const daysUntilDue = Math.floor(
      (new Date(vaccination.nextDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) return { label: 'Vencida', variant: 'destructive' as const, icon: AlertCircle };
    if (daysUntilDue < 30) return { label: 'Próxima', variant: 'warning' as const, icon: Calendar };
    return { label: 'Al día', variant: 'success' as const, icon: Check };
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center pb-24 bg-background-secondary">
        <Loader2 className="w-10 h-10 text-primary animate-spin" aria-label="Cargando mascotas" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-background-secondary">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border p-4 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('nav.pets')}</h1>
            <p className="text-sm text-muted-foreground">
              {pets.length} {pets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={openAddPetForm}
          >
            <Plus className="w-4 h-4" />
            {t('pet.add')}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {onOpenReminders && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onOpenReminders}
            className="w-full mb-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-4 flex items-center gap-3 text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{t('reminders.title')}</p>
              <ReminderSummaryText statusCounts={statusCounts} />
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </motion.button>
        )}

        {/* Empty State */}
        {pets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Agrega tu primera mascota</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Crea un perfil para tu compañero peludo y mantén su información de salud organizada
            </p>
            <Button onClick={openAddPetForm}>
              <Plus className="w-5 h-5" />
              Agregar mascota
            </Button>
          </motion.div>
        )}

        {/* Pet Cards */}
        <div className="space-y-3 mb-6">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card hoverable variant="elevated" padding="lg">
                <div className="flex gap-4 mb-4">
                  {/* Pet Avatar */}
                  <div className="relative">
                    <Avatar {...getPetAvatarProps(pet)} size="2xl" />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-card border-2 border-background rounded-full flex items-center justify-center">
                      <span className="text-xs">{pet.gender === 'male' ? '♂️' : '♀️'}</span>
                    </div>
                  </div>

                  {/* Pet Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground">{pet.breed}</p>
                      </div>
                      <div className="flex gap-1">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPet(pet);
                            setShowHealthDashboard(true);
                          }}
                        >
                          <Syringe className="w-4 h-4" />
                        </IconButton>
                        <IconButton variant="ghost" size="sm" onClick={() => openEditPetForm(pet)}>
                          <Edit2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground-secondary">{pet.age} años</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground-secondary">{pet.weight} kg</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {pet.behaviors.slice(0, 3).map((behavior) => {
                        const option = behaviorOptions.find((b) => b.id === behavior);
                        return (
                          <Badge key={behavior} className={option?.color} size="sm">
                            {option?.icon} {option?.label}
                          </Badge>
                        );
                      })}
                      {pet.behaviors.length > 3 && (
                        <Badge variant="default" size="sm">
                          +{pet.behaviors.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Health Summary */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">
                        {pet.vaccinations?.length || 0} vacunas registradas
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPet(pet);
                        setShowHealthDashboard(true);
                      }}
                      className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                      Ver salud
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add / Edit Pet Modal */}
      <AnimatePresence>
        {showPetForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
            onClick={closePetForm}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold">
                    {petFormMode === 'edit' ? 'Editar mascota' : t('pet.add')}
                  </h2>
                  <p className="text-sm text-muted-foreground">Paso {formStep} de 3</p>
                </div>
                <IconButton onClick={closePetForm} variant="ghost">
                  <X className="w-5 h-5" />
                </IconButton>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(formStep / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {/* Step 1: Basic Info */}
                  {formStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="space-y-6"
                    >
                      {/* Species Selection */}
                      <div>
                        <label className="block mb-3 font-semibold text-sm">Tipo de mascota</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setNewPet({ ...newPet, species: 'dog' })}
                            className={`p-4 rounded-2xl border-2 transition-all ${
                              newPet.species === 'dog'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span className="text-4xl mb-2 block">🐕</span>
                            <span className="font-semibold">Perro</span>
                          </button>
                          <button
                            onClick={() => setNewPet({ ...newPet, species: 'cat' })}
                            className={`p-4 rounded-2xl border-2 transition-all ${
                              newPet.species === 'cat'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span className="text-4xl mb-2 block">🐈</span>
                            <span className="font-semibold">Gato</span>
                          </button>
                        </div>
                      </div>

                      {/* Avatar Selection */}
                      <div>
                        <label className="block mb-3 font-semibold text-sm">Elige un avatar</label>
                        <div className="flex gap-2 flex-wrap">
                          {avatarOptions[newPet.species as 'dog' | 'cat'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setNewPet({ ...newPet, avatar: emoji })}
                              className={`w-16 h-16 rounded-2xl border-2 transition-all text-3xl ${
                                newPet.avatar === emoji
                                  ? 'border-primary bg-primary/10 scale-110'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Name */}
                      <Input
                        label="Nombre de tu mascota"
                        placeholder="Max"
                        value={newPet.name}
                        onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                      />

                      {/* Gender */}
                      <div>
                        <label className="block mb-3 font-semibold text-sm">Sexo</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setNewPet({ ...newPet, gender: 'male' })}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              newPet.gender === 'male'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            ♂️ Macho
                          </button>
                          <button
                            onClick={() => setNewPet({ ...newPet, gender: 'female' })}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              newPet.gender === 'female'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            ♀️ Hembra
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Physical Details */}
                  {formStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="space-y-5"
                    >
                      {/* Breed */}
                      <div>
                        <label className="block mb-3 font-semibold text-sm">Raza</label>
                        <select
                          value={newPet.breed}
                          onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl bg-input-background border border-input-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="">Selecciona una raza</option>
                          {(newPet.species === 'dog' ? dogBreeds : catBreeds).map((breed) => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                        </select>
                      </div>

                      {/* Age and Weight */}
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Edad (años)"
                          type="number"
                          placeholder="3"
                          value={newPet.age || ''}
                          onChange={(e) => setNewPet({ ...newPet, age: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                          label="Peso (kg)"
                          type="number"
                          placeholder="28"
                          value={newPet.weight || ''}
                          onChange={(e) => setNewPet({ ...newPet, weight: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Behavior */}
                  {formStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block mb-3 font-semibold text-sm">
                          Personalidad (selecciona todas las que apliquen)
                        </label>
                        <p className="text-sm text-muted-foreground mb-4">
                          Esto ayuda a los paseadores a conocer mejor a {newPet.name || 'tu mascota'}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {behaviorOptions.map((option) => {
                            const isSelected = newPet.behaviors?.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                onClick={() => toggleBehavior(option.id)}
                                className={`p-4 rounded-2xl border-2 transition-all text-left relative ${
                                  isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-2xl">{option.icon}</span>
                                  {isSelected && (
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium text-sm">{option.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer */}
              <div className="p-6 pb-safe border-t border-border space-y-3">
                {petFormMode === 'edit' && (
                  <Button
                    variant="outline"
                    fullWidth
                    className="border-destructive/30 text-destructive hover:bg-destructive/5"
                    onClick={() => {
                      const pet = pets.find((item) => item.id === editingPetId);
                      if (pet) setPetToDelete(pet);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar mascota
                  </Button>
                )}
                <div className="flex gap-3">
                {formStep > 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => setFormStep(formStep - 1)}
                  >
                    Atrás
                  </Button>
                )}
                <Button
                  fullWidth
                  loading={isSaving}
                  onClick={() => {
                    if (formStep < 3) {
                      setFormStep(formStep + 1);
                    } else {
                      handleSavePet();
                    }
                  }}
                  disabled={
                    (formStep === 1 && (!newPet.name || !newPet.avatar)) ||
                    (formStep === 2 && (!newPet.breed || !newPet.age || !newPet.weight))
                  }
                >
                  {formStep === 3
                    ? petFormMode === 'edit'
                      ? 'Guardar cambios'
                      : 'Guardar mascota'
                    : 'Siguiente'}
                </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Health Dashboard Modal */}
      <AnimatePresence>
        {showHealthDashboard && selectedPet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
            onClick={() => setShowHealthDashboard(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar {...getPetAvatarProps(selectedPet)} size="md" />
                  <div>
                    <h2 className="text-xl font-bold">Salud de {selectedPet.name}</h2>
                    <p className="text-sm text-muted-foreground">Historial médico</p>
                  </div>
                </div>
                <IconButton onClick={() => setShowHealthDashboard(false)} variant="ghost">
                  <X className="w-5 h-5" />
                </IconButton>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Vaccinations */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Syringe className="w-5 h-5 text-primary" />
                      Vacunas
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddVaccine(true)}>
                      <Plus className="w-4 h-4" />
                      Agregar
                    </Button>
                  </div>

                  {selectedPet.vaccinations && selectedPet.vaccinations.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPet.vaccinations.map((vaccination) => {
                        const status = getVaccinationStatus(vaccination);
                        const StatusIcon = status.icon;
                        return (
                          <Card key={vaccination.id} variant="bordered" padding="md">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{vaccination.name}</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>Aplicada: {new Date(vaccination.date).toLocaleDateString()}</p>
                                  {vaccination.nextDue ? (
                                    <p>Próxima: {new Date(vaccination.nextDue).toLocaleDateString()}</p>
                                  ) : (
                                    <p>Sin fecha de vencimiento registrada</p>
                                  )}
                                </div>
                                {vaccination.cardImageUrl && (
                                  <img
                                    src={vaccination.cardImageUrl}
                                    alt="Carnet de vacunación"
                                    className="mt-2 w-full max-h-32 object-cover rounded-lg border border-border"
                                  />
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant={status.variant} size="sm">
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {status.label}
                                </Badge>
                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteVaccine(vaccination.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </IconButton>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card variant="bordered" padding="lg" className="text-center">
                      <Syringe className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No hay vacunas registradas
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setShowAddVaccine(true)}>
                        <Plus className="w-4 h-4" />
                        Agregar primera vacuna
                      </Button>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add vaccine modal */}
      <AnimatePresence>
        {showAddVaccine && selectedPet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddVaccine(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md bg-card rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Nueva vacuna — {selectedPet.name}</h3>
                <IconButton variant="ghost" onClick={() => setShowAddVaccine(false)}>
                  <X className="w-5 h-5" />
                </IconButton>
              </div>

              {vaccineError && (
                <p className="text-sm text-destructive mb-3" role="alert">
                  {vaccineError}
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Vacuna</label>
                  <select
                    value={vaccineForm.name}
                    onChange={(e) => {
                      setVaccineForm({ ...vaccineForm, name: e.target.value });
                      if (e.target.value !== CUSTOM_VACCINE_OPTION) {
                        setCustomVaccineName('');
                      }
                    }}
                    className="w-full h-12 px-4 rounded-xl bg-input-background border border-input-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Selecciona una vacuna</option>
                    {getVaccineOptionsForSpecies(selectedPet.species).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {vaccineForm.name === CUSTOM_VACCINE_OPTION && (
                  <Input
                    label="Nombre personalizado"
                    placeholder="Ej. Giardia"
                    value={customVaccineName}
                    onChange={(e) => setCustomVaccineName(e.target.value)}
                  />
                )}

                <Input
                  label="Fecha de aplicación"
                  type="date"
                  value={vaccineForm.date}
                  onChange={(e) => setVaccineForm({ ...vaccineForm, date: e.target.value })}
                />
                <Input
                  label="Próxima dosis (opcional)"
                  type="date"
                  value={vaccineForm.nextDue}
                  onChange={(e) => setVaccineForm({ ...vaccineForm, nextDue: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Carnet / imagen (opcional)</label>
                  <label className="flex items-center justify-center gap-2 h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Subir imagen</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleVaccineImageUpload} />
                  </label>
                  {vaccineForm.cardImageUrl && (
                    <img
                      src={vaccineForm.cardImageUrl}
                      alt="Vista previa"
                      className="mt-2 w-full max-h-28 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                className="mt-6"
                loading={isSavingVaccine}
                onClick={handleAddVaccine}
              >
                Guardar vacuna
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={Boolean(petToDelete)}
        title={`¿Eliminar a ${petToDelete?.name ?? 'esta mascota'}?`}
        description="Esta acción no se puede deshacer. Se eliminarán también las vacunas registradas y las reservas futuras quedarán sin esta mascota."
        confirmLabel="Eliminar mascota"
        loading={isDeletingPet}
        onConfirm={handleDeletePet}
        onCancel={() => setPetToDelete(null)}
      />
    </div>
  );
};

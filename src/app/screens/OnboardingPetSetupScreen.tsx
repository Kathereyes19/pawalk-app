import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Camera,
  Check,
  X,
  Loader2,
  Heart,
  ChevronRight,
  Upload,
  Trash2,
  PawPrint,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { IconButton } from '../components/IconButton';
import iconOnlyLogo from '../../imports/Icon-only_version.png';
import { createPetId } from '@/lib/petId';

interface Pet {
  id: string;
  name: string;
  avatar: string;
  breed: string;
  age: number;
  weight: number;
  behaviors: string[];
  gender: 'male' | 'female';
  species: 'dog' | 'cat';
}

interface OnboardingPetSetupScreenProps {
  onComplete: (pets: Pet[]) => void;
  onSkip?: () => void;
}

export const OnboardingPetSetupScreen: React.FC<OnboardingPetSetupScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const { t } = useLanguage();
  const [pets, setPets] = useState<Pet[]>([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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
    { id: 'friendly', label: 'Amigable', icon: '😊', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    { id: 'energetic', label: 'Enérgico', icon: '⚡', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
    { id: 'shy', label: 'Tímido', icon: '😌', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    { id: 'trained', label: 'Entrenado', icon: '🎓', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    { id: 'playful', label: 'Juguetón', icon: '🎾', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
    { id: 'calm', label: 'Tranquilo', icon: '🧘', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  ];

  const dogBreeds = [
    'Labrador Retriever', 'Golden Retriever', 'Pastor Alemán', 'Bulldog', 'Beagle',
    'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Dachshund', 'Chihuahua',
    'Husky Siberiano', 'Pomerania', 'Schnauzer', 'Cocker Spaniel', 'Otro'
  ];

  const catBreeds = [
    'Siamés', 'Persa', 'Maine Coon', 'Bengalí', 'Ragdoll',
    'British Shorthair', 'Sphynx', 'Angora', 'Mestizo', 'Otro'
  ];

  const avatarOptions = {
    dog: ['🐕', '🐶', '🦮', '🐕‍🦺', '🐩'],
    cat: ['🐈', '🐱', '🐈‍⬛', '😺', '😸'],
  };

  const handleAvatarUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const toggleBehavior = (behaviorId: string) => {
    setNewPet((prev) => ({
      ...prev,
      behaviors: prev.behaviors?.includes(behaviorId)
        ? prev.behaviors.filter((b) => b !== behaviorId)
        : [...(prev.behaviors || []), behaviorId],
    }));
  };

  const handleSavePet = () => {
    const petToSave: Pet = {
      id: createPetId(),
      name: newPet.name || '',
      avatar: newPet.avatar || avatarOptions[newPet.species as 'dog' | 'cat'][0],
      breed: newPet.breed || '',
      age: newPet.age || 0,
      weight: newPet.weight || 0,
      behaviors: newPet.behaviors || [],
      gender: newPet.gender || 'male',
      species: newPet.species || 'dog',
    };

    setPets([...pets, petToSave]);
    setShowAddPet(false);
    setFormStep(1);
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
  };

  const handleRemovePet = (id: string) => {
    setPets(pets.filter((p) => p.id !== id));
  };

  const handleOpenAddPet = () => {
    setShowAddPet(true);
    // Auto-select first avatar when opening
    if (!newPet.avatar) {
      setNewPet({
        ...newPet,
        avatar: avatarOptions[newPet.species as 'dog' | 'cat'][0],
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-32 bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-20 h-20 mx-auto mb-4"
        >
          <img
            src={iconOnlyLogo}
            alt="Pawalk"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold mb-2">¿Quiénes son tus compañeros?</h1>
          <p className="text-foreground-secondary text-lg">
            Agrega a tus mascotas para comenzar
          </p>
        </motion.div>
      </div>

      <div className="px-6 pb-8">
        {/* Empty State */}
        {pets.length === 0 && !showAddPet && (
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
              Necesitas agregar al menos una mascota para poder agendar paseos
            </p>
            <Button onClick={handleOpenAddPet} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Agregar mascota
            </Button>
          </motion.div>
        )}

        {/* Pet Cards */}
        {pets.length > 0 && !showAddPet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mb-6"
          >
            {pets.map((pet, index) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card variant="elevated" padding="md">
                  <div className="flex gap-4">
                    <div className="relative">
                      <Avatar emoji={pet.avatar} size="xl" className="rounded-2xl" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-card border-2 border-background rounded-full flex items-center justify-center">
                        <span className="text-xs">{pet.gender === 'male' ? '♂️' : '♀️'}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{pet.name}</h3>
                          <p className="text-sm text-muted-foreground">{pet.breed}</p>
                        </div>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePet(pet.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>

                      <div className="flex items-center gap-3 text-sm mb-2">
                        <span>{pet.age} años</span>
                        <span>•</span>
                        <span>{pet.weight} kg</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
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
                </Card>
              </motion.div>
            ))}

            <Button
              fullWidth
              variant="outline"
              size="lg"
              onClick={handleOpenAddPet}
              className="mt-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar otra mascota
            </Button>
          </motion.div>
        )}

        {/* Add Pet Form */}
        <AnimatePresence>
          {showAddPet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card variant="elevated" className="border-2 border-primary/20 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Nueva mascota</h3>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddPet(false);
                      setFormStep(1);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </IconButton>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(formStep / 3) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {/* Step 1: Basic Info */}
                  {formStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="space-y-5"
                    >
                      {/* Species */}
                      <div>
                        <label className="block mb-3 font-semibold text-sm">Tipo de mascota</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setNewPet({ ...newPet, species: 'dog', avatar: avatarOptions.dog[0] });
                            }}
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
                            onClick={() => {
                              setNewPet({ ...newPet, species: 'cat', avatar: avatarOptions.cat[0] });
                            }}
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

                      {/* Avatar */}
                      <div>
                        <label className="block mb-3 font-semibold text-sm">Elige un avatar</label>
                        <div className="flex gap-2 flex-wrap">
                          {avatarOptions[newPet.species as 'dog' | 'cat'].map((emoji) => (
                            <button
                              key={emoji}
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
                          <button
                            onClick={handleAvatarUpload}
                            className="w-16 h-16 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all flex items-center justify-center"
                          >
                            {isUploading ? (
                              <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            ) : (
                              <Camera className="w-6 h-6 text-muted-foreground" />
                            )}
                          </button>
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
                            <option key={breed} value={breed}>
                              {breed}
                            </option>
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
                          onChange={(e) =>
                            setNewPet({ ...newPet, age: parseInt(e.target.value) || 0 })
                          }
                        />
                        <Input
                          label="Peso (kg)"
                          type="number"
                          placeholder="28"
                          value={newPet.weight || ''}
                          onChange={(e) =>
                            setNewPet({ ...newPet, weight: parseInt(e.target.value) || 0 })
                          }
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

                <div className="flex gap-3 mt-6">
                  {formStep > 1 && (
                    <Button variant="ghost" onClick={() => setFormStep(formStep - 1)}>
                      Atrás
                    </Button>
                  )}
                  <Button
                    fullWidth
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
                    {formStep === 3 ? 'Guardar mascota' : 'Siguiente'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Actions */}
      {pets.length > 0 && !showAddPet && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-card/98 backdrop-blur-xl border-t-2 border-border/50 shadow-2xl z-40"
        >
          <div className="max-w-md mx-auto space-y-3">
            <Button fullWidth size="lg" onClick={() => onComplete(pets)}>
              Continuar con {pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            {onSkip && (
              <Button fullWidth variant="ghost" size="sm" onClick={onSkip}>
                Agregar mascotas después
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

import React, { useCallback } from 'react';
import { motion } from 'motion/react';
import { Check, PawPrint } from 'lucide-react';
import { Card } from '../Card';
import { Avatar } from '../Avatar';
import { getPetAvatarProps } from '@/lib/avatars';
import type { Pet } from '@/types';

interface PetSelectionPickerProps {
  pets: Pet[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export const PetSelectionPicker: React.FC<PetSelectionPickerProps> = ({
  pets,
  selectedIds,
  onChange,
}) => {
  const allSelected = pets.length > 0 && selectedIds.length === pets.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      onChange(pets.length > 0 ? [pets[0].id] : []);
    } else {
      onChange(pets.map((pet) => pet.id));
    }
  }, [allSelected, onChange, pets]);

  const togglePet = useCallback(
    (petId: string) => {
      if (selectedIds.includes(petId)) {
        if (selectedIds.length === 1) return;
        onChange(selectedIds.filter((id) => id !== petId));
      } else {
        onChange([...selectedIds, petId]);
      }
    },
    [onChange, selectedIds]
  );

  if (pets.length === 0) {
    return (
      <Card className="border-dashed border-warning/40 bg-warning/5">
        <p className="text-sm text-muted-foreground">
          Agrega una mascota en tu perfil para reservar un paseo.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {pets.length > 1 && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={toggleAll}
          className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
            allSelected
              ? 'border-primary bg-primary/10 shadow-md'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                allSelected ? 'bg-primary text-white' : 'bg-muted text-primary'
              }`}
            >
              <PawPrint className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Todas las mascotas</p>
              <p className="text-xs text-muted-foreground">
                {pets.length} mascotas · precio × {pets.length}
              </p>
            </div>
          </div>
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              allSelected ? 'border-primary bg-primary' : 'border-border'
            }`}
          >
            {allSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </motion.button>
      )}

      <div className="grid grid-cols-1 gap-2">
        {pets.map((pet, index) => {
          const isSelected = selectedIds.includes(pet.id);
          return (
            <motion.button
              key={pet.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => togglePet(pet.id)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <Avatar {...getPetAvatarProps(pet)} size="lg" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{pet.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {pet.breed} · {pet.age} {pet.age === 1 ? 'año' : 'años'}
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-primary bg-primary' : 'border-border'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedIds.length > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          {selectedIds.length} mascotas seleccionadas · el precio se multiplica por{' '}
          {selectedIds.length}
        </p>
      )}
    </div>
  );
};

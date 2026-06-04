import React from 'react';
import { PawPrint } from 'lucide-react';
import { Avatar } from '../../Avatar';
import { getPetAvatarProps } from '@/lib/avatars';
import { cn } from '../../../utils/cn';
import { PROFILE_CHIP_BASE, PROFILE_CHIP_DEFAULT, PROFILE_CHIP_SELECTED, PROFILE_FOCUS_RING } from './profileButtonStyles';
import type { Pet } from '@/types';

interface DesktopProfilePetPickerProps {
  pets: Pet[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export const DesktopProfilePetPicker: React.FC<DesktopProfilePetPickerProps> = ({
  pets,
  selectedIds,
  onChange,
}) => {
  if (pets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-warning/40 bg-warning/5 px-4 py-3 text-sm text-muted-foreground">
        Agrega una mascota en tu perfil para reservar.
      </div>
    );
  }

  const togglePet = (petId: string) => {
    if (selectedIds.includes(petId)) {
      if (selectedIds.length === 1) return;
      onChange(selectedIds.filter((id) => id !== petId));
      return;
    }
    onChange([...selectedIds, petId]);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar mascotas">
      {pets.map((pet) => {
        const isSelected = selectedIds.includes(pet.id);
        return (
          <button
            key={pet.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => togglePet(pet.id)}
            className={cn(
              PROFILE_CHIP_BASE,
              'inline-flex items-center gap-2 pr-3 pl-1.5',
              isSelected ? PROFILE_CHIP_SELECTED : PROFILE_CHIP_DEFAULT
            )}
          >
            <Avatar {...getPetAvatarProps(pet)} size="sm" />
            <span className="truncate max-w-[88px]">{pet.name}</span>
          </button>
        );
      })}
      {pets.length > 1 && (
        <button
          type="button"
          onClick={() => onChange(pets.map((pet) => pet.id))}
          className={cn(
            PROFILE_CHIP_BASE,
            'inline-flex items-center gap-1.5',
            selectedIds.length === pets.length ? PROFILE_CHIP_SELECTED : PROFILE_CHIP_DEFAULT
          )}
        >
          <PawPrint className="h-4 w-4" aria-hidden />
          Todas
        </button>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  LogOut,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { upsertProfile } from '@/features/profile';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import type { UserProfile } from '@/types';

interface ProfileScreenProps {
  onLogout: () => void;
}

const avatarOptions = ['👤', '👨🏻', '👩🏻', '👨🏽', '👩🏽', '👨🏼', '👩🏼', '👨🏿', '👩🏿'];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const { profile, userId, isLoading, setProfile, refreshUserData } = useUserData();

  const [form, setForm] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setForm(profile);
    } else if (user?.email) {
      setForm({
        avatar: '👤',
        fullName: user.user_metadata?.full_name ?? '',
        phone: '',
        email: user.email,
        neighborhood: '',
        emergencyContact: '',
        emergencyPhone: '',
        language: 'es',
        notifications: { push: true, email: true, sms: false },
      });
    }
  }, [profile, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setForm({
        ...form,
        avatarUrl: dataUrl,
        avatar: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form || !userId) return;

    setIsSaving(true);
    setStatus('idle');
    setErrorMessage('');

    const { error } = await upsertProfile(userId, form);

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
    } else {
      setProfile(form);
      setStatus('success');
      await refreshUserData();
      setTimeout(() => setStatus('idle'), 2500);
    }

    setIsSaving(false);
  };

  if (isLoading || !form) {
    return (
      <div className="h-full flex items-center justify-center pb-24">
        <Loader2 className="w-10 h-10 text-primary animate-spin" aria-label="Cargando perfil" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-background-secondary">
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border p-4 z-10">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Administra tu información personal</p>
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-success/10 text-success text-sm"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Cambios guardados correctamente
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {errorMessage || 'No se pudo guardar el perfil'}
            </motion.div>
          )}
        </AnimatePresence>

        <Card padding="lg">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar
                emoji={form.avatar.length <= 4 ? form.avatar : undefined}
                src={form.avatarUrl ?? (form.avatar.startsWith('data:') ? form.avatar : undefined)}
                size="2xl"
                className="rounded-2xl"
              />
              <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                <Camera className="w-5 h-5 text-primary-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Toca el ícono para cambiar foto</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {avatarOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm({ ...form, avatar: emoji, avatarUrl: null })}
                className={`w-10 h-10 rounded-xl text-xl transition-all ${
                  form.avatar === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Input
              label="Nombre completo"
              icon={<User className="w-5 h-5" />}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <Input
              label="Correo"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Teléfono"
              icon={<Phone className="w-5 h-5" />}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Barrio"
              icon={<MapPin className="w-5 h-5" />}
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            />
            <Input
              label="Contacto de emergencia"
              icon={<Users className="w-5 h-5" />}
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
            />
            <Input
              label="Teléfono de emergencia"
              icon={<Phone className="w-5 h-5" />}
              value={form.emergencyPhone}
              onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
            />
          </div>
        </Card>

        <Button fullWidth size="lg" loading={isSaving} onClick={handleSave}>
          Guardar cambios
        </Button>

        <Button
          fullWidth
          size="lg"
          variant="outline"
          onClick={onLogout}
          className="text-destructive border-destructive/30 hover:bg-destructive/5"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

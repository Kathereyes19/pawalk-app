import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
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
  Pencil,
  PawPrint,
  Shield,
  Bell,
  Globe,
  Sun,
  Moon,
  Accessibility,
  Type,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { upsertProfile } from '@/features/profile';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { ProfileInfoRow } from '../components/profile/ProfileInfoRow';
import { ProfileSectionCard } from '../components/profile/ProfileSectionCard';
import { PaymentMethodsSection } from '../components/payments/PaymentMethodsSection';
import type { UserProfile } from '@/types';

interface ProfileScreenProps {
  onLogout: () => void;
  onNavigateToPets?: () => void;
}

type ProfileMode = 'view' | 'edit';
type SaveStatus = 'idle' | 'success' | 'error';

const avatarOptions = ['👤', '👨🏻', '👩🏻', '👨🏽', '👩🏽', '👨🏼', '👩🏼', '👨🏿', '👩🏿'];

const ACCESSIBILITY_KEY = 'pawalk_accessibility_prefs';

interface AccessibilityPrefs {
  largeText: boolean;
  reduceMotion: boolean;
}

function loadAccessibilityPrefs(): AccessibilityPrefs {
  try {
    return JSON.parse(localStorage.getItem(ACCESSIBILITY_KEY) ?? '{}') as AccessibilityPrefs;
  } catch {
    return { largeText: false, reduceMotion: false };
  }
}

function saveAccessibilityPrefs(prefs: AccessibilityPrefs): void {
  localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(prefs));
}

function buildDefaultProfile(email: string, fullName = ''): UserProfile {
  return {
    avatar: '👤',
    fullName,
    phone: '',
    email,
    neighborhood: '',
    emergencyContact: '',
    emergencyPhone: '',
    language: 'es',
    notifications: { push: true, email: true, sms: false },
  };
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onNavigateToPets,
}) => {
  const { user } = useAuth();
  const { profile, pets, userId, isLoading, setProfile, refreshUserData } = useUserData();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [mode, setMode] = useState<ProfileMode>('view');
  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [accessibility, setAccessibility] = useState<AccessibilityPrefs>(loadAccessibilityPrefs);

  const displayProfile = profile ?? draft;

  useEffect(() => {
    if (profile) return;
    if (user?.email) {
      setDraft(
        buildDefaultProfile(user.email, (user.user_metadata?.full_name as string | undefined) ?? '')
      );
    }
  }, [profile, user]);

  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      setLanguage(profile.language);
    }
  }, [profile?.language, language, setLanguage]);

  useEffect(() => {
    document.documentElement.classList.toggle('pawalk-large-text', accessibility.largeText);
    document.documentElement.classList.toggle('pawalk-reduce-motion', accessibility.reduceMotion);
  }, [accessibility]);

  const avatarSrc = useMemo(() => {
    if (!displayProfile) return undefined;
    return (
      displayProfile.avatarUrl ??
      (displayProfile.avatar.startsWith('data:') ? displayProfile.avatar : undefined)
    );
  }, [displayProfile]);

  const avatarEmoji =
    displayProfile && displayProfile.avatar.length <= 4 ? displayProfile.avatar : undefined;

  const startEditing = () => {
    if (!displayProfile) return;
    setDraft({ ...displayProfile });
    setStatus('idle');
    setErrorMessage('');
    setMode('edit');
  };

  const cancelEditing = () => {
    setDraft(profile);
    setStatus('idle');
    setErrorMessage('');
    setMode('view');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setDraft({
        ...draft,
        avatarUrl: dataUrl,
        avatar: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!draft || !userId) return;

    setIsSaving(true);
    setStatus('idle');
    setErrorMessage('');

    const { error } = await upsertProfile(userId, draft);

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    setProfile(draft);
    setLanguage(draft.language);
    await refreshUserData();
    setStatus('success');
    setMode('view');
    setIsSaving(false);
    setTimeout(() => setStatus('idle'), 2500);
  };

  const toggleAccessibility = (key: keyof AccessibilityPrefs) => {
    setAccessibility((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveAccessibilityPrefs(next);
      return next;
    });
  };

  if (isLoading || !displayProfile) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 pb-24">
        <Loader2 className="w-10 h-10 text-primary animate-spin" aria-label={t('profile.loading')} />
        <p className="text-sm text-muted-foreground">{t('profile.loading')}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-background-secondary">
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-4 z-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'view' ? t('profile.subtitle.view') : t('profile.subtitle.edit')}
            </p>
          </div>
          {mode === 'view' ? (
            <Button size="sm" variant="outline" onClick={startEditing}>
              <Pencil className="w-4 h-4" />
              {t('profile.edit')}
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={cancelEditing} disabled={isSaving}>
              {t('cancel')}
            </Button>
          )}
        </div>
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
              {t('profile.save.success')}
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
              {errorMessage || t('profile.save.error')}
            </motion.div>
          )}
        </AnimatePresence>

        {mode === 'view' ? (
          <>
            <Card padding="lg" variant="elevated">
              <div className="flex flex-col items-center text-center">
                <Avatar
                  emoji={avatarEmoji}
                  src={avatarSrc}
                  size="2xl"
                  className="rounded-2xl mb-4"
                />
                <h2 className="text-xl font-bold">{displayProfile.fullName || t('profile.notSet')}</h2>
                <p className="text-sm text-muted-foreground mt-1">{displayProfile.email}</p>
                {displayProfile.phone && (
                  <p className="text-sm text-muted-foreground mt-0.5">{displayProfile.phone}</p>
                )}
              </div>
            </Card>

            <ProfileSectionCard title={t('profile.section.contact')}>
              <ProfileInfoRow
                icon={<User className="w-5 h-5" />}
                label={t('profile.field.name')}
                value={displayProfile.fullName}
                placeholder={t('profile.notSet')}
              />
              <ProfileInfoRow
                icon={<Mail className="w-5 h-5" />}
                label={t('profile.field.email')}
                value={displayProfile.email}
              />
              <ProfileInfoRow
                icon={<Phone className="w-5 h-5" />}
                label={t('profile.field.phone')}
                value={displayProfile.phone}
                placeholder={t('profile.notSet')}
              />
              <ProfileInfoRow
                icon={<MapPin className="w-5 h-5" />}
                label={t('profile.field.neighborhood')}
                value={displayProfile.neighborhood}
                placeholder={t('profile.notSet')}
              />
              <ProfileInfoRow
                icon={<Users className="w-5 h-5" />}
                label={t('profile.field.emergency')}
                value={
                  displayProfile.emergencyContact
                    ? `${displayProfile.emergencyContact}${displayProfile.emergencyPhone ? ` · ${displayProfile.emergencyPhone}` : ''}`
                    : undefined
                }
                placeholder={t('profile.notSet')}
              />
            </ProfileSectionCard>

            <ProfileSectionCard
              title={t('profile.section.pets')}
              description={t('profile.section.pets.desc')}
              action={
                onNavigateToPets ? (
                  <button
                    type="button"
                    onClick={onNavigateToPets}
                    className="text-sm font-medium text-primary flex items-center gap-1"
                  >
                    {t('profile.pets.viewAll')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : undefined
              }
            >
              {pets.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-3 flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{t('profile.pets.empty')}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {pets.slice(0, 3).map((pet) => (
                    <ProfileInfoRow
                      key={pet.id}
                      icon={<span className="text-lg">{pet.avatar || '🐾'}</span>}
                      label={pet.species === 'cat' ? t('pet.cat') : t('pet.dog')}
                      value={`${pet.name} · ${pet.breed}`}
                      onClick={onNavigateToPets}
                    />
                  ))}
                  {pets.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      {t('profile.pets.more').replace('{count}', String(pets.length - 3))}
                    </p>
                  )}
                </div>
              )}
            </ProfileSectionCard>

            <PaymentMethodsSection />

            <ProfileSectionCard title={t('profile.section.account')}>
              <ProfileInfoRow
                icon={<Shield className="w-5 h-5" />}
                label={t('profile.account.security')}
                value={t('profile.account.security.desc')}
              />
              <ProfileInfoRow
                icon={<Sparkles className="w-5 h-5" />}
                label={t('profile.account.member')}
                value={t('profile.account.member.desc')}
              />
            </ProfileSectionCard>

            <ProfileSectionCard title={t('profile.section.preferences')}>
              <ProfileInfoRow
                icon={<Globe className="w-5 h-5" />}
                label={t('language')}
                value={displayProfile.language === 'en' ? 'English' : 'Español'}
              />
              <ProfileInfoRow
                icon={theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                label={t('theme')}
                value={theme === 'dark' ? t('dark') : t('light')}
              />
              <ProfileInfoRow
                icon={<Bell className="w-5 h-5" />}
                label={t('profile.prefs.notifications')}
                value={[
                  displayProfile.notifications.push && t('profile.prefs.push'),
                  displayProfile.notifications.email && t('profile.prefs.email'),
                  displayProfile.notifications.sms && t('profile.prefs.sms'),
                ]
                  .filter(Boolean)
                  .join(' · ') || t('profile.prefs.none')}
              />
            </ProfileSectionCard>

            <ProfileSectionCard title={t('profile.section.accessibility')}>
              <button
                type="button"
                onClick={() => toggleAccessibility('largeText')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Type className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{t('profile.a11y.largeText')}</p>
                  <p className="text-xs text-muted-foreground">{t('profile.a11y.largeText.desc')}</p>
                </div>
                <div
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    accessibility.largeText ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{ x: accessibility.largeText ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>
              <button
                type="button"
                onClick={() => toggleAccessibility('reduceMotion')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Accessibility className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{t('profile.a11y.reduceMotion')}</p>
                  <p className="text-xs text-muted-foreground">{t('profile.a11y.reduceMotion.desc')}</p>
                </div>
                <div
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    accessibility.reduceMotion ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{ x: accessibility.reduceMotion ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>
            </ProfileSectionCard>

            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={onLogout}
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              <LogOut className="w-5 h-5" />
              {t('profile.logout')}
            </Button>
          </>
        ) : (
          <>
            <Card padding="lg">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <Avatar
                    emoji={draft && draft.avatar.length <= 4 ? draft.avatar : undefined}
                    src={
                      draft?.avatarUrl ??
                      (draft?.avatar.startsWith('data:') ? draft.avatar : undefined)
                    }
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
                <p className="text-xs text-muted-foreground mt-3">{t('profile.edit.photo')}</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => draft && setDraft({ ...draft, avatar: emoji, avatarUrl: null })}
                    className={`w-10 h-10 rounded-xl text-xl transition-all ${
                      draft?.avatar === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <Input
                  label={t('profile.field.name')}
                  icon={<User className="w-5 h-5" />}
                  value={draft?.fullName ?? ''}
                  onChange={(e) => draft && setDraft({ ...draft, fullName: e.target.value })}
                />
                <Input
                  label={t('profile.field.email')}
                  type="email"
                  icon={<Mail className="w-5 h-5" />}
                  value={draft?.email ?? ''}
                  onChange={(e) => draft && setDraft({ ...draft, email: e.target.value })}
                />
                <Input
                  label={t('profile.field.phone')}
                  icon={<Phone className="w-5 h-5" />}
                  value={draft?.phone ?? ''}
                  onChange={(e) => draft && setDraft({ ...draft, phone: e.target.value })}
                />
                <Input
                  label={t('profile.field.neighborhood')}
                  icon={<MapPin className="w-5 h-5" />}
                  value={draft?.neighborhood ?? ''}
                  onChange={(e) => draft && setDraft({ ...draft, neighborhood: e.target.value })}
                />
                <Input
                  label={t('profile.field.emergency')}
                  icon={<Users className="w-5 h-5" />}
                  value={draft?.emergencyContact ?? ''}
                  onChange={(e) =>
                    draft && setDraft({ ...draft, emergencyContact: e.target.value })
                  }
                />
                <Input
                  label={t('profile.field.emergencyPhone')}
                  icon={<Phone className="w-5 h-5" />}
                  value={draft?.emergencyPhone ?? ''}
                  onChange={(e) =>
                    draft && setDraft({ ...draft, emergencyPhone: e.target.value })
                  }
                />
              </div>
            </Card>

            <ProfileSectionCard title={t('profile.section.preferences')}>
              <label className="block px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                {t('language')}
              </label>
              <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                {[
                  { value: 'es' as const, label: 'Español', flag: '🇪🇸' },
                  { value: 'en' as const, label: 'English', flag: '🇺🇸' },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => draft && setDraft({ ...draft, language: lang.value })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      draft?.language === lang.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.label}</span>
                  </button>
                ))}
              </div>

              <label className="block px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                {t('theme')}
              </label>
              <div className="grid grid-cols-2 gap-2 px-2 pb-2">
                {[
                  { value: 'light', label: t('light'), icon: Sun },
                  { value: 'dark', label: t('dark'), icon: Moon },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTheme(item.value)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      theme === item.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="px-2 pb-2 space-y-1">
                {[
                  { key: 'push' as const, label: t('profile.prefs.push'), desc: t('profile.prefs.push.desc') },
                  { key: 'email' as const, label: t('profile.prefs.email'), desc: t('profile.prefs.email.desc') },
                  { key: 'sms' as const, label: t('profile.prefs.sms'), desc: t('profile.prefs.sms.desc') },
                ].map((notif) => (
                  <button
                    key={notif.key}
                    type="button"
                    onClick={() =>
                      draft &&
                      setDraft({
                        ...draft,
                        notifications: {
                          ...draft.notifications,
                          [notif.key]: !draft.notifications[notif.key],
                        },
                      })
                    }
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="text-left flex-1 pr-3">
                      <p className="font-medium text-sm">{notif.label}</p>
                      <p className="text-xs text-muted-foreground">{notif.desc}</p>
                    </div>
                    <div
                      className={`w-12 h-6 rounded-full transition-all shrink-0 ${
                        draft?.notifications[notif.key] ? 'bg-primary' : 'bg-border'
                      } relative`}
                    >
                      <motion.div
                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{ x: draft?.notifications[notif.key] ? 26 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </ProfileSectionCard>

            <div className="flex gap-3 pt-1">
              <Button
                fullWidth
                size="lg"
                variant="outline"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                {t('cancel')}
              </Button>
              <Button fullWidth size="lg" loading={isSaving} onClick={handleSave}>
                {t('save')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

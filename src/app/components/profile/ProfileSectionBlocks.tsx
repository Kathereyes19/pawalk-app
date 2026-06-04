import React from 'react';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  LogOut,
  Camera,
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
import { Button } from '../Button';
import { Input } from '../Input';
import { Card } from '../Card';
import { Avatar } from '../Avatar';
import { ProfileInfoRow } from './ProfileInfoRow';
import { ProfileSectionCard } from './ProfileSectionCard';
import { getPetAvatarProps } from '@/lib/avatars';
import type { Pet, UserProfile } from '@/types';

export const avatarOptions = ['👤', '👨🏻', '👩🏻', '👨🏽', '👩🏽', '👨🏼', '👩🏼', '👨🏿', '👩🏿'];

interface ProfileHeroProps {
  avatarProps: React.ComponentProps<typeof Avatar>;
  fullName: string;
  email: string;
  phone?: string;
  notSetLabel: string;
  layout?: 'centered' | 'horizontal';
}

export const ProfileHeroCard: React.FC<ProfileHeroProps> = ({
  avatarProps,
  fullName,
  email,
  phone,
  notSetLabel,
  layout = 'centered',
}) => {
  if (layout === 'horizontal') {
    return (
      <Card padding="lg" variant="elevated">
        <div className="flex items-center gap-5">
          <Avatar {...avatarProps} size="2xl" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold truncate">{fullName || notSetLabel}</h2>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{email}</p>
            {phone ? (
              <p className="text-sm text-muted-foreground mt-0.5">{phone}</p>
            ) : null}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" variant="elevated">
      <div className="flex flex-col items-center text-center">
        <Avatar {...avatarProps} size="2xl" className="mb-4" />
        <h2 className="text-xl font-bold">{fullName || notSetLabel}</h2>
        <p className="text-sm text-muted-foreground mt-1">{email}</p>
        {phone ? <p className="text-sm text-muted-foreground mt-0.5">{phone}</p> : null}
      </div>
    </Card>
  );
};

interface ProfileContactSectionProps {
  profile: UserProfile;
  title: string;
  labels: {
    name: string;
    email: string;
    phone: string;
    neighborhood: string;
    emergency: string;
    notSet: string;
  };
}

export const ProfileContactSection: React.FC<ProfileContactSectionProps> = ({
  profile,
  title,
  labels,
}) => (
  <ProfileSectionCard title={title}>
    <ProfileInfoRow
      icon={<User className="w-5 h-5" />}
      label={labels.name}
      value={profile.fullName}
      placeholder={labels.notSet}
    />
    <ProfileInfoRow
      icon={<Mail className="w-5 h-5" />}
      label={labels.email}
      value={profile.email}
    />
    <ProfileInfoRow
      icon={<Phone className="w-5 h-5" />}
      label={labels.phone}
      value={profile.phone}
      placeholder={labels.notSet}
    />
    <ProfileInfoRow
      icon={<MapPin className="w-5 h-5" />}
      label={labels.neighborhood}
      value={profile.neighborhood}
      placeholder={labels.notSet}
    />
    <ProfileInfoRow
      icon={<Users className="w-5 h-5" />}
      label={labels.emergency}
      value={
        profile.emergencyContact
          ? `${profile.emergencyContact}${profile.emergencyPhone ? ` · ${profile.emergencyPhone}` : ''}`
          : undefined
      }
      placeholder={labels.notSet}
    />
  </ProfileSectionCard>
);

interface ProfilePetsSectionProps {
  pets: Pet[];
  title: string;
  description: string;
  emptyLabel: string;
  viewAllLabel: string;
  moreLabel: string;
  catLabel: string;
  dogLabel: string;
  onNavigateToPets?: () => void;
}

export const ProfilePetsSection: React.FC<ProfilePetsSectionProps> = ({
  pets,
  title,
  description,
  emptyLabel,
  viewAllLabel,
  moreLabel,
  catLabel,
  dogLabel,
  onNavigateToPets,
}) => (
  <ProfileSectionCard
    title={title}
    description={description}
    action={
      onNavigateToPets ? (
        <button
          type="button"
          onClick={onNavigateToPets}
          className="text-sm font-medium text-primary flex items-center gap-1"
        >
          {viewAllLabel}
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
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    ) : (
      <div className="space-y-1">
        {pets.slice(0, 3).map((pet) => (
          <ProfileInfoRow
            key={pet.id}
            bareIcon
            icon={
              <Avatar
                {...getPetAvatarProps({
                  avatar: pet.avatar,
                  species: pet.species,
                  name: pet.name,
                  id: pet.id,
                })}
                size="sm"
              />
            }
            label={pet.species === 'cat' ? catLabel : dogLabel}
            value={`${pet.name} · ${pet.breed}`}
            onClick={onNavigateToPets}
          />
        ))}
        {pets.length > 3 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            {moreLabel.replace('{count}', String(pets.length - 3))}
          </p>
        )}
      </div>
    )}
  </ProfileSectionCard>
);

interface ProfileAccountMetaSectionProps {
  title: string;
  securityLabel: string;
  securityDesc: string;
  memberLabel: string;
  memberDesc: string;
  showAdminEntry?: boolean;
  onOpenAdmin?: () => void;
}

export const ProfileAccountMetaSection: React.FC<ProfileAccountMetaSectionProps> = ({
  title,
  securityLabel,
  securityDesc,
  memberLabel,
  memberDesc,
  showAdminEntry,
  onOpenAdmin,
}) => (
  <ProfileSectionCard title={title}>
    {showAdminEntry && onOpenAdmin && (
      <button
        type="button"
        onClick={onOpenAdmin}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors mb-1"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">Panel de administración</p>
          <p className="text-xs text-muted-foreground">Dashboard, usuarios y analíticas</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    )}
    <ProfileInfoRow
      icon={<Shield className="w-5 h-5" />}
      label={securityLabel}
      value={securityDesc}
    />
    <ProfileInfoRow
      icon={<Sparkles className="w-5 h-5" />}
      label={memberLabel}
      value={memberDesc}
    />
  </ProfileSectionCard>
);

interface ProfilePreferencesViewProps {
  title: string;
  profile: UserProfile;
  theme: string | undefined;
  labels: {
    language: string;
    theme: string;
    dark: string;
    light: string;
    notifications: string;
    push: string;
    email: string;
    sms: string;
    none: string;
  };
}

export const ProfilePreferencesRows: React.FC<Omit<ProfilePreferencesViewProps, 'title'>> = ({
  profile,
  theme,
  labels,
}) => (
  <>
    <ProfileInfoRow
      icon={<Globe className="w-5 h-5" />}
      label={labels.language}
      value={profile.language === 'en' ? 'English' : 'Español'}
    />
    <ProfileInfoRow
      icon={theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      label={labels.theme}
      value={theme === 'dark' ? labels.dark : labels.light}
    />
    <ProfileInfoRow
      icon={<Bell className="w-5 h-5" />}
      label={labels.notifications}
      value={
        [
          profile.notifications.push && labels.push,
          profile.notifications.email && labels.email,
          profile.notifications.sms && labels.sms,
        ]
          .filter(Boolean)
          .join(' · ') || labels.none
      }
    />
  </>
);

export const ProfilePreferencesViewSection: React.FC<ProfilePreferencesViewProps> = (props) => (
  <ProfileSectionCard title={props.title}>
    <ProfilePreferencesRows profile={props.profile} theme={props.theme} labels={props.labels} />
  </ProfileSectionCard>
);

export interface AccessibilityPrefs {
  largeText: boolean;
  reduceMotion: boolean;
}

interface ProfileAccessibilitySectionProps {
  title: string;
  accessibility: AccessibilityPrefs;
  labels: {
    largeText: string;
    largeTextDesc: string;
    reduceMotion: string;
    reduceMotionDesc: string;
  };
  onToggle: (key: keyof AccessibilityPrefs) => void;
  embedded?: boolean;
}

export const ProfileAccessibilitySection: React.FC<ProfileAccessibilitySectionProps> = ({
  title,
  accessibility,
  labels,
  onToggle,
  embedded = false,
}) => {
  const toggles = (
    <>
      <button
        type="button"
        onClick={() => onToggle('largeText')}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Type className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">{labels.largeText}</p>
          <p className="text-xs text-muted-foreground">{labels.largeTextDesc}</p>
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
        onClick={() => onToggle('reduceMotion')}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Accessibility className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">{labels.reduceMotion}</p>
          <p className="text-xs text-muted-foreground">{labels.reduceMotionDesc}</p>
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
    </>
  );

  if (embedded) {
    return (
      <div className="border-t border-border mt-1 pt-1">
        <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        {toggles}
      </div>
    );
  }

  return <ProfileSectionCard title={title}>{toggles}</ProfileSectionCard>;
};

interface ProfileLogoutButtonProps {
  label: string;
  onLogout: () => void;
  className?: string;
}

export const ProfileLogoutButton: React.FC<ProfileLogoutButtonProps> = ({
  label,
  onLogout,
  className,
}) => (
  <Button
    fullWidth
    size="lg"
    variant="outline"
    onClick={onLogout}
    className={className ?? 'text-destructive border-destructive/30 hover:bg-destructive/5'}
  >
    <LogOut className="w-5 h-5" />
    {label}
  </Button>
);

interface ProfileEditAvatarCardProps {
  avatarProps: React.ComponentProps<typeof Avatar>;
  draft: UserProfile;
  photoHint: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmojiSelect: (emoji: string) => void;
  children: React.ReactNode;
}

export const ProfileEditAvatarCard: React.FC<ProfileEditAvatarCardProps> = ({
  avatarProps,
  draft,
  photoHint,
  onImageChange,
  onEmojiSelect,
  children,
}) => (
  <Card padding="lg">
    <div className="flex flex-col items-center mb-6">
      <div className="relative">
        <Avatar {...avatarProps} size="2xl" />
        <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg">
          <Camera className="w-5 h-5 text-primary-foreground" />
          <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground mt-3">{photoHint}</p>
    </div>

    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {avatarOptions.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onEmojiSelect(emoji)}
          className={`w-10 h-10 rounded-xl text-xl transition-all ${
            draft.avatar === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>

    {children}
  </Card>
);

interface ProfileEditFormFieldsProps {
  draft: UserProfile;
  labels: {
    name: string;
    email: string;
    phone: string;
    neighborhood: string;
    emergency: string;
    emergencyPhone: string;
  };
  onChange: (patch: Partial<UserProfile>) => void;
}

export const ProfileEditFormFields: React.FC<ProfileEditFormFieldsProps> = ({
  draft,
  labels,
  onChange,
}) => (
  <div className="space-y-4">
    <Input
      label={labels.name}
      icon={<User className="w-5 h-5" />}
      value={draft.fullName}
      onChange={(e) => onChange({ fullName: e.target.value })}
    />
    <Input
      label={labels.email}
      type="email"
      icon={<Mail className="w-5 h-5" />}
      value={draft.email}
      onChange={(e) => onChange({ email: e.target.value })}
    />
    <Input
      label={labels.phone}
      icon={<Phone className="w-5 h-5" />}
      value={draft.phone}
      onChange={(e) => onChange({ phone: e.target.value })}
    />
    <Input
      label={labels.neighborhood}
      icon={<MapPin className="w-5 h-5" />}
      value={draft.neighborhood}
      onChange={(e) => onChange({ neighborhood: e.target.value })}
    />
    <Input
      label={labels.emergency}
      icon={<Users className="w-5 h-5" />}
      value={draft.emergencyContact}
      onChange={(e) => onChange({ emergencyContact: e.target.value })}
    />
    <Input
      label={labels.emergencyPhone}
      icon={<Phone className="w-5 h-5" />}
      value={draft.emergencyPhone}
      onChange={(e) => onChange({ emergencyPhone: e.target.value })}
    />
  </div>
);

interface ProfileEditPreferencesSectionProps {
  title: string;
  draft: UserProfile;
  theme: string | undefined;
  labels: {
    language: string;
    theme: string;
    light: string;
    dark: string;
    push: string;
    pushDesc: string;
    email: string;
    emailDesc: string;
    sms: string;
    smsDesc: string;
  };
  onDraftChange: (patch: Partial<UserProfile>) => void;
  onNotificationToggle: (key: 'push' | 'email' | 'sms') => void;
  onThemeChange: (theme: string) => void;
}

export const ProfileEditPreferencesSection: React.FC<ProfileEditPreferencesSectionProps> = ({
  title,
  draft,
  theme,
  labels,
  onDraftChange,
  onNotificationToggle,
  onThemeChange,
}) => (
  <ProfileSectionCard title={title}>
    <label className="block px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">
      {labels.language}
    </label>
    <div className="grid grid-cols-2 gap-2 px-2 pb-2">
      {[
        { value: 'es' as const, label: 'Español', flag: '🇪🇸' },
        { value: 'en' as const, label: 'English', flag: '🇺🇸' },
      ].map((lang) => (
        <button
          key={lang.value}
          type="button"
          onClick={() => onDraftChange({ language: lang.value })}
          className={`p-3 rounded-xl border-2 transition-all ${
            draft.language === lang.value
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
      {labels.theme}
    </label>
    <div className="grid grid-cols-2 gap-2 px-2 pb-2">
      {[
        { value: 'light', label: labels.light, icon: Sun },
        { value: 'dark', label: labels.dark, icon: Moon },
      ].map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onThemeChange(item.value)}
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
        { key: 'push' as const, label: labels.push, desc: labels.pushDesc },
        { key: 'email' as const, label: labels.email, desc: labels.emailDesc },
        { key: 'sms' as const, label: labels.sms, desc: labels.smsDesc },
      ].map((notif) => (
        <button
          key={notif.key}
          type="button"
          onClick={() => onNotificationToggle(notif.key)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition-all"
        >
          <div className="text-left flex-1 pr-3">
            <p className="font-medium text-sm">{notif.label}</p>
            <p className="text-xs text-muted-foreground">{notif.desc}</p>
          </div>
          <div
            className={`w-12 h-6 rounded-full transition-all shrink-0 ${
              draft.notifications[notif.key] ? 'bg-primary' : 'bg-border'
            } relative`}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: draft.notifications[notif.key] ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      ))}
    </div>
  </ProfileSectionCard>
);

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
import { Button } from '../Button';
import { PaymentMethodsSection } from '../payments/PaymentMethodsSection';
import { RemindersSection } from '../reminders/RemindersSection';
import { ProfileSectionCard } from './ProfileSectionCard';
import {
  ProfileHeroCard,
  ProfileContactSection,
  ProfilePetsSection,
  ProfileAccountMetaSection,
  ProfilePreferencesRows,
  ProfileAccessibilitySection,
  ProfileLogoutButton,
  ProfileEditAvatarCard,
  ProfileEditFormFields,
  ProfileEditPreferencesSection,
  type AccessibilityPrefs,
} from './ProfileSectionBlocks';
import type { Pet, UserProfile } from '@/types';

type ProfileMode = 'view' | 'edit';
type SaveStatus = 'idle' | 'success' | 'error';

interface ProfileDesktopDashboardProps {
  mode: ProfileMode;
  displayProfile: UserProfile;
  draft: UserProfile | null;
  pets: Pet[];
  theme: string | undefined;
  accessibility: AccessibilityPrefs;
  status: SaveStatus;
  errorMessage: string;
  isSaving: boolean;
  userAvatarProps: React.ComponentProps<typeof import('../Avatar').Avatar>;
  draftAvatarProps: React.ComponentProps<typeof import('../Avatar').Avatar>;
  showAdminEntry?: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onLogout: () => void;
  onNavigateToPets?: () => void;
  onOpenReminders?: () => void;
  onOpenAdmin?: () => void;
  onToggleAccessibility: (key: keyof AccessibilityPrefs) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDraftChange: (patch: Partial<UserProfile>) => void;
  onEmojiSelect: (emoji: string) => void;
  onNotificationToggle: (key: 'push' | 'email' | 'sms') => void;
  onThemeChange: (theme: string) => void;
  copy: {
    title: string;
    subtitleView: string;
    subtitleEdit: string;
    edit: string;
    cancel: string;
    save: string;
    saveSuccess: string;
    saveError: string;
    notSet: string;
    logout: string;
    photoHint: string;
    section: {
      contact: string;
      account: string;
      pets: string;
      petsDesc: string;
      preferences: string;
      accessibility: string;
    };
    field: {
      name: string;
      email: string;
      phone: string;
      neighborhood: string;
      emergency: string;
      emergencyPhone: string;
    };
    pets: {
      viewAll: string;
      empty: string;
      more: string;
    };
    pet: { cat: string; dog: string };
    account: {
      security: string;
      securityDesc: string;
      member: string;
      memberDesc: string;
    };
    prefs: {
      notifications: string;
      push: string;
      email: string;
      sms: string;
      none: string;
      pushDesc: string;
      emailDesc: string;
      smsDesc: string;
    };
    a11y: {
      largeText: string;
      largeTextDesc: string;
      reduceMotion: string;
      reduceMotionDesc: string;
    };
    language: string;
    theme: string;
    light: string;
    dark: string;
  };
}

export const ProfileDesktopDashboard: React.FC<ProfileDesktopDashboardProps> = ({
  mode,
  displayProfile,
  draft,
  pets,
  theme,
  accessibility,
  status,
  errorMessage,
  isSaving,
  userAvatarProps,
  draftAvatarProps,
  showAdminEntry,
  onStartEditing,
  onCancelEditing,
  onSave,
  onLogout,
  onNavigateToPets,
  onOpenReminders,
  onOpenAdmin,
  onToggleAccessibility,
  onImageChange,
  onDraftChange,
  onEmojiSelect,
  onNotificationToggle,
  onThemeChange,
  copy,
}) => {
  const contactLabels = {
    name: copy.field.name,
    email: copy.field.email,
    phone: copy.field.phone,
    neighborhood: copy.field.neighborhood,
    emergency: copy.field.emergency,
    notSet: copy.notSet,
  };

  const statusBanners = (
    <AnimatePresence>
      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-success/10 text-success text-sm"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {copy.saveSuccess}
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
          {errorMessage || copy.saveError}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="hidden md:block h-full overflow-y-auto bg-background-secondary">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8 py-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mode === 'view' ? copy.subtitleView : copy.subtitleEdit}
            </p>
          </div>
          {mode === 'view' ? (
            <Button size="sm" variant="outline" onClick={onStartEditing}>
              <Pencil className="w-4 h-4" />
              {copy.edit}
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={onCancelEditing} disabled={isSaving}>
              {copy.cancel}
            </Button>
          )}
        </header>

        {status === 'success' || status === 'error' ? (
          <div className="mb-5">{statusBanners}</div>
        ) : null}

        {mode === 'view' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-start">
            <div className="space-y-5 min-w-0">
              <ProfileHeroCard
                layout="horizontal"
                avatarProps={userAvatarProps}
                fullName={displayProfile.fullName}
                email={displayProfile.email}
                phone={displayProfile.phone}
                notSetLabel={copy.notSet}
              />

              <ProfileContactSection
                profile={displayProfile}
                title={copy.section.contact}
                labels={contactLabels}
              />

              <ProfileAccountMetaSection
                title={copy.section.account}
                securityLabel={copy.account.security}
                securityDesc={copy.account.securityDesc}
                memberLabel={copy.account.member}
                memberDesc={copy.account.memberDesc}
                showAdminEntry={showAdminEntry}
                onOpenAdmin={onOpenAdmin}
              />

              <PaymentMethodsSection />

              <ProfileLogoutButton label={copy.logout} onLogout={onLogout} />
            </div>

            <div className="space-y-5 min-w-0">
              <ProfilePetsSection
                pets={pets}
                title={copy.section.pets}
                description={copy.section.petsDesc}
                emptyLabel={copy.pets.empty}
                viewAllLabel={copy.pets.viewAll}
                moreLabel={copy.pets.more}
                catLabel={copy.pet.cat}
                dogLabel={copy.pet.dog}
                onNavigateToPets={onNavigateToPets}
              />

              {onOpenReminders ? <RemindersSection onOpenReminders={onOpenReminders} /> : null}

              <ProfileSectionCard title={copy.section.preferences}>
                <ProfilePreferencesRows
                  profile={displayProfile}
                  theme={theme}
                  labels={{
                    language: copy.language,
                    theme: copy.theme,
                    dark: copy.dark,
                    light: copy.light,
                    notifications: copy.prefs.notifications,
                    push: copy.prefs.push,
                    email: copy.prefs.email,
                    sms: copy.prefs.sms,
                    none: copy.prefs.none,
                  }}
                />
                <ProfileAccessibilitySection
                  title={copy.section.accessibility}
                  accessibility={accessibility}
                  labels={{
                    largeText: copy.a11y.largeText,
                    largeTextDesc: copy.a11y.largeTextDesc,
                    reduceMotion: copy.a11y.reduceMotion,
                    reduceMotionDesc: copy.a11y.reduceMotionDesc,
                  }}
                  onToggle={onToggleAccessibility}
                  embedded
                />
              </ProfileSectionCard>
            </div>
          </div>
        ) : draft ? (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-start">
              <div className="space-y-5 min-w-0">
                <ProfileEditAvatarCard
                  avatarProps={draftAvatarProps}
                  draft={draft}
                  photoHint={copy.photoHint}
                  onImageChange={onImageChange}
                  onEmojiSelect={onEmojiSelect}
                >
                  <ProfileEditFormFields
                    draft={draft}
                    labels={{
                      name: copy.field.name,
                      email: copy.field.email,
                      phone: copy.field.phone,
                      neighborhood: copy.field.neighborhood,
                      emergency: copy.field.emergency,
                      emergencyPhone: copy.field.emergencyPhone,
                    }}
                    onChange={onDraftChange}
                  />
                </ProfileEditAvatarCard>
              </div>

              <div className="space-y-5 min-w-0">
                <ProfileEditPreferencesSection
                  title={copy.section.preferences}
                  draft={draft}
                  theme={theme}
                  labels={{
                    language: copy.language,
                    theme: copy.theme,
                    light: copy.light,
                    dark: copy.dark,
                    push: copy.prefs.push,
                    pushDesc: copy.prefs.pushDesc,
                    email: copy.prefs.email,
                    emailDesc: copy.prefs.emailDesc,
                    sms: copy.prefs.sms,
                    smsDesc: copy.prefs.smsDesc,
                  }}
                  onDraftChange={onDraftChange}
                  onNotificationToggle={onNotificationToggle}
                  onThemeChange={onThemeChange}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 max-w-md">
              <Button fullWidth size="lg" variant="outline" onClick={onCancelEditing} disabled={isSaving}>
                {copy.cancel}
              </Button>
              <Button fullWidth size="lg" loading={isSaving} onClick={onSave}>
                {copy.save}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

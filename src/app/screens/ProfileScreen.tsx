import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import { Pencil, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { upsertProfile } from '@/features/profile';
import { Button } from '../components/Button';
import { PaymentMethodsSection } from '../components/payments/PaymentMethodsSection';
import { RemindersSection } from '../components/reminders/RemindersSection';
import { ProfileDesktopDashboard } from '../components/profile/ProfileDesktopDashboard';
import {
  ProfileHeroCard,
  ProfileContactSection,
  ProfilePetsSection,
  ProfileAccountMetaSection,
  ProfilePreferencesViewSection,
  ProfileAccessibilitySection,
  ProfileLogoutButton,
  ProfileEditAvatarCard,
  ProfileEditFormFields,
  ProfileEditPreferencesSection,
  type AccessibilityPrefs,
} from '../components/profile/ProfileSectionBlocks';
import { getUserAvatarProps } from '@/lib/avatars';
import type { UserProfile } from '@/types';

interface ProfileScreenProps {
  onLogout: () => void;
  onNavigateToPets?: () => void;
  onOpenReminders?: () => void;
  onOpenAdmin?: () => void;
  showAdminEntry?: boolean;
}

type ProfileMode = 'view' | 'edit';
type SaveStatus = 'idle' | 'success' | 'error';

const ACCESSIBILITY_KEY = 'pawalk_accessibility_prefs';

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
  onOpenReminders,
  onOpenAdmin,
  showAdminEntry = false,
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

  const userAvatarProps = useMemo(() => {
    if (!displayProfile) return { emoji: '👤', alt: 'User', variant: 'user' as const };
    return getUserAvatarProps(
      {
        avatarUrl: displayProfile.avatarUrl,
        avatar: displayProfile.avatar,
        fullName: displayProfile.fullName,
      },
      userId ?? undefined
    );
  }, [displayProfile, userId]);

  const draftAvatarProps = useMemo(() => {
    if (!draft) return { emoji: '👤', alt: 'User', variant: 'user' as const };
    return getUserAvatarProps(
      {
        avatarUrl: draft.avatarUrl,
        avatar: draft.avatar,
        fullName: draft.fullName,
      },
      userId ?? undefined
    );
  }, [draft, userId]);

  const contactLabels = useMemo(
    () => ({
      name: t('profile.field.name'),
      email: t('profile.field.email'),
      phone: t('profile.field.phone'),
      neighborhood: t('profile.field.neighborhood'),
      emergency: t('profile.field.emergency'),
      notSet: t('profile.notSet'),
    }),
    [t]
  );

  const desktopCopy = useMemo(
    () => ({
      title: t('profile.title'),
      subtitleView: t('profile.subtitle.view'),
      subtitleEdit: t('profile.subtitle.edit'),
      edit: t('profile.edit'),
      cancel: t('cancel'),
      save: t('save'),
      saveSuccess: t('profile.save.success'),
      saveError: t('profile.save.error'),
      notSet: t('profile.notSet'),
      logout: t('profile.logout'),
      photoHint: t('profile.edit.photo'),
      section: {
        contact: t('profile.section.contact'),
        account: t('profile.section.account'),
        pets: t('profile.section.pets'),
        petsDesc: t('profile.section.pets.desc'),
        preferences: t('profile.section.preferences'),
        accessibility: t('profile.section.accessibility'),
      },
      field: {
        name: t('profile.field.name'),
        email: t('profile.field.email'),
        phone: t('profile.field.phone'),
        neighborhood: t('profile.field.neighborhood'),
        emergency: t('profile.field.emergency'),
        emergencyPhone: t('profile.field.emergencyPhone'),
      },
      pets: {
        viewAll: t('profile.pets.viewAll'),
        empty: t('profile.pets.empty'),
        more: t('profile.pets.more'),
      },
      pet: { cat: t('pet.cat'), dog: t('pet.dog') },
      account: {
        security: t('profile.account.security'),
        securityDesc: t('profile.account.security.desc'),
        member: t('profile.account.member'),
        memberDesc: t('profile.account.member.desc'),
      },
      prefs: {
        notifications: t('profile.prefs.notifications'),
        push: t('profile.prefs.push'),
        email: t('profile.prefs.email'),
        sms: t('profile.prefs.sms'),
        none: t('profile.prefs.none'),
        pushDesc: t('profile.prefs.push.desc'),
        emailDesc: t('profile.prefs.email.desc'),
        smsDesc: t('profile.prefs.sms.desc'),
      },
      a11y: {
        largeText: t('profile.a11y.largeText'),
        largeTextDesc: t('profile.a11y.largeText.desc'),
        reduceMotion: t('profile.a11y.reduceMotion'),
        reduceMotionDesc: t('profile.a11y.reduceMotion.desc'),
      },
      language: t('language'),
      theme: t('theme'),
      light: t('light'),
      dark: t('dark'),
    }),
    [t]
  );

  const a11yLabels = useMemo(
    () => ({
      largeText: t('profile.a11y.largeText'),
      largeTextDesc: t('profile.a11y.largeText.desc'),
      reduceMotion: t('profile.a11y.reduceMotion'),
      reduceMotionDesc: t('profile.a11y.reduceMotion.desc'),
    }),
    [t]
  );

  const prefsViewLabels = useMemo(
    () => ({
      language: t('language'),
      theme: t('theme'),
      dark: t('dark'),
      light: t('light'),
      notifications: t('profile.prefs.notifications'),
      push: t('profile.prefs.push'),
      email: t('profile.prefs.email'),
      sms: t('profile.prefs.sms'),
      none: t('profile.prefs.none'),
    }),
    [t]
  );

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
      <div className="h-full flex flex-col items-center justify-center gap-3 pb-24 md:pb-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" aria-label={t('profile.loading')} />
        <p className="text-sm text-muted-foreground">{t('profile.loading')}</p>
      </div>
    );
  }

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
  );

  return (
    <div className="h-full bg-background-secondary">
      {/* Mobile — unchanged stacked layout */}
      <div className="md:hidden h-full overflow-y-auto pb-24">
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
          {statusBanners}

          {mode === 'view' ? (
            <>
              <ProfileHeroCard
                avatarProps={userAvatarProps}
                fullName={displayProfile.fullName}
                email={displayProfile.email}
                phone={displayProfile.phone}
                notSetLabel={t('profile.notSet')}
              />

              <ProfileContactSection
                profile={displayProfile}
                title={t('profile.section.contact')}
                labels={contactLabels}
              />

              <ProfilePetsSection
                pets={pets}
                title={t('profile.section.pets')}
                description={t('profile.section.pets.desc')}
                emptyLabel={t('profile.pets.empty')}
                viewAllLabel={t('profile.pets.viewAll')}
                moreLabel={t('profile.pets.more')}
                catLabel={t('pet.cat')}
                dogLabel={t('pet.dog')}
                onNavigateToPets={onNavigateToPets}
              />

              <PaymentMethodsSection />

              {onOpenReminders ? <RemindersSection onOpenReminders={onOpenReminders} /> : null}

              <ProfileAccountMetaSection
                title={t('profile.section.account')}
                securityLabel={t('profile.account.security')}
                securityDesc={t('profile.account.security.desc')}
                memberLabel={t('profile.account.member')}
                memberDesc={t('profile.account.member.desc')}
                showAdminEntry={showAdminEntry}
                onOpenAdmin={onOpenAdmin}
              />

              <ProfilePreferencesViewSection
                title={t('profile.section.preferences')}
                profile={displayProfile}
                theme={theme}
                labels={prefsViewLabels}
              />

              <ProfileAccessibilitySection
                title={t('profile.section.accessibility')}
                accessibility={accessibility}
                labels={a11yLabels}
                onToggle={toggleAccessibility}
              />

              <ProfileLogoutButton label={t('profile.logout')} onLogout={onLogout} />
            </>
          ) : draft ? (
            <>
              <ProfileEditAvatarCard
                avatarProps={draftAvatarProps}
                draft={draft}
                photoHint={t('profile.edit.photo')}
                onImageChange={handleImageChange}
                onEmojiSelect={(emoji) =>
                  setDraft({ ...draft, avatar: emoji, avatarUrl: null })
                }
              >
                <ProfileEditFormFields
                  draft={draft}
                  labels={{
                    name: t('profile.field.name'),
                    email: t('profile.field.email'),
                    phone: t('profile.field.phone'),
                    neighborhood: t('profile.field.neighborhood'),
                    emergency: t('profile.field.emergency'),
                    emergencyPhone: t('profile.field.emergencyPhone'),
                  }}
                  onChange={(patch) => setDraft({ ...draft, ...patch })}
                />
              </ProfileEditAvatarCard>

              <ProfileEditPreferencesSection
                title={t('profile.section.preferences')}
                draft={draft}
                theme={theme}
                labels={{
                  language: t('language'),
                  theme: t('theme'),
                  light: t('light'),
                  dark: t('dark'),
                  push: t('profile.prefs.push'),
                  pushDesc: t('profile.prefs.push.desc'),
                  email: t('profile.prefs.email'),
                  emailDesc: t('profile.prefs.email.desc'),
                  sms: t('profile.prefs.sms'),
                  smsDesc: t('profile.prefs.sms.desc'),
                }}
                onDraftChange={(patch) => setDraft({ ...draft, ...patch })}
                onNotificationToggle={(key) =>
                  setDraft({
                    ...draft,
                    notifications: {
                      ...draft.notifications,
                      [key]: !draft.notifications[key],
                    },
                  })
                }
                onThemeChange={setTheme}
              />

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
          ) : null}
        </div>
      </div>

      {/* Desktop — two-column dashboard */}
      <ProfileDesktopDashboard
        mode={mode}
        displayProfile={displayProfile}
        draft={draft}
        pets={pets}
        theme={theme}
        accessibility={accessibility}
        status={status}
        errorMessage={errorMessage}
        isSaving={isSaving}
        userAvatarProps={userAvatarProps}
        draftAvatarProps={draftAvatarProps}
        showAdminEntry={showAdminEntry}
        onStartEditing={startEditing}
        onCancelEditing={cancelEditing}
        onSave={handleSave}
        onLogout={onLogout}
        onNavigateToPets={onNavigateToPets}
        onOpenReminders={onOpenReminders}
        onOpenAdmin={onOpenAdmin}
        onToggleAccessibility={toggleAccessibility}
        onImageChange={handleImageChange}
        onDraftChange={(patch) => draft && setDraft({ ...draft, ...patch })}
        onEmojiSelect={(emoji) =>
          draft && setDraft({ ...draft, avatar: emoji, avatarUrl: null })
        }
        onNotificationToggle={(key) =>
          draft &&
          setDraft({
            ...draft,
            notifications: {
              ...draft.notifications,
              [key]: !draft.notifications[key],
            },
          })
        }
        onThemeChange={setTheme}
        copy={desktopCopy}
      />
    </div>
  );
};

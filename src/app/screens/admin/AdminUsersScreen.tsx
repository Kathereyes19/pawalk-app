import React from 'react';
import { Mail, MapPin, Phone, Shield, User } from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { getUserAvatarProps } from '@/lib/avatars';

const MOCK_USERS = [
  {
    id: 'u1',
    fullName: 'Camila Restrepo',
    email: 'camila@email.com',
    neighborhood: 'Chapinero',
    role: 'user' as const,
  },
  {
    id: 'u2',
    fullName: 'Andrés Gómez',
    email: 'andres@email.com',
    neighborhood: 'Usaquén',
    role: 'user' as const,
  },
  {
    id: 'u3',
    fullName: 'Pawalk Admin',
    email: 'admin@pawalk.app',
    neighborhood: 'Centro',
    role: 'admin' as const,
  },
];

export const AdminUsersScreen: React.FC = () => {
  const { profile, userId } = useUserData();

  const users = profile
    ? [
        {
          id: userId ?? 'current',
          fullName: profile.fullName || 'Usuario actual',
          email: profile.email,
          neighborhood: profile.neighborhood || '—',
          role: profile.role ?? 'user',
        },
        ...MOCK_USERS.filter((user) => user.email !== profile.email),
      ]
    : MOCK_USERS;

  return (
    <div className="h-full overflow-y-auto bg-background-secondary">
      <div className="border-b border-border bg-background/95 backdrop-blur-lg px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin</p>
        <h1 className="text-2xl font-bold mt-1">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestión de cuentas y roles de la plataforma.
        </p>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-4">
        {users.map((user) => (
          <Card key={user.id} variant="elevated">
            <div className="flex items-start gap-4">
              <Avatar
                {...getUserAvatarProps(
                  { fullName: user.fullName, avatar: '👤' },
                  user.id
                )}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold">{user.fullName}</h2>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {user.neighborhood}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline shrink-0"
              >
                Ver detalle
              </button>
            </div>
          </Card>
        ))}

        <Card className="border-dashed text-center py-8">
          <Phone className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Próximamente: edición de roles, suspensión de cuentas y exportación.
          </p>
        </Card>
      </div>
    </div>
  );
};

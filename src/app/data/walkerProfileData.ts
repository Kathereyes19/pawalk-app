import type { WalkerReview } from '../components/walker/WalkerReviewsModal';

export const WALKER_RATING_BREAKDOWN = [
  { stars: 5, count: 142, percentage: 94 },
  { stars: 4, count: 8, percentage: 5 },
  { stars: 3, count: 1, percentage: 1 },
  { stars: 2, count: 0, percentage: 0 },
  { stars: 1, count: 0, percentage: 0 },
];

export const WALKER_REVIEWS: WalkerReview[] = [
  {
    id: '1',
    user: 'Ana López',
    avatar: '👩🏽',
    rating: 5,
    comment:
      'Excelente servicio. Mi perro quedó muy feliz. Carlos es muy profesional y siempre llega puntual. Me encanta que envía fotos durante el paseo y mi perro siempre regresa feliz y cansado. Lo recomiendo 100%.',
    date: '2 días atrás',
    verified: true,
    petName: 'Rocky',
  },
  {
    id: '2',
    user: 'Pedro Díaz',
    avatar: '👨🏻',
    rating: 5,
    comment: 'Muy profesional y confiable. Siempre cuida muy bien a mi mascota.',
    date: '1 semana atrás',
    verified: true,
    petName: 'Luna',
  },
  {
    id: '3',
    user: 'Sofia Vargas',
    avatar: '👩🏼',
    rating: 5,
    comment: 'Buen paseador, muy puntual. Mi perro lo adora!',
    date: '2 semanas atrás',
    verified: true,
    petName: 'Max',
  },
  {
    id: '4',
    user: 'Miguel Torres',
    avatar: '👨🏽',
    rating: 5,
    comment: 'Increíble experiencia. Carlos es súper atento y responsable.',
    date: '3 semanas atrás',
    verified: true,
    petName: 'Coco',
  },
  {
    id: '5',
    user: 'Laura Méndez',
    avatar: '👩🏻',
    rating: 5,
    comment:
      'Llevamos meses reservando con él. Siempre puntual, amable y con excelente comunicación durante el paseo.',
    date: '1 mes atrás',
    verified: true,
    petName: 'Nina',
  },
  {
    id: '6',
    user: 'Diego Ruiz',
    avatar: '👨🏼',
    rating: 4,
    comment: 'Muy buen servicio en general. Solo una vez hubo un pequeño retraso, pero avisó con tiempo.',
    date: '1 mes atrás',
    verified: true,
    petName: 'Toby',
  },
  {
    id: '7',
    user: 'Camila Herrera',
    avatar: '👩🏽',
    rating: 5,
    comment: 'Mi gata es tímida y él supo manejarla perfectamente. Total confianza.',
    date: '5 semanas atrás',
    verified: true,
    petName: 'Michi',
  },
  {
    id: '8',
    user: 'Andrés Gil',
    avatar: '👨🏿',
    rating: 5,
    comment: 'El seguimiento en vivo me da mucha tranquilidad. Recomendado para familias ocupadas.',
    date: '6 semanas atrás',
    verified: true,
    petName: 'Bruno',
  },
];

export const WALKER_CERTIFICATIONS = [
  {
    icon: 'shield' as const,
    labelKey: 'walker.cert.id',
    verified: true,
    issueDate: 'Ene 2024',
    verificationId: '***8742',
  },
  {
    icon: 'award' as const,
    labelKey: 'walker.cert.background',
    verified: true,
    issueDate: 'Mar 2024',
    verificationId: '***2156',
  },
  {
    icon: 'heart' as const,
    labelKey: 'walker.cert.firstaid',
    verified: true,
    issueDate: 'Feb 2024',
    verificationId: '***9431',
  },
];

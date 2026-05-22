import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Onboarding
    'welcome.title': 'Bienvenido a Pawalk',
    'welcome.subtitle': 'Conexión y cuidado animal',
    'welcome.slide1.title': 'Encuentra paseadores verificados',
    'welcome.slide1.desc': 'Todos nuestros paseadores están verificados y certificados',
    'welcome.slide2.title': 'Seguimiento en tiempo real',
    'welcome.slide2.desc': 'Rastrea el paseo de tu mascota en vivo',
    'welcome.slide3.title': 'Seguro y confiable',
    'welcome.slide3.desc': 'Pagos seguros y garantía de satisfacción',
    'get.started': 'Comenzar',
    'login': 'Iniciar sesión',
    'signup': 'Registrarse',
    'signup.email.exists.title': 'Este correo ya está registrado',
    'signup.email.exists.message':
      'Ya tienes una cuenta con este correo. Puedes iniciar sesión o registrarte con un email diferente.',
    'signup.email.exists.login': 'Iniciar sesión',
    'signup.email.exists.change': 'Usar otro correo',
    'language': 'Idioma',
    'theme': 'Tema',
    'light': 'Claro',
    'dark': 'Oscuro',
    'forgot.password': '¿Olvidaste tu contraseña?',
    'no.account': '¿No tienes cuenta?',
    'have.account': '¿Ya tienes cuenta?',
    'or': 'o',
    'continue.with': 'Continuar con',
    'accept.terms': 'Acepto los términos y condiciones',

    // Navigation
    'nav.home': 'Inicio',
    'nav.bookings': 'Reservas',
    'nav.pets': 'Mascotas',
    'nav.profile': 'Perfil',

    // Home
    'home.title': '¿Dónde necesitas un paseador?',
    'home.search': 'Buscar por ubicación...',
    'home.nearby': 'Paseadores cercanos',
    'home.filters': 'Filtros',
    'home.distance': 'Distancia',
    'home.price': 'Precio',
    'home.rating': 'Calificación',
    'home.service': 'Servicio',

    // Walker Profile
    'walker.verified': 'Verificado',
    'walker.experience': 'Experiencia',
    'walker.years': 'años',
    'walker.reviews': 'reseñas',
    'walker.book': 'Reservar paseo',
    'walker.about': 'Acerca de',
    'walker.certifications': 'Certificaciones',
    'walker.cert.id': 'Verificación de identidad',
    'walker.cert.background': 'Antecedentes judiciales',
    'walker.cert.firstaid': 'Primeros auxilios veterinarios',

    // Pet Profile
    'pet.add': 'Agregar mascota',
    'pet.name': 'Nombre',
    'pet.breed': 'Raza',
    'pet.age': 'Edad',
    'pet.weight': 'Peso',
    'pet.behavior': 'Comportamiento',
    'pet.vaccinations': 'Vacunas',
    'pet.friendly': 'Amigable',
    'pet.energetic': 'Enérgico',
    'pet.shy': 'Tímido',
    'pet.trained': 'Entrenado',
    'pet.playful': 'Juguetón',
    'pet.calm': 'Tranquilo',
    'pet.gender': 'Sexo',
    'pet.male': 'Macho',
    'pet.female': 'Hembra',
    'pet.species': 'Tipo',
    'pet.dog': 'Perro',
    'pet.cat': 'Gato',

    // Booking
    'booking.select.date': 'Seleccionar fecha',
    'booking.select.time': 'Seleccionar hora',
    'booking.duration': 'Duración',
    'booking.30min': '30 minutos',
    'booking.60min': '60 minutos',
    'booking.90min': '90 minutos',
    'booking.terms': 'Términos y condiciones',
    'booking.accept': 'Acepto los términos y reglas de convivencia',
    'booking.cancel.policy': 'Política de cancelación',
    'booking.rules': 'Reglas de convivencia',

    // Checkout
    'checkout.summary': 'Resumen',
    'checkout.service': 'Servicio de paseo',
    'checkout.platform.fee': 'Tarifa de plataforma (15%)',
    'checkout.total': 'Total',
    'checkout.payment': 'Método de pago',
    'checkout.confirm': 'Confirmar pago',

    // Live Tracking
    'tracking.walker.on.way': 'Paseador en camino',
    'tracking.walk.started': 'Paseo iniciado',
    'tracking.eta': 'Tiempo estimado',
    'tracking.emergency': 'Emergencia',
    'tracking.contact.walker': 'Contactar paseador',

    // Notifications
    'notif.booking.confirmed': 'Reserva confirmada',
    'notif.walk.started': 'Paseo iniciado',
    'notif.walk.completed': 'Paseo completado',
    'notif.payment.confirmed': 'Pago confirmado',
    'notif.vaccination.reminder': 'Recordatorio de vacunación',

    // Common
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'edit': 'Editar',
    'delete': 'Eliminar',
    'confirm': 'Confirmar',
    'back': 'Volver',
    'next': 'Siguiente',
    'skip': 'Omitir',
    'done': 'Listo',
    'from': 'desde',
    'min': 'min',
    'hour': 'hora',
    'available': 'Disponible',
  },
  en: {
    // Onboarding
    'welcome.title': 'Welcome to Pawalk',
    'welcome.subtitle': 'Connection and animal care',
    'welcome.slide1.title': 'Find verified walkers',
    'welcome.slide1.desc': 'All our walkers are verified and certified',
    'welcome.slide2.title': 'Real-time tracking',
    'welcome.slide2.desc': "Track your pet's walk live",
    'welcome.slide3.title': 'Safe and reliable',
    'welcome.slide3.desc': 'Secure payments and satisfaction guarantee',
    'get.started': 'Get Started',
    'login': 'Log In',
    'signup': 'Sign Up',
    'signup.email.exists.title': 'This email is already registered',
    'signup.email.exists.message':
      'An account already exists with this email. Log in or sign up with a different address.',
    'signup.email.exists.login': 'Log in',
    'signup.email.exists.change': 'Use a different email',
    'language': 'Language',
    'theme': 'Theme',
    'light': 'Light',
    'dark': 'Dark',
    'forgot.password': 'Forgot your password?',
    'no.account': "Don't have an account?",
    'have.account': 'Already have an account?',
    'or': 'or',
    'continue.with': 'Continue with',
    'accept.terms': 'I accept the terms and conditions',

    // Navigation
    'nav.home': 'Home',
    'nav.bookings': 'Bookings',
    'nav.pets': 'Pets',
    'nav.profile': 'Profile',

    // Home
    'home.title': 'Where do you need a walker?',
    'home.search': 'Search by location...',
    'home.nearby': 'Nearby walkers',
    'home.filters': 'Filters',
    'home.distance': 'Distance',
    'home.price': 'Price',
    'home.rating': 'Rating',
    'home.service': 'Service',

    // Walker Profile
    'walker.verified': 'Verified',
    'walker.experience': 'Experience',
    'walker.years': 'years',
    'walker.reviews': 'reviews',
    'walker.book': 'Book Walk',
    'walker.about': 'About',
    'walker.certifications': 'Certifications',
    'walker.cert.id': 'Identity Verification',
    'walker.cert.background': 'Background Check',
    'walker.cert.firstaid': 'Veterinary First Aid',

    // Pet Profile
    'pet.add': 'Add Pet',
    'pet.name': 'Name',
    'pet.breed': 'Breed',
    'pet.age': 'Age',
    'pet.weight': 'Weight',
    'pet.behavior': 'Behavior',
    'pet.vaccinations': 'Vaccinations',
    'pet.friendly': 'Friendly',
    'pet.energetic': 'Energetic',
    'pet.shy': 'Shy',
    'pet.trained': 'Trained',
    'pet.playful': 'Playful',
    'pet.calm': 'Calm',
    'pet.gender': 'Gender',
    'pet.male': 'Male',
    'pet.female': 'Female',
    'pet.species': 'Species',
    'pet.dog': 'Dog',
    'pet.cat': 'Cat',

    // Booking
    'booking.select.date': 'Select date',
    'booking.select.time': 'Select time',
    'booking.duration': 'Duration',
    'booking.30min': '30 minutes',
    'booking.60min': '60 minutes',
    'booking.90min': '90 minutes',
    'booking.terms': 'Terms and conditions',
    'booking.accept': 'I accept the terms and coexistence rules',
    'booking.cancel.policy': 'Cancellation policy',
    'booking.rules': 'Coexistence rules',

    // Checkout
    'checkout.summary': 'Summary',
    'checkout.service': 'Walk service',
    'checkout.platform.fee': 'Platform fee (15%)',
    'checkout.total': 'Total',
    'checkout.payment': 'Payment method',
    'checkout.confirm': 'Confirm Payment',

    // Live Tracking
    'tracking.walker.on.way': 'Walker on the way',
    'tracking.walk.started': 'Walk started',
    'tracking.eta': 'Estimated time',
    'tracking.emergency': 'Emergency',
    'tracking.contact.walker': 'Contact walker',

    // Notifications
    'notif.booking.confirmed': 'Booking confirmed',
    'notif.walk.started': 'Walk started',
    'notif.walk.completed': 'Walk completed',
    'notif.payment.confirmed': 'Payment confirmed',
    'notif.vaccination.reminder': 'Vaccination reminder',

    // Common
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'confirm': 'Confirm',
    'back': 'Back',
    'next': 'Next',
    'skip': 'Skip',
    'done': 'Done',
    'from': 'from',
    'min': 'min',
    'hour': 'hour',
    'available': 'Available',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

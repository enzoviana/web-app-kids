/**
 * Service de gestion du Contrôle Horaire d'Accès
 * Vérifie si un utilisateur peut accéder au système selon son rôle et l'heure actuelle
 */

import { UserRole, HORAIRES_PAR_ROLE, PlageHoraire, LogSecurite } from '@/types';
import { toast } from 'sonner';
import { api } from './api';

// Détection du mode démo via variable d'environnement
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

/**
 * Vérifie si un rôle a des restrictions horaires
 */
export function hasHoraireRestrictions(role: UserRole): boolean {
  return HORAIRES_PAR_ROLE[role]?.length > 0;
}

/**
 * Parse une heure au format HH:mm en minutes depuis minuit
 */
function parseHeureEnMinutes(heure: string): number {
  const [heures, minutes] = heure.split(':').map(Number);
  return heures * 60 + minutes;
}

/**
 * Obtient l'heure actuelle en minutes depuis minuit
 */
function getMinutesActuelles(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Vérifie si l'heure actuelle est dans une plage horaire donnée
 */
function estDansPlage(plage: PlageHoraire, date: Date = new Date()): boolean {
  const jourActuel = date.getDay(); // 0=Dimanche, 1=Lundi, etc.
  const minutesActuelles = getMinutesActuelles(date);
  const minutesDebut = parseHeureEnMinutes(plage.debut);
  const minutesFin = parseHeureEnMinutes(plage.fin);

  // Vérifier si c'est un jour autorisé
  if (!plage.jours.includes(jourActuel)) {
    return false;
  }

  // Vérifier si l'heure est dans la plage
  return minutesActuelles >= minutesDebut && minutesActuelles <= minutesFin;
}

/**
 * Vérifie si l'accès est autorisé selon l'horaire
 * En mode démo, permet de simuler différents horaires
 */
export function verifierAccesHoraire(
  role: UserRole,
  dateTest?: Date
): {
  autorise: boolean;
  message?: string;
  prochaineCreneau?: string;
  plagesAutorisees: PlageHoraire[];
} {
  const date = dateTest || new Date();
  const plages = HORAIRES_PAR_ROLE[role];

  // Pas de restrictions pour ce rôle
  if (!plages || plages.length === 0) {
    return {
      autorise: true,
      plagesAutorisees: [],
    };
  }

  // Vérifier si l'heure actuelle est dans une des plages autorisées
  const dansUnePlage = plages.some((plage) => estDansPlage(plage, date));

  if (dansUnePlage) {
    return {
      autorise: true,
      plagesAutorisees: plages,
    };
  }

  // Accès refusé - calculer le prochain créneau disponible
  const prochaineCreneau = calculerProchaineCreneau(plages, date);

  return {
    autorise: false,
    message: genererMessageRefus(role, date, prochaineCreneau),
    prochaineCreneau,
    plagesAutorisees: plages,
  };
}

/**
 * Calcule le prochain créneau horaire disponible
 */
function calculerProchaineCreneau(plages: PlageHoraire[], date: Date): string {
  const jourActuel = date.getDay();
  const minutesActuelles = getMinutesActuelles(date);

  // Chercher une plage plus tard aujourd'hui
  for (const plage of plages) {
    if (plage.jours.includes(jourActuel)) {
      const minutesDebut = parseHeureEnMinutes(plage.debut);
      if (minutesDebut > minutesActuelles) {
        return `aujourd'hui à ${plage.debut}`;
      }
    }
  }

  // Chercher le prochain jour disponible
  const joursNoms = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  for (let i = 1; i <= 7; i++) {
    const prochainJour = (jourActuel + i) % 7;
    const plageProchainJour = plages.find((p) => p.jours.includes(prochainJour));
    if (plageProchainJour) {
      return `${joursNoms[prochainJour]} à ${plageProchainJour.debut}`;
    }
  }

  return 'prochainement';
}

/**
 * Génère un message de refus personnalisé selon le rôle
 */
function genererMessageRefus(role: UserRole, date: Date, prochaineCreneau: string): string {
  const heureActuelle = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const messages: Record<UserRole, string> = {
    creche: `Accès réservé aux horaires d'ouverture de la crèche (7h-19h, lundi-vendredi). Il est actuellement ${heureActuelle}. Prochain accès : ${prochaineCreneau}.`,
    auxiliaire: `Accès réservé aux horaires de travail (7h-19h, lundi-vendredi). Il est actuellement ${heureActuelle}. Prochain accès : ${prochaineCreneau}.`,
    rsai: `Accès réservé aux horaires de bureau (8h-18h, lundi-vendredi) pour les inspections RSAI. Il est actuellement ${heureActuelle}. Prochain accès : ${prochaineCreneau}.`,
    medecin: '',
    parent: '',
    superadmin: '',
    developpeur: '',
  };

  return messages[role] || `Accès non autorisé en dehors des horaires définis. Prochain accès : ${prochaineCreneau}.`;
}

/**
 * Enregistre une tentative d'accès hors horaires dans les logs de sécurité
 */
export async function logTentativeHorsHoraires(
  userId: string,
  role: UserRole,
  date: Date = new Date()
): Promise<void> {
  const horaireTentative = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const log: Partial<LogSecurite> = {
    type: 'tentative_acces_hors_horaires',
    utilisateur_id: userId,
    role: role,
    timestamp: date.toISOString(),
    horaire_tentative: horaireTentative,
    raison: `Tentative de connexion en dehors des horaires autorisés pour le rôle ${role}`,
    details: `Heure de la tentative : ${horaireTentative}`,
  };

  try {
    if (IS_DEMO_MODE) {
      console.log('🔐 [DEMO HORAIRE] Log de sécurité (simulé):', log);
    } else {
      // En production, envoyer au backend
      await api.post('/logs/securite', log);
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du log de sécurité:', error);
  }
}

/**
 * Affiche une notification de blocage horaire
 */
export function afficherBlocageHoraire(message: string): void {
  toast.error('🕐 Accès refusé - Hors horaires', {
    description: message,
    duration: 8000,
  });
}

/**
 * Affiche les plages horaires autorisées pour un rôle
 */
export function afficherPlagesHoraires(role: UserRole): string {
  const plages = HORAIRES_PAR_ROLE[role];

  if (!plages || plages.length === 0) {
    return 'Accès 24/7';
  }

  const joursNoms = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return plages
    .map((plage) => {
      const joursTexte = plage.jours
        .map((j) => joursNoms[j])
        .join(', ');
      return `${joursTexte} : ${plage.debut}-${plage.fin}`;
    })
    .join(' | ');
}

/**
 * Middleware de vérification horaire pour le frontend
 * À appeler lors de la connexion ou lors de la vérification de session
 */
export async function verifierEtBloquerSiHorsHoraires(
  userId: string,
  role: UserRole,
  dateTest?: Date
): Promise<{ autorise: boolean; message?: string }> {
  const resultat = verifierAccesHoraire(role, dateTest);

  if (!resultat.autorise) {
    // Logger la tentative
    await logTentativeHorsHoraires(userId, role, dateTest);

    // Afficher la notification
    if (resultat.message) {
      afficherBlocageHoraire(resultat.message);
    }

    return {
      autorise: false,
      message: resultat.message,
    };
  }

  return { autorise: true };
}

import { differenceInDays } from 'date-fns';
import type { Document, StatutDocument, ActionDocument, NotificationDocument, UserRole, Parent } from '@/types';

// Permissions
export const canValidateDocument = (role: UserRole): boolean => {
  return ['creche', 'rsai', 'superadmin'].includes(role);
};

export const canUploadDocument = (role: UserRole): boolean => {
  return role === 'parent';
};

export const canViewCode = (role: UserRole): boolean => {
  return ['creche', 'rsai', 'superadmin'].includes(role);
};

// Calcul statut basé sur expiration
export const calculateDocumentStatus = (doc: Document): StatutDocument => {
  if (doc.statut === 'rejete' || doc.statut === 'en_attente' || doc.statut === 'soumis' || doc.statut === 'manquant') {
    return doc.statut;
  }

  if (!doc.dateExpiration) return doc.statut;

  const daysUntilExpiry = differenceInDays(new Date(doc.dateExpiration), new Date());

  if (daysUntilExpiry < 0) return 'expire';
  if (daysUntilExpiry < 30) return 'expire_bientot';

  return 'valide';
};

// Créer notification
export const createDocumentNotification = (
  type: NotificationDocument['type'],
  destinataireId: string,
  destinataireRole: UserRole,
  enfantId: string,
  message: string,
  documentId?: string
): NotificationDocument => {
  const titres = {
    document_demande: 'Document requis',
    document_valide: 'Document validé',
    document_rejete: 'Document refusé',
    document_expire_bientot: 'Document à renouveler',
    relance: 'Rappel document',
  };

  return {
    _id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    destinataire_id: destinataireId,
    destinataire_role: destinataireRole,
    enfant_id: enfantId,
    document_id: documentId,
    type,
    titre: titres[type],
    message,
    date: new Date().toISOString(),
    lu: false,
    priorite: type.includes('demande') || type.includes('rejete') ? 'haute' : 'normale',
  };
};

// Logger action
export const logActionDocument = (
  documentId: string,
  enfantId: string,
  type: ActionDocument['type'],
  auteurId: string,
  auteurRole: UserRole,
  commentaire?: string
): ActionDocument => {
  return {
    _id: `act_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    document_id: documentId,
    enfant_id: enfantId,
    type,
    auteur_id: auteurId,
    auteur_role: auteurRole,
    commentaire,
    date: new Date().toISOString(),
  };
};

// Simulation email/SMS
export const simulateEmailSMS = (destinataire: Parent, type: string, message: string) => {
  console.log(`📧 EMAIL simulé envoyé à ${destinataire.email}`);
  console.log(`📱 SMS simulé envoyé au ${destinataire.tel}`);
  console.log(`Type: ${type}`);
  console.log(`Message: ${message}`);
};

// Labels pour les types de documents
export const getDocumentTypeLabel = (type: Document['type']): string => {
  const labels: Record<Document['type'], string> = {
    certificat_medical: 'Certificat médical',
    attestation_rc: 'Attestation RC',
    justificatif_domicile: 'Justificatif de domicile',
    fiche_urgence: 'Fiche d\'urgence',
    carnet_vaccination: 'Carnet de vaccination',
    contrat_accueil: 'Contrat d\'accueil',
    autorisation_sortie: 'Autorisation de sortie',
    autorisation_image: 'Autorisation d\'image',
    pai: 'PAI',
    autre: 'Autre',
  };
  return labels[type];
};

// Labels des types de documents (version Record pour usage direct)
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  certificat_medical: 'Certificat médical',
  attestation_rc: 'Attestation RC',
  justificatif_domicile: 'Justificatif de domicile',
  fiche_urgence: 'Fiche d\'urgence',
  carnet_vaccination: 'Carnet de vaccination',
  contrat_accueil: 'Contrat d\'accueil',
  autorisation_sortie: 'Autorisation de sortie',
  autorisation_image: 'Autorisation droit à l\'image',
  pai: 'PAI (Projet d\'Accueil Individualisé)',
  autre: 'Autre document',
};

// Labels des statuts
export const STATUT_LABELS: Record<StatutDocument, string> = {
  en_attente: 'En attente',
  soumis: 'Soumis',
  valide: 'Validé',
  expire_bientot: 'Expire bientôt',
  expire: 'Expiré',
  manquant: 'Manquant',
  rejete: 'Rejeté',
};

// Couleurs des badges de statuts
export const STATUT_BADGE_COLORS: Record<StatutDocument, string> = {
  valide: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  expire_bientot: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  expire: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  manquant: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  en_attente: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  soumis: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  rejete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Documents obligatoires pour compliance
export const DOCUMENTS_OBLIGATOIRES = [
  { id: 'certificat_medical' as const, label: 'Certificat médical' },
  { id: 'carnet_vaccination' as const, label: 'Carnet vaccination' },
  { id: 'attestation_rc' as const, label: 'Attestation RC' },
  { id: 'fiche_urgence' as const, label: 'Fiche urgence' },
  { id: 'contrat_accueil' as const, label: 'Contrat accueil' },
  { id: 'autorisation_sortie' as const, label: 'Autoris. sortie' },
  { id: 'autorisation_image' as const, label: 'Autoris. image' },
];

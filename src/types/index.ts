// Types correspondant aux collections MongoDB du projet Kids'Med IA

export type UserRole = 'creche' | 'medecin' | 'rsai' | 'auxiliaire' | 'parent' | 'superadmin' | 'developpeur';

export type StatutEnfant = 'sain' | 'symptome' | 'attention';

export type NoteVisibilite = 'interne' | 'globale';

export type AlerteType = 'doudou_oublie' | 'stock_couches' | 'stock_lait' | 'medicament_oublie' | 'autre';

export interface Enfant {
  _id: string;
  prenom: string;
  nom: string;
  age: number;
  dateNaissance: string;
  groupeSanguin: string;
  photo: string;
  statut: StatutEnfant;
  allergies: string[];
  pai?: {
    actif: boolean;
    dateDebut: string;
    dateFin?: string;
    pathologie: string;
    traitement: string;
    urgences: string;
  };
  vaccins: Vaccin[];
  antecedents: string[];
  parents_ids: string[];
  creche_id: string;
  medecin_id?: string;
  codeConfidentiel: string; // Code unique à 6 caractères
  codeGenereeLe?: string;   // Date de dernière génération
}

export interface Vaccin {
  nom: string;
  date: string;
  rappel?: string;
  lot?: string;
}

export interface Parent {
  _id: string;
  nom: string;
  prenom: string;
  tel: string;
  email: string;
  adresse: string;
  lien: 'mere' | 'pere' | 'tuteur';
}

export interface Creche {
  _id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  latitude: number;
  longitude: number;
  capacite: number;
  directeur: string;
}

export interface Medecin {
  _id: string;
  nom: string;
  prenom: string;
  specialite: string;
  adresse: string;
  telephone: string;
  email: string;
  numeroOrdre: string;
}

export interface RSAI {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  certifications: string[];
  secteur: string;
}

export interface DiagnosticIA {
  _id: string;
  enfant_id: string;
  symptomes: string[];
  diagnostic: string;
  confiance: number;
  recommandation: string;
  date: string;
  declareParRole: UserRole;
  notificationEnvoyee: boolean;
}

export interface Ordonnance {
  _id: string;
  enfant_id: string;
  medecin_id: string;
  date: string;
  medicaments: {
    nom: string;
    posologie: string;
    duree: string;
    instructions: string;
  }[];
  instructions: string;
}

export interface NoteInterne {
  _id: string;
  enfant_id: string;
  auteur: UserRole;
  auteur_id: string;
  texte: string;
  visibilite: NoteVisibilite;
  date: string;
}

export interface AlerteQuotidien {
  _id: string;
  enfant_id: string;
  type: AlerteType;
  message: string;
  date: string;
  resolue: boolean;
}

export interface LogSecurite {
  _id: string;
  type: 'acces_refuse_geofencing' | 'acces_autorise' | 'tentative_acces_hors_horaires' | 'modification_donnees_sensibles';
  rsai_id?: string;
  utilisateur_id?: string;
  role?: UserRole;
  creche_id?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  raison?: string;
  details?: string;
}

export interface AlerteSOS {
  _id: string;
  enfant_id: string;
  creche_id: string;
  motif: string;
  description: string;
  timestamp: string;
  notificationEnvoyee: boolean;
}

export interface Review {
  _id: string;
  auteurRole: UserRole;
  auteur_id: string;
  cible_id: string;
  cible_type: 'rsai' | 'medecin' | 'creche';
  note: number;
  commentaire: string;
  date: string;
}

export interface SuperAdmin {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateCreation: string;
}

export interface Developpeur {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  dateCreation: string;
}

export interface Abonnement {
  _id: string;
  creche_id: string;
  plan: 'basic' | 'premium' | 'enterprise';
  statut: 'actif' | 'inactif' | 'suspendu';
  dateDebut: string;
  dateFin: string;
  montant: number;
  periodePaiement: 'mensuel' | 'annuel';
}

export interface Tarif {
  _id: string;
  plan: 'basic' | 'premium' | 'enterprise';
  nom: string;
  prixMensuel: number;
  prixAnnuel: number;
  fonctionnalites: string[];
  capaciteMax: number;
}

// Types pour le système de gestion des documents

export type StatutDocument =
  | 'en_attente'      // Demandé mais pas uploadé
  | 'soumis'          // Uploadé, en attente validation
  | 'valide'          // Validé par crèche/RSAI/SuperAdmin
  | 'expire_bientot'  // Expire < 30 jours
  | 'expire'          // Expiré
  | 'manquant'        // Jamais fourni
  | 'rejete';         // Refusé avec commentaire

export type TypeDocument =
  | 'certificat_medical'
  | 'attestation_rc'
  | 'justificatif_domicile'
  | 'fiche_urgence'
  | 'carnet_vaccination'
  | 'contrat_accueil'
  | 'autorisation_sortie'
  | 'autorisation_image'
  | 'pai'
  | 'autre';

export interface Document {
  id: string;
  enfantId: string;
  type: TypeDocument;
  nom: string;
  statut: StatutDocument;
  dateUpload?: string;
  dateExpiration?: string;
  dateValidation?: string;
  uploadedBy?: string;
  validatedBy?: string;
  rejectedBy?: string;
  commentaire?: string;
  fichierUrl?: string;
  obligatoire: boolean;
  // Legacy support
  _id?: string;
  enfant_id?: string;
}

export interface ActionDocument {
  _id: string;
  document_id: string;
  enfant_id: string;
  type: 'demande' | 'upload' | 'validation' | 'rejet' | 'relance' | 'regeneration_code';
  auteur_id: string;
  auteur_role: UserRole;
  commentaire?: string;
  date: string;
}

export interface NotificationDocument {
  _id: string;
  destinataire_id: string;
  destinataire_role: UserRole;
  enfant_id: string;
  document_id?: string;
  type: 'document_demande' | 'document_valide' | 'document_rejete' | 'document_expire_bientot' | 'relance';
  titre: string;
  message: string;
  date: string;
  lu: boolean;
  priorite: 'basse' | 'normale' | 'haute';
}

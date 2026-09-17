import React, { useState, useEffect } from 'react';
import { IoMail, IoSend, IoLockClosed, IoAttach, IoSearchOutline, IoPeople, IoArchive, IoTrash, IoEllipsisVertical, IoSparkles } from 'react-icons/io5';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { messageApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { AppBackground } from '@/components/AppBackground';
import { motion } from 'framer-motion';

interface MessageData {
  id: string;
  expediteurId: string;
  destinataireId: string;
  sujet: string;
  contenu: string;
  type: string;
  lu: boolean;
  archive: boolean;
  createdAt: string;
  expediteur?: {
    id: string;
    profile: {
      prenom: string;
      nom: string;
    };
    role: string;
  };
  destinataire?: {
    id: string;
    profile: {
      prenom: string;
      nom: string;
    };
    role: string;
  };
}

interface Conversation {
  id: string;
  participants: {
    nom: string;
    role: string;
  }[];
  dernierMessage: string;
  date: Date;
  nonLu: boolean;
  priorite: 'normale' | 'haute';
  messages: MessageData[];
}

export const MessagerieSecuriseePage: React.FC = () => {
  const { user } = useAuth();

  // Role detection for dynamic theming
  const isRSAI = user?.role === 'rsai' || user?.role === 'referent_sante';
  const isCreche = user?.role === 'creche' || user?.role === 'professionnel';
  const isMedecin = user?.role === 'medecin';
  const isAuxiliaire = user?.role === 'auxiliaire' || user?.role === 'professionnel_puericulture';
  const isParent = user?.role === 'parent';

  // Dynamic theme based on role
  const roleTheme = isRSAI
    ? { hex: '#FF007A', name: 'RSAI' }
    : isCreche
    ? { hex: '#8BC34A', name: 'Crèche' }
    : isMedecin
    ? { hex: '#0099FF', name: 'Médecin' }
    : isAuxiliaire
    ? { hex: '#14B8A6', name: 'Auxiliaire' }
    : isParent
    ? { hex: '#8B5CF6', name: 'Parent' }
    : { hex: '#64748B', name: 'Utilisateur' };

  const [messagesRecus, setMessagesRecus] = useState<MessageData[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<MessageData[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showActions, setShowActions] = useState(false);

  // Charger les messages au montage
  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, []);

  // Fermer le menu des actions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => setShowActions(false);
    if (showActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActions]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const [recusResponse, envoyesResponse] = await Promise.all([
        messageApi.getMessagesRecus({ archive: false }),
        messageApi.getMessagesEnvoyes(),
      ]);

      const recus = recusResponse.data || [];
      const envoyes = envoyesResponse.data || [];

      setMessagesRecus(recus);
      setMessagesEnvoyes(envoyes);

      // Grouper les messages en conversations
      const conversationsMap = new Map<string, Conversation>();

      // Traiter les messages reçus
      recus.forEach((msg: MessageData) => {
        const otherUserId = msg.expediteurId;
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            participants: [
              {
                nom: msg.expediteur
                  ? `${msg.expediteur.profile.prenom} ${msg.expediteur.profile.nom}`
                  : 'Utilisateur',
                role: msg.expediteur?.role || 'Utilisateur',
              },
            ],
            dernierMessage: msg.contenu,
            date: new Date(msg.createdAt),
            nonLu: !msg.lu,
            priorite: msg.type === 'urgent' ? 'haute' : 'normale',
            messages: [msg],
          });
        } else {
          const conv = conversationsMap.get(otherUserId)!;
          conv.messages.push(msg);
          if (new Date(msg.createdAt) > conv.date) {
            conv.dernierMessage = msg.contenu;
            conv.date = new Date(msg.createdAt);
          }
          if (!msg.lu) {
            conv.nonLu = true;
          }
        }
      });

      // Traiter les messages envoyés
      envoyes.forEach((msg: MessageData) => {
        const otherUserId = msg.destinataireId;
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            participants: [
              {
                nom: msg.destinataire
                  ? `${msg.destinataire.profile.prenom} ${msg.destinataire.profile.nom}`
                  : 'Utilisateur',
                role: msg.destinataire?.role || 'Utilisateur',
              },
            ],
            dernierMessage: msg.contenu,
            date: new Date(msg.createdAt),
            nonLu: false,
            priorite: msg.type === 'urgent' ? 'haute' : 'normale',
            messages: [msg],
          });
        } else {
          const conv = conversationsMap.get(otherUserId)!;
          conv.messages.push(msg);
          if (new Date(msg.createdAt) > conv.date) {
            conv.dernierMessage = msg.contenu;
            conv.date = new Date(msg.createdAt);
          }
        }
      });

      // Trier les messages de chaque conversation par date
      conversationsMap.forEach((conv) => {
        conv.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });

      // Convertir en tableau et trier par date (plus récent en premier)
      const conversationsArray = Array.from(conversationsMap.values()).sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      setConversations(conversationsArray);

      // Sélectionner la première conversation par défaut
      if (conversationsArray.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsArray[0]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des messages:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await messageApi.countUnread();
      setUnreadCount(response.data?.count || 0);
    } catch (err) {
      console.error('Erreur lors du comptage des messages non lus:', err);
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);

    // Marquer les messages non lus comme lus
    const unreadMessages = conv.messages.filter(
      (msg) => !msg.lu && msg.destinataireId === user?.id
    );

    for (const msg of unreadMessages) {
      try {
        await messageApi.markAsRead(msg.id);
        msg.lu = true;
      } catch (err) {
        console.error('Erreur lors du marquage comme lu:', err);
      }
    }

    // Mettre à jour la conversation
    if (unreadMessages.length > 0) {
      conv.nonLu = false;
      setConversations([...conversations]);
      loadUnreadCount();
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user) return;

    try {
      const messageData = {
        destinataireId: selectedConversation.id,
        sujet: 'Re: Conversation',
        contenu: messageInput.trim(),
        type: 'general',
      };

      const response = await messageApi.createMessage(messageData);
      const newMessage = response.data;

      // Ajouter le message à la conversation
      selectedConversation.messages.push(newMessage);
      selectedConversation.dernierMessage = newMessage.contenu;
      selectedConversation.date = new Date(newMessage.createdAt);

      // Mettre à jour l'état
      setConversations([...conversations]);
      setMessageInput('');
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi du message');
    }
  };

  const handleArchiveConversation = async () => {
    if (!selectedConversation) return;

    try {
      // Archiver tous les messages reçus de cette conversation
      const receivedMessages = selectedConversation.messages.filter(
        (msg) => msg.destinataireId === user?.id
      );

      for (const msg of receivedMessages) {
        await messageApi.archiveMessage(msg.id);
      }

      // Retirer la conversation de la liste
      setConversations(conversations.filter((c) => c.id !== selectedConversation.id));
      setSelectedConversation(null);
      setShowActions(false);
    } catch (err: any) {
      console.error('Erreur lors de l\'archivage:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'archivage');
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation || !window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      return;
    }

    try {
      // Supprimer tous les messages de cette conversation
      for (const msg of selectedConversation.messages) {
        await messageApi.deleteMessage(msg.id);
      }

      // Retirer la conversation de la liste
      setConversations(conversations.filter((c) => c.id !== selectedConversation.id));
      setSelectedConversation(null);
      setShowActions(false);
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p) => p.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <AppBackground>
        <div className="max-w-6xl mx-auto p-6 md:p-10 h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: roleTheme.hex }}></div>
            <p className="text-slate-600 dark:text-zinc-400">Chargement des messages...</p>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto p-6 md:p-10 h-[calc(100vh-80px)] flex flex-col space-y-6 text-slate-900 dark:text-zinc-100"
      >
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Messagerie Sécurisée HDS</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold shadow-xs"
            style={{
              backgroundColor: `color-mix(in srgb, ${roleTheme.hex} 10%, transparent)`,
              borderColor: `color-mix(in srgb, ${roleTheme.hex} 30%, transparent)`,
              color: roleTheme.hex,
              border: '1px solid'
            }}
          >
            <IoSparkles className="h-3.5 w-3.5" />
            {roleTheme.name}
          </span>
          {unreadCount > 0 && (
            <Badge variant="error" className="ml-2">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <IoLockClosed className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs text-slate-500 dark:text-zinc-400">Conversations chiffrées de bout en bout</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Conversations List */}
        <Card className="w-96 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Messages</CardTitle>
              <Button size="sm">
                <IoPeople className="h-4 w-4 mr-2" />
                Nouveau
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y divide-slate-200/60">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm">
                    {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>{conv.participants[0].nom[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-medium text-sm ${conv.nonLu ? 'text-slate-900' : 'text-slate-600'}`}>
                            {conv.participants[0].nom}
                          </p>
                          {conv.nonLu && <div className="w-2 h-2 bg-primary rounded-full" />}
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{conv.participants[0].role}</p>
                        <p className="text-sm text-slate-600 truncate">{conv.dernierMessage}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(conv.date, 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <CardHeader className="border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{selectedConversation.participants[0].nom[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900">{selectedConversation.participants[0].nom}</p>
                      <p className="text-xs text-slate-500">{selectedConversation.participants[0].role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation.priorite === 'haute' && <Badge variant="error">Priorité haute</Badge>}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowActions(!showActions)}
                      >
                        <IoEllipsisVertical className="h-5 w-5" />
                      </Button>
                      {showActions && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                          <button
                            onClick={handleArchiveConversation}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <IoArchive className="h-4 w-4" />
                            Archiver
                          </button>
                          <button
                            onClick={handleDeleteConversation}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <IoTrash className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedConversation.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <p>Aucun message dans cette conversation</p>
                  </div>
                ) : (
                  selectedConversation.messages.map((message) => {
                    const isFromMe = message.expediteurId === user?.id;
                    const senderName = isFromMe
                      ? 'Vous'
                      : message.expediteur
                      ? `${message.expediteur.profile.prenom} ${message.expediteur.profile.nom}`
                      : 'Utilisateur';

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            isFromMe
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          {!isFromMe && (
                            <p className="text-xs font-medium mb-2">{senderName}</p>
                          )}
                          <p className="text-sm">{message.contenu}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isFromMe ? 'text-primary-100' : 'text-slate-500'
                            }`}
                          >
                            {format(new Date(message.createdAt), 'HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>

              {/* Input Area */}
              <div className="border-t border-slate-200/60 p-4 bg-white">
                <div className="flex gap-3">
                  <Button variant="ghost" size="icon">
                    <IoAttach className="h-5 w-5 text-slate-600" />
                  </Button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && messageInput.trim()) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Button disabled={!messageInput.trim()} onClick={handleSendMessage} style={{ backgroundColor: roleTheme.hex }}>
                    <IoSend className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 flex items-center gap-1">
                  <IoLockClosed className="h-3 w-3" />
                  Messages chiffrés end-to-end (AES-256) - Conforme HDS
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-zinc-500">
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </Card>
      </div>

      {/* Footer */}
      <footer className="pt-4 border-t border-slate-200/80 dark:border-zinc-800 shrink-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-bold" style={{ color: roleTheme.hex }}>Kids'Med IA</span>
            <span>•</span>
            <span>© 2026 Tous droits réservés</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: roleTheme.hex }}>Aide</a>
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: roleTheme.hex }}>Confidentialité</a>
          </div>
        </div>
      </footer>
      </motion.div>
    </AppBackground>
  );
};

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IoDownloadOutline, IoQrCodeOutline } from 'react-icons/io5';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  enfantId: string;
  codeConfidentiel: string;
  prenom: string;
  nom: string;
}

/**
 * Composant d'affichage et téléchargement du QR Code enfant
 * Conforme CDC page 2 : "QR Code unique pour identification rapide"
 */
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  enfantId,
  codeConfidentiel,
  prenom,
  nom,
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [codeConfidentiel]);

  /**
   * Génère le QR Code côté client avec l'API qrcode
   * En production, ceci devrait être fait côté backend
   */
  const generateQRCode = async () => {
    try {
      setLoading(true);

      // Mode démo : génération simulée avec API externe
      // En production : endpoint backend /api/enfants/:id/qrcode
      const qrData = JSON.stringify({
        enfantId,
        code: codeConfidentiel,
        type: 'kids_med_ia',
      });

      // Utiliser l'API qrserver.com pour génération (mode démo)
      const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        qrData
      )}`;

      setQrCodeDataURL(qrURL);
      setLoading(false);
    } catch (error) {
      console.error('Erreur génération QR Code:', error);
      toast.error('Impossible de générer le QR Code');
      setLoading(false);
    }
  };

  /**
   * Télécharge le QR Code en PNG
   */
  const handleDownloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeDataURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode_${prenom}_${nom}_${codeConfidentiel}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('QR Code téléchargé avec succès');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Impossible de télécharger le QR Code');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IoQrCodeOutline className="text-2xl" />
          QR Code de {prenom}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {loading ? (
          <div className="w-[300px] h-[300px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
            <IoQrCodeOutline className="text-6xl text-gray-400" />
          </div>
        ) : (
          <>
            <div className="border-4 border-gray-200 rounded-lg p-4 bg-white">
              <img
                src={qrCodeDataURL}
                alt={`QR Code de ${prenom} ${nom}`}
                className="w-[300px] h-[300px]"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Code confidentiel</p>
              <p className="text-2xl font-mono font-bold text-gray-800">{codeConfidentiel}</p>
            </div>

            <Button onClick={handleDownloadQRCode} className="w-full max-w-xs">
              <IoDownloadOutline className="mr-2" />
              Télécharger le QR Code
            </Button>

            <div className="text-xs text-gray-500 text-center mt-2">
              <p>Ce QR Code permet l'identification rapide de votre enfant.</p>
              <p>Scannez-le à l'arrivée en crèche ou présentez le code à 6 chiffres.</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EnfantDetailsPage as CrecheEnfantDetailsPage } from '@/pages/creche/EnfantDetailsPage';
import { IoArrowBackOutline } from 'react-icons/io5';
import { Button } from '@/components/ui/button';

export const EnfantDetailsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="p-4 bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/superadmin/enfants')}
          className="h-10 px-4 rounded-2xl"
        >
          <IoArrowBackOutline className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
      <CrecheEnfantDetailsPage />
    </div>
  );
};

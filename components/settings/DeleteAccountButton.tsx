"use client";

import { useFormStatus } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  action: () => Promise<void>;
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <AlertDialogAction
      type="submit"
      form="delete-account-form"
      variant="destructive"
      disabled={pending}
    >
      {pending ? 'Siliniyor...' : 'Hesabi Sil'}
    </AlertDialogAction>
  );
}

export function DeleteAccountButton({ action }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={(
          <Button variant="destructive" className="w-full justify-center bg-red-500/10 text-red-200 hover:bg-red-500/20" />
        )}
      >
        Hesabi Sil
      </AlertDialogTrigger>
      <AlertDialogContent className="border-destructive/20 bg-background text-foreground shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-foreground">Hesabı Kalıcı Olarak Sil</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Bu işlem geri alınamaz. Profilin, onboarding verin, içerik geçmişin ve feedback
            kayıtların tamamen silinir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t border-border bg-secondary/30 mt-4 -mx-6 -mb-6 px-6 py-4">
          <AlertDialogCancel className="border-border bg-transparent text-foreground hover:bg-secondary">
            Vazgec
          </AlertDialogCancel>
          <form id="delete-account-form" action={action}>
            <DeleteSubmitButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

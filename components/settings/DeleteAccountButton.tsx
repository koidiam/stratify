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
      className="rounded-sm bg-red-500 text-white hover:bg-red-600 font-bold uppercase tracking-widest text-[11px] h-10 border-none shadow-none"
      disabled={pending}
    >
      {pending ? 'Deleting...' : 'Confirm Deletion'}
    </AlertDialogAction>
  );
}

export function DeleteAccountButton({ action }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={(
          <Button className="w-full justify-center rounded-sm bg-red-500/5 text-red-500 hover:bg-red-500/10 border border-red-500/20 font-bold uppercase tracking-widest text-[11px] h-10 shadow-none transition-colors" />
        )}
      >
        Delete Account
      </AlertDialogTrigger>
      <AlertDialogContent className="str-panel rounded-sm !border-red-500/30 bg-[#050505] text-white shadow-2xl p-0 overflow-hidden">
        <div className="p-6">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-500/10 text-red-500 rounded-sm w-12 h-12 flex items-center justify-center mb-4">
              <AlertTriangle className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-white uppercase tracking-widest text-sm font-bold">Permanent Deletion Warning</AlertDialogTitle>
            <AlertDialogDescription className="text-red-500/70 text-xs font-light leading-relaxed mt-2">
              This action cannot be undone. Your profile, settings, and generated history will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="border-t border-red-500/10 bg-[#000000]/40 px-6 py-4">
          <AlertDialogCancel className="rounded-sm border-white/10 bg-transparent text-white/50 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[11px] h-10 shadow-none">
            Cancel
          </AlertDialogCancel>
          <form id="delete-account-form" action={action}>
            <DeleteSubmitButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

'use client';

import { useState } from 'react';

import { Trans, msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { DateTime } from 'luxon';
import { signOut } from 'next-auth/react';

import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type SigningAuthPageViewProps = {
  email: string;
  emailHasAccount?: boolean;
};

export const SigningAuthPageView = ({ email, emailHasAccount }: SigningAuthPageViewProps) => {
  const { _ } = useLingui();
  const { toast } = useToast();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const { mutateAsync: encryptSecondaryData } = trpc.crypto.encryptSecondaryData.useMutation();

  const handleChangeAccount = async (email: string) => {
    try {
      setIsSigningOut(true);

      const encryptedEmail = await encryptSecondaryData({
        data: email,
        expiresAt: DateTime.now().plus({ days: 1 }).toMillis(),
      });

      await signOut({
        callbackUrl: emailHasAccount
          ? `/signin?email=${encodeURIComponent(encryptedEmail)}`
          : `/signup?email=${encodeURIComponent(encryptedEmail)}`,
      });
    } catch {
      toast({
        title: _(msg`Something went wrong`),
        description: _(msg`We were unable to log you out at this time.`),
        duration: 10000,
        variant: 'destructive',
      });
    }

    setIsSigningOut(false);
  };

  return (
    <div className="mx-auto flex h-[70vh] w-full max-w-md flex-col items-center justify-center">
      <div>
        <h1 className="text-3xl font-semibold">
          <Trans>Authentication required</Trans>
        </h1>

        <p className="text-muted-foreground mt-2 text-sm">
          <Trans>
            You need to be logged in as <strong>{email}</strong> to view this page.
          </Trans>
        </p>

        <Button
          className="mt-4 w-full"
          type="submit"
          onClick={async () => handleChangeAccount(email)}
          loading={isSigningOut}
        >
          {emailHasAccount ? <Trans>Login</Trans> : <Trans>Sign up</Trans>}
        </Button>
      </div>
    </div>
  );
};

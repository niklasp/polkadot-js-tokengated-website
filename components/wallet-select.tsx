'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, LogOut, Wallet } from 'lucide-react';
import { usePolkadotExtension } from '@/providers/polkadot-extension-provider';
import { cn, trimAddress, isMobile } from '@/lib/utils';
import { Identicon } from '@polkadot/react-identicon';
import { allSubstrateWallets, SubstrateWalletPlatform } from '@/components/wallets';
import Image from 'next/image';

export function WalletSelect() {
  const {
    accounts,
    installedExtensions,
    selectedExtensionName,
    selectedAccount,
    setSelectedExtensionName,
    setSelectedAccount,
    initiateConnection,
    disconnect,
    isAccountsLoading,
  } = usePolkadotExtension();

  const systemWallets = allSubstrateWallets
    .filter((wallet) =>
      isMobile()
        ? wallet.platforms.includes(SubstrateWalletPlatform.Android) ||
          wallet.platforms.includes(SubstrateWalletPlatform.iOS)
        : wallet.platforms.includes(SubstrateWalletPlatform.Browser),
    )
    .sort((a, b) =>
      installedExtensions.includes(a.id) ? -1 : installedExtensions.includes(b.id) ? 1 : 0,
    );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" onClick={initiateConnection} className="cursor-pointer">
          <Wallet className="w-4 h-4" />
          {selectedAccount ? selectedAccount.name : 'Connect Wallet'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="p-4">
          <DialogTitle className="leading-snug">
            {selectedExtensionName !== undefined && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-4"
                onClick={() => setSelectedExtensionName(undefined)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {selectedExtensionName !== undefined
              ? 'Select Account'
              : 'Select a wallet to connect to Polkadot'}
            {selectedExtensionName !== undefined && (
              <Button variant="ghost" size="icon" className="ml-4" onClick={disconnect}>
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-0 overflow-auto max-h-[500px]">
          <div
            className={cn(
              'flex flex-col items-start gap-2 transition-[max-height,opacity]',
              selectedExtensionName === undefined
                ? 'opacity-100 max-h-[9999px] duration-500 delay-200'
                : 'opacity-0 max-h-0 overflow-hidden duration-0',
            )}
          >
            {systemWallets.map((wallet, index) => (
              <Button
                variant="ghost"
                className="w-full flex flex-row items-center justify-between"
                key={index}
                onClick={() => {
                  if (installedExtensions.includes(wallet.id)) {
                    setSelectedExtensionName(wallet.id);
                  } else {
                    window.open(wallet.urls.website, '_blank');
                  }
                }}
              >
                <div className="flex flex-row items-center justify-start gap-4">
                  <Image
                    src={wallet.logoUrls[0]}
                    alt={wallet.name}
                    className="w-6 h-6"
                    width={24}
                    height={24}
                  />
                  <span className="font-bold">{wallet.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {installedExtensions.includes(wallet.id) ? 'Detected' : 'Install'}
                </span>
              </Button>
            ))}
          </div>
          <div
            className={cn(
              'flex flex-col items-start gap-2 transition-[max-height,opacity]',
              selectedExtensionName === undefined
                ? 'opacity-0 max-h-0 overflow-hidden duration-0'
                : 'opacity-100 max-h-[9999px] duration-500 delay-200',
            )}
          >
            {accounts.length > 0 ? (
              accounts.map((account, index) => (
                <DialogClose asChild key={index}>
                  <Button
                    variant="ghost"
                    className="w-full flex flex-row h-auto justify-start items-center gap-0 [&_svg]:size-auto"
                    onClick={() => setSelectedAccount(account)}
                  >
                    <Identicon
                      className="w-[32px] h-[32px] mr-2 [&>svg>circle:first-child]:fill-transparent"
                      value={account.address}
                      size={32}
                      theme="polkadot"
                    />
                    <div className="flex flex-col justify-start items-start gap-0">
                      <span className="font-bold">{account.name}</span>
                      {account.address && <div>{trimAddress(account.address)}</div>}
                    </div>
                  </Button>
                </DialogClose>
              ))
            ) : (
              <div>
                {isAccountsLoading
                  ? 'Loading accounts...'
                  : 'Please allow the site to access your extension accounts'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

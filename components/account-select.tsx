'use client';

import Identicon from '@polkadot/react-identicon';
import { usePolkadotExtensionWithContext } from '@/context/polkadotExtensionContext';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function AccountSelector() {
  const { accounts, actingAccount, setActingAccountIdx } = usePolkadotExtensionWithContext();

  // Filter unique accounts by address
  const uniqueAccounts = accounts?.filter(
    (account, index, self) => index === self.findIndex((a) => a.address === account.address),
  );

  return (
    <div className="flex flex-col items-start gap-2">
      <Label>Select Account</Label>
      <Select
        onValueChange={(value) =>
          setActingAccountIdx(accounts?.findIndex((account) => account.address === value) ?? 0)
        }
        value={actingAccount?.address}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select Account" />
        </SelectTrigger>
        <SelectContent className="bg-black text-white w-[220px]">
          <SelectGroup>
            {uniqueAccounts?.map((account) => (
              <SelectItem key={account.address} value={account.address}>
                <Identicon value={account.address} size={32} theme="polkadot" />
                {account.meta?.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, Copy, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

const keys = {
  Home: 'TX9XD-98N7V-6WMQ6-BX7FG-H8Q99',
  'Home N': '3KHY7-WNT83-DGQKR-F7HPR-844BM',
  'Home Single Language': '7HNRX-D7KGG-3K4RQ-4WPJ4-YTDFH',
  'Home Country Specific': 'PVMJN-6DFY6-9CCP6-7BKTT-D3WVR',
  Pro: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
  'Pro N': 'MH37W-N47XK-V7XM9-C7227-GCQG9',
  Education: 'NW6C2-QMPVW-D7KKK-3GKT6-VCFB2',
  'Education N': '2WH4N-8QGBV-H22JP-CT43Q-MDWWJ',
  Enterprise: 'NPPR9-FWDCX-D2C8J-H872K-2YT43',
  'Enterprise N': 'DPH2V-TTNVB-4X9Q3-TJR4H-KHJW4',
} as const;

type KeyType = keyof typeof keys;

function AtWindows() {
  const [selectedKey, setSelectedKey] = useState<KeyType>('Pro');
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'Ativando!';
  }, []);

  const commands = [
    `cscript slmgr.vbs /ipk ${keys[selectedKey]}`,
    'cscript slmgr.vbs /skms kms8.msguides.com',
    'cscript slmgr.vbs /ato',
  ];

  const fullText = commands.join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const selectKey = (key: KeyType) => {
    setSelectedKey(key);
    setMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-zinc-900 px-4">
      <div className="relative w-full max-w-xl">
        <button
          onClick={toggleMenu}
          className="flex w-full items-center justify-between rounded-sm bg-zinc-800 p-2 font-mono text-sm text-green-600 shadow-md"
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          {selectedKey}: {keys[selectedKey]}
          <ChevronDown className="ml-2" />
        </button>

        {menuOpen && (
          <ul className="absolute z-10 mt-1 w-full rounded-sm border border-zinc-700 bg-zinc-800 font-mono text-sm text-green-600 shadow-lg">
            {(Object.keys(keys) as KeyType[]).map((key) => (
              <li
                key={key}
                className="cursor-pointer px-3 py-2 hover:bg-green-600 hover:text-zinc-900"
                onClick={() => selectKey(key)}
                role="menuitem"
              >
                {key}: {keys[key]}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="w-full max-w-xl rounded-sm bg-zinc-800 p-4 font-mono text-sm whitespace-pre-line text-green-600 shadow-xl">
        {commands.join('\n')}
      </div>

      <div className="flex w-full max-w-xl flex-col gap-4 sm:flex-row">
        <Button
          onClick={handleCopy}
          variant="default"
          className="flex-1 bg-green-600 text-white transition-colors hover:bg-green-700"
        >
          <Copy className="size-4" />
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>

        <a href="/maumau.cmd" download className="flex-1">
          <Button
            variant="default"
            className="w-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
          >
            <Download className="size-4" />
            Baixar
          </Button>
        </a>
      </div>
    </div>
  );
}

export default AtWindows;

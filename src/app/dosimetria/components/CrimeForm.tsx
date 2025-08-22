// components/CrimeForm.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FaTrash } from 'react-icons/fa';

interface CrimeFormProps {
  crime: any; // Use a interface Crime do arquivo page.tsx
  onChange: (id: number, field: string, value: any) => void;
  onRemove: (id: number) => void;
}

export default function CrimeForm({ crime, onChange, onRemove }: CrimeFormProps) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 rounded-lg border bg-slate-50 p-4 md:grid-cols-8 dark:bg-slate-900">
      {/* Inputs de Pena */}
      <div className="col-span-1 space-y-2 md:col-span-2">
        <Label>Pena Base</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Anos"
            value={crime.anos}
            onChange={(e) => onChange(crime.id, 'anos', parseInt(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Meses"
            value={crime.meses}
            onChange={(e) => onChange(crime.id, 'meses', parseInt(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Dias"
            value={crime.dias}
            onChange={(e) => onChange(crime.id, 'dias', parseInt(e.target.value))}
          />
        </div>
      </div>
      {/* Input Dias-Multa */}
      <div className="col-span-1 md:col-span-1">
        <Label>Dias-Multa</Label>
        <Input
          type="number"
          placeholder="Dias-multa"
          value={crime.diasMulta}
          onChange={(e) => onChange(crime.id, 'diasMulta', parseInt(e.target.value))}
        />
      </div>
      {/* Seletor de Operação */}
      <div className="col-span-1 md:col-span-1">
        <Label>Operação</Label>
        <Select
          value={crime.operacao}
          onValueChange={(value) => onChange(crime.id, 'operacao', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="+" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+">+</SelectItem>
            <SelectItem value="-">-</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Inputs de Fração */}
      <div className="col-span-1 md:col-span-2">
        <Label>Fração de Causa</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Numerador"
            value={crime.numerador}
            onChange={(e) => onChange(crime.id, 'numerador', parseInt(e.target.value))}
          />
          <span className="self-end pb-2">/</span>
          <Input
            type="number"
            placeholder="Denominador"
            value={crime.denominador}
            onChange={(e) => onChange(crime.id, 'denominador', parseInt(e.target.value))}
          />
        </div>
      </div>
      {/* Botão de Excluir */}
      <div className="col-span-1 self-end md:col-span-1">
        <Button variant="destructive" onClick={() => onRemove(crime.id)}>
          <FaTrash />
        </Button>
      </div>
    </div>
  );
}

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

interface Crime {
  id: number;
  anos: number;
  meses: number;
  dias: number;
  diasMulta: number; // Agora representa o valor em Reais
  operacao: '+' | '-';
  numerador: number;
  denominador: number;
}

interface CrimeFormProps {
  crime: Crime;
  onChange: (id: number, field: string, value: any) => void;
  onRemove: (id: number) => void;
}

export default function CrimeForm({ crime, onChange, onRemove }: CrimeFormProps) {
  return (
    <div className="mb-4 grid grid-cols-1 items-end gap-4 rounded-lg border bg-slate-50 p-4 md:grid-cols-12 dark:bg-slate-900">
      {/* Inputs de Pena */}
      <div className="col-span-1 space-y-2 md:col-span-4">
        <Label htmlFor={`pena-base-${crime.id}`}>Pena Base</Label>
        <div className="flex gap-2" id={`pena-base-${crime.id}`}>
          <Input
            type="number"
            placeholder="Anos"
            value={crime.anos > 0 ? crime.anos : ''}
            onChange={(e) => onChange(crime.id, 'anos', parseInt(e.target.value) || 0)}
          />
          <Input
            type="number"
            placeholder="Meses"
            value={crime.meses > 0 ? crime.meses : ''}
            onChange={(e) => onChange(crime.id, 'meses', parseInt(e.target.value) || 0)}
          />
          <Input
            type="number"
            placeholder="Dias"
            value={crime.dias > 0 ? crime.dias : ''}
            onChange={(e) => onChange(crime.id, 'dias', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
      {/* Input Multa (R$) */}
      <div className="col-span-1 md:col-span-2">
        <Label htmlFor={`multa-reais-${crime.id}`}>Multa (R$)</Label>
        <Input
          id={`multa-reais-${crime.id}`}
          type="number"
          placeholder="Valor em R$"
          value={crime.diasMulta > 0 ? crime.diasMulta : ''}
          onChange={(e) => onChange(crime.id, 'diasMulta', parseInt(e.target.value) || 0)}
        />
      </div>
      {/* Seletor de Operação */}
      <div className="col-span-1 md:col-span-1">
        <Label htmlFor={`operacao-${crime.id}`}>Op.</Label>
        <Select
          value={crime.operacao}
          onValueChange={(value) => onChange(crime.id, 'operacao', value)}
        >
          <SelectTrigger id={`operacao-${crime.id}`}>
            <SelectValue placeholder="+" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+">+</SelectItem>
            <SelectItem value="-">-</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Inputs de Fração (ordem invertida) */}
      <div className="col-span-1 md:col-span-3">
        <Label htmlFor={`fracao-${crime.id}`}>Fração</Label>
        <div className="flex items-center gap-2" id={`fracao-${crime.id}`}>
          <Input
            type="number"
            placeholder="Num"
            value={crime.numerador > 0 ? crime.numerador : ''}
            onChange={(e) => onChange(crime.id, 'numerador', parseInt(e.target.value) || 0)}
          />
          <span className="pb-1 text-xl">/</span>
          <Input
            type="number"
            placeholder="Den"
            value={crime.denominador > 0 ? crime.denominador : ''}
            onChange={(e) => onChange(crime.id, 'denominador', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
      <div className="col-span-1 md:col-span-2">
        <Button variant="destructive" onClick={() => onRemove(crime.id)} className="w-full">
          <FaTrash className="mr-2" /> Excluir
        </Button>
      </div>
    </div>
  );
}

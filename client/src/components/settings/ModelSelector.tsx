import { ModelOption } from '../../types';

interface ModelSelectorProps {
  models: ModelOption[];
  selected: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ models, selected, onChange }: ModelSelectorProps) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-dark-300 mb-1.5">
        Model AI
      </label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}

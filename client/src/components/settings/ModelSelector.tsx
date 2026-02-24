import { ModelOption } from '../../types';

interface ModelSelectorProps {
  models: ModelOption[];
  selected: string;
  onChange: (model: string) => void;
}

function formatCost(cost: number): string {
  if (cost < 0.01) return '<$0.01';
  return `~$${cost.toFixed(2)}`;
}

export function ModelSelector({ models, selected, onChange }: ModelSelectorProps) {
  const selectedModel = models.find((m) => m.id === selected);

  return (
    <div className="flex-1">
      <label htmlFor="model-selector" className="block text-sm font-medium text-dark-300 mb-1.5">
        Model AI
      </label>
      <select
        id="model-selector"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}{m.estimatedCost != null ? ` (${formatCost(m.estimatedCost)})` : ''}
          </option>
        ))}
      </select>
      {selectedModel?.estimatedCost != null && (
        <p className="text-[11px] text-dark-500 mt-1">
          Szacowany koszt analizy: {formatCost(selectedModel.estimatedCost)}
        </p>
      )}
    </div>
  );
}

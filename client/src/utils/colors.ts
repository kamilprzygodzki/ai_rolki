export const priorityColors = {
  high: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300',
  },
  low: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
  },
};

export const statusLabels: Record<string, string> = {
  idle: 'Gotowy',
  uploading: 'Przesyłanie...',
  processing_audio: 'Ekstrakcja audio...',
  transcribing: 'Transkrypcja...',
  analyzing: 'Analiza AI...',
  done: 'Gotowe',
  error: 'Błąd',
};

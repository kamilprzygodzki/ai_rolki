export function buildAnalysisPrompt(transcript: string, duration: number): string {
  const durationMin = Math.round(duration / 60);

  return `Jesteś ekspertem od tworzenia krótkich form wideo (Reels, Shorts, TikTok). Przeanalizuj poniższą transkrypcję nagrania wideo (${durationMin} min) i zaproponuj fragmenty idealne do przerobienia na rolki.

## Zasady:
1. Każda rolka powinna trwać 30-90 sekund
2. Szukaj momentów z silnym hookiem (zaskoczenie, kontrowersja, wartość, emocja)
3. Preferuj fragmenty, które są samodzielne — nie wymagają kontekstu
4. Oznacz priorytet: high (viralowy potencjał), medium (dobry content), low (filler, ale można użyć)
5. Podaj dokładne timecody w formacie MM:SS
6. Zaproponuj hooki — pierwsze 3 sekundy, które zatrzymają scrollowanie

## Format odpowiedzi (JSON):
\`\`\`json
{
  "summary": "Krótkie podsumowanie całego materiału (2-3 zdania)",
  "reels": [
    {
      "title": "Chwytliwy tytuł rolki",
      "hook": "Pierwsze zdanie/hook do zatrzymania uwagi",
      "start": "MM:SS",
      "end": "MM:SS",
      "duration": "Xs",
      "priority": "high|medium|low",
      "why": "Dlaczego ten fragment zadziała jako rolka",
      "script_outline": "Krótki zarys jak zmontować tę rolkę",
      "editing_tips": ["Tip montażowy 1", "Tip montażowy 2"],
      "hashtags": ["#hashtag1", "#hashtag2"]
    }
  ],
  "hooks": [
    "Propozycja hooka 1 — do użycia na początku rolki",
    "Propozycja hooka 2",
    "Propozycja hooka 3"
  ],
  "structure_notes": "Ogólne uwagi o strukturze materiału i potencjale na rolki"
}
\`\`\`

Odpowiedz TYLKO poprawnym JSON-em, bez dodatkowego tekstu.

## Transkrypcja:
${transcript}`;
}

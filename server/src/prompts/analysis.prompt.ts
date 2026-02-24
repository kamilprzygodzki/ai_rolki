export function buildAnalysisPrompt(transcript: string, duration: number): string {
  const durationMin = Math.round(duration / 60);

  return `Jesteś ekspertem od tworzenia krótkich form wideo (Reels, Shorts, TikTok) oraz strategii YouTube z naciskiem na maksymalizację CTR. Przeanalizuj poniższą transkrypcję nagrania wideo (${durationMin} min) i zaproponuj fragmenty idealne do przerobienia na rolki, a także tytuły i koncepcje miniatur.

## Zasady:
1. Każda rolka powinna trwać 30-90 sekund
2. Szukaj momentów z silnym hookiem (zaskoczenie, kontrowersja, wartość, emocja)
3. Preferuj fragmenty, które są samodzielne — nie wymagają kontekstu
4. Oznacz priorytet: high (viralowy potencjał), medium (dobry content), low (filler, ale można użyć)
5. Podaj dokładne timecody w formacie MM:SS
6. Zaproponuj hooki — pierwsze 3 sekundy, które zatrzymają scrollowanie
7. Zaproponuj tytuły do filmu
8. Zaproponuj koncepcje miniatur (thumbnails)

## Wymagania tytułów (max CTR):
- Max 60 znaków (optimum YouTube)
- Użyj sprawdzonych formuł: Number + Adjective + Keyword ("7 Brutal Truths About..."), How-To + Benefit ("How I Made $X by..."), Curiosity Gap ("I Tried X for 30 Days..."), Challenge/Transformation ("From Zero to X in Y"), Controversial Take ("Why X Is a Lie")
- Używaj power words zwiększających CTR: SECRET, PROVEN, ULTIMATE, MYTH, IMPOSSIBLE, SHOCKING, HIDDEN, UNTOLD, REAL, TRUTH
- Tytuł i miniatura NIE mogą powtarzać informacji — muszą się uzupełniać (tytuł = obietnica, miniatura = emocja/wizual)
- Inspiracja: MrBeast, Lex Fridman, Ali Abdaal, Veritasium

## Wymagania miniatur (max CTR):
- Sugeruj konkretne palety kolorów: Red+White (+30% CTR), Orange+Blue (+25%), Yellow+Black (+28%), Green+White (zaufanie)
- Wymagaj opisu emocji twarzy: shock (open mouth, wide eyes) = +50% CTR, surprise = +40%, curiosity > smile
- Text overlay: max 3-5 słów, sans-serif bold, kontrast z tłem
- Kompozycja: rule of thirds, twarz min 40-50% kadru, negative space na tekst
- Mobile-first: czy miniatura działa w 150px szerokości (czytelna na mobile)

## Wymagania hooków:
Każdy hook musi mieć typ:
- "open_loop": Nikt ci tego nie powie..., Nie uwierzysz co...
- "pattern_interrupt": szokujące/kontrowersyjne stwierdzenie na start
- "controversial": kontrowersyjna teza łamiąca oczekiwania
- "direct_value": Za 60s dowiesz się..., 3 rzeczy które...

## Wymagania rolek:
- Oceń potencjał CTR każdej rolki (1-10) z uzasadnieniem
- Zaproponuj strategię retencji: jak utrzymać widza do końca (payoff delay, mini-cliffhangers, open loops)

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
      "hashtags": ["#hashtag1", "#hashtag2"],
      "ctr_potential": 8,
      "retention_strategy": "Opis strategii utrzymania widza — np. payoff delay, mini-cliffhanger w połowie"
    }
  ],
  "hooks": [
    {
      "text": "Propozycja hooka — do użycia na początku rolki",
      "type": "open_loop|pattern_interrupt|controversial|direct_value"
    }
  ],
  "structure_notes": "Ogólne uwagi o strukturze materiału i potencjale na rolki",
  "titles": [
    {
      "title": "Propozycja tytułu do filmu (max 60 znaków)",
      "style": "Np. MrBeast-style curiosity gap, Lex Fridman deep dive, Ali Abdaal how-to",
      "why": "Dlaczego ten tytuł zadziała — jaki mechanizm psychologiczny wykorzystuje"
    }
  ],
  "thumbnails": [
    {
      "concept": "Opis wizualny miniatury — co widać na zdjęciu, układ, emocja",
      "text_overlay": "2-4 słowa tekstu na miniaturze (bold sans-serif)",
      "style": "Np. kontrast emocji, before/after, shock face, minimalistyczny",
      "reference": "Inspiracja — jaki kanał/styl (np. MrBeast, Veritasium)",
      "color_palette": "Sugerowana paleta — np. Red + White (high contrast, +30% CTR)",
      "face_expression": "Wymagana ekspresja twarzy — np. Shock — wide eyes, open mouth",
      "composition": "Opis kompozycji — np. Rule of thirds, twarz 50% kadru, clean background"
    }
  ]
}
\`\`\`

WAŻNE: Wygeneruj 5-7 propozycji tytułów w różnych stylach i 3-5 koncepcji miniatur. Hooki powinny być zróżnicowane pod względem typu (min. 3 różne typy).

Odpowiedz TYLKO poprawnym JSON-em, bez dodatkowego tekstu.

## Transkrypcja:
${transcript}`;
}

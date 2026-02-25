export function buildAnalysisPrompt(transcript: string, duration: number): string {
  const durationMin = Math.round(duration / 60);

  return `Jesteś ekspertem od tworzenia krótkich form wideo (Reels, Shorts, TikTok) oraz strategii YouTube z naciskiem na maksymalizację CTR. Jesteś RÓWNIEŻ doświadczonym montażystą wideo — znasz techniki cięć, pacing, B-roll, zoom, tekst overlay i muzykę. Przeanalizuj poniższą transkrypcję nagrania wideo (${durationMin} min) i zaproponuj fragmenty idealne do przerobienia na rolki, a także tytuły i koncepcje miniatur.

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
- Każdy tytuł MUSI mieć przypisaną platformę: "youtube", "tiktok" lub "instagram"
- Jeśli tytuł pasuje do konkretnej miniatury, podaj jej indeks (0-based) w paired_thumbnail_index
- Jeśli tytuł pasuje do konkretnego typu hooka, podaj go w paired_hook_type

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

## Instrukcja montażu per rolka (editing_guide):
Dla KAŻDEJ rolki wygeneruj obiekt editing_guide z:
- "pace": "fast" / "medium" / "slow" — ogólne tempo montażu
- "cuts": tablica cięć, każde z: timecode (MM:SS), type (jump_cut/hard_cut/j_cut/l_cut), description
- "broll_moments": tablica, każdy z: start (MM:SS), end (MM:SS), suggestion (co wstawić jako B-roll)
- "zoom_moments": tablica, każdy z: timecode (MM:SS), type (zoom_in/zoom_out/slow_zoom), reason
- "text_overlays": tablica, każdy z: timecode (MM:SS), text (tekst do wyświetlenia), style (lower_third/center/caption)
- "music_sync": string opisujący strategię muzyczną (tempo, gatunek, momenty drop/build-up)

## Warianty hooków per rolka (hook_variants):
Dla KAŻDEJ rolki wygeneruj 2-3 warianty hooka w polu hook_variants, każdy z:
- "text": tekst hooka
- "type": typ (open_loop/pattern_interrupt/controversial/direct_value)
- "visual_description": co widz widzi w pierwszych 3 sekundach
- "audio_description": co widz słyszy (muzyka, efekt dźwiękowy, cisza, głos)
- "first_3_seconds": szczegółowy scenariusz pierwszych 3 sekund (klatka po klatce)

## Mapa zaangażowania (engagement_map):
Wygeneruj pole "engagement_map" — tablicę segmentów opisujących poziom zaangażowania widza w czasie CAŁEGO materiału:
- "start": MM:SS
- "end": MM:SS
- "level": "peak" / "high" / "medium" / "low"
- "emotion": etykieta emocji (np. "ciekawość", "zaskoczenie", "nuda", "napięcie", "śmiech", "wow")
- "note": krótki opis co się dzieje w tym momencie
Segmenty powinny pokrywać cały materiał bez przerw. Min 5 segmentów.

## Predykcja retencji (retention_prediction):
Wygeneruj pole "retention_prediction" z:
- "estimated_avg_retention": szacowany % średniej retencji (0-100)
- "drop_points": tablica miejsc odpływu widzów, każde z: timecode (MM:SS), reason, severity (critical/moderate/minor)
- "peak_moments": tablica momentów szczytowych, każde z: timecode (MM:SS), reason

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
      "retention_strategy": "Opis strategii utrzymania widza",
      "editing_guide": {
        "pace": "fast|medium|slow",
        "cuts": [
          {"timecode": "MM:SS", "type": "jump_cut|hard_cut|j_cut|l_cut", "description": "opis cięcia"}
        ],
        "broll_moments": [
          {"start": "MM:SS", "end": "MM:SS", "suggestion": "co wstawić"}
        ],
        "zoom_moments": [
          {"timecode": "MM:SS", "type": "zoom_in|zoom_out|slow_zoom", "reason": "dlaczego"}
        ],
        "text_overlays": [
          {"timecode": "MM:SS", "text": "tekst", "style": "lower_third|center|caption"}
        ],
        "music_sync": "Opis strategii muzycznej"
      },
      "hook_variants": [
        {
          "text": "Tekst hooka",
          "type": "open_loop|pattern_interrupt|controversial|direct_value",
          "visual_description": "Co widz widzi",
          "audio_description": "Co widz słyszy",
          "first_3_seconds": "Scenariusz klatka po klatce"
        }
      ]
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
      "style": "Np. MrBeast-style curiosity gap",
      "why": "Dlaczego ten tytuł zadziała",
      "platform": "youtube|tiktok|instagram",
      "paired_thumbnail_index": 0,
      "paired_hook_type": "open_loop"
    }
  ],
  "thumbnails": [
    {
      "concept": "Opis wizualny miniatury",
      "text_overlay": "2-4 słowa tekstu na miniaturze",
      "style": "Np. kontrast emocji, before/after",
      "reference": "Inspiracja — jaki kanał/styl",
      "color_palette": "Sugerowana paleta",
      "face_expression": "Wymagana ekspresja twarzy",
      "composition": "Opis kompozycji"
    }
  ],
  "engagement_map": [
    {
      "start": "00:00",
      "end": "02:30",
      "level": "high|medium|low|peak",
      "emotion": "etykieta emocji",
      "note": "co się dzieje"
    }
  ],
  "retention_prediction": {
    "estimated_avg_retention": 65,
    "drop_points": [
      {"timecode": "MM:SS", "reason": "dlaczego widzowie odchodzą", "severity": "critical|moderate|minor"}
    ],
    "peak_moments": [
      {"timecode": "MM:SS", "reason": "dlaczego widzowie zostają"}
    ]
  }
}
\`\`\`

WAŻNE: Wygeneruj 5-7 propozycji tytułów w różnych stylach i 3-5 koncepcji miniatur. Hooki powinny być zróżnicowane pod względem typu (min. 3 różne typy). Tytuły powinny obejmować WSZYSTKIE platformy (YouTube, TikTok, Instagram). Engagement map MUSI pokrywać cały materiał.

Odpowiedz TYLKO poprawnym JSON-em, bez dodatkowego tekstu.

## Transkrypcja:
${transcript}`;
}

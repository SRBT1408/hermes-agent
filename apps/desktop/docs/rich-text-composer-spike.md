# Rich Text Composer Spike

## Ziel des Spikes

Validieren, wie wir den Desktop-Composer von Plain-Text zu einem WYSIWYG-/Rich-Text-Composer erweitern können, ohne bestehende Chat-Workflows, Slash-Commands, Attachments und Keyboard-UX zu beschädigen.

## Problem

Der aktuelle Composer ist stark auf Plain-Text-Verhalten optimiert. Ein Rich-Text-Composer muss Formatierung, Selektion, Copy/Paste, Keyboard-Handling, Markdown-/HTML-Interoperabilität und bestehende Hermes-spezifische Trigger sauber unterstützen.

## Evaluationsoptionen

### Option A: Bestehenden Editor ausbauen
- Rich-Text-Verhalten direkt auf dem bestehenden Composer ergänzen
- Vorteil: maximale Kontrolle, geringere Abhängigkeit
- Nachteil: hohes Risiko bei Selektion, IME, Paste, Undo/Redo und langfristiger Wartbarkeit

### Option B: Rich-Text-Framework integrieren
- Framework wie Lexical, ProseMirror/Tiptap oder Slate evaluieren
- Vorteil: etablierte Primitive für Selection, Schema, Plugins, History und Paste
- Nachteil: Integrationsaufwand, Bundle-/API-Kosten, Anpassung an Hermes-Composer-Features

## Betroffene Dateien

Erste Prüfpfade im Desktop-Client:
- `apps/desktop/src/app/chat/composer/`
- `apps/desktop/src/store/composer.js`
- `apps/desktop/src/store/composer-status.js`
- `apps/desktop/src/components/chat/composer-dock.js`

## MVP-Scope

- Basis-Rich-Text-Eingabe im Composer
- Fett, Kursiv, Inline-Code
- Sauberes Plain-Text-/Markdown-Fallback beim Senden
- Copy/Paste ohne Datenverlust für einfache Formatierung
- Keine Block-Layouts, Tabellen oder komplexen Embeds im ersten Schritt

## Risiken

- Regressionen bei Enter/Shift+Enter, Slash-Commands und @-Referenzen
- IME-/Accessibility-/Selection-Bugs
- Inkonsistenz zwischen internem Rich-Text-State und gesendetem Textformat
- Mehr Aufwand für Tests rund um Keyboard-, Paste- und Focus-Handling

## Entscheidungskriterien

- Geringstes Risiko für bestehende Composer-Workflows
- Gute Testbarkeit der Kerninteraktionen
- Klare Datenmodell-/Serialization-Story
- Erweiterbarkeit für spätere Features wie Listen, Links und Embeds
- Akzeptabler Integrationsaufwand im Desktop-Bundle

## Nächste Schritte

1. Bestehende Composer-Datenflüsse und Submit-Pipeline kartieren
2. 2-3 Framework-Kandidaten gegen bestehende Anforderungen vergleichen
3. Minimalen Prototyp für Formatierung + Send/Fallback bauen
4. Entscheidung dokumentieren und Implementierungsplan für das MVP ableiten

# Rich-Text Composer Spike Plan

- Issue: #64248
- Branch: `spike/desktop-rich-text-composer`
- Status: Spike / Entscheidungsgrundlage

## Ziel des Spikes

Vor einer Implementierung belastbar klären, wie der Desktop-Composer zu einem WYSIWYG-/Rich-Text-Composer erweitert werden kann, ohne bestehende Text-, Slash-, `@ref`-, Attachment- und Submit-Flows zu destabilisieren.

## Problem

Der aktuelle Composer nutzt bereits eine eigene `contenteditable`-basierte Rich-Input-Schicht, serialisiert aber weiterhin auf Plain-Text mit Chips für Direktiven und Referenzen. Für echtes Rich Text Editing fehlen klare Entscheidungen zu:

- Datenmodell und Serialisierung
- Toolbar-/Formatting-UX
- Interop mit bestehenden Triggern (`/`, `@`)
- Copy/Paste, Selection und Undo/Redo
- Risiko und Migrationsaufwand gegenüber der bestehenden Eigenlösung

## Eval-Optionen

### Option A — Bestehenden Editor ausbauen

Die vorhandene `contenteditable`-Implementierung gezielt um Rich-Text-Markup, Toolbar-Aktionen und Rendering-Regeln erweitern.

**Vorteile**
- Maximale Wiederverwendung bestehender Composer-Logik
- Keine harte Framework-Migration
- Volle Kontrolle über Hermes-spezifische Chips, Trigger und Submit-Verhalten

**Nachteile**
- Höheres Risiko bei Selection-/DOM-Kantenfällen
- Formatting-, Paste- und Undo-Logik muss weitgehend selbst getragen werden
- Langfristig potenziell höhere Wartungskosten

### Option B — Rich-Text-Framework einführen

Ein etabliertes Framework evaluieren (z. B. Lexical, ProseMirror/Tiptap, Slate) und Hermes-spezifische Composer-Features darauf abbilden.

**Vorteile**
- Reiferes Datenmodell für Markup, Selection und History
- Bessere Basis für Toolbar, Shortcuts und strukturierte Rich-Text-Features
- Wahrscheinlich robuster bei komplexem Editing

**Nachteile**
- Migrations- und Integrationsaufwand
- Trigger-/Chip-Interop muss neu angepasst werden
- Zusätzliche Bundle-/Abhängigkeitskosten

## Betroffene Dateien / Bereiche

Bestehende Integrationspunkte, die im Spike betrachtet werden sollten:

- `apps/desktop/src/app/chat/composer/index.tsx`
- `apps/desktop/src/app/chat/composer/rich-editor.ts`
- `apps/desktop/src/app/chat/composer/text-utils.ts`
- `apps/desktop/src/app/chat/composer/trigger-popover.tsx`
- `apps/desktop/src/app/chat/composer/hooks/use-composer-submit.ts`
- `apps/desktop/src/app/chat/composer/hooks/use-at-completions.ts`
- `apps/desktop/src/app/chat/composer/hooks/use-slash-completions.ts`
- `apps/desktop/src/components/assistant-ui/thread/user-edit-composer.tsx`
- `apps/desktop/src/components/chat/composer-dock.ts`
- `apps/desktop/src/store/composer.ts`

## MVP-Scope für den Spike

Der Spike soll **noch kein Production-Build** liefern, sondern Antworten mit kleinstmöglichem Prototyping erzeugen:

1. Ziel-Dokumentmodell definieren: Plain text + decorations vs. strukturierter Rich-Text-State
2. Zwei Wege vergleichen:
   - bestehende Editor-Schicht erweitern
   - ein Rich-Text-Framework integrieren
3. Nachweisen, wie folgende Kernflows funktionieren würden:
   - fett / kursiv / inline code
   - Paste aus externen Quellen
   - `@ref`-Chips und Slash-Kommandos
   - Submit als erwarteter Prompt-Text / serialisierte Payload
4. Risiken für Selection, Undo/Redo, IME und Keyboard-Navigation dokumentieren

## Risiken

- `contenteditable`-DOM und Selection-Handling bleiben fehleranfällig
- Framework-Migration kann bestehende Composer-Hooks stark berühren
- Serialisierung zurück in Hermes-Prompt-Text könnte Rich-Text-Information verlieren
- `@ref`-Chips, Attachments und Trigger-Popovers sind stark in den aktuellen Editorfluss eingebettet
- Edit-Composer und Haupt-Composer müssen dieselbe Architektur tragen

## Entscheidungskriterien

Eine Option ist nur dann Spike-Sieger, wenn sie die folgenden Kriterien besser erfüllt:

1. **Interop:** `@ref`, Slash-Kommandos, Attachments und Submit bleiben zuverlässig integrierbar
2. **Editing-Robustheit:** Selection, Paste, Undo/Redo und IME zeigen keine offensichtlichen Blocker
3. **Serialisierung:** Ein klarer und testbarer Weg zwischen Editor-State und Hermes-Payload ist definiert
4. **Komplexität:** Implementierungs- und Wartungskosten bleiben vertretbar
5. **Incremental Rollout:** Einführung ist ohne Big-Bang-Rewrite möglich
6. **Testbarkeit:** Kritische Flows lassen sich mit sinnvollen DOM-/Integrationstests absichern

## Nächste Schritte

1. Aktuelle Composer-Invarianten und Hot Paths schriftlich festhalten
2. 1 kleinen Ausbau-Prototypen auf Basis des bestehenden Editors bauen
3. 1 kleinen Framework-Prototypen mit denselben Kernflows bauen
4. Beide Prototypen entlang der Entscheidungskriterien vergleichen
5. Danach Architekturentscheidung und MVP-Umsetzungsplan festziehen

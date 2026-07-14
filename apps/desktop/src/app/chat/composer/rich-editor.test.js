import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { insertInlineRefsIntoEditor } from './inline-refs';
import { applyInlineFormat, composerPlainText, deleteSelectionInEditor, insertPlainTextAtCaret, normalizeComposerEditorDom, refChipElement, renderComposerContents, RICH_INPUT_SLOT } from './rich-editor';
const caretIn = (editor) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
};
afterEach(() => {
    cleanup();
});
describe('renderComposerContents', () => {
    it('renders refs and raw text without interpreting user text as HTML', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        renderComposerContents(editor, '@file:`<img src=x onerror=alert(1)>` <b>raw</b>');
        expect(editor.querySelector('img')).toBeNull();
        expect(editor.querySelector('b')).toBeNull();
        expect(editor.textContent).toContain('<img src=x onerror=alert(1)>');
        expect(editor.textContent).toContain('<b>raw</b>');
        expect(composerPlainText(editor)).toBe('@file:`<img src=x onerror=alert(1)>` <b>raw</b>');
    });
    it('renders basic markdown fences as visible inline formatting', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        renderComposerContents(editor, 'plain **bold** *italic* `code`');
        expect(editor.querySelector('strong')?.textContent).toBe('bold');
        expect(editor.querySelector('em')?.textContent).toBe('italic');
        expect(editor.querySelector('code')?.textContent).toBe('code');
        expect(composerPlainText(editor)).toBe('plain **bold** *italic* `code`');
    });
});
describe('normalizeComposerEditorDom', () => {
    it('unwraps a single insertHTML wrapper div so plain text stays one line', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        editor.innerHTML = '<div><span data-ref-text="@file:`src/foo.ts`" contenteditable="false">foo.ts</span> </div>';
        normalizeComposerEditorDom(editor);
        expect(composerPlainText(editor)).toBe('@file:`src/foo.ts` ');
        expect(editor.querySelector(':scope > div')).toBeNull();
    });
    it('removes a trailing br after a ref chip', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        editor.append(refChipElement('file', '`src/foo.ts`'), document.createElement('br'));
        normalizeComposerEditorDom(editor);
        expect(composerPlainText(editor)).toBe('@file:`src/foo.ts`');
        expect(editor.querySelector('br')).toBeNull();
    });
});
describe('insertInlineRefsIntoEditor', () => {
    it('inserts chips without wrapper divs or spurious newlines', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        insertInlineRefsIntoEditor(editor, ['@file:`src/foo.ts`']);
        expect(editor.querySelector(':scope > div')).toBeNull();
        expect(composerPlainText(editor)).toBe('@file:`src/foo.ts` ');
    });
});
describe('insertPlainTextAtCaret', () => {
    it('inserts multiline text as text nodes + br', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        document.body.append(editor);
        caretIn(editor);
        insertPlainTextAtCaret(editor, 'one\ntwo\nthree');
        expect(editor.querySelectorAll('br').length).toBe(2);
        expect(composerPlainText(editor)).toBe('one\ntwo\nthree');
        editor.remove();
    });
    it('replaces the selected span', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        editor.textContent = 'abXYef';
        document.body.append(editor);
        const text = editor.firstChild;
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(text, 2);
        range.setEnd(text, 4);
        selection.removeAllRanges();
        selection.addRange(range);
        insertPlainTextAtCaret(editor, 'cd');
        expect(composerPlainText(editor)).toBe('abcdef');
        editor.remove();
    });
});
describe('deleteSelectionInEditor', () => {
    it('clears a non-collapsed range and leaves a collapsed caret', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        editor.textContent = 'hello world';
        document.body.append(editor);
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        selection.removeAllRanges();
        selection.addRange(range);
        expect(deleteSelectionInEditor(editor)).toBe(true);
        expect(composerPlainText(editor)).toBe('');
        expect(selection.getRangeAt(0).collapsed).toBe(true);
        expect(deleteSelectionInEditor(editor)).toBe(false);
        editor.remove();
    });
});
describe('applyInlineFormat', () => {
    it('wraps the current selection and serializes it back to markdown', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        editor.textContent = 'hello world';
        document.body.append(editor);
        const text = editor.firstChild;
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(text, 6);
        range.setEnd(text, 11);
        selection.removeAllRanges();
        selection.addRange(range);
        expect(applyInlineFormat(editor, 'bold')).toBe(true);
        expect(editor.querySelector('strong')?.textContent).toBe('world');
        expect(composerPlainText(editor)).toBe('hello **world**');
        editor.remove();
    });
    it('inserts stable markdown markers with the placeholder selected for an empty selection', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        document.body.append(editor);
        caretIn(editor);
        expect(applyInlineFormat(editor, 'bold')).toBe(true);
        expect(composerPlainText(editor)).toBe('**bold**');
        const selection = window.getSelection();
        expect(selection?.toString()).toBe('bold');
        selection.getRangeAt(0).deleteContents();
        selection.getRangeAt(0).insertNode(document.createTextNode('Hallo'));
        expect(composerPlainText(editor)).toBe('**Hallo**');
        editor.remove();
    });
    it('keeps empty-selection inline code replacement to one fenced span', () => {
        const editor = document.createElement('div');
        editor.dataset.slot = RICH_INPUT_SLOT;
        document.body.append(editor);
        caretIn(editor);
        expect(applyInlineFormat(editor, 'code')).toBe(true);
        expect(composerPlainText(editor)).toBe('`code`');
        const selection = window.getSelection();
        expect(selection?.toString()).toBe('code');
        selection.getRangeAt(0).deleteContents();
        selection.getRangeAt(0).insertNode(document.createTextNode('Testcode'));
        expect(composerPlainText(editor)).toBe('`Testcode`');
        editor.remove();
    });
});

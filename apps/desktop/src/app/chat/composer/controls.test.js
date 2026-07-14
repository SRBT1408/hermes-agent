import { jsx as _jsx } from "react/jsx-runtime";
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/i18n';
import { ComposerControls } from './controls';
vi.mock('@/lib/haptics', () => ({ triggerHaptic: vi.fn() }));
vi.mock('./model-pill', () => ({
    ModelPill: () => _jsx("div", { "data-testid": "model-pill" })
}));
afterEach(cleanup);
const baseProps = {
    autoSpeak: false,
    busy: false,
    busyAction: 'stop',
    canSteer: false,
    canSubmit: true,
    compactModelPill: false,
    conversation: {
        active: false,
        level: 0,
        muted: false,
        onEnd: vi.fn(),
        onStart: vi.fn(),
        onStopTurn: vi.fn(),
        onToggleMute: vi.fn(),
        status: 'idle',
        toggleMute: vi.fn()
    },
    disabled: false,
    formatControls: {
        onBold: vi.fn(),
        onCode: vi.fn(),
        onItalic: vi.fn()
    },
    hasComposerPayload: true,
    onDictate: vi.fn(),
    onSteer: vi.fn(),
    onToggleAutoSpeak: vi.fn(),
    state: {
        model: { modelMenuContent: null },
        voice: { active: false, enabled: true }
    },
    voiceStatus: 'idle'
};
function renderControls(props = {}) {
    return render(_jsx(I18nProvider, { configClient: null, initialLocale: "en", children: _jsx(ComposerControls, { ...baseProps, ...props }) }));
}
describe('ComposerControls formatting actions', () => {
    it('renders visible bold, italic, and inline-code buttons', () => {
        renderControls();
        expect(screen.getByRole('button', { name: 'Bold' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Italic' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Inline code' })).toBeTruthy();
    });
    it('calls the matching callback when a formatting button is clicked', () => {
        const onBold = vi.fn();
        const onItalic = vi.fn();
        const onCode = vi.fn();
        renderControls({ formatControls: { onBold, onCode, onItalic } });
        fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
        fireEvent.click(screen.getByRole('button', { name: 'Italic' }));
        fireEvent.click(screen.getByRole('button', { name: 'Inline code' }));
        expect(onBold).toHaveBeenCalledTimes(1);
        expect(onItalic).toHaveBeenCalledTimes(1);
        expect(onCode).toHaveBeenCalledTimes(1);
    });
});

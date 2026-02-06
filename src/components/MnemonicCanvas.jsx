import React, { useState, useCallback, useRef } from 'react';

/**
 * Interactive overlay on the DALL-E image: hotspots for active retrieval.
 * Hover shows tooltip; click toggles persistent reveal; Show all labels toggles all.
 */
export function MnemonicCanvas({
  imageUrl,
  hotspots = [],
  accentColor = '#EC4899',
  /** When set, only these hotspot ids show labels (narrative walkthrough). */
  narrativeRevealIds = null,
  /** When set, this hotspot gets a highlight ring (current beat). */
  narrativeHighlightId = null,
  /** Called when user reveals a hotspot (clicks to show); used for "studied" tracking. */
  onRevealChange = null,
}) {
  const [revealed, setRevealed] = useState(new Set());
  const [hoverId, setHoverId] = useState(null);
  const [labelsVisible, setLabelsVisible] = useState(false);

  const isNarrativeMode = Array.isArray(narrativeRevealIds);

  const showLabel = useCallback(
    (id) => {
      if (isNarrativeMode) return narrativeRevealIds.includes(id);
      return labelsVisible || revealed.has(id) || hoverId === id;
    },
    [isNarrativeMode, narrativeRevealIds, labelsVisible, revealed, hoverId]
  );
  const isHighlighted = useCallback(
    (id) => narrativeHighlightId === id,
    [narrativeHighlightId]
  );

  const toggleReveal = (id) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        if (typeof onRevealChange === 'function') onRevealChange(id);
      }
      return next;
    });
  };

  const overlayRef = useRef(null);
  const handleOverlayKeyDown = (e) => {
    const { key } = e;
    if (key !== 'ArrowRight' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowUp') return;
    const el = overlayRef.current;
    if (!el) return;
    const buttons = el.querySelectorAll('button[type="button"]');
    if (!buttons.length) return;
    const current = document.activeElement;
    const idx = current && buttons.length ? Array.from(buttons).indexOf(current) : -1;
    if (idx === -1) return;
    e.preventDefault();
    const nextIdx = key === 'ArrowRight' || key === 'ArrowDown'
      ? Math.min(idx + 1, buttons.length - 1)
      : Math.max(idx - 1, 0);
    buttons[nextIdx]?.focus();
  };

  if (!imageUrl) return null;

  return (
    <div className="w-full">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
        <img
          src={imageUrl}
          alt="Mnemonic scene"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {hotspots.map((h) => (
              <g key={h.id}>
                {isHighlighted(h.id) && (
                  <circle
                    cx={h.xPercent}
                    cy={h.yPercent}
                    r="5"
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="1.5"
                    opacity="0.85"
                    style={{ animation: 'narrative-pulse 1.2s ease-in-out infinite' }}
                  />
                )}
                {/* Soft shadow layer for depth */}
                <circle
                  cx={h.xPercent}
                  cy={h.yPercent}
                  r="3.2"
                  fill="rgba(0,0,0,0.15)"
                  style={{ filter: 'blur(0.5px)' }}
                />
                {/* Main bead: smaller, semi-transparent, 3D-ish */}
                <circle
                  cx={h.xPercent}
                  cy={h.yPercent}
                  r="2.8"
                  fill={showLabel(h.id) ? accentColor : 'rgba(255,255,255,0.75)'}
                  fillOpacity={showLabel(h.id) ? 0.92 : 1}
                  stroke={isHighlighted(h.id) ? accentColor : 'rgba(255,255,255,0.9)'}
                  strokeWidth={isHighlighted(h.id) ? 1.5 : 0.8}
                  style={{
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  }}
                />
              </g>
          ))}
        </svg>
        {/* Clickable overlay: smaller, glass-like hit targets; arrow keys move focus */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-[2]"
          style={{ pointerEvents: 'auto' }}
          onKeyDown={handleOverlayKeyDown}
        >
          <div className="relative w-full h-full">
            {hotspots.map((h, idx) => {
              const spotLabel = idx === 0 ? '★' : String(idx);
              return (
                <button
                  key={h.id}
                  type="button"
                  className="absolute w-10 h-10 rounded-full -translate-x-1/2 -translate-y-1/2 border border-white/80 transition-all duration-200 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500 bg-white/25 hover:bg-white/55 hover:scale-110 active:scale-95 flex items-center justify-center"
                  style={{
                    left: `${h.xPercent}%`,
                    top: `${h.yPercent}%`,
                    boxShadow:
                      '0 1px 3px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
                  }}
                  onMouseEnter={() => setHoverId(h.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => toggleReveal(h.id)}
                  aria-label={showLabel(h.id) ? h.label : 'Reveal'}
                >
                  <span className="text-[10px] font-bold text-gray-700 drop-shadow-sm pointer-events-none" aria-hidden>
                    {spotLabel}
                  </span>
                  <span className="sr-only">{h.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Tooltip / reveal popover */}
        {hotspots.map((h, idx) => {
          const spotLabel = idx === 0 ? '★' : String(idx);
          const titlePrefix = idx === 0 ? '★ ' : `${spotLabel}. `;
          return showLabel(h.id) ? (
            <div
              key={h.id}
              className="absolute z-[3] max-w-[85%] rounded-lg border-2 shadow-xl p-2 text-sm bg-white pointer-events-none"
              style={{
                left: `${h.xPercent}%`,
                top: `${h.yPercent}%`,
                transform: `translate(-50%, ${h.yPercent > 60 ? '-100%' : '0'}) translateY(${h.yPercent > 60 ? '-8px' : '8px'})`,
                borderColor: accentColor,
              }}
            >
              <p className="font-semibold text-gray-900">
                <span className="text-gray-500 font-normal">{titlePrefix}</span>
                {h.label}
              </p>
              {h.mnemonicLogic && String(h.mnemonicLogic).trim() !== String(h.label || '').trim() && (
                <p className="text-xs text-blue-600 mt-0.5">{h.mnemonicLogic}</p>
              )}
            </div>
          ) : null;
        })}
      </div>
      {/* Show all labels — below image (hidden during narrative). Hide also clears per-spot reveals. */}
      {!isNarrativeMode && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLabelsVisible((v) => {
                if (v) setRevealed(new Set());
                return !v;
              });
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border-2 border-gray-300 shadow hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            {labelsVisible ? 'Hide labels' : 'Show all labels'}
          </button>
        </div>
      )}
    </div>
  );
}

export default MnemonicCanvas;

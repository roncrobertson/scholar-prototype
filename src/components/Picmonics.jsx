import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Bot, Volume2, ChevronDown, Cog, MapPin, ArrowRight, Tag, Box, Lock, Plus, Minus, Shield, Radio, Check } from 'lucide-react';
import { StudyAideIcon } from '../utils/studyAideIcons';
import {
  getPicmonicsForCourse,
  getConceptsWithPicmonics,
  getPicmonicsForConcept,
  getMnemonicImageUrl,
  getMnemonicArtifact,
} from '../data/picmonics';
import { getDecomposition } from '../data/conceptDecompositions';
import { toCanonicalArtifact, getDisplayHotspots } from '../data/canonicalArtifact';
import { runPipeline } from '../services/mnemonicPipeline';
import { generateMnemonicImage } from '../services/imageGeneration';
import { getHotspotPositionsFromImage } from '../services/hotspotFromImage';
import { buildScenePrompt, buildScenePromptWithLLM } from '../services/promptEngineer';
import { MnemonicCanvas } from './MnemonicCanvas';
import { getEncodingChecklist } from '../utils/encodingChecklist';
import { exportValidationReport } from '../utils/visualMnemonicEngineValidation';
import { addPostImageRecord, recordPostImageOutcome, exportPostImageRecordsJson } from '../utils/postImageCheckStore';
import { sanitizeLearnerFacingText } from '../utils/learnerFacingText';
import { recordStudied, getDueForReview } from '../services/spacedReview';
import { recordStudyActivity } from '../utils/studyStats';
import { getSavedVariant, setSavedVariant } from '../utils/savedVariant';
import { suggestAnchor } from '../services/anchorSuggestion';

/** Attribute type → { color, icon } for legend pills. */
const ATTRIBUTE_TYPE_STYLE = {
  mechanism: { color: '#2563eb', Icon: Cog },
  inhibition: { color: '#2563eb', Icon: Lock },
  synthesis: { color: '#2563eb', Icon: Plus },
  breakdown: { color: '#2563eb', Icon: Minus },
  location: { color: '#059669', Icon: MapPin },
  structure: { color: '#059669', Icon: Box },
  class: { color: '#7c3aed', Icon: Tag },
  effect: { color: '#d97706', Icon: ArrowRight },
  side_effect: { color: '#d97706', Icon: ArrowRight },
  increase: { color: '#d97706', Icon: ArrowRight },
  decrease: { color: '#d97706', Icon: ArrowRight },
  receptor: { color: '#0d9488', Icon: Radio },
  enzyme: { color: '#0d9488', Icon: Cog },
  resistance: { color: '#6b7280', Icon: Shield },
  exception: { color: '#6b7280', Icon: Tag },
  spectrum: { color: '#6b7280', Icon: Tag },
};

function getAttributeTypeStyle(type) {
  if (!type) return null;
  const key = (type || '').toLowerCase().replace(/\s+/g, '_');
  return ATTRIBUTE_TYPE_STYLE[key] || { color: '#6b7280', Icon: Tag };
}

const LOADING_MESSAGES = [
  'Building your scene…',
  'Sketching the anchor…',
  'Adding memorable details…',
  'Making it stick…',
  'Almost there…',
];
const LOADING_MESSAGE_INTERVAL_MS = 2800;

/** Derive a short key term from full fact text (first phrase before " — " or ": " or first ~50 chars). */
function keyTermFromFact(factText) {
  if (!factText || typeof factText !== 'string') return '';
  const trimmed = factText.trim();
  const beforeDash = trimmed.split(/\s+—\s+/)[0]?.trim();
  const beforeColon = trimmed.split(/\s*:\s+/)[0]?.trim();
  if (beforeDash && beforeDash.length < trimmed.length && beforeDash.length <= 60) return beforeDash;
  if (beforeColon && beforeColon.length < trimmed.length && beforeColon.length <= 60) return beforeColon;
  if (trimmed.length <= 55) return trimmed;
  const firstPhrase = trimmed.slice(0, 55).replace(/\s+\S+$/, '').trim();
  return firstPhrase ? firstPhrase + '…' : trimmed.slice(0, 50) + '…';
}

/**
 * Picmonics - Visual mnemonic engine: decomposition → phonetic anchor → symbol map → retrieval.
 * Learning mode: full labels. Retrieval mode: hide labels, tap symbol to reveal fact.
 */
export function Picmonics({ course, onExit, onAskTutor }) {
  const [selectedConceptId, setSelectedConceptId] = useState(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageStatus, setImageStatus] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [transcriptPlaying, setTranscriptPlaying] = useState(false);
  const [expandLegend, setExpandLegend] = useState(true);
  const [audioMenuOpen, setAudioMenuOpen] = useState(false);
  const [studiedHotspotIds, setStudiedHotspotIds] = useState(() => new Set());
  const [pipelineArtifact, setPipelineArtifact] = useState(null);
  const [createFromTextOpen, setCreateFromTextOpen] = useState(false);
  const [createFromTextInput, setCreateFromTextInput] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);
  const [lastPostImageRecordId, setLastPostImageRecordId] = useState(null);
  const [postImageFeedbackGiven, setPostImageFeedbackGiven] = useState(false);
  const [showOnboardingTip, setShowOnboardingTip] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && !localStorage.getItem('scholar-onboarding-picmonics');
    } catch {
      return false;
    }
  });
  const [focusedHotspotId, setFocusedHotspotId] = useState(null);
  const [resolvedHotspotPositions, setResolvedHotspotPositions] = useState(null);

  const concepts = getConceptsWithPicmonics(course);
  const dueForReview = useMemo(
    () => (course?.id ? getDueForReview(course.id, 'picmonics') : []),
    [course?.id]
  );
  const dueConceptIds = useMemo(() => new Set(dueForReview.map((d) => d.conceptId)), [dueForReview]);
  const conceptsToShow = useMemo(
    () => (filterDueOnly ? concepts.filter((c) => dueConceptIds.has(c.concept_id)) : concepts),
    [concepts, filterDueOnly, dueConceptIds]
  );
  const mnemonicsForConcept = selectedConceptId
    ? getPicmonicsForConcept(course, selectedConceptId)
    : [];
  const currentMnemonic = mnemonicsForConcept[variantIndex] || null;
  const libraryArtifact = useMemo(
    () => (currentMnemonic ? getMnemonicArtifact(currentMnemonic) : null),
    [currentMnemonic?.id]
  );
  const artifact = pipelineArtifact || libraryArtifact;
  const effectiveMnemonic = pipelineArtifact
    ? { concept_id: selectedConceptId || 'pipeline', title: pipelineArtifact.concept }
    : currentMnemonic;
  const canonical = useMemo(
    () => (artifact && effectiveMnemonic ? toCanonicalArtifact(effectiveMnemonic, artifact) : null),
    [artifact, effectiveMnemonic]
  );
  const hotspots = useMemo(
    () => (canonical ? getDisplayHotspots(canonical, resolvedHotspotPositions) : []),
    [canonical, resolvedHotspotPositions]
  );
  const hasMultipleVariants = mnemonicsForConcept.length > 1;
  const courseLabel = course?.code || 'All Courses';
  const courseColor = course?.color || '#EC4899';

  // Load studied hotspots from localStorage when viewing a concept
  useEffect(() => {
    const cid = course?.id;
    const conceptId = selectedConceptId;
    if (!cid || !conceptId || typeof localStorage === 'undefined') return;
    try {
      const key = `scholar-picmonics-studied-${cid}-${conceptId}`;
      const raw = localStorage.getItem(key);
      const ids = raw ? JSON.parse(raw) : [];
      setStudiedHotspotIds(Array.isArray(ids) ? new Set(ids) : new Set());
    } catch (_) {
      setStudiedHotspotIds(new Set());
    }
  }, [course?.id, selectedConceptId]);

  const handleHotspotReveal = useCallback((hotspotId) => {
    setStudiedHotspotIds((prev) => {
      const next = new Set(prev);
      next.add(hotspotId);
      const cid = course?.id;
      const conceptId = selectedConceptId;
      if (cid && conceptId && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`scholar-picmonics-studied-${cid}-${conceptId}`, JSON.stringify([...next]));
        } catch (_) {}
      }
      return next;
    });
  }, [course?.id, selectedConceptId]);

  // Cycle fun loading messages while image is generating
  useEffect(() => {
    if (!imageLoading) return;
    setLoadingMessageIndex(0);
    const t = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, LOADING_MESSAGE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [imageLoading]);

  const handleSelectConcept = (conceptId) => {
    setPipelineArtifact(null);
    setSelectedConceptId(conceptId);
    setStudiedHotspotIds(new Set());
    const saved = course?.id && conceptId ? getSavedVariant(course.id, conceptId) : null;
    setVariantIndex(saved !== null ? saved : 0);
    setGeneratedImageUrl(null);
    setResolvedHotspotPositions(null);
    setLastPostImageRecordId(null);
    setPostImageFeedbackGiven(false);
    setImageError(null);
    setTranscriptPlaying(false);
    if (course?.id && conceptId) {
      recordStudied(course.id, conceptId, 'picmonics');
      recordStudyActivity();
    }
  };
  const handleGenerateImage = async () => {
    if (!artifact?.anchor?.object) return;
    setImageLoading(true);
    setImageError(null);
    setImageStatus('Building your scene…');
    const useLLM = !!import.meta.env.VITE_OPENAI_API_KEY;
    const prompt = useLLM
      ? await buildScenePromptWithLLM(artifact)
      : buildScenePrompt(artifact);
    const result = await generateMnemonicImage(prompt, (status) => setImageStatus(status));
    setImageLoading(false);
    setImageStatus(null);
    if (result.url) {
      setGeneratedImageUrl(result.url);
      setResolvedHotspotPositions(null);
      const recordId = addPostImageRecord({
        concept_id: effectiveMnemonic?.concept_id ?? undefined,
        concept_title: artifact?.concept || 'Unknown',
        prompt,
        image_url: result.url,
      });
      setLastPostImageRecordId(recordId);
      setPostImageFeedbackGiven(false);
      // Vision-based hotspot placement: same API key as DALL·E; fallback to zone-based if it fails
      getHotspotPositionsFromImage(result.url, artifact).then((positions) => {
        setResolvedHotspotPositions(positions ?? null);
      });
    }
    if (result.error) setImageError(result.error);
    setTranscriptPlaying(false);
  };
  const handleBackToConcepts = () => {
    setPipelineArtifact(null);
    setSelectedConceptId(null);
    setVariantIndex(0);
    setCreateFromTextOpen(false);
    setCreateFromTextInput('');
  };

  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [anchorConceptName, setAnchorConceptName] = useState('');
  const [suggestedAnchor, setSuggestedAnchor] = useState(null);
  const [anchorSuggestLoading, setAnchorSuggestLoading] = useState(false);
  const handleCreateFromTextSubmit = async () => {
    const text = createFromTextInput.trim();
    if (!text) return;
    setPipelineLoading(true);
    setImageError(null);
    const decomp = selectedConceptId ? getDecomposition(selectedConceptId) : null;
    const conceptTitle = decomp?.concept || concepts.find((c) => c.concept_id === selectedConceptId)?.title || 'Generated concept';
    const options = {
      concept_id: selectedConceptId || undefined,
      domain: decomp?.domain || 'general',
      concept_title: conceptTitle,
      anchorOverride: suggestedAnchor?.phrase && suggestedAnchor?.visual
        ? { phrase: suggestedAnchor.phrase, object: suggestedAnchor.visual }
        : undefined,
    };
    try {
      const result = await runPipeline(text, options);
      if (result) {
        setPipelineArtifact(result);
        setCreateFromTextOpen(false);
        setCreateFromTextInput('');
        setGeneratedImageUrl(null);
        setResolvedHotspotPositions(null);
        setLastPostImageRecordId(null);
        setPostImageFeedbackGiven(false);
        setSuggestedAnchor(null);
      } else {
        setImageError('Could not extract enough facts from the text. Use at least one full sentence.');
      }
    } catch (_) {
      setImageError('Pipeline failed. Try again or use shorter text.');
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleGenerateAnother = () => {
    if (mnemonicsForConcept.length <= 1) return;
    setVariantIndex((i) => (i + 1) % mnemonicsForConcept.length);
    setGeneratedImageUrl(null);
    setResolvedHotspotPositions(null);
    setLastPostImageRecordId(null);
    setPostImageFeedbackGiven(false);
    setImageError(null);
    setTranscriptPlaying(false);
  };

  const encodingChecklist = useMemo(() => (artifact ? getEncodingChecklist(artifact) : []), [artifact]);
  const rawTranscript = artifact?.transcript || '';
  const transcript = useMemo(() => sanitizeLearnerFacingText(rawTranscript), [rawTranscript]);
  const blockImageGeneration = artifact?._validation?.blockImageGeneration === true;
  const validationWarnings = artifact?._validation?.warnings ?? [];

  const handlePlayTranscript = useCallback(() => {
    if (!transcript || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(transcript);
    u.rate = 0.92;
    u.onstart = () => setTranscriptPlaying(true);
    u.onend = () => setTranscriptPlaying(false);
    u.onerror = () => setTranscriptPlaying(false);
    window.speechSynthesis.speak(u);
    setTranscriptPlaying(true);
  }, [transcript]);
  const handleStopTranscript = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setTranscriptPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key !== 'Escape') return;
      if (audioMenuOpen) {
        setAudioMenuOpen(false);
        e.preventDefault();
      } else if (typeof onExit === 'function') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [audioMenuOpen, onExit]);

  if (concepts.length === 0) {
    return (
      <div className="fade-in bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-gray-500 mb-1">No picture mnemonics for this course yet.</p>
        <p className="text-sm text-gray-400 mb-2">Pick another course or try All Courses.</p>
        <p className="text-xs text-gray-400">Use the bar above to switch mode or back to course.</p>
      </div>
    );
  }

  // Concept list view
  if (!selectedConceptId) {
    return (
      <div className="fade-in space-y-6">
        <div className="flex items-center gap-3">
          <StudyAideIcon aideId="picmonics" className="w-8 h-8 text-gray-700 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Picmonics</h1>
            <p className="text-sm text-gray-500">{courseLabel}</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          Pick a concept to see a picture mnemonic—a memorable image or story to lock it in.
        </p>

        {/* Due for review filter */}
        {course?.id && dueForReview.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Show:</span>
            <button
              type="button"
              onClick={() => setFilterDueOnly(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterDueOnly ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterDueOnly(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterDueOnly ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Due for review ({dueForReview.length})
            </button>
          </div>
        )}

        {createFromTextOpen ? (
          <div className="rounded-xl border-2 border-brand-200 bg-brand-50/30 p-4 mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Create from text (AI)</p>
            <p className="text-xs text-gray-600 mb-2">
              Paste a paragraph or learning objective. We extract facts, build a scene blueprint, and derive an image prompt. Optionally select a concept above first to use its anchor and domain.
            </p>
            <textarea
              value={createFromTextInput}
              onChange={(e) => setCreateFromTextInput(e.target.value)}
              placeholder="e.g. Protein synthesis is how genes become proteins. DNA is transcribed to mRNA in the nucleus, and mRNA is translated into protein at the ribosome. Central dogma: genes → proteins."
              className="w-full min-h-[120px] p-3 rounded-lg border border-gray-200 bg-white text-sm resize-y mb-3"
              rows={4}
            />
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <input
                type="text"
                value={anchorConceptName}
                onChange={(e) => setAnchorConceptName(e.target.value)}
                placeholder="Concept name (for anchor)"
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
              />
              <button
                type="button"
                onClick={async () => {
                  const name = anchorConceptName.trim() || createFromTextInput.trim().split(/[.\n]/)[0]?.trim()?.slice(0, 60);
                  if (!name) return;
                  setAnchorSuggestLoading(true);
                  setSuggestedAnchor(null);
                  try {
                    const result = await suggestAnchor(name);
                    if (result) setSuggestedAnchor(result);
                  } finally {
                    setAnchorSuggestLoading(false);
                  }
                }}
                disabled={anchorSuggestLoading}
                className="px-3 py-2 rounded-lg border border-brand-200 bg-brand-50 text-brand-800 text-sm font-medium hover:bg-brand-100 disabled:opacity-50"
              >
                {anchorSuggestLoading ? '…' : 'Suggest anchor (AI)'}
              </button>
            </div>
            {suggestedAnchor && (
              <div className="mb-3 p-2 rounded-lg bg-white border border-brand-200 text-sm">
                <p className="font-medium text-gray-900">Suggested anchor</p>
                <p className="text-gray-700">&quot;{suggestedAnchor.phrase}&quot; → {suggestedAnchor.visual}</p>
                <button type="button" onClick={() => setSuggestedAnchor(null)} className="text-xs text-gray-500 hover:text-gray-700 mt-1">Clear</button>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateFromTextSubmit}
                disabled={!createFromTextInput.trim() || pipelineLoading}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 text-sm"
              >
                {pipelineLoading ? 'Extracting facts…' : 'Generate mnemonic (AI)'}
              </button>
              <button
                type="button"
                onClick={() => { setCreateFromTextOpen(false); setCreateFromTextInput(''); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreateFromTextOpen(true)}
            className="mb-4 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/50 transition-colors text-sm font-medium"
          >
            Create from text (AI)
          </button>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {conceptsToShow.map((c) => (
            <button
              key={c.concept_id}
              type="button"
              onClick={() => handleSelectConcept(c.concept_id)}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${dueConceptIds.has(c.concept_id) ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300' : 'border-gray-100 hover:border-brand-200 hover:bg-brand-50/50'}`}
            >
              <span className="font-medium text-gray-900">{c.title}</span>
              <p className="text-xs text-gray-500 mt-0.5">
                {dueConceptIds.has(c.concept_id) ? 'Due for review • View mnemonic' : 'View mnemonic'}
              </p>
            </button>
          ))}
        </div>
        {filterDueOnly && conceptsToShow.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No concepts due for review in this course. Study any concept to add it to your review queue.</p>
        )}
      </div>
    );
  }

  // Mnemonic card view — 50/50 split: image left, all text right
  if (artifact) {
    return (
      <div className="fade-in">
        {/* Full-width header — breadcrumb-style nav: exit study | concepts | current concept */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          {typeof onExit === 'function' && (
            <>
              <button
                type="button"
                onClick={onExit}
                className="text-brand-600 hover:text-brand-700 text-sm font-medium shrink-0"
                aria-label={`Back to ${courseLabel}`}
              >
                ← Back to {courseLabel}
              </button>
              <span className="text-gray-300 hidden sm:inline" aria-hidden>|</span>
            </>
          )}
          <button
            type="button"
            onClick={handleBackToConcepts}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium shrink-0"
          >
            ← Concepts
          </button>
          <span className="text-gray-300 hidden sm:inline" aria-hidden>|</span>
          <div className="flex items-baseline gap-2 min-w-0">
            <StudyAideIcon aideId="picmonics" className="w-5 h-5 text-gray-700 shrink-0" />
            <h1 className="text-lg font-bold text-gray-900 truncate">{artifact.concept}</h1>
            <span className="text-sm text-gray-500 shrink-0">{courseLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left: Image panel — min-height so image uses more screen */}
          <section className="rounded-xl border-2 overflow-hidden border-gray-200 bg-white lg:sticky lg:top-4 min-h-[min(55vh,640px)] lg:min-h-[min(60vh,720px)] relative">
            {/* Image (or empty state when no image yet) */}
            {generatedImageUrl ? (
              <div className={`p-3 transition-opacity duration-300 ${imageLoading ? 'opacity-40 pointer-events-none' : ''}`}>
                <p className="text-xs text-gray-500 mb-2">
                  Hover circles to see labels; click to reveal or hide. Use the button below to show all.
                </p>
                <MnemonicCanvas
                  imageUrl={generatedImageUrl}
                  hotspots={hotspots}
                  accentColor={courseColor}
                  narrativeHighlightId={focusedHotspotId}
                  onRevealChange={handleHotspotReveal}
                />
                {(artifact.image_story || artifact.narrative) && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 italic">
                      You&apos;re looking at: {sanitizeLearnerFacingText(
                        artifact.image_story
                          ? artifact.image_story.replace(/^One scene:\s*/i, '').replace(/\.\s*No split panels\.?$/i, '')
                          : (artifact.narrative?.split(/\.\s+/)[0]?.trim() || '')
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">If the image shows text or extra objects, ignore them—the mnemonic is what we describe here.</p>
                  </div>
                )}
              </div>
            ) : !imageLoading ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 min-h-[280px] flex flex-col items-center justify-center">
                <p className="text-gray-500 font-medium mb-1">Your mnemonic image will appear here</p>
                <p className="text-sm text-gray-400 mb-4">Click Generate image in the panel on the right to create it</p>
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={imageLoading || blockImageGeneration}
                  className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  aria-label="Generate mnemonic image with AI"
                >
                  Generate image (AI)
                </button>
              </div>
            ) : null}
            {/* Loading overlay: fun animation + cycling messages */}
            {imageLoading && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white/95 to-gray-50/95 backdrop-blur-sm image-generating-loader__shimmer"
                aria-live="polite"
                aria-busy="true"
              >
                <div className="image-generating-loader__shape flex flex-col items-center">
                  <svg className="w-32 h-32 text-brand-500/90" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <circle cx="60" cy="55" r="22" className="image-generating-loader__path" strokeDasharray="120" />
                    <path d="M 30 85 Q 60 70 90 85" className="image-generating-loader__path" strokeDasharray="120" />
                    <circle cx="40" cy="45" r="6" className="opacity-70" fill="currentColor" />
                    <circle cx="80" cy="48" r="5" className="opacity-60" fill="currentColor" />
                  </svg>
                  <p className="mt-6 text-lg font-medium text-gray-800">
                    {imageStatus || LOADING_MESSAGES[loadingMessageIndex]}
                  </p>
                  <div className="flex gap-1.5 mt-3 justify-center" aria-hidden>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className="image-generating-loader__dot w-2 h-2 rounded-full bg-brand-500/80" />
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-gray-400">Usually 10–30 seconds · worth the wait</p>
                </div>
              </div>
            )}
          </section>

          {/* Right: All text — controls, expandables, actions */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* One-time onboarding tip (Phase 4.3) */}
            {showOnboardingTip && (
              <div className="flex items-start justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3 text-sm text-brand-900">
                <p className="flex-1">
                  <span className="font-medium">Tip:</span> Generate an image to encode the concept. Use the button below or &quot;Create from text (AI)&quot; to build a mnemonic.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowOnboardingTip(false);
                    try {
                      localStorage.setItem('scholar-onboarding-picmonics', '1');
                    } catch (_) {}
                  }}
                  className="shrink-0 rounded px-2 py-1 text-brand-700 hover:bg-brand-100 font-medium"
                  aria-label="Dismiss tip"
                >
                  Got it
                </button>
              </div>
            )}
            {/* Generate image + Ask tutor + error */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={imageLoading || blockImageGeneration}
                className="px-3 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                aria-label={generatedImageUrl ? 'Regenerate mnemonic image' : 'Generate mnemonic image'}
              >
                {imageLoading ? (imageStatus || LOADING_MESSAGES[loadingMessageIndex]) : generatedImageUrl ? 'Regenerate image (AI)' : 'Generate image (AI)'}
              </button>
              {typeof onAskTutor === 'function' && artifact && (
                <button
                  type="button"
                  onClick={() => onAskTutor({ conceptName: artifact.concept, summary: artifact.core_concept || artifact.summary })}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-brand-100 text-brand-800 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  <Bot className="w-4 h-4 shrink-0" aria-hidden /> Ask tutor
                </button>
              )}
            </div>
            {imageError && <p className="text-sm text-red-600">{imageError}</p>}
            {blockImageGeneration && validationWarnings.length > 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2" title={validationWarnings.join(' ')}>
                Validation: {validationWarnings[0]} Generate image is disabled until fixed.
              </p>
            )}

            {/* How to remember it — definition + mnemonic (combined, open by default) */}
        <div className="rounded-xl border-2 border-gray-200 bg-white mb-3 overflow-hidden shadow-sm" style={{ borderTopWidth: 4, borderTopColor: courseColor }}>
          <button
            type="button"
            onClick={() => setExpandLegend((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-900 hover:bg-gray-50/80 transition-colors"
          >
            <span className="flex items-center gap-2 text-lg">
              <span aria-hidden className="text-xl">🧠</span> How to remember it
            </span>
            <span className="text-gray-400 text-sm" aria-hidden>{expandLegend ? '▼' : '▶'}</span>
          </button>
          {expandLegend && (
            <div className="px-4 pb-4 pt-0 border-t border-gray-100 space-y-6">
              {/* Definition (what it is) — merged from former What it is section */}
              {(() => {
                const full = (artifact.core_concept || artifact.summary) || artifact.exam_summary || artifact.concept || '';
                const summary = artifact.summary?.trim();
                const oneLineSummary = summary && summary.length <= 120 && !summary.slice(0, -1).includes('.');
                const lead = oneLineSummary ? summary : (full.split(/[.!?]+/)[0]?.trim() || full);
                const rest = oneLineSummary
                  ? (artifact.core_concept && artifact.core_concept !== summary ? artifact.core_concept : '')
                  : (lead ? full.substring(lead.length).replace(/^\s*[.!?]\s*/, '').trim() : '');
                if (!full) return null;
                return (
                  <>
                    <p className="text-base text-gray-800 leading-relaxed font-medium">
                      {lead ? (lead.endsWith('.') || lead.endsWith('?') || lead.endsWith('!') ? lead : `${lead}.`) : full}
                    </p>
                    {rest && (
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{rest}</p>
                    )}
                  </>
                );
              })()}

              <div className="border-t border-gray-100 pt-4">
                {artifact.mnemonic_narrative?.trim() && (
                <p className="text-sm text-gray-700 leading-relaxed italic" style={{ borderLeft: `3px solid ${courseColor}`, paddingLeft: '0.75rem' }}>
                  {artifact.mnemonic_narrative}
                </p>
              )}
              </div>

              {/* Hero: one big mnemonic idea */}
              {artifact.anchor?.phrase && artifact.anchor?.object && (
                <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${courseColor}12`, borderLeft: `4px solid ${courseColor}` }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: courseColor }}>Core mnemonic</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{artifact.concept}</p>
                  <p className="text-base font-semibold text-gray-800 mt-1">&quot;{artifact.anchor.phrase}&quot; → {artifact.anchor.object}</p>
                </div>
              )}

              {/* Recall story: one-line narrative to replay before the hotspot map (Option A) */}
              {(artifact.recall_story || transcript) && (
                <div className="border-t border-gray-100 pt-4">
                  <blockquote className="m-0 p-4 rounded-xl italic text-gray-800 text-base leading-relaxed" style={{ borderLeft: `4px solid ${courseColor}`, backgroundColor: `${courseColor}08` }}>
                    &quot;{artifact.recall_story || transcript?.split(/[.!?]/)[0]?.trim() || transcript}&quot;
                  </blockquote>
                </div>
              )}

              {hotspots?.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="grid gap-2">
                    {hotspots.map((h, idx) => {
                      const isAnchor = h.id === 'hotspot-anchor';
                      const attr = !isAnchor && artifact?.attributes?.[idx - 1];
                      const typeLabel = attr?.type ? attr.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
                      const keyTerm = isAnchor ? (h.term || 'Concept') : keyTermFromFact(h.label);
                      const definition = h.label;
                      const visualPhonetic = h.mnemonicLogic?.trim() || '';
                      const showKeyTermAsHeading = keyTerm && (isAnchor || keyTerm !== definition);
                      const typeStyle = attr?.type ? getAttributeTypeStyle(attr.type) : null;
                      const isRedundant = typeLabel && keyTerm && keyTerm.toLowerCase().trim() === typeLabel.toLowerCase().trim();
                      const showTypePill = typeLabel && typeStyle && !isRedundant;
                      return (
                        <div
                          key={h.id}
                          className={`flex gap-3 items-start p-2.5 rounded-lg border ${isAnchor ? 'border-2 bg-white shadow-sm' : 'bg-gray-50 border-gray-100'}`}
                          style={isAnchor ? { borderColor: courseColor, backgroundColor: `${courseColor}08` } : undefined}
                          onMouseEnter={() => setFocusedHotspotId(h.id)}
                          onMouseLeave={() => setFocusedHotspotId(null)}
                          onFocus={() => setFocusedHotspotId(h.id)}
                          onBlur={() => setFocusedHotspotId(null)}
                          role="listitem"
                        >
                          <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white relative" style={{ backgroundColor: courseColor }}>
                            {isAnchor ? '★' : idx}
                            {studiedHotspotIds.has(h.id) && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center" aria-label="Studied">
                                <Check className="w-2 h-2 text-white" strokeWidth={3} />
                              </span>
                            )}
                          </span>
                          <div className="min-w-0 flex-1 flex gap-3 items-start">
                            <div className="min-w-0 flex-1 space-y-1">
                              {showKeyTermAsHeading && (
                                <p className="font-semibold text-gray-900 text-sm leading-tight">{keyTerm}</p>
                              )}
                              <p className="text-sm text-gray-900 leading-snug">
                                {definition}
                                {isAnchor && visualPhonetic && (
                                  <span className="block text-xs text-gray-500 mt-1 not-italic">This is the main character in the scene.</span>
                                )}
                              </p>
                              {visualPhonetic && (
                                <p className="text-sm font-medium text-blue-600 leading-tight italic">
                                  &quot;{visualPhonetic}&quot;
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 w-[72px] flex items-start justify-end">
                              {showTypePill && (() => {
                                const { color, Icon } = typeStyle;
                                return (
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full self-start"
                                    style={{ backgroundColor: `${color}18`, color }}
                                    aria-label={`Type: ${typeLabel}`}
                                  >
                                    <Icon className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                                    {typeLabel}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Audio menu — Read aloud, Play narrative */}
              {typeof window !== 'undefined' && window.speechSynthesis && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAudioMenuOpen((v) => !v)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    aria-label="Audio options"
                    aria-expanded={audioMenuOpen}
                  >
                    <Volume2 className="w-4 h-4" aria-hidden />
                    Audio
                    <ChevronDown className={`w-4 h-4 transition-transform ${audioMenuOpen ? 'rotate-180' : ''}`} aria-hidden />
                  </button>
                  {audioMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden onClick={() => setAudioMenuOpen(false)} />
                      <div className="absolute left-0 top-full mt-1 z-20 min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                        <button
                          type="button"
                          onClick={() => {
                            const def = (artifact.core_concept || artifact.summary) || artifact.exam_summary || artifact.concept;
                            if (!def) return;
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance(def);
                            u.rate = 0.92;
                            window.speechSynthesis.speak(u);
                            setAudioMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Volume2 className="w-4 h-4 shrink-0" /> Read definition aloud
                        </button>
                        {transcript && (
                          <button
                            type="button"
                            onClick={() => {
                              if (transcriptPlaying) {
                                handleStopTranscript();
                              } else {
                                handlePlayTranscript();
                              }
                              setAudioMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            {transcriptPlaying ? (
                              <>Stop</>
                            ) : (
                              <>Play narrative</>
                            )}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleBackToConcepts}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Pick another concept
                </button>
                {hasMultipleVariants ? (
                  <>
                    <button
                      type="button"
                      onClick={handleGenerateAnother}
                      className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                      Try another scene
                    </button>
                    <button
                      type="button"
                      onClick={() => course?.id && (effectiveMnemonic?.concept_id || selectedConceptId) && setSavedVariant(course.id, effectiveMnemonic?.concept_id || selectedConceptId, variantIndex)}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                      Save this variant
                    </button>
                  </>
                ) : null}
                {transcript && (
                  <button
                    type="button"
                    onClick={() => {
                      const text = artifact?.exam_summary || transcript?.split(/[.!?]/)[0]?.trim() || transcript;
                      if (typeof navigator?.clipboard?.writeText === 'function') navigator.clipboard.writeText(text).then(() => {});
                    }}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    Copy story
                  </button>
                )}
                {(artifact?.anchor?.object || hotspots?.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      const lines = [];
                      if (artifact.anchor?.object) lines.push(`Anchor: ${artifact.anchor.object} → ${artifact.concept}`);
                      hotspots.forEach((h) => lines.push(`${h.term || h.mnemonicLogic || h.label}: ${h.mnemonicLogic || h.label} → ${h.label}`));
                      const text = lines.join('\n');
                      if (typeof navigator?.clipboard?.writeText === 'function') navigator.clipboard.writeText(text).then(() => {});
                    }}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    Copy legend
                  </button>
                )}
                {generatedImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!generatedImageUrl.startsWith('data:')) return;
                      const a = document.createElement('a');
                      a.href = generatedImageUrl;
                      a.download = `picmonic-${(artifact?.concept || 'mnemonic').replace(/\s+/g, '-')}.png`;
                      a.click();
                    }}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    Export image
                  </button>
                )}
                {generatedImageUrl && lastPostImageRecordId && !postImageFeedbackGiven && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 mt-2">
                    <span className="text-xs text-gray-500 mr-1">Quality check: Does this image teach the concept without labels?</span>
                    <button
                      type="button"
                      onClick={() => {
                        recordPostImageOutcome(lastPostImageRecordId, 'accept');
                        setPostImageFeedbackGiven(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        recordPostImageOutcome(lastPostImageRecordId, 'reject');
                        setPostImageFeedbackGiven(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {generatedImageUrl && postImageFeedbackGiven && (
                  <p className="text-xs text-gray-500 pt-2 mt-2 border-t border-gray-200">Thanks for the feedback.</p>
                )}
                {artifact && (
                  <button
                    type="button"
                    onClick={() => {
                      const report = exportValidationReport(artifact, { getCanonical: () => canonical }, { concept_id: effectiveMnemonic?.concept_id, concept_title: artifact?.concept });
                      if (!report) return;
                      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `validation-${(artifact?.concept || 'mnemonic').replace(/\s+/g, '-')}-${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(a.href);
                    }}
                    className="px-3 py-2 rounded-lg text-xs text-gray-500 border border-gray-200 hover:bg-gray-50"
                    title="Download engine validation report (passed/failed/skipped checks)"
                  >
                    Validation report
                  </button>
                )}
                {import.meta.env.DEV && (
                  <button
                    type="button"
                    onClick={() => {
                      const json = exportPostImageRecordsJson();
                      const blob = new Blob([json], { type: 'application/json' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `picmonic-quality-checks-${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(a.href);
                    }}
                    className="px-3 py-2 rounded-lg text-xs text-gray-400 border border-dashed border-gray-300 hover:bg-gray-50"
                    title="Dev: Export post-image Accept/Reject records"
                  >
                    Export quality data
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Legacy mnemonic (no decomposition): image + description
  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center gap-3">
        {typeof onExit === 'function' && (
          <>
            <button
              type="button"
              onClick={onExit}
              className="text-brand-600 hover:text-brand-700 text-sm font-medium shrink-0"
              aria-label={`Back to ${courseLabel}`}
            >
              ← Back to {courseLabel}
            </button>
            <span className="text-gray-300">|</span>
          </>
        )}
        <button
          type="button"
          onClick={handleBackToConcepts}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          ← Concepts
        </button>
        <span className="text-gray-300">|</span>
        <StudyAideIcon aideId="picmonics" className="w-8 h-8 text-gray-700 shrink-0" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">{currentMnemonic?.title}</h1>
          <p className="text-sm text-gray-500">{courseLabel}</p>
        </div>
      </div>

      <div
        className="rounded-2xl border-2 border-gray-100 bg-white overflow-hidden shadow-sm"
        style={{ borderTopColor: courseColor, borderTopWidth: 4 }}
      >
        <div className="aspect-[400/260] bg-gray-100 relative">
          <img
            src={getMnemonicImageUrl(currentMnemonic)}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 bg-gradient-to-br from-brand-100 to-pink-100 flex items-center justify-center">
            <StudyAideIcon aideId="picmonics" className="w-16 h-16 text-gray-400" />
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm font-medium text-brand-600 mb-2">Picture this</p>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {currentMnemonic?.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-between">
        <button
          type="button"
          onClick={handleBackToConcepts}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Pick another concept
        </button>
        {hasMultipleVariants ? (
          <button
            type="button"
            onClick={handleGenerateAnother}
            className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            Try another scene
          </button>
        ) : (
          <p className="text-sm text-gray-500 self-center">One mnemonic for this concept</p>
        )}
      </div>
    </div>
  );
}

export default Picmonics;

import React, { useState } from 'react';
import {
  auditCode,
  getSynthesizedArchetype,
  SLOPPY_COMPONENTS,
  SLOPPY_LIBRARIES,
  SYNTHESIZED_ARCHETYPES,
  transformSlopToCraft
} from '@sloppy/core';

const SAMPLE_SLOP_SNIPPETS: { name: string; code: string }[] = [
  {
    name: 'Purple Gradient & Sparkles Hero',
    code: `import React from 'react';
import { Sparkles } from 'lucide-react';

export function AIHeroCard() {
  return (
    <div className="mx-auto my-8 max-w-sm rounded-xl border p-6 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl animate-bounce">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        <span className="text-xs font-semibold uppercase">Powered by AI</span>
      </div>
      <h2 className="text-2xl font-bold">Magical AI Platform</h2>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto, fugit!</p>
      <button className="mt-4 px-4 py-2 bg-white text-purple-700 font-semibold rounded-lg shadow-md hover:bg-neutral-100">
        Start Magic Free
      </button>
    </div>
  );
}`
  },
  {
    name: 'Unearned Bouncing Floating Card',
    code: `export function FloatingFeature() {
  return (
    <div className="m-8 max-w-md mx-auto p-8 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-indigo-950 to-purple-900 animate-pulse">
      <div className="flex items-center gap-2">
        <MagicWand className="w-6 h-6 text-fuchsia-400" />
        <span className="text-sm font-bold">Smart AI Copilot</span>
      </div>
      <p className="mt-2 text-neutral-300">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
      </p>
    </div>
  );
}`
  }
];

export function SlopStudio() {
  const [activeTab, setActiveTab] = useState<'transformer' | 'archetypes' | 'libraries'>('transformer');
  const [inputCode, setInputCode] = useState(SAMPLE_SLOP_SNIPPETS[0].code);
  const [selectedLook, setSelectedLook] = useState<'linear' | 'minimal' | 'dark-hero'>('linear');
  const [copied, setCopied] = useState(false);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState('ai-agent-cockpit');

  const auditResult = auditCode(inputCode, { strict: true });
  const transformResult = transformSlopToCraft(inputCode, { look: selectedLook });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedArchetype = getSynthesizedArchetype(selectedArchetypeId);

  return (
    <div className="sloppy-studio-container" style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', color: '#f4f4f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Studio Header & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Sloppy Craft Studio</h1>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '12px', background: '#27272a', color: '#a1a1aa' }}>v1.1.0</span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#a1a1aa' }}>
            Surgical AI slop auto-fixer and multi-library unified component synthesis
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '6px', background: '#18181b', padding: '4px', borderRadius: '8px', border: '1px solid #27272a' }}>
          {(['transformer', 'archetypes', 'libraries'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab ? '#27272a' : 'transparent',
                color: activeTab === tab ? '#ffffff' : '#a1a1aa',
                transition: 'all 0.15s'
              }}
            >
              {tab === 'transformer' ? 'Code Auto-Fixer' : tab === 'archetypes' ? 'Master Archetypes' : 'MIT Libraries'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: TRANSFORMER */}
      {activeTab === 'transformer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Left Column: Code Input & Audit Meter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Raw Component (Input)</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: auditResult.slopScore > 50 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                  color: auditResult.slopScore > 50 ? '#ef4444' : '#22c55e',
                  border: `1px solid ${auditResult.slopScore > 50 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                }}>
                  Slop Score: {auditResult.slopScore}/100
                </span>
              </div>

              {/* Sample Selector */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {SAMPLE_SLOP_SNIPPETS.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => setInputCode(sample.code)}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #3f3f46',
                      background: '#18181b',
                      color: '#d4d4d8',
                      cursor: 'pointer'
                    }}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Input Textarea */}
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              style={{
                width: '100%',
                height: '340px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                background: '#09090b',
                color: '#e4e4e7',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.5',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              placeholder="Paste JSX / TSX code here to inspect for AI slop..."
            />

            {/* Live Detected Violations List */}
            <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '8px' }}>
                Detected AI Slop Anti-Patterns ({auditResult.violations.length})
              </div>
              {auditResult.violations.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#22c55e', padding: '8px 0' }}>
                  [PASS] Zero AI slop detected. Clean craft principles verified.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {auditResult.violations.map((v) => (
                    <div key={v.id} style={{ fontSize: '11px', padding: '6px 8px', borderRadius: '4px', background: '#18181b', borderLeft: '3px solid #ef4444' }}>
                      <span style={{ fontWeight: 600, color: '#f87171' }}>[{v.type}]</span> {v.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Surgical Auto-Fix & Clean Output */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Surgically Refactored (Clean Craft)</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  Slop Score: {transformResult.postAudit.slopScore}/100
                </span>
              </div>

              {/* Look Selector & Copy */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={selectedLook}
                  onChange={(e) => setSelectedLook(e.target.value as any)}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #3f3f46',
                    background: '#18181b',
                    color: '#d4d4d8'
                  }}
                >
                  <option value="linear">Look: Linear Dark</option>
                  <option value="minimal">Look: Minimal Light</option>
                  <option value="dark-hero">Look: Dark Hero</option>
                </select>

                <button
                  onClick={() => handleCopy(transformResult.transformedCode)}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid #38bdf8',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Refactored Code Output */}
            <textarea
              readOnly
              value={transformResult.transformedCode}
              style={{
                width: '100%',
                height: '340px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                background: '#09090b',
                color: '#34d399',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.5',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />

            {/* Transformations Applied Summary */}
            <div style={{ background: '#121215', border: '1px solid #27272a', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '8px' }}>
                Transformations Applied ({transformResult.changesApplied})
              </div>
              {transformResult.transformations.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#a1a1aa', padding: '8px 0' }}>
                  No transformations required. Code already meets anti-slop guidelines.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {transformResult.transformations.map((t, idx) => (
                    <div key={idx} style={{ fontSize: '11px', padding: '6px 8px', borderRadius: '4px', background: '#18181b', borderLeft: '3px solid #38bdf8' }}>
                      <span style={{ fontWeight: 600, color: '#38bdf8' }}>{t.type}:</span> {t.explanation}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER ARCHETYPES */}
      {activeTab === 'archetypes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Left Archetype List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#a1a1aa' }}>Synthesized Master Archetypes</span>
            {SYNTHESIZED_ARCHETYPES.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedArchetypeId(a.id)}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${selectedArchetypeId === a.id ? '#38bdf8' : '#27272a'}`,
                  background: selectedArchetypeId === a.id ? '#18181b' : '#111114',
                  color: '#f4f4f5',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px' }}>{a.description.slice(0, 75)}...</div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {a.librariesUsed.slice(0, 3).map((lib) => (
                    <span key={lib} style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: '#27272a', color: '#93c5fd' }}>
                      {lib}
                    </span>
                  ))}
                  {a.librariesUsed.length > 3 && (
                    <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: '#27272a', color: '#93c5fd' }}>
                      +{a.librariesUsed.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Right Archetype Detail View */}
          {selectedArchetype && (
            <div style={{ background: '#111114', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #27272a', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{selectedArchetype.name}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a1a1aa' }}>{selectedArchetype.description}</p>
                </div>
                <button
                  onClick={() => handleCopy(`sloppy create ${selectedArchetype.id}`)}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #38bdf8',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? 'Copied CLI Command' : `sloppy create ${selectedArchetype.id}`}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>Unified Libraries:</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedArchetype.librariesUsed.map((lib) => (
                      <span key={lib} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7' }}>
                        {lib}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>Focal Point:</div>
                  <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{selectedArchetype.focalPoint}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>Anti-Slop Craft Measures Enforced:</div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#a1a1aa' }}>
                  {selectedArchetype.antiSlopMeasures.map((m, idx) => (
                    <li key={idx} style={{ marginBottom: '3px' }}>{m}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#d4d4d8' }}>Component Source Code (TSX):</div>
                  <button
                    onClick={() => handleCopy(selectedArchetype.tsxCode)}
                    style={{ fontSize: '11px', color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Copy TSX Code
                  </button>
                </div>
                <textarea
                  readOnly
                  value={selectedArchetype.tsxCode}
                  style={{
                    width: '100%',
                    height: '240px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #27272a',
                    background: '#09090b',
                    color: '#e4e4e7',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 7 LIBRARIES INDEX */}
      {activeTab === 'libraries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {Object.values(SLOPPY_LIBRARIES).map((lib) => {
              const comps = SLOPPY_COMPONENTS.filter(c => c.library === lib.id);
              return (
                <div key={lib.id} style={{ background: '#111114', border: '1px solid #27272a', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{lib.name}</h3>
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Author: {lib.author}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8' }}>
                      {comps.length} components
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#d4d4d8', margin: '8px 0 10px' }}>
                    {lib.description}
                  </p>

                  <div style={{ fontSize: '11px', background: '#18181b', padding: '8px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 600, color: '#38bdf8' }}>Role:</span> {lib.antiSlopRole}
                  </div>

                  <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                    <strong>CLI Command:</strong> <code style={{ color: '#34d399' }}>sloppy list {lib.id}</code>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

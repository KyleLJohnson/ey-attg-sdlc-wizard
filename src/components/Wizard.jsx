/* eslint-disable react/prop-types */
import { useState } from 'react';
import { generateAllFiles } from './generators.js';
import GitHubPublish from './GitHubPublish.jsx';
import {
  JournalPage, BookStack, ShieldAlt, ChatLines, PlugTypeA, Archive,
  HomeSimple, Code, ShieldCheck, Github, Server, Search,
  MultiplePages, Database, ChatBubble, Terminal, CodeBrackets,
  BrainResearch, InfoCircle, LightBulbOn, Accessibility, Page,
} from 'iconoir-react';

// ─── Motif Icon Helper ────────────────────────────────────────────────────────
function MotifIcon({ icon: Icon, size = 20, style = {} }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...style }}>
      <Icon width={size} height={size} />
    </span>
  );
}

// ─── Step Metadata ────────────────────────────────────────────────────────────
// 9 steps: Welcome(0) → Project(1) → TechStack(2) → Governance(3) → Principles(4)
//          → MCP(5) → Agent(6) → Preview(7) → Publish(8)
const STEPS = [
  { id: 'welcome',    label: 'Welcome',       icon: HomeSimple },
  { id: 'project',   label: 'Project',        icon: JournalPage },
  { id: 'techstack', label: 'Tech Stack',     icon: Code },
  { id: 'governance',label: 'Governance',     icon: ShieldAlt },
  { id: 'principles',label: 'Principles',     icon: ShieldCheck },
  { id: 'mcp',       label: 'MCP Tools',      icon: PlugTypeA },
  { id: 'agent',     label: 'Agent & LLM',    icon: ChatLines },
  { id: 'preview',   label: 'Preview',        icon: Search },
  { id: 'publish',   label: 'Publish',        icon: Github },
];

// ─── Initial Form Data ────────────────────────────────────────────────────────
const INITIAL = {
  project: {
    name: '', description: '', problemStatement: '',
    personas: [{ id: 1, name: '', description: '', goals: '', painPoints: '' }],
    userOutcome: '', businessOutcome: '', businessConstraints: '', technicalConstraints: '',
    featureSpecMode: 'paste', featureSpecContent: '', featureSpecUrl: '', featureSpecFileName: '',
  },
  techStack: {
    languages: [], frontend: '', frontendOther: '',
    backend: '', backendOther: '', testing: [],
    database: '', infrastructure: [], identityPlatform: [],
    sourceControl: '',
    devops: [],
    useMotif: false,
    useSwagger: false,
    useA11y: false,
  },
  governance: {
    levels: ['product', 'enterprise'], buName: '', domainName: '',
  },
  constitution: {
    codeQuality: '', performance: '', security: [],
    architectureStyle: 'modular-monolith', testCoverage: 80,
    additionalRules: '',
  },
  mcp: { tools: [] },
  agent: { primary: 'github-copilot', model: 'gpt-4o', secondary: [] },
};

// ─── Main Wizard Component ────────────────────────────────────────────────────
export default function Wizard() {
  const [step, setStep]           = useState(0);
  const [data, setData]           = useState(INITIAL);
  const [files, setFiles]         = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [copied, setCopied]       = useState(null);
  const [errors, setErrors]       = useState({});

  const update = (section, patch) =>
    setData(d => ({ ...d, [section]: { ...d[section], ...patch } }));

  const clearError = (key) => setErrors(e => { const n = { ...e }; delete n[key]; return n; });

  const validate = (currentStep, d) => {
    const errs = {};
    if (currentStep === 1) {
      if (!d.project.name?.trim())        errs.name        = 'Project name is required';
      if (!d.project.description?.trim()) errs.description = 'One-sentence description is required';
    }
    if (currentStep === 3) {
      if (d.governance.levels.includes('bu') && !d.governance.buName?.trim())
        errs.buName = 'Business Unit name is required when L2 is selected';
      if (d.governance.levels.includes('domain') && !d.governance.domainName?.trim())
        errs.domainName = 'Domain name is required when L3 is selected';
    }
    return errs;
  };

  const goNext = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    // Generate files when advancing FROM the Agent step (6) INTO the Preview step (7)
    if (step === STEPS.length - 3) {
      const generated = generateAllFiles(data);
      setFiles(generated);
      setActiveTab(Object.keys(generated)[0]);
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep(s => Math.max(s - 1, 0));

  const copyToClipboard = (key, content) => {
    navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="wizard-shell">
      {/* ── Sidebar ── */}
      <aside className="wizard-sidebar">
        <div className="wizard-sidebar-logo">
          <svg className="ey-logo-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="EY logo">
            <path fill="#FFFFFF" d="M-0.02,17.98c0-1.84,0-3.68,0-5.52c0-0.37,0.05-0.43,0.43-0.43c2.09,0,4.19,0,6.28,0c0.24,0,0.39,0.1,0.5,0.29c0.44,0.74,0.89,1.48,1.33,2.23c0.13,0.22,0.04,0.35-0.25,0.35c-1.37,0-2.73,0.01-4.1,0c-0.27,0-0.4,0.05-0.38,0.35c0.03,0.37,0.03,0.74,0,1.1c-0.02,0.26,0.1,0.32,0.33,0.32c1.2,0,2.39,0,3.59,0c0.43,0,0.48,0.05,0.48,0.47c0,0.59,0,1.18,0,1.77c0,0.35-0.05,0.4-0.42,0.4c-1.21,0-2.41,0.01-3.62,0c-0.28,0-0.37,0.07-0.36,0.35c0.02,0.39,0.01,0.77,0,1.16c0,0.22,0.09,0.3,0.32,0.3c1.76-0.01,3.51,0,5.27,0c0.48,0,0.52,0.04,0.52,0.49c0,0.65,0,1.3,0,1.95C9.9,23.91,9.8,24,9.44,24c-3,0-6,0-9.01,0c-0.37,0-0.45-0.09-0.45-0.45C-0.02,21.69-0.02,19.83-0.02,17.98C-0.02,17.98-0.02,17.98-0.02,17.98z" />
            <path fill="#FFFFFF" d="M12.3,21.49c0-0.67,0-1.34,0-2c0-0.18-0.05-0.34-0.14-0.5c-0.32-0.53-0.64-1.07-0.96-1.6c-0.59-0.98-1.19-1.96-1.77-2.94c-0.41-0.68-0.8-1.37-1.2-2.05c-0.15-0.25-0.1-0.37,0.2-0.37c1.17-0.01,2.33,0,3.5-0.01c0.2,0,0.33,0.09,0.42,0.26c0.56,1.07,1.14,2.13,1.7,3.19c0.05,0.09,0.08,0.19,0.2,0.18c0.12-0.01,0.12-0.12,0.15-0.19c0.58-1.09,1.17-2.18,1.75-3.27c0.08-0.15,0.23-0.18,0.38-0.18c1.15,0,2.29,0,3.44,0c0.32,0,0.36,0.09,0.19,0.37c-0.48,0.8-0.96,1.6-1.44,2.4c-0.46,0.78-0.92,1.56-1.38,2.34c-0.37,0.61-0.74,1.23-1.1,1.84c-0.1,0.16-0.15,0.33-0.15,0.52c0.01,1.34,0,2.67,0,4.01c0,0.4-0.08,0.48-0.48,0.48c-0.96,0-1.92,0-2.87,0c-0.36,0-0.45-0.09-0.45-0.45C12.29,22.86,12.29,22.17,12.3,21.49C12.3,21.49,12.3,21.49,12.3,21.49z" />
            <path fill="#FFE600" d="M24,2.23c0,0.62-0.01,1.24,0,1.86c0,0.28-0.11,0.41-0.41,0.46c-1.73,0.29-3.45,0.59-5.18,0.89c-1.31,0.22-2.61,0.43-3.92,0.66c-1.63,0.28-3.25,0.57-4.88,0.85c-1.27,0.22-2.54,0.41-3.8,0.64C4.34,7.85,2.85,8.06,1.38,8.36C1.06,8.42,0.73,8.55,0.39,8.49C0.32,8.48,0.23,8.5,0.21,8.41C0.2,8.33,0.3,8.32,0.36,8.3c1.23-0.44,2.47-0.88,3.7-1.32C5.6,6.44,7.13,5.9,8.67,5.36c1.73-0.61,3.46-1.22,5.19-1.83c1.51-0.53,3.01-1.08,4.51-1.61c1.35-0.48,2.7-0.95,4.04-1.42c0.4-0.14,0.8-0.29,1.2-0.44c0.29-0.11,0.37-0.07,0.37,0.23C24,0.93,24,1.58,24,2.23C24,2.23,24,2.23,24,2.23z" />
          </svg>
          <div className="ey-logo-text">
            <span className="ey-logo-title">EY ATTG SDLC</span>
            <span className="ey-logo-sub">Setup Wizard</span>
          </div>
        </div>
        {STEPS.map((s, i) => {
          const isDone     = i < step;
          const isActive   = i === step;
          const isClickable = i < step;
          return (
            <button
              key={s.id}
              type="button"
              className={`wizard-step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && setStep(i)}
            >
              <div className="wizard-step-num">{isDone ? '✓' : i + 1}</div>
              <span className="wizard-step-label">{s.label}</span>
            </button>
          );
        })}
      </aside>

      {/* ── Main Content ── */}
      <main className="wizard-main">
        <div className="wizard-content">
          {step === 0 && <WelcomeStep />}
          {step === 1 && <ProjectStep data={data.project} update={p => update('project', p)} errors={errors} clearError={clearError} />}
          {step === 2 && <TechStackStep data={data.techStack} update={p => update('techStack', p)} />}
          {step === 3 && <GovernanceStep data={data.governance} update={p => update('governance', p)} errors={errors} clearError={clearError} />}
          {step === 4 && <PrinciplesStep data={data.constitution} update={p => update('constitution', p)} />}
          {step === 5 && <MCPStep data={data.mcp} update={p => update('mcp', p)} />}
          {step === 6 && <AgentStep data={data.agent} update={p => update('agent', p)} />}
          {step === 7 && (
            <PreviewStep
              files={files}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              copied={copied}
              onCopy={copyToClipboard}
            />
          )}
          {step === 8 && (
            <PublishStep
              files={files}
              projectName={data.project.name}
            />
          )}
        </div>

        {/* ── Footer Navigation ── */}
        {step > 0 && (
          <div className="wizard-footer">
            <button className="btn btn-secondary" onClick={goBack}>← Back</button>
            <div className="wizard-footer-right">
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Step {step} of {STEPS.length - 1}
              </span>
              {step < STEPS.length - 1 && (
                <button className="btn btn-primary" onClick={goNext}>
                  {step === STEPS.length - 2 ? (
                    <>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" style={{ marginRight: 4 }}>
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      Publish to GitHub →
                    </>
                  ) : step === STEPS.length - 3 ? '✦ Generate Files' : 'Next →'}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 0 && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button className="btn btn-primary btn-large" onClick={goNext}>
              Let's Get Started →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Step 0: Welcome ──────────────────────────────────────────────────────────
function WelcomeStep() {
  return (
    <div className="welcome-hero">
      <div className="welcome-hero-left">
        <div className="hero-icon">
          <MotifIcon icon={Archive} size="24" style={{ color: 'var(--ey-charcoal)' }} />
        </div>
        <h1>EY ATTG SDLC<br />Setup Wizard</h1>
        <p className="subtitle">
          Answer a few questions about your project and we'll generate a
          complete, plug-and-play kit — all sdd-kit prompts, instructions,
          templates, and pre-filled context files — then push it directly
          to a new GitHub repository in one click.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          ~3 minutes &middot; 8 steps &middot; Creates a GitHub repo for you
        </p>
      </div>
      <div className="output-cards">
        {[
          { icon: JournalPage,  file: 'context/project.md',            desc: 'Project identity & personas' },
          { icon: BookStack,    file: 'context/tech-stack.md',          desc: 'Approved technologies' },
          { icon: ShieldAlt,    file: 'context/constitution.md',        desc: 'Governing principles' },
          { icon: ChatLines,    file: '.github/copilot-instructions.md',desc: 'AI agent context (auto-loaded)' },
          { icon: PlugTypeA,    file: '.vscode/mcp.json',               desc: 'MCP server config' },
          { icon: Github,       file: 'New GitHub repository',          desc: 'Everything above + all 80+ kit files pushed in one commit' },
        ].map(card => (
          <div key={card.file} className="output-card">
            <MotifIcon icon={card.icon} size="18" style={{ color: 'var(--ey-charcoal)', marginTop: 2 }} />
            <div>
              <div className="card-text">{card.file}</div>
              <div className="card-desc">{card.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Project Identity ─────────────────────────────────────────────────
function ProjectStep({ data, update, errors = {}, clearError = () => {} }) {
  const addPersona = () =>
    update({ personas: [...data.personas, { id: Date.now(), name: '', description: '', goals: '', painPoints: '' }] });

  const removePersona = i =>
    update({ personas: data.personas.filter((_, idx) => idx !== i) });

  const updatePersona = (i, patch) =>
    update({ personas: data.personas.map((p, idx) => idx === i ? { ...p, ...patch } : p) });

  return (
    <div>
      <div className="step-header">
        <h1>Project Identity</h1>
        <p>Tell us about your project. This fills in <code>context/project.md</code> and <code>.github/copilot-instructions.md</code>.</p>
      </div>

      <div className="form-section">
        <div className="form-section-title">Core Identity</div>
        <div className="form-group">
          <label htmlFor="proj-name">Project Name <span className="badge badge-required">required</span></label>
          <input id="proj-name" type="text" className={errors.name ? 'invalid' : ''} value={data.name}
            onChange={e => { update({ name: e.target.value }); clearError('name'); }}
            placeholder="e.g., ShareTrust Portal, TaxFlow API, DevOps Dashboard" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="proj-desc">One-sentence description <span className="badge badge-required">required</span></label>
          <input id="proj-desc" type="text" className={errors.description ? 'invalid' : ''} value={data.description}
            onChange={e => { update({ description: e.target.value }); clearError('description'); }}
            placeholder="e.g., A portal that lets auditors review shared trust documents in real time" />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="proj-problem">Problem Statement <span className="badge badge-optional">optional</span></label>
          <textarea id="proj-problem" value={data.problemStatement} onChange={e => update({ problemStatement: e.target.value })}
            placeholder="What real-world problem does this solve? Why does it need to exist?" rows={3} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Users & Personas</div>
        <div className="persona-list">
          {data.personas.map((p, i) => (
            <div key={p.id} className="persona-card">
              <div className="persona-card-header">
                <span className="persona-number">Persona {i + 1}</span>
                {data.personas.length > 1 && (
                  <button className="btn btn-danger-ghost" onClick={() => removePersona(i)}>Remove</button>
                )}
              </div>
              <div className="form-group">
                <label htmlFor={`persona-${i}-role`}>Role / Name</label>
                <input id={`persona-${i}-role`} type="text" value={p.name} onChange={e => updatePersona(i, { name: e.target.value })}
                  placeholder="e.g., Auditor, Portfolio Manager, System Admin" />
              </div>
              <div className="form-group">
                <label htmlFor={`persona-${i}-desc`}>Description</label>
                <input id={`persona-${i}-desc`} type="text" value={p.description} onChange={e => updatePersona(i, { description: e.target.value })}
                  placeholder="Who they are and what they do" />
              </div>
              <div className="form-group">
                <label htmlFor={`persona-${i}-goals`}>Primary Goals</label>
                <input id={`persona-${i}-goals`} type="text" value={p.goals} onChange={e => updatePersona(i, { goals: e.target.value })}
                  placeholder="What they want to accomplish" />
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary mt-3" onClick={addPersona}>+ Add Persona</button>
      </div>

      <div className="form-section">
        <div className="form-section-title">Feature Specs <span className="badge badge-optional">optional</span></div>
        <p className="form-section-desc">Provide feature specifications to include — paste text, upload a file, or link an ADO work item.</p>
        <div className="spec-mode-tabs">
          {[['paste', 'Paste Text'], ['file', 'Upload File'], ['ado', 'ADO URL']].map(([mode, label]) => (
            <button key={mode} type="button"
              className={`spec-mode-tab ${data.featureSpecMode === mode ? 'active' : ''}`}
              onClick={() => update({ featureSpecMode: mode })}>
              {label}
            </button>
          ))}
        </div>
        {data.featureSpecMode === 'paste' && (
          <div className="form-group">
            <label htmlFor="feat-spec-content">Feature Specification Text</label>
            <textarea id="feat-spec-content" rows={6}
              value={data.featureSpecContent}
              onChange={e => update({ featureSpecContent: e.target.value })}
              placeholder="Paste your feature spec here (Gherkin, user stories, acceptance criteria, etc.)" />
          </div>
        )}
        {data.featureSpecMode === 'file' && (
          <div className="form-group">
            <label htmlFor="feat-spec-file">Upload Spec File</label>
            <input id="feat-spec-file" type="file" accept=".md,.txt,.docx"
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                update({ featureSpecFileName: file.name });
                const reader = new FileReader();
                reader.onload = ev => update({ featureSpecContent: ev.target.result });
                reader.readAsText(file);
              }} />
            {data.featureSpecFileName && <span className="label-hint">Selected: {data.featureSpecFileName}</span>}
            <span className="label-hint">Naming convention: <code>feature-[name]-spec.md</code></span>
          </div>
        )}
        {data.featureSpecMode === 'ado' && (
          <div className="form-group">
            <label htmlFor="feat-spec-url">ADO Work Item URL</label>
            <input id="feat-spec-url" type="url"
              value={data.featureSpecUrl}
              onChange={e => update({ featureSpecUrl: e.target.value })}
              placeholder="https://dev.azure.com/{org}/{project}/_workitems/edit/{id}" />
            <span className="label-hint">Link to an Azure DevOps Epic, Feature, or User Story.</span>
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="form-section-title">NFRs <span className="form-section-subtitle">Non-Functional Requirements</span> <span className="badge badge-optional">optional</span></div>
        <div className="form-group">
          <label htmlFor="proj-biz-constraints">Business <span className="label-hint">one per line</span></label>
          <textarea id="proj-biz-constraints" value={data.businessConstraints} onChange={e => update({ businessConstraints: e.target.value })}
            placeholder="e.g., Must launch by Q3 2026&#10;Must comply with GDPR&#10;Budget: £200k" rows={3} />
        </div>
        <div className="form-group">
          <label htmlFor="proj-tech-constraints">Technical <span className="label-hint">one per line</span></label>
          <textarea id="proj-tech-constraints" value={data.technicalConstraints} onChange={e => update({ technicalConstraints: e.target.value })}
            placeholder="e.g., Must integrate with existing SSO&#10;Azure only — no new cloud providers" rows={3} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Tech Stack ───────────────────────────────────────────────────────
function TechStackStep({ data, update }) {
  const toggle = (field, val) => {
    const arr = data[field] || [];
    update({ [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  const LANGUAGES = ['TypeScript', 'JavaScript', 'C#', 'SQL'];
  const TESTING   = ['Playwright', 'FTA'];
  const INFRA     = ['Azure Services', 'MOVEit', 'Kubernetes (AKS)', 'Cloudflare', 'Microsoft Fabric'];
  const IDENTITY  = ['Auth0', 'Microsoft Entra ID (Azure AD)'];

  return (
    <div>
      <div className="step-header">
        <h1>Tech Stack</h1>
        <p>Define the approved technologies. This fills in <code>context/tech-stack.md</code> — the AI agent references this before every code task.</p>
      </div>

      <div className="form-section">
        <div className="form-section-title">Languages</div>
        <div className="checkbox-grid">
          {LANGUAGES.map(lang => (
            <label key={lang} aria-label={lang} className={`checkbox-item ${data.languages.includes(lang) ? 'checked' : ''}`}>
              <input type="checkbox" checked={data.languages.includes(lang)} onChange={() => toggle('languages', lang)} />
              <div><div className="item-label">{lang}</div></div>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Frameworks</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label htmlFor="fe-select">Frontend Framework</label>
            <select id="fe-select" value={data.frontend} onChange={e => update({ frontend: e.target.value })}>
              <option value="">— Select —</option>
              <option value="React">React</option>
              <option value="Angular">Angular</option>
              <option value="none">None / Not applicable</option>
              <option value="other">Other</option>
            </select>
            {data.frontend === 'other' && (
              <input type="text" className="mt-2" value={data.frontendOther}
                onChange={e => update({ frontendOther: e.target.value })} placeholder="Specify framework" />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="be-select">Backend Framework</label>
            <select id="be-select" value={data.backend} onChange={e => update({ backend: e.target.value })}>
              <option value="">— Select —</option>
              <option value="Node.js">Node.js (JavaScript)</option>
              <option value="ASP.NET Core">.NET / ASP.NET Core</option>
              <option value="none">None / Serverless</option>
              <option value="other">Other</option>
            </select>
            {data.backend === 'other' && (
              <input type="text" className="mt-2" value={data.backendOther}
                onChange={e => update({ backendOther: e.target.value })} placeholder="Specify framework" />
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Testing</div>
        <div className="checkbox-grid">
          {TESTING.map(t => (
            <label key={t} aria-label={t} className={`checkbox-item ${data.testing.includes(t) ? 'checked' : ''}`}>
              <input type="checkbox" checked={data.testing.includes(t)} onChange={() => toggle('testing', t)} />
              <div><div className="item-label">{t}</div></div>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Source Control</div>
        <div className="form-group">
          <label htmlFor="source-control-select">Source Control System</label>
          <select id="source-control-select" value={data.sourceControl} onChange={e => update({ sourceControl: e.target.value })}>
            <option value="">— Select —</option>
            <option value="GitHub">GitHub</option>
            <option value="Azure Repos (Git)">ADO Git (Azure Repos)</option>
            <option value="JFrog Artifactory (Git)">JFrog Artifactory (Git)</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">DevOps &amp; Project Tracking</div>
        <p className="form-hint">Select every tool in use.</p>
        <div className="checkbox-grid">
          {[
            { val: 'Azure DevOps (ADO)', desc: 'Boards, Pipelines, Repos, Artifacts' },
            { val: 'Jira', desc: 'Atlassian project tracking & sprints' },
            { val: 'GitHub Actions', desc: 'CI/CD pipelines on GitHub' },
            { val: 'ServiceNow', desc: 'ITSM, change management' },
            { val: 'DevSecOps', desc: 'Security integrated into CI/CD pipelines' },
          ].map(({ val, desc }) => (
            <label key={val} aria-label={val} className={`checkbox-item ${(data.devops || []).includes(val) ? 'checked' : ''}`}>
              <input type="checkbox" checked={(data.devops || []).includes(val)} onChange={() => toggle('devops', val)} />
              <div>
                <div className="item-label">{val}</div>
                <div className="item-desc">{desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">API Documentation</div>
        <button type="button" className={`mcp-card ${data.useSwagger ? 'selected' : ''}`}
          aria-pressed={!!data.useSwagger} onClick={() => update({ useSwagger: !data.useSwagger })}>
          <MotifIcon icon={Page} size="24" style={{ color: 'var(--ey-charcoal)', flexShrink: 0 }} />
          <div className="mcp-card-body">
            <div className="mcp-name">OpenAPI / Swagger Docs</div>
            <div className="mcp-desc">Adds OpenAPI 3.1 documentation standards — framework setup, required annotations, response schema rules, and a pre-flight checklist for every backend route.</div>
            <code className="mcp-tag">OAS 3.1 · Swagger UI · Swashbuckle · springdoc · swagger-jsdoc</code>
          </div>
        </button>
      </div>

      <div className="form-section">
        <div className="form-section-title">Accessibility &amp; Design Standards</div>
        <button type="button" className={`mcp-card ${data.useA11y ? 'selected' : ''}`}
          aria-pressed={!!data.useA11y} onClick={() => update({ useA11y: !data.useA11y })}>
          <MotifIcon icon={Accessibility} size="24" style={{ color: 'var(--ey-charcoal)', flexShrink: 0 }} />
          <div className="mcp-card-body">
            <div className="mcp-name">Accessibility (WCAG 2.2 AA)</div>
            <div className="mcp-desc">Enforces WCAG 2.2 Level AA — semantic HTML, ARIA rules, keyboard navigation, focus management, colour contrast, and inclusive language.</div>
            <code className="mcp-tag">WCAG 2.2 AA · ARIA · keyboard · screen reader</code>
          </div>
        </button>
        <button type="button" className={`mcp-card ${data.useMotif ? 'selected' : ''}`}
          aria-pressed={!!data.useMotif} onClick={() => update({ useMotif: !data.useMotif })}>
          <MotifIcon icon={MultiplePages} size="24" style={{ color: 'var(--ey-charcoal)', flexShrink: 0 }} />
          <div className="mcp-card-body">
            <div className="mcp-name">Motif Design System</div>
            <div className="mcp-desc">EY's enterprise Web Components library — React, Angular, and HTML. Adds Motif design tokens, component rules, and Figma workflow guidance.</div>
            <code className="mcp-tag">@ey-xd/motif-components · @ey-xd/motif-wc-react</code>
          </div>
        </button>
      </div>

      <div className="form-section">
        <div className="form-section-title">Data &amp; Infrastructure</div>
        <div className="form-group">
          <label htmlFor="db-select">Primary Database</label>
          <select id="db-select" value={data.database} onChange={e => update({ database: e.target.value })}>
            <option value="">— Select —</option>
            <option value="Azure PostgreSQL">PostgreSQL (Azure)</option>
            <option value="SQL Server">SQL Server</option>
            <option value="Azure CosmosDB">Azure CosmosDB</option>
            <option value="MongoDB">MongoDB</option>
            <option value="MySQL">MySQL</option>
            <option value="SQLite">SQLite</option>
            <option value="Redis">Redis (cache)</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="form-section-title mt-3">Infrastructure</div>
        <div className="checkbox-grid">
          {INFRA.map(infItem => (
            <label key={infItem} aria-label={infItem} className={`checkbox-item ${data.infrastructure.includes(infItem) ? 'checked' : ''}`}>
              <input type="checkbox" checked={data.infrastructure.includes(infItem)} onChange={() => toggle('infrastructure', infItem)} />
              <div><div className="item-label">{infItem}</div></div>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Identity &amp; Authentication</div>
        <div className="checkbox-grid">
          {IDENTITY.map(idItem => (
            <label key={idItem} aria-label={idItem} className={`checkbox-item ${(data.identityPlatform || []).includes(idItem) ? 'checked' : ''}`}>
              <input type="checkbox" checked={(data.identityPlatform || []).includes(idItem)} onChange={() => toggle('identityPlatform', idItem)} />
              <div><div className="item-label">{idItem}</div></div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Governance ───────────────────────────────────────────────────────
function GovernanceStep({ data, update, errors = {}, clearError = () => {} }) {
  const toggleLevel = (level) => {
    if (level === 'product' || level === 'enterprise') return;
    const levels = data.levels.includes(level)
      ? data.levels.filter(l => l !== level)
      : [...data.levels, level];
    update({ levels });
  };

  const levels = [
    { id: 'enterprise', label: 'L1 — Enterprise', desc: 'Org-wide rules set by CTO / Enterprise Architect.', badge: 'L1', disabled: true },
    { id: 'bu',         label: 'L2 — Business Unit', desc: 'BU-level reference architectures. Generate with /sdd-blueprint.', badge: 'L2', field: 'buName', placeholder: 'e.g., ATTG, Tax, Assurance' },
    { id: 'domain',     label: 'L3 — Domain', desc: 'Domain namespace and shared models. Generate with /sdd-domain-spec.', badge: 'L3', field: 'domainName', placeholder: 'e.g., ShareTrust, APM, CTP' },
    { id: 'product',    label: 'L4 — Product', desc: 'Product-level principles (always applies). Generated by this wizard.', badge: 'L4', disabled: true },
  ];

  return (
    <div>
      <div className="step-header">
        <h1>Governance Levels</h1>
        <p>Which governance levels apply to this product? Lower levels inherit from higher ones.</p>
      </div>

      <div className="governance-levels">
        {levels.map(l => {
          const isSelected = data.levels.includes(l.id);
          return (
            <div key={l.id}>
              <button type="button"
                className={`gov-level-card ${isSelected ? 'selected' : ''} ${l.disabled ? 'disabled' : ''}`}
                aria-pressed={isSelected} disabled={!!l.disabled}
                onClick={() => !l.disabled && toggleLevel(l.id)}>
                <div className="gov-level-badge">{l.badge}</div>
                <div className="gov-level-info">
                  <div className="gov-level-name">{l.label}</div>
                  <div className="gov-level-desc">{l.desc}</div>
                </div>
              </button>
              {isSelected && l.field && (
                <div className="conditional-field">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor={l.field}>{l.badge === 'L2' ? 'Business Unit' : 'Domain'} <span className="badge badge-required">required</span></label>
                    {l.badge === 'L2' ? (
                      <select id={l.field} className={errors[l.field] ? 'invalid' : ''}
                        value={data[l.field] || ''} onChange={e => { update({ [l.field]: e.target.value }); clearError(l.field); }}>
                        <option value="">— Select Business Unit —</option>
                        <option value="ATTG">ATTG</option>
                        <option value="CBS">CBS</option>
                        <option value="Law">Law</option>
                      </select>
                    ) : (
                      <select id={l.field} className={errors[l.field] ? 'invalid' : ''}
                        value={data[l.field] || ''} onChange={e => { update({ [l.field]: e.target.value }); clearError(l.field); }}>
                        <option value="">— Select Domain —</option>
                        <option value="Trust Tax">Trust Tax</option>
                        <option value="Private Tax">Private Tax</option>
                        <option value="Global Tax">Global Tax</option>
                      </select>
                    )}
                    {errors[l.field] && <span className="field-error">{errors[l.field]}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="alert alert-info mt-4">
        <MotifIcon icon={InfoCircle} size="18" style={{ color: 'var(--ey-charcoal)', flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Not sure?</strong> Start with just L4 (Product). You can add higher-level governance later with <code>/sdd-blueprint</code> or <code>/sdd-domain-spec</code>.
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Principles ───────────────────────────────────────────────────────
function PrinciplesStep({ data, update }) {
  const toggle = (field, val) => {
    const arr = data[field] || [];
    update({ [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  const SECURITY = ['OWASP Top 10', 'GDPR', 'SOC 2', 'HIPAA', 'PCI-DSS', 'ISO 27001'];
  const ARCH_STYLES = [
    { id: 'modular-monolith', label: 'Modular Monolith', desc: 'Single deployable, well-bounded modules' },
    { id: 'microservices', label: 'Microservices', desc: 'Independent services, separate deployments' },
    { id: 'monolith', label: 'Monolith', desc: 'Traditional single-tier application' },
    { id: 'serverless', label: 'Serverless', desc: 'Function-as-a-Service, event-driven' },
    { id: 'event-driven', label: 'Event-Driven', desc: 'Message bus / event streaming architecture' },
  ];

  return (
    <div>
      <div className="step-header">
        <h1>Governing Principles</h1>
        <p>Define the non-negotiables for your project. This fills in <code>context/constitution.md</code>.</p>
      </div>

      <div className="form-section">
        <div className="form-section-title">Quality &amp; Performance</div>
        <div className="form-group">
          <label htmlFor="code-quality">Code Quality Standard</label>
          <input id="code-quality" type="text" value={data.codeQuality} onChange={e => update({ codeQuality: e.target.value })}
            placeholder="e.g., All code must be reviewed, linted, and tested before merge" />
        </div>
        <div className="form-group">
          <label htmlFor="perf-target">Performance Target</label>
          <input id="perf-target" type="text" value={data.performance} onChange={e => update({ performance: e.target.value })}
            placeholder="e.g., p99 latency < 300ms for all user-facing API calls" />
        </div>
        <div className="form-group">
          <label htmlFor="test-coverage">Minimum Test Coverage <span className="label-hint">%</span></label>
          <input id="test-coverage" type="number" value={data.testCoverage} min={0} max={100}
            onChange={e => update({ testCoverage: Number.parseInt(e.target.value) || 0 })} style={{ width: 100 }} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Security Requirements</div>
        <div className="checkbox-grid">
          {SECURITY.map(s => (
            <label key={s} aria-label={s} className={`checkbox-item ${data.security.includes(s) ? 'checked' : ''}`}>
              <input type="checkbox" checked={data.security.includes(s)} onChange={() => toggle('security', s)} />
              <div><div className="item-label">{s}</div></div>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Architecture Style</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ARCH_STYLES.map(style => (
            <label key={style.id} aria-label={style.label} className={`radio-item ${data.architectureStyle === style.id ? 'selected' : ''}`}>
              <input type="radio" name="archStyle" checked={data.architectureStyle === style.id}
                onChange={() => update({ architectureStyle: style.id })} />
              <div>
                <div className="item-label">{style.label}</div>
                <div className="item-desc">{style.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Additional Non-Negotiables <span className="badge badge-optional">optional</span></div>
        <div className="form-group">
          <textarea value={data.additionalRules} onChange={e => update({ additionalRules: e.target.value })}
            placeholder="Any other must-follow rules that every AI action must respect..." rows={3} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: MCP Tools ────────────────────────────────────────────────────────
function MCPStep({ data, update }) {
  const toggle = (tool) => {
    const tools = data.tools.includes(tool)
      ? data.tools.filter(t => t !== tool)
      : [...data.tools, tool];
    update({ tools });
  };

  const MCP_TOOLS = [
    { id: 'github',    icon: Github,       name: 'GitHub MCP',       desc: 'Create issues, PRs, review code directly from Copilot Chat', tag: '@modelcontextprotocol/server-github', env: 'GITHUB_TOKEN' },
    { id: 'ado',       icon: Server,        name: 'Azure DevOps MCP', desc: 'Work items, boards, pipelines, and repos in ADO', tag: 'Built-in (VS Code)', env: null },
    { id: 'sonarqube', icon: Search,        name: 'SonarQube MCP',    desc: 'Query code quality metrics, issues, and security findings', tag: '@sonarsource/mcp-server-sonarqube', env: 'SONAR_TOKEN' },
    { id: 'figma',     icon: MultiplePages, name: 'Figma MCP',        desc: 'Inspect designs, extract tokens, generate component code', tag: 'Built-in (VS Code)', env: null },
    { id: 'context7',  icon: BookStack,     name: 'Context7 MCP',     desc: 'Always-current docs for React, Next.js, Prisma, and 200+ libraries', tag: '@upstash/context7-mcp', env: null },
    { id: 'postgres',  icon: Database,      name: 'PostgreSQL MCP',   desc: 'Query your database schema and data directly from chat', tag: '@modelcontextprotocol/server-postgres', env: 'DATABASE_URL' },
  ];

  return (
    <div>
      <div className="step-header">
        <h1>MCP Tools</h1>
        <p>Select the MCP servers your team will use. We'll generate <code>.vscode/mcp.json</code> with the config — just add your tokens and you're ready.</p>
      </div>

      <div className="mcp-grid">
        {MCP_TOOLS.map(tool => (
          <button key={tool.id} type="button"
            className={`mcp-card ${data.tools.includes(tool.id) ? 'selected' : ''}`}
            aria-pressed={data.tools.includes(tool.id)} onClick={() => toggle(tool.id)}>
            <span className="mcp-card-icon"><MotifIcon icon={tool.icon} size="20" style={{ color: 'var(--ey-charcoal)' }} /></span>
            <div className="mcp-card-body">
              <div className="mcp-name">{tool.name}</div>
              <div className="mcp-desc">{tool.desc}</div>
              <code className="mcp-tag">{tool.tag}</code>
              {tool.env && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Needs: <code>{tool.env}</code></div>}
            </div>
          </button>
        ))}
      </div>

      {data.tools.length === 0 && (
        <div className="alert alert-info mt-4">
          <MotifIcon icon={LightBulbOn} size="18" style={{ color: 'var(--ey-charcoal)', flexShrink: 0, marginTop: 1 }} />
          <div>No MCP tools selected — <code>.vscode/mcp.json</code> won't be generated. You can always add tools later.</div>
        </div>
      )}
    </div>
  );
}

// ─── Step 6: Agent & LLM ─────────────────────────────────────────────────────
function AgentStep({ data, update }) {
  const AGENTS = [
    { id: 'github-copilot', icon: ChatBubble,   name: 'GitHub Copilot', desc: 'VS Code + Copilot Chat — best with .github/ slash commands', config: '.github/copilot-instructions.md' },
    { id: 'claude',         icon: Terminal,      name: 'Claude Code',    desc: 'Terminal-based agent — uses CLAUDE.md', config: 'CLAUDE.md' },
    { id: 'cursor',         icon: CodeBrackets,  name: 'Cursor',         desc: 'Cursor IDE — uses .cursor/rules/', config: '.cursor/rules/' },
    { id: 'gemini',         icon: BrainResearch, name: 'Gemini CLI',     desc: 'Google Gemini CLI — uses .gemini/', config: '.gemini/' },
  ];

  const MODELS = {
    'github-copilot': [
      { id: 'gpt-4o', label: 'GPT-4o', desc: 'Fast, great for coding (default)' },
      { id: 'o3', label: 'o3', desc: 'Best reasoning, slower' },
      { id: 'o1', label: 'o1', desc: 'Strong reasoning, supports tools' },
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', desc: 'Excellent for long context / docs' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Fastest, great for exploration' },
    ],
    'claude': [
      { id: 'claude-opus-4', label: 'Claude Opus 4', desc: 'Most capable' },
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', desc: 'Best balance (recommended)' },
      { id: 'claude-haiku-3-5', label: 'Claude Haiku 3.5', desc: 'Fastest, cheapest' },
    ],
    'cursor': [
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', desc: 'Best for Cursor agent mode' },
      { id: 'gpt-4o', label: 'GPT-4o', desc: 'Fast, widely used' },
      { id: 'o3', label: 'o3', desc: 'Strongest reasoning' },
    ],
    'gemini': [
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Most capable Gemini' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Fastest' },
    ],
  };

  const currentModels = MODELS[data.primary] || MODELS['github-copilot'];

  const handleAgentChange = (agentId) => {
    const defaultModel = MODELS[agentId]?.[0]?.id || 'gpt-4o';
    update({ primary: agentId, model: defaultModel });
  };

  return (
    <div>
      <div className="step-header">
        <h1>Agent & LLM</h1>
        <p>Choose your primary AI coding agent and preferred LLM model.</p>
      </div>

      <div className="form-section">
        <div className="form-section-title">Primary AI Agent</div>
        <div className="agent-grid">
          {AGENTS.map(agent => (
            <button key={agent.id} type="button"
              className={`agent-card ${data.primary === agent.id ? 'selected' : ''}`}
              aria-pressed={data.primary === agent.id} onClick={() => handleAgentChange(agent.id)}>
              <div className="agent-icon"><MotifIcon icon={agent.icon} size="24" style={{ color: 'var(--ey-charcoal)' }} /></div>
              <div className="agent-name">{agent.name}</div>
              <div className="agent-desc">{agent.desc}</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: 6 }}>{agent.config}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Default LLM Model</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {currentModels.map(m => (
            <label key={m.id} aria-label={m.label} className={`radio-item ${data.model === m.id ? 'selected' : ''}`}>
              <input type="radio" name="model" checked={data.model === m.id}
                onChange={() => update({ model: m.id })} />
              <div>
                <div className="item-label">{m.label}</div>
                <div className="item-desc">{m.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 7: Preview ──────────────────────────────────────────────────────────
function PreviewStep({ files, activeTab, onTabChange, copied, onCopy }) {
  if (!files) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Generating files…</div>;
  const fileEntries = Object.entries(files);

  return (
    <div>
      <div className="step-header">
        <h1>Preview Generated Files</h1>
        <p>
          {fileEntries.length} files ready. Review the key files below, then click
          <strong> Publish to GitHub →</strong> to create your repository.
        </p>
      </div>

      <div className="preview-container">
        <div className="preview-tabs">
          {fileEntries.map(([path]) => (
            <button key={path}
              className={`preview-tab ${activeTab === path ? 'active' : ''}`}
              onClick={() => onTabChange(path)}>
              {path}
            </button>
          ))}
        </div>
        {activeTab && files[activeTab] && (
          <div className="preview-pane">
            <button className="preview-copy-btn" onClick={() => onCopy(activeTab, files[activeTab])}>
              {copied === activeTab ? '✓ Copied' : 'Copy'}
            </button>
            <pre>{files[activeTab]}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 8: Publish to GitHub ────────────────────────────────────────────────
function PublishStep({ files, projectName }) {
  return (
    <div>
      <div className="step-header">
        <h1>Publish to GitHub</h1>
        <p>
          Enter a Personal Access Token to create a new repository and push all{' '}
          {files ? Object.keys(files).length : 0} files in a single initial commit.
        </p>
      </div>

      <GitHubPublish
        files={files}
        projectName={projectName}
      />
    </div>
  );
}

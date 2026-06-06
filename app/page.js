'use client';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const AGENTS = [
  {
    id: 'jd', name: 'JD Agent', icon: '📄',
    description: 'Parsing job description...',
    tasks: ['Extracting required skills', 'Identifying ATS keywords', 'Detecting red flags', 'Analyzing experience level'],
    color: 'blue', duration: 30,
  },
  {
    id: 'resume', name: 'Resume Agent', icon: '👤',
    description: 'Reading your resume...',
    tasks: ['Extracting PDF text', 'Chunking with FAISS', 'Parsing skills & projects', 'Mapping experience'],
    color: 'purple', duration: 35,
  },
  {
    id: 'gap', name: 'Gap Agent', icon: '🔍',
    description: 'Analyzing skill gaps...',
    tasks: ['Comparing JD vs Resume', 'Scoring ATS match', 'Rewriting weak bullets', 'Building action plan'],
    color: 'amber', duration: 35,
  },
  {
    id: 'done', name: 'LangGraph', icon: '✅',
    description: 'Compiling final report...',
    tasks: ['Aggregating agent outputs', 'Finalizing match score'],
    color: 'green', duration: 10,
  },
];

const colorMap = {
  blue:   { ring: 'ring-blue-500/60',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/30',   bar: 'bg-blue-500',   dot: 'bg-blue-400' },
  purple: { ring: 'ring-purple-500/60', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', bar: 'bg-purple-500', dot: 'bg-purple-400' },
  amber:  { ring: 'ring-amber-500/60',  bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/30',  bar: 'bg-amber-500',  dot: 'bg-amber-400' },
  green:  { ring: 'ring-green-500/60',  bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/30',  bar: 'bg-green-500',  dot: 'bg-green-400' },
};

function AgentPipelineLoader() {
  const [activeAgent, setActiveAgent] = useState(0);
  const [completedAgents, setCompletedAgents] = useState([]);
  const [activeTask, setActiveTask] = useState(0);
  const [taskProgress, setTaskProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const i = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const agent = AGENTS[activeAgent];
    if (!agent) return;
    setActiveTask(0);
    setTaskProgress(0);
    const taskCount = agent.tasks.length;
    const taskDuration = (agent.duration * 1000) / taskCount;
    let current = 0;
    const taskInt = setInterval(() => {
      current++;
      if (current < taskCount) { setActiveTask(current); setTaskProgress(0); }
      else {
        clearInterval(taskInt);
        setCompletedAgents(prev => [...prev, activeAgent]);
        setActiveAgent(prev => Math.min(prev + 1, AGENTS.length - 1));
      }
    }, taskDuration);
    const progInt = setInterval(() => setTaskProgress(p => Math.min(p + 2, 100)), taskDuration / 50);
    return () => { clearInterval(taskInt); clearInterval(progInt); };
  }, [activeAgent]);

  const agent = AGENTS[activeAgent];
  const c = agent ? colorMap[agent.color] : null;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 px-8 py-6">
      <div className="text-center">
        <div className="text-lg font-semibold text-white mb-1">Running AI Pipeline{dots}</div>
        <div className="text-sm text-white/40">3 specialized agents analyzing your profile</div>
      </div>

      {/* Pipeline nodes */}
      <div className="flex items-center gap-2 w-full max-w-2xl">
        {AGENTS.map((ag, idx) => {
          const isDone = completedAgents.includes(idx);
          const isActive = activeAgent === idx;
          const isPending = !isDone && !isActive;
          const cc = colorMap[ag.color];
          return (
            <div key={ag.id} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 rounded-2xl border p-3 text-center transition-all duration-500
                ${isActive ? `${cc.bg} ${cc.border} ${cc.ring} ring-2 scale-105 shadow-xl` : ''}
                ${isDone ? 'bg-white/5 border-white/15 opacity-60' : ''}
                ${isPending ? 'bg-white/3 border-white/8 opacity-25' : ''}
              `}>
                <div className={`text-xl mb-1 ${isActive ? 'animate-bounce' : ''}`}>{isDone ? '✅' : ag.icon}</div>
                <div className={`text-xs font-semibold ${isActive ? cc.text : isDone ? 'text-white/40' : 'text-white/15'}`}>{ag.name}</div>
                {isActive && <div className={`text-[10px] mt-0.5 ${cc.text} opacity-60`}>{ag.description}</div>}
              </div>
              {idx < AGENTS.length - 1 && (
                <div className={`text-base transition-all duration-500 flex-shrink-0 ${completedAgents.includes(idx) ? 'text-white/50' : 'text-white/10'}`}>→</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active agent detail */}
      {agent && c && (
        <div className={`w-full max-w-2xl rounded-2xl border p-5 transition-all duration-500 ${c.bg} ${c.border}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl animate-pulse">{agent.icon}</div>
            <div>
              <div className={`text-sm font-semibold ${c.text}`}>{agent.name} — Active</div>
              <div className="text-xs text-white/40">{agent.description}</div>
            </div>
            <div className="ml-auto">
              <svg className={`animate-spin w-5 h-5 ${c.text}`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {agent.tasks.map((task, i) => {
              const isDoneTask = i < activeTask;
              const isActiveTask = i === activeTask;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold
                    ${isDoneTask ? 'bg-white/20 text-white/50' : isActiveTask ? `${c.dot} animate-pulse` : 'bg-white/5'}
                  `}>{isDoneTask ? '✓' : ''}</div>
                  <div className={`text-sm flex-1
                    ${isDoneTask ? 'text-white/35 line-through' : isActiveTask ? 'text-white/85 font-medium' : 'text-white/20'}
                  `}>{task}</div>
                  {isActiveTask && (
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-200 ${c.bar}`} style={{ width: `${taskProgress}%` }}/>
                    </div>
                  )}
                  {isDoneTask && <span className="text-[10px] text-white/25">done</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall progress */}
      <div className="w-full max-w-2xl">
        <div className="flex justify-between text-xs text-white/30 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round((completedAgents.length / AGENTS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${(completedAgents.length / AGENTS.length) * 100}%` }}/>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [jdText, setJdText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!file || !jdText) { setError('Please upload resume and paste job description!'); return; }
    setError(''); setLoading(true); setResult(null);
    const formData = new FormData();
    formData.append('jd_text', jdText);
    formData.append('resume', file);
    try {
      const res = await fetch('http://localhost:8000/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setResult(data.gap_analysis);
      else setError(data.error || 'Something went wrong!');
    } catch (e) { setError('Cannot connect to backend. Is FastAPI running?'); }
    setLoading(false);
  };

  const handleClear = () => { setJdText(''); setFile(null); setResult(null); setError(''); };
  const scoreColor = (score) => { const n = parseInt(score); if (n >= 75) return '#22c55e'; if (n >= 50) return '#f59e0b'; return '#ef4444'; };
  const extractScore = (scoreStr) => { const match = String(scoreStr).match(/\d+/); return match ? parseInt(match[0]) : 0; };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <nav className="border-b border-white/10 px-6 py-3 flex items-center justify-between bg-[#0f0f0f] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">AI</div>
          <div>
            <div className="text-base font-semibold text-white">AI Job Assistant</div>
            <div className="text-xs text-white/40">by Vineet Prakash</div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-white/50">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">JD Agent</span>
            <span>→</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">Resume Agent</span>
            <span>→</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">Gap Agent</span>
            <span>→</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">LangGraph</span>
          </div>
          <div className="text-xs text-white/40">Powered by <span className="text-blue-400 font-medium">Groq + LLaMA3</span></div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-52px)]">
        {/* Left Pane */}
        <div className="w-80 min-w-80 border-r border-white/10 p-5 flex flex-col gap-5 bg-[#111111]">
          <div>
            <div className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Resume</div>
            <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl p-5 cursor-pointer hover:border-blue-500/60 hover:bg-blue-500/5 transition-all">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-white/70 font-medium">{file ? file.name : 'Drop your resume here'}</span>
              <span className="text-xs text-white/30">PDF supported</span>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Job Description</div>
            <textarea
              className="w-full h-52 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-sm text-white/80 placeholder-white/25 resize-none focus:outline-none focus:border-blue-500/60 leading-relaxed"
              placeholder="Paste job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
          {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}
          <div className="flex gap-2">
            <button onClick={handleAnalyze} disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Analyzing...</>) : '✦ Analyze'}
            </button>
            <button onClick={handleClear} className="px-4 py-2.5 text-sm text-white/50 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white/80 transition-all">Clear</button>
          </div>
          <div className="text-xs text-white/20 text-center">🔒 Your data stays private. No storage.</div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-white/20">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-4xl">✦</div>
              <div className="text-base font-medium">Upload resume + paste JD to get started</div>
              <div className="text-sm">AI will analyze skill gaps, ATS keywords & more</div>
            </div>
          )}

          {loading && <AgentPipelineLoader />}

          {result && (
            <div className="flex flex-col gap-6 p-6">
              <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-widest">Match Score</div>
                  <div className="text-6xl font-bold" style={{ color: scoreColor(result.match_score) }}>
                    {extractScore(result.match_score)}<span className="text-2xl text-white/30 font-normal">/100</span>
                  </div>
                  <div className="text-sm text-white/50 leading-relaxed max-w-lg">{result.match_score}</div>
                  <Progress value={extractScore(result.match_score)} className="w-56 h-2 mt-1" />
                </div>
                <div className="flex flex-col gap-3 items-end">
                  <div className="text-sm text-white/50">Present <span className="text-green-400 font-bold text-base ml-1">{result.present_skills?.length || 0}</span></div>
                  <div className="text-sm text-white/50">Missing <span className="text-red-400 font-bold text-base ml-1">{result.missing_skills?.length || 0}</span></div>
                  <div className="text-sm text-white/50">ATS gaps <span className="text-amber-400 font-bold text-base ml-1">{result.ats_keywords_missing?.length || 0}</span></div>
                </div>
              </div>

              <Tabs defaultValue="skills">
                <TabsList className="bg-[#1a1a1a] border border-white/10 p-1 rounded-xl gap-1">
                  <TabsTrigger value="skills" className="text-sm text-white/50 rounded-lg px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Skill Gap</TabsTrigger>
                  <TabsTrigger value="ats" className="text-sm text-white/50 rounded-lg px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">ATS Keywords</TabsTrigger>
                  <TabsTrigger value="bullets" className="text-sm text-white/50 rounded-lg px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Resume Rewrite</TabsTrigger>
                  <TabsTrigger value="actions" className="text-sm text-white/50 rounded-lg px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Action Items</TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="mt-5 flex flex-col gap-5">
                  <div>
                    <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">✅ Present Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {result.present_skills?.map((s, i) => (<span key={i} className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/15 text-green-400 border border-green-500/25">{s}</span>))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">❌ Missing Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills?.map((s, i) => (<span key={i} className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/15 text-red-400 border border-red-500/25">{s}</span>))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ats" className="mt-5">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">⚠️ ATS Keywords Missing</div>
                  <div className="flex flex-wrap gap-2">
                    {result.ats_keywords_missing?.map((s, i) => (<span key={i} className="px-3 py-1 rounded-full text-sm font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">{s}</span>))}
                  </div>
                </TabsContent>

                <TabsContent value="bullets" className="mt-5 flex flex-col gap-4">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">🚀 Optimized Resume Bullets</div>
                  {result.new_bullets?.map((bullet, i) => (
                    <div key={i} className="bg-[#141414] border border-green-500/20 rounded-xl px-4 py-3 bg-green-500/5">
                      <div className="text-xs text-green-400/80 font-semibold mb-1.5">+ optimized</div>
                      <div className="text-sm text-white/80 leading-relaxed">{bullet}</div>
                    </div>
                  ))}
                  {result.weak_bullets?.length > 0 && (
                    <div className="mt-2 flex flex-col gap-3">
                      <div className="text-xs font-semibold text-white/40 uppercase tracking-widest">⚠️ Weak Bullets to Improve</div>
                      {result.weak_bullets?.map((bullet, i) => (
                        <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
                          <div className="text-xs text-red-400/80 font-semibold mb-1.5">— original</div>
                          <div className="text-sm text-white/60 leading-relaxed">{bullet}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="mt-5 flex flex-col gap-3">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">🎯 Priority Action Items</div>
                  {result.priority_actions?.map((action, i) => (
                    <div key={i} className="flex items-start gap-4 bg-[#141414] border border-white/10 rounded-xl p-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">{i+1}</div>
                      <div className="text-sm text-white/80 leading-relaxed">{action}</div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0f0f0f] px-6 py-2.5 flex items-center justify-between">
        <div className="text-xs text-white/25">AI Job Assistant — Built by Vineet Prakash</div>
        <div className="flex items-center gap-5">
          <a href="https://github.com/vin1bun" target="_blank" className="text-xs text-white/35 hover:text-blue-400 transition-colors">GitHub</a>
          <a href="https://linkedin.com/in/vineetprakash03" target="_blank" className="text-xs text-white/35 hover:text-blue-400 transition-colors">LinkedIn</a>
          <a href="https://vin1bun.github.io" target="_blank" className="text-xs text-white/35 hover:text-blue-400 transition-colors">Portfolio</a>
        </div>
      </div>
    </div>
  );
}
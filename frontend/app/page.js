'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, BarChart2, Star, Github, Linkedin, Globe, Mail, Code } from 'lucide-react';
import VisualAnalytics from './components/VisualAnalytics';

export default function Home() {
  const [file, setFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdType, setJdType] = useState('pdf'); // 'pdf' or 'text'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [jdDragging, setJdDragging] = useState(false);

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        return alert("Only PDF files are allowed.");
      }
      if (type === 'resume') setFile(selected);
      if (type === 'jd') setJdFile(selected);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    if (type === 'resume') setDragging(false);
    if (type === 'jd') setJdDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type !== "application/pdf") {
        return alert("Only PDF files are allowed.");
      }
      if (type === 'resume') setFile(selected);
      if (type === 'jd') setJdFile(selected);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a resume (PDF).");
    if (jdType === 'pdf' && !jdFile) return alert("Please upload a Job Description PDF.");
    if (jdType === 'text' && !jdText.trim()) return alert("Please paste the Job Description text.");

    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('resume', file);

    if (jdType === 'pdf') {
      formData.append('job_description_file', jdFile);
    } else {
      formData.append('job_description_text', jdText);
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Error analyzing: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-snow text-slate-800 font-sans selection:bg-cyan selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-silver/50 bg-snow/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 group cursor-pointer hover:scale-105 transition-all">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-silver group-hover:border-orange group-hover:rotate-6 transition-all">
              <img src="/logo.png" alt="Matchly AI Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange to-cyan group-hover:tracking-wider transition-all">
              Matchly AI
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-sm text-slate-400 hover:text-orange font-bold uppercase tracking-widest transition-all">Documentation</a>
            <div className="h-4 w-[1px] bg-silver"></div>
            <span className="text-sm text-slate-500 font-black uppercase tracking-widest px-3 py-1 bg-silver/10 rounded-full border border-silver/20">v2.0 Beta</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Optimize Your Resume with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-cyan">
              AI-Powered Precision
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your resume and the job description. Get instant feedback, ATS scoring, and improvement suggestions to land your dream job.
          </p>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Resume Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-orange" />
                1. Upload Resume
              </h2>
              <span className="text-xs text-white font-bold bg-orange px-2 py-1 rounded shadow-sm">PDF ONLY</span>
            </div>

            <div
              className={`border-2 border-dashed rounded-3xl p-8 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col items-center justify-center text-center h-64 shadow-sm group relative overflow-hidden
                ${dragging ? 'border-orange bg-orange/5 scale-[1.02] shadow-orange/10' : 'border-silver hover:border-orange/50 hover:bg-white hover:shadow-2xl hover:-translate-y-2'}
                ${file ? 'bg-orange/5 border-orange/30' : 'bg-white/50'}
              `}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => handleDrop(e, 'resume')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'resume')}
              />

              {file ? (
                <div className="space-y-4 animate-in fade-in zoom-in duration-500 relative z-10">
                  <div className="w-20 h-20 bg-cyan/10 text-cyan rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-orange hover:text-red-600 font-bold uppercase tracking-wider transition-all duration-300 hover:tracking-widest"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <label htmlFor="resume-upload" className="cursor-pointer space-y-4 w-full h-full flex flex-col items-center justify-center relative z-10">
                  <div className="w-20 h-20 bg-silver/20 rounded-2xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-orange group-hover:bg-orange/10 group-hover:scale-110 transition-all duration-500">
                    <Upload className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-lg">Drop your resume here</p>
                    <p className="text-sm text-slate-500">Accepts high-quality PDF files</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* JD Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-cyan" />
                2. Job Description
              </h2>

              <div className="flex bg-silver/20 rounded-xl p-1.5 border border-silver/50 shadow-inner">
                <button
                  onClick={() => setJdType('pdf')}
                  className={`px-4 py-1.5 text-xs font-black uppercase tracking-tighter rounded-lg transition-all ${jdType === 'pdf' ? 'bg-cyan text-white shadow-lg' : 'text-slate-400 hover:text-cyan hover:bg-cyan/5'}`}
                >
                  Upload PDF
                </button>
                <button
                  onClick={() => setJdType('text')}
                  className={`px-4 py-1.5 text-xs font-black uppercase tracking-tighter rounded-lg transition-all ${jdType === 'text' ? 'bg-cyan text-white shadow-lg' : 'text-slate-400 hover:text-cyan hover:bg-cyan/5'}`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {jdType === 'pdf' ? (
              <div
                className={`border-2 border-dashed rounded-3xl p-8 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col items-center justify-center text-center h-64 shadow-sm group relative overflow-hidden
                    ${jdDragging ? 'border-cyan bg-cyan/5 scale-[1.02] shadow-cyan/10' : 'border-silver hover:border-cyan/50 hover:bg-white hover:shadow-2xl hover:-translate-y-2'}
                    ${jdFile ? 'bg-cyan/5 border-cyan/30' : 'bg-white/50'}
                `}
                onDragOver={(e) => { e.preventDefault(); setJdDragging(true); }}
                onDragLeave={() => setJdDragging(false)}
                onDrop={(e) => handleDrop(e, 'jd')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <input
                  type="file"
                  id="jd-upload"
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'jd')}
                />

                {jdFile ? (
                  <div className="space-y-4 animate-in fade-in zoom-in duration-500 relative z-10">
                    <div className="w-20 h-20 bg-cyan/10 text-cyan rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 group-hover:rotate-[-3deg] transition-transform duration-500">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{jdFile.name}</p>
                      <p className="text-sm text-slate-500">{(jdFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => setJdFile(null)}
                      className="text-sm text-orange hover:text-red-600 font-bold uppercase tracking-wider transition-all duration-300 hover:tracking-widest"
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <label htmlFor="jd-upload" className="cursor-pointer space-y-4 w-full h-full flex flex-col items-center justify-center relative z-10">
                    <div className="w-20 h-20 bg-silver/20 rounded-2xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-cyan group-hover:bg-cyan/10 group-hover:scale-110 transition-all duration-500">
                      <Upload className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-lg">Drop JD PDF here</p>
                      <p className="text-sm text-slate-500">Directly analyze job requirements</p>
                    </div>
                  </label>
                )}
              </div>
            ) : (
              <div className="relative h-64 animate-in fade-in duration-300 shadow-inner rounded-2xl">
                <textarea
                  className="w-full h-full bg-white/60 border border-silver rounded-2xl p-6 focus:ring-2 focus:ring-cyan focus:border-transparent outline-none resize-none text-slate-800 placeholder-slate-400 transition-all font-mono text-sm leading-relaxed"
                  placeholder="Paste the job description here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                ></textarea>
                <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                  {jdText.length} characters
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-16">
          <button
            onClick={handleAnalyze}
            disabled={loading || !file || (jdType === 'pdf' ? !jdFile : !jdText)}
            className={`
                group relative px-10 py-4 bg-gradient-to-r from-orange to-red-500 rounded-2xl font-bold text-xl text-white shadow-xl shadow-orange/30 transition-all duration-500 hover:shadow-orange/50 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform"></div>
            <span className="relative z-10 flex items-center gap-3">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  Start Analysis <Star className="w-6 h-6 fill-white animate-pulse" />
                </>
              )}
            </span>
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="reveal-item space-y-10">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Score Card */}
              <div className="md:col-span-1 bg-white border border-silver rounded-[2rem] p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <p className="text-slate-400 mb-2 font-bold uppercase tracking-[0.2em] text-xs">Match Score</p>
                  <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 mb-4 group-hover:scale-110 transition-transform duration-700 ease-out">
                    {result.analysis.overall_score}
                  </div>
                  <div className="w-32 bg-silver/30 h-1.5 rounded-full mx-auto overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange to-red-500 transition-all duration-[1.5s] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{ width: `${result.analysis.overall_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="md:col-span-2 bg-white border border-silver rounded-[2rem] p-10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
                  <BarChart2 className="w-6 h-6 text-orange" /> Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <ScoreItem label="Skill Alignment" value={result.analysis.skill_match_percent} desc="Keyword overlap" />
                  <ScoreItem label="Experience" value={result.analysis.breakdown.experience_score + " pts"} desc={`~${result.analysis.detected_years_experience} Yrs Found`} />
                  <ScoreItem label="Education" value={result.analysis.breakdown.education_score + "/10"} desc="Academic check" />
                  <ScoreItem label="Strategic Fit" value={"+" + result.analysis.breakdown.bonus} desc="Bonus markers" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Skill Gap Analysis */}
              <div className="bg-orange/5 border border-orange/10 rounded-[2rem] p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <h3 className="text-xl font-black text-orange mb-6 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 animate-pulse" /> Strategic Gaps
                </h3>
                {result.analysis.skill_gap_analysis && result.analysis.skill_gap_analysis.length > 0 ? (
                  <div className="space-y-3">
                    {result.analysis.skill_gap_analysis.map((item, i) => (
                      <div key={i} className={`bg-white border rounded-xl p-4 shadow-sm ${item.severity === 'high' ? 'border-red-200' : 'border-orange-200'}`}>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 text-lg">{item.skill}</span>
                          <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${item.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                            {item.severity === 'high' ? 'Missing' : 'Weak Match'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">{item.reason}</p>
                        <div className="mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-xs text-slate-400 uppercase font-bold mb-1">How to fix:</p>
                          <p className="text-sm text-slate-700">{item.how_to_improve}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  result.analysis.missing_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.missing_skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-white text-orange border border-orange/20 rounded-lg text-sm shadow-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-400">Great job! No major skill gaps detected.</p>
                  )
                )}
              </div>

              {/* Matched Skills */}
              <div className="bg-cyan/5 border border-cyan/10 rounded-[2rem] p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <h3 className="text-xl font-black text-cyan mb-6 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" /> Proven Assets
                </h3>
                {result.analysis.matched_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {result.analysis.matched_skills.map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-white text-slate-700 border border-cyan/10 rounded-xl text-sm shadow-sm font-bold hover:scale-110 hover:shadow-md hover:border-cyan/30 transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No direct assets identified.</p>
                )}
              </div>
            </div>

            {/* AI Insights Section */}
            {result.ai_insights && (
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-orange/10 transition-colors duration-1000"></div>
                <h3 className="text-3xl font-black mb-10 flex items-center gap-4 relative z-10">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-cyan">
                    AI Insight Report
                  </span>
                  <div className="px-3 py-1 bg-cyan/10 text-cyan text-xs rounded-full border border-cyan/20 font-black tracking-widest uppercase">Universal Engine</div>
                </h3>

                <div className="space-y-8 relative z-10">
                  {/* Summary */}
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/[0.08] transition-colors duration-500">
                    <h4 className="text-orange font-black mb-4 text-xs uppercase tracking-[0.3em]">Evaluation Summary</h4>
                    <p className="text-slate-100 leading-relaxed text-xl font-medium" dangerouslySetInnerHTML={{ __html: result.ai_insights.summary }}></p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Strengths */}
                    <div className="space-y-4">
                      <h4 className="text-cyan font-black flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                        Major Strengths
                      </h4>
                      <ul className="space-y-3">
                        {result.ai_insights.strengths.map((str, i) => (
                          <li key={i} className="flex gap-4 text-slate-300 text-sm bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-cyan/20 transition-all duration-300">
                            <span className="text-cyan font-bold">●</span>
                            <span dangerouslySetInnerHTML={{ __html: str }}></span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Plan */}
                    <div className="space-y-4">
                      <h4 className="text-orange font-black flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                        Optimization Paths
                      </h4>
                      <ul className="space-y-3">
                        {result.ai_insights.action_plan.map((action, i) => (
                          <li key={i} className="flex gap-4 text-slate-300 text-sm bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-orange/20 transition-all duration-300">
                            <span className="text-orange font-bold">→</span>
                            <span dangerouslySetInnerHTML={{ __html: action }}></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Match Report (New Functionality) */}
            {result.debug_advanced?.detailed_match_report && (
              <div className="bg-white border border-silver rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <span className="text-orange">🔍</span> Detailed Evidence Report
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-silver text-xs uppercase text-slate-500 tracking-wider">
                        <th className="p-3 font-semibold">Requirement</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 font-semibold">Evidence Found</th>
                        <th className="p-3 font-semibold text-right">Confidence</th>
                        <th className="p-3 font-semibold text-right">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {result.debug_advanced.detailed_match_report.map((item, idx) => (
                        <tr key={idx} className="border-b border-silver/50 hover:bg-slate-50 transition-colors group">
                          <td className="p-3 font-medium text-slate-700 group-hover:text-orange transition-colors">{item.job_requirement || item.requirement}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase transition-all duration-300 group-hover:scale-105 inline-block ${(item.match_status || item.status) === 'strong' ? 'bg-cyan/10 text-cyan' :
                              (item.match_status || item.status) === 'partial' ? 'bg-orange/10 text-orange' :
                                'bg-red-50 text-red-500'
                              }`}>
                              {item.match_status || item.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 max-w-sm truncate" title={item.resume_evidence || item.evidence}>
                            {item.resume_evidence || item.evidence || '-'}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500">
                            {item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : '-'}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-700 font-bold group-hover:text-cyan transition-colors">
                            +{item.score_impact}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Visual Analytics */}
            <div className="mt-8">
              <VisualAnalytics breakdown={result.analysis.breakdown} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700">
                  <img src="/logo.png" alt="Matchly AI Logo" className="w-full h-full object-cover opacity-80" />
                </div>
                <span className="text-xl font-black text-white tracking-wider">
                  Matchly AI
                </span>
              </div>
              <p className="text-sm max-w-sm">
                Advanced resume optimization powered by semantic analysis and large language models.
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">
                Made By Developer Bharath Kumar K
              </p>
            </div>

            <div className="flex flex-col md:items-end space-y-4">
              <div className="flex flex-wrap gap-4">
                <a href="mailto:bharathkumatkbk10@gmail.com" className="p-2 bg-slate-800 rounded-lg hover:bg-orange hover:text-white transition-all group" title="Email">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/bharath-kumar-k-b35ba0304" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-[#0077b5] hover:text-white transition-all group" title="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://github.com/Bharath-Kumar-K-0930" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-black hover:text-white transition-all group" title="GitHub Profile">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://bharath-kumar-k-0930.github.io/My_Portfolio_website/" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-cyan hover:text-white transition-all group" title="Portfolio">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="https://leetcode.com/u/Bharath_Kumar_K_91/" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-[#FFA116] hover:text-white transition-all group" title="LeetCode">
                  <Code className="w-5 h-5" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <a href="https://github.com/Bharath-Kumar-K-0930/Matchly-AI.git" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-cyan transition-colors">
                  <Github className="w-4 h-4" />
                  <span>Source Code</span>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; {new Date().getFullYear()} Matchly AI. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Built with Next.js, FastAPI & Python</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ScoreItem({ label, value, desc }) {
  return (
    <div className="bg-slate-50 hover:bg-white p-6 rounded-[1.5rem] border border-silver/40 shadow-sm hover:shadow-2xl hover:border-orange/20 hover:-translate-y-2 transition-all duration-500 group cursor-default">
      <div className="text-slate-400 text-xs mb-2 group-hover:text-slate-600 transition-colors uppercase tracking-[0.2em] font-black">{label}</div>
      <div className="text-3xl font-black text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange group-hover:to-cyan transition-all duration-700 ease-out">{value}</div>
      <div className="text-[10px] text-orange font-black uppercase tracking-widest">{desc}</div>
    </div>
  );
}

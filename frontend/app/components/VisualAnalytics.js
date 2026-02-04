'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export default function VisualAnalytics({ breakdown }) {
    // Transform breakdown for Bar Chart
    // Note: We use stackId to overlay "score" on top of "full" if we want progress bar style,
    // or separate bars. Here I want a background bar "full" and foreground "score".
    // But stacked bars stack ON TOP. So I need "remaining" = full - score.

    const barData = [
        { name: 'Skills', score: breakdown.skill_score, remaining: Math.max(0, 35 - breakdown.skill_score), full: 35 },
        { name: 'Resp', score: breakdown.responsibility_score, remaining: Math.max(0, 25 - breakdown.responsibility_score), full: 25 },
        { name: 'Exp', score: breakdown.experience_score, remaining: Math.max(0, 20 - breakdown.experience_score), full: 20 },
        { name: 'Stack', score: breakdown.stack_score, remaining: Math.max(0, 10 - breakdown.stack_score), full: 10 },
        { name: 'ATS', score: breakdown.ats_score, remaining: Math.max(0, 10 - breakdown.ats_score), full: 10 },
    ];

    // Transform for Radar Chart (normalize to 100% scale for shape comparison)
    const radarData = [
        { subject: 'Skills', A: Math.min(100, (breakdown.skill_score / 35) * 100), fullMark: 100 },
        { subject: 'Impact', A: Math.min(100, (breakdown.responsibility_score / 25) * 100), fullMark: 100 },
        { subject: 'Depth', A: Math.min(100, (breakdown.experience_score / 20) * 100), fullMark: 100 },
        { subject: 'Stack', A: Math.min(100, (breakdown.stack_score / 10) * 100), fullMark: 100 },
        { subject: 'ATS', A: Math.min(100, (breakdown.ats_score / 10) * 100), fullMark: 100 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid md:grid-cols-2 gap-8">

                {/* Score Breakdown (Bar) */}
                <div className="bg-white border border-silver rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                        📊 Score Breakdown
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide domain={[0, 'dataMax']} />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={40} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value, name) => [value, name === 'remaining' ? 'Remaining' : 'Score']}
                                />

                                {/* Stacked Bar: Score + Remaining = Full. Score is colored, remaining is gray. */}
                                <Bar dataKey="score" stackId="a" fill="url(#colorGradient)" barSize={20} radius={[5, 0, 0, 5]} />
                                <Bar dataKey="remaining" stackId="a" fill="#f1f5f9" barSize={20} radius={[0, 5, 5, 0]} />

                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Profile */}
                <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/20 blur-[50px] rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange/20 blur-[50px] rounded-full"></div>

                    <h3 className="text-lg font-black mb-6 relative z-10">
                        🎯 Competency Radar
                    </h3>
                    <div className="h-64 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Match %"
                                    dataKey="A"
                                    stroke="#22d3ee"
                                    strokeWidth={3}
                                    fill="#22d3ee"
                                    fillOpacity={0.3}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#22d3ee' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

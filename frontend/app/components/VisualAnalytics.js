'use client';

import {
    RadialBarChart, RadialBar, Legend, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';

export default function VisualAnalytics({ breakdown, overallScore }) {
    // 1. Prepare Data for Radial Bar Chart (Profile DNA)
    // Scores are normalized to 100 for proper ring sizing
    const radialData = [
        { name: 'ATS Scan', score: (breakdown.ats_score / 10) * 100, xVal: breakdown.ats_score, full: 10, fill: '#64748b' }, // Slate (Base)
        { name: 'Tech Stack', score: (breakdown.stack_score / 10) * 100, xVal: breakdown.stack_score, full: 10, fill: '#eab308' }, // Yellow/Gold
        { name: 'Experience', score: (breakdown.experience_score / 20) * 100, xVal: breakdown.experience_score, full: 20, fill: '#06b6d4' }, // Cyan
        { name: 'Impact', score: (breakdown.responsibility_score / 25) * 100, xVal: breakdown.responsibility_score, full: 25, fill: '#a855f7' }, // Purple
        { name: 'Skills', score: breakdown.skill_score && breakdown.skill_score > 0 ? (breakdown.skill_score / 35) * 100 : 0, xVal: breakdown.skill_score, full: 35, fill: '#f97316' }, // Orange (Outer)
    ];

    // 2. Prepare Data for Radar Chart (Holographic View)
    const radarData = [
        { subject: 'Skills', A: Math.min(100, (breakdown.skill_score / 35) * 100), full: 100 },
        { subject: 'Impact', A: Math.min(100, (breakdown.responsibility_score / 25) * 100), full: 100 },
        { subject: 'Depth', A: Math.min(100, (breakdown.experience_score / 20) * 100), full: 100 },
        { subject: 'Stack', A: Math.min(100, (breakdown.stack_score / 10) * 100), full: 100 },
        { subject: 'ATS', A: Math.min(100, (breakdown.ats_score / 10) * 100), full: 100 },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)] text-white animate-in zoom-in-95 duration-200">
                    <p className="font-bold text-sm mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill || '#22d3ee' }}></span>
                        {data.name || data.subject}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="font-mono text-cyan font-black text-2xl">
                            {typeof data.xVal === 'number' ? data.xVal.toFixed(1) : payload[0].value.toFixed(0)}
                        </span>
                        <span className="text-slate-400 text-xs font-bold uppercase">
                            {data.full ? `/ ${data.full} pts` : '% Match'}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            {/* Container Grid */}
            <div className="grid lg:grid-cols-2 gap-8">

                {/* Chart 1: Profile DNA (Radial) */}
                <div className="bg-white border border-silver rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                    {/* Subtle Background Gradient */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange/5 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                🧬 Profile DNA
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Component Breakdown</p>
                        </div>
                    </div>

                    <div className="h-80 relative z-10 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                innerRadius="30%"
                                outerRadius="100%"
                                data={radialData}
                                startAngle={180}
                                endAngle={0}
                                barSize={24}
                            >
                                {/* Removed internal labeling for cleaner look */}
                                <RadialBar
                                    minAngle={15}
                                    background={{ fill: '#f1f5f9' }}
                                    clockWise={true}
                                    dataKey="score"
                                    cornerRadius={12}
                                />
                                <Legend
                                    iconSize={8}
                                    iconType="circle"
                                    width={140}
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    wrapperStyle={{ right: 0, fontWeight: 700, fontSize: '11px', color: '#64748b', letterSpacing: '0.05em' }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            </RadialBarChart>
                        </ResponsiveContainer>

                        {/* Center Stat (Overall Score) */}
                        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center pointer-events-none pr-32">
                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500">{overallScore || 0}</div>
                            <div className="text-[10px] uppercase font-bold text-orange tracking-[0.3em] mt-1">Total Match</div>
                        </div>
                    </div>
                </div>

                {/* Chart 2: Holographic Radar */}
                <div className="bg-[#0b1120] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5 group">
                    {/* Animated Glow Background */}
                    <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:bg-cyan/20 transition-all duration-1000"></div>

                    <h3 className="text-xl font-black mb-1 relative z-10 flex items-center gap-2 text-white">
                        <span className="text-cyan animate-pulse">◈</span> Holographic View
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-6 relative z-10">Asset Distribution</p>

                    <div className="h-80 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <defs>
                                    <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                <PolarGrid stroke="#1e293b" strokeDasharray="4 4" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                                {/* Reference Polygon (Ideal) - Faint */}
                                <Radar
                                    name="Ideal"
                                    dataKey="full"
                                    stroke="#334155"
                                    strokeWidth={1}
                                    fill="transparent"
                                    strokeDasharray="3 3"
                                />

                                {/* User Polygon - Glowing and Solid */}
                                <Radar
                                    name="You"
                                    dataKey="A"
                                    stroke="#22d3ee"
                                    strokeWidth={2}
                                    fill="url(#radarFill)"
                                    fillOpacity={0.6}
                                    filter="url(#glow)"
                                    isAnimationActive={true}
                                />

                                <Tooltip content={<CustomTooltip />} cursor={false} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import {
    RadialBarChart, RadialBar, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend
} from 'recharts';

export default function VisualAnalytics({ breakdown, overallScore }) {
    // 1. Prepare Data for Radial Bar Chart
    // Mapping Backend Keys to Visual Categories:
    // Skills (40), Experience (20), Education (10), Quality (10), Bonus (20) - Total 100
    // 1. Prepare Data for Radial Bar Chart
    // Mapping Backend Keys to Visual Categories:
    // Skills (40), Experience (20), Education (10), Quality (10), Bonus (20) - Total 100
    // Added safety checks (|| 0) to prevent NaN errors.
    const radialData = [
        { name: 'ATS', score: ((breakdown.quality_score || 0) / 10) * 100, xVal: breakdown.quality_score || 0, full: 10, fill: '#64748b' }, // Quality -> Slate
        { name: 'Stack', score: ((breakdown.bonus_score || 0) / 20) * 100, xVal: breakdown.bonus_score || 0, full: 20, fill: '#eab308' },  // Bonus -> Yellow
        { name: 'Depth', score: ((breakdown.experience_score || 0) / 20) * 100, xVal: breakdown.experience_score || 0, full: 20, fill: '#06b6d4' }, // Exp -> Cyan
        { name: 'Creds', score: ((breakdown.education_score || 0) / 10) * 100, xVal: breakdown.education_score || 0, full: 10, fill: '#a855f7' }, // Edu -> Purple
        { name: 'Skills', score: ((breakdown.skill_score || 0) / 40) * 100, xVal: breakdown.skill_score || 0, full: 40, fill: '#f97316' },   // Skills -> Orange
    ];

    // 2. Prepare Data for Radar Chart
    const radarData = [
        { subject: 'Skills', A: Math.min(100, ((breakdown.skill_score || 0) / 40) * 100), full: 100 },
        { subject: 'Creds', A: Math.min(100, ((breakdown.education_score || 0) / 10) * 100), full: 100 },
        { subject: 'Depth', A: Math.min(100, ((breakdown.experience_score || 0) / 20) * 100), full: 100 },
        { subject: 'Stack', A: Math.min(100, ((breakdown.bonus_score || 0) / 20) * 100), full: 100 },
        { subject: 'ATS', A: Math.min(100, ((breakdown.quality_score || 0) / 10) * 100), full: 100 },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)] text-white animate-in zoom-in-95 duration-200 z-50">
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
                <div className="bg-white border border-silver rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden group flex flex-col">
                    {/* Subtle Background Gradient */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange/5 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>

                    <div className="mb-6 relative z-10 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-2">
                                <span className="bg-orange/10 text-orange p-1.5 rounded-lg text-lg">🧬</span> Profile DNA
                            </h3>
                            <div className="inline-block px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">Component Breakdown</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center relative z-10">
                        {/* Chart Side */}
                        <div className="w-2/3 h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    innerRadius="40%"
                                    outerRadius="100%"
                                    data={radialData}
                                    startAngle={180}
                                    endAngle={0}
                                    barSize={20}
                                    cy="70%"
                                >
                                    <RadialBar
                                        minAngle={15}
                                        background={{ fill: '#f1f5f9' }}
                                        clockWise={true}
                                        dataKey="score"
                                        cornerRadius={10}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                </RadialBarChart>
                            </ResponsiveContainer>

                            {/* Center Stat - Adjusted Position */}
                            <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-5xl font-black text-slate-800">{overallScore || 0}</div>
                                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">Total Match</div>
                            </div>
                        </div>

                        {/* Custom Legend Side */}
                        <div className="w-1/3 pl-4 flex flex-col justify-center space-y-3 border-l border-slate-100">
                            {radialData.slice().reverse().map((item, i) => (
                                <div key={i} className="flex items-center gap-2 group/legend">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-white transition-transform group-hover/legend:scale-125" style={{ backgroundColor: item.fill }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-600 leading-none">{item.name}</span>
                                        <span className="text-[10px] font-mono text-slate-400 mt-0.5">{item.score.toFixed(0)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chart 2: Holographic Radar */}
                <div className="bg-[#0b1120] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5 group flex flex-col">
                    {/* Animated Glow Background */}
                    <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:bg-cyan/20 transition-all duration-1000"></div>

                    <div className="mb-6 relative z-10">
                        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
                            <span className="bg-cyan/10 text-cyan p-1.5 rounded-lg text-lg animate-pulse">◈</span> Holographic View
                        </h3>
                        <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.1em]">Asset Distribution</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[16rem] relative z-10">
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
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}
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

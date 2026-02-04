'use client';

import {
    RadialBarChart, RadialBar, Legend, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';

export default function VisualAnalytics({ breakdown }) {
    // 1. Prepare Data for Radial Bar Chart (Profile DNA)
    // Normalize all scores to 0-100 scale for the rings
    const radialData = [
        { name: 'ATS Scan', score: (breakdown.ats_score / 10) * 100, xVal: breakdown.ats_score, full: 10, fill: '#64748b' }, // Gray/Slate
        { name: 'Tech Stack', score: (breakdown.stack_score / 10) * 100, xVal: breakdown.stack_score, full: 10, fill: '#f59e0b' }, // Amber
        { name: 'Experience', score: (breakdown.experience_score / 20) * 100, xVal: breakdown.experience_score, full: 20, fill: '#06b6d4' }, // Cyan
        { name: 'Impact', score: (breakdown.responsibility_score / 25) * 100, xVal: breakdown.responsibility_score, full: 25, fill: '#8b5cf6' }, // Violet
        { name: 'Skills', score: breakdown.skill_score && breakdown.skill_score > 0 ? (breakdown.skill_score / 35) * 100 : 0, xVal: breakdown.skill_score, full: 35, fill: '#f97316' }, // Orange
    ];

    // 2. Prepare Data for Radar Chart (Holographic View)
    // We add a "Full Potential" baseline for comparison
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
                <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl text-white">
                    <p className="font-bold text-sm mb-1">{data.name || data.subject}</p>
                    <p className="text-xs text-slate-300">
                        Score: <span className="font-mono text-cyan font-bold text-lg">
                            {data.xVal !== undefined ? data.xVal : payload[0].value.toFixed(1)}
                        </span>
                        {data.full ? <span className="text-slate-500"> / {data.full}</span> : '%'}
                    </p>
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                🧬 Profile DNA
                            </h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Multi-Layer Analysis</p>
                        </div>
                    </div>

                    <div className="h-80 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                innerRadius="20%"
                                outerRadius="100%"
                                data={radialData}
                                startAngle={180}
                                endAngle={0}
                                barSize={30}
                            >
                                <RadialBar
                                    minAngle={15}
                                    label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 'bold' }}
                                    background={{ fill: '#f1f5f9' }}
                                    clockWise={true}
                                    dataKey="score"
                                    cornerRadius={20} // Modern rounded caps
                                />
                                <Legend
                                    iconSize={10}
                                    width={120}
                                    layout="vertical"
                                    verticalAlign="middle"
                                    wrapperStyle={{ top: '10%', right: 0, lineHeight: '24px', fontWeight: 600, fontSize: '12px', color: '#64748b' }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={false} />
                            </RadialBarChart>
                        </ResponsiveContainer>

                        {/* Center Stat */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                            <div className="text-4xl font-black text-slate-800">{radialData[4].xVal}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Skill Score</div>
                        </div>
                    </div>
                </div>

                {/* Chart 2: Holographic Radar */}
                <div className="bg-[#0f172a] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
                    {/* Animated Glow Background */}
                    <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:bg-cyan/30 transition-all duration-1000"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange/20 blur-[60px] rounded-full"></div>

                    <h3 className="text-xl font-black mb-1 relative z-10 flex items-center gap-2">
                        <span className="text-cyan">◈</span> Holographic View
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6 relative z-10">Asset Distribution</p>

                    <div className="h-80 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                <defs>
                                    <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.1} />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                                {/* Reference Polygon (Ideal) - Faint */}
                                <Radar
                                    name="Ideal"
                                    dataKey="full"
                                    stroke="#334155"
                                    strokeWidth={1}
                                    fill="transparent"
                                    strokeDasharray="4 4"
                                />

                                {/* User Polygon - Glowing */}
                                <Radar
                                    name="You"
                                    dataKey="A"
                                    stroke="#22d3ee"
                                    strokeWidth={3}
                                    fill="url(#radarFill)"
                                    fillOpacity={0.5}
                                    filter="url(#glow)"
                                />

                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

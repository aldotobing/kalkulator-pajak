import React, { useState } from 'react';
import {
    TrendingUp,
    Scale,
    Target,
    Info,
    Settings,
    Wallet,
    Activity,
    HelpCircle,
    Building2,
    Briefcase,
    DollarSign,
    PieChart,
    XCircle,
    PlusCircle,
    Lightbulb,
    ChevronDown,
    Check,
    ArrowRight
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { PPH21_BRACKETS, PTKP_BASE, PTKP_MARRIED, PTKP_PER_CHILD, BIAYA_JABATAN_RATE, MAX_BIAYA_JABATAN_ANNUAL } from '../constants';
import TaxPlannerMethodology from './TaxPlannerMethodology';

// --- Types ---

type PlanTab = 'PROJECTION' | 'SCENARIO' | 'RECOMMENDATION';

interface AdvancedProjectionInput {
    // Income
    monthlySalary: number;
    monthlyAllowance: number;
    annualTHR: number;
    annualBonus: number;

    // Deductions & Settings
    useBPJS: boolean;
    zakat: number;

    // Growth
    salaryGrowthRate: number; // %
    inflationRate: number; // %

    // Tax Status
    ptkpStatus: string;
    hasNPWP: boolean;
}

interface ScenarioInput {
    name: string;
    type: 'EMPLOYEE' | 'FREELANCER' | 'UMKM';
    grossIncome: number; // Annual
    expenses: number; // For Freelancer/UMKM
    ptkpStatus: string;
    useBPJS: boolean;
}

// --- Constants ---
const BPJS_JHT_RATE = 0.02; // 2% Employee
const BPJS_JP_RATE = 0.01; // 1% Employee
const BPJS_JP_CAP = 10042300; // 2024 Cap
const BPJS_KES_RATE = 0.01; // 1% Employee
const BPJS_KES_CAP = 12000000; // Approx Cap

// --- Styles (Matches TaxHealthCheck) ---
const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
const INPUT_CONTAINER_STYLE = "relative group";
const INPUT_FIELD_STYLE = "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all font-bold text-base text-slate-900 placeholder:text-slate-300 h-[50px]";
const INPUT_ICON_STYLE = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm no-print group-focus-within:text-blue-500 transition-colors";
const SELECT_FIELD_STYLE = "w-full pl-5 pr-10 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer text-base h-[50px]";

// --- Helper Functions ---

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
};

const calculateAdvancedTax = (input: AdvancedProjectionInput, yearOffset: number = 0) => {
    // Growth Factor
    const growthFactor = Math.pow(1 + input.salaryGrowthRate / 100, yearOffset);

    // Inflated Values
    const monthlySalary = input.monthlySalary * growthFactor;
    const monthlyAllowance = input.monthlyAllowance * growthFactor;
    const annualTHR = input.annualTHR * growthFactor;
    const annualBonus = input.annualBonus * growthFactor; // Bonus usually grows too

    // 1. Gross Income Calculation
    const regularGross = (monthlySalary + monthlyAllowance) * 12;
    const irregularGross = annualTHR + annualBonus;
    const totalGross = regularGross + irregularGross;

    // 2. Deductions (BPJS & Zakat)
    let totalDeductions = 0;
    let bpjsDeduction = 0;

    if (input.useBPJS) {
        // JHT
        const jht = (monthlySalary + monthlyAllowance) * BPJS_JHT_RATE * 12;

        // JP (Capped)
        const jpBase = Math.min(monthlySalary + monthlyAllowance, BPJS_JP_CAP);
        const jp = jpBase * BPJS_JP_RATE * 12;

        // Kesehatan (Capped)
        const kesBase = Math.min(monthlySalary + monthlyAllowance, BPJS_KES_CAP);
        const kes = kesBase * BPJS_KES_RATE * 12;

        bpjsDeduction = jht + jp + kes;
    }

    // Biaya Jabatan
    const biayaJabatan = Math.min(totalGross * BIAYA_JABATAN_RATE, MAX_BIAYA_JABATAN_ANNUAL);

    // Total Reductions
    const totalReductions = biayaJabatan + bpjsDeduction + input.zakat;

    // 3. Net Income (Before PTKP)
    const netIncome = totalGross - totalReductions;

    // 4. PTKP
    let ptkp = PTKP_BASE;
    if (input.ptkpStatus.startsWith('K')) ptkp += PTKP_MARRIED;
    const children = parseInt(input.ptkpStatus.split('/')[1]) || 0;
    ptkp += children * PTKP_PER_CHILD;

    // 5. PKP
    const pkp = Math.max(0, netIncome - ptkp);

    // 6. Tax Calculation
    let tax = 0;
    let remainingPkp = pkp;

    // Bracket 1: 5% up to 60jt
    if (remainingPkp > 0) { const t = Math.min(remainingPkp, 60000000); tax += t * 0.05; remainingPkp -= t; }
    // Bracket 2: 15% up to 250jt
    if (remainingPkp > 0) { const t = Math.min(remainingPkp, 190000000); tax += t * 0.15; remainingPkp -= t; }
    // Bracket 3: 25% up to 500jt
    if (remainingPkp > 0) { const t = Math.min(remainingPkp, 250000000); tax += t * 0.25; remainingPkp -= t; }
    // Bracket 4: 30% up to 5M
    if (remainingPkp > 0) { const t = Math.min(remainingPkp, 4500000000); tax += t * 0.30; remainingPkp -= t; }
    // Bracket 5: 35% > 5M
    if (remainingPkp > 0) { tax += remainingPkp * 0.35; }

    // NPWP Penalty (+20%)
    if (!input.hasNPWP) {
        tax = tax * 1.2;
    }

    const takeHomePay = totalGross - tax - bpjsDeduction - input.zakat; // Nominal cash in hand

    // Real Value (Purchasing Power)
    const inflationFactor = Math.pow(1 + input.inflationRate / 100, yearOffset);
    const realTakeHome = takeHomePay / inflationFactor;

    return {
        gross: totalGross,
        tax,
        bpjs: bpjsDeduction,
        takeHome: takeHomePay,
        realTakeHome,
        biayaJabatan
    };
};

const calculateScenario = (input: ScenarioInput) => {
    let tax = 0;
    let bpjs = 0;
    let net = 0;
    let pkp = 0;

    if (input.type === 'EMPLOYEE') {
        const monthlyGross = input.grossIncome / 12;

        if (input.useBPJS) {
            const jht = monthlyGross * BPJS_JHT_RATE * 12;
            const jp = Math.min(monthlyGross, BPJS_JP_CAP) * BPJS_JP_RATE * 12;
            const kes = Math.min(monthlyGross, BPJS_KES_CAP) * BPJS_KES_RATE * 12;
            bpjs = jht + jp + kes;
        }

        const biayaJabatan = Math.min(input.grossIncome * BIAYA_JABATAN_RATE, MAX_BIAYA_JABATAN_ANNUAL);
        const netIncome = input.grossIncome - biayaJabatan - bpjs;

        let ptkp = PTKP_BASE;
        if (input.ptkpStatus.startsWith('K')) ptkp += PTKP_MARRIED;
        const children = parseInt(input.ptkpStatus.split('/')[1]) || 0;
        ptkp += children * PTKP_PER_CHILD;

        pkp = Math.max(0, netIncome - ptkp);

        let remainingPkp = pkp;
        if (remainingPkp > 0) { const t = Math.min(remainingPkp, 60000000); tax += t * 0.05; remainingPkp -= t; }
        if (remainingPkp > 0) { const t = Math.min(remainingPkp, 190000000); tax += t * 0.15; remainingPkp -= t; }
        if (remainingPkp > 0) { const t = Math.min(remainingPkp, 250000000); tax += t * 0.25; remainingPkp -= t; }
        if (remainingPkp > 0) { const t = Math.min(remainingPkp, 4500000000); tax += t * 0.30; remainingPkp -= t; }
        if (remainingPkp > 0) { tax += remainingPkp * 0.35; }

    } else if (input.type === 'FREELANCER') {
        const netIncome = input.grossIncome * 0.5;

        let ptkp = PTKP_BASE;
        if (input.ptkpStatus.startsWith('K')) ptkp += PTKP_MARRIED;
        const children = parseInt(input.ptkpStatus.split('/')[1]) || 0;
        ptkp += children * PTKP_PER_CHILD;

        pkp = Math.max(0, netIncome - ptkp);

        let remainingPkp = pkp;
        if (remainingPkp > 0) { const t = Math.min(remainingPkp, 60000000); tax += t * 0.05; remainingPkp -= t; }
        if (remainingPkp > 0) { const t = Math.min(remainingPkp, 190000000); tax += t * 0.15; remainingPkp -= t; }
        if (remainingPkp > 0) { const t = Math.min(remainingPkp, 250000000); tax += t * 0.25; remainingPkp -= t; }
        if (remainingPkp > 0) { const t = Math.min(remainingPkp, 4500000000); tax += t * 0.30; remainingPkp -= t; }
        if (remainingPkp > 0) { tax += remainingPkp * 0.35; }

        bpjs = 0;

    } else if (input.type === 'UMKM') {
        const threshold = 500000000;
        const taxable = Math.max(0, input.grossIncome - threshold);
        tax = taxable * 0.005;
        bpjs = 0;
    }

    net = input.grossIncome - tax - bpjs - input.expenses;

    return { tax, bpjs, net, pkp };
};

// --- Reusable UI Components ---

const FormInput = ({
    label,
    value,
    onChange,
    name,
    type = "text",
    icon = <DollarSign size={14} />,
    placeholder = "0",
    isCurrency = false
}: any) => {
    const displayValue = isCurrency ? formatNumber(Number(value) || 0) : value;

    return (
        <div>
            <label className={LABEL_STYLE}>{label}</label>
            <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}>{icon}</span>
                <input
                    type={isCurrency ? "text" : type}
                    name={name}
                    value={displayValue}
                    onChange={onChange}
                    className={INPUT_FIELD_STYLE}
                    placeholder={placeholder}
                    inputMode={isCurrency ? "numeric" : undefined}
                />
            </div>
        </div>
    );
};

const FormSelect = ({ label, value, onChange, name, options }: any) => (
    <div>
        <label className={LABEL_STYLE}>{label}</label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={SELECT_FIELD_STYLE}
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown size={18} />
            </div>
        </div>
    </div>
);

const TaxPlanner: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PlanTab>('PROJECTION');

    // Advanced Projection State
    const [advInput, setAdvInput] = useState<AdvancedProjectionInput>({
        monthlySalary: 10000000,
        monthlyAllowance: 0,
        annualTHR: 10000000,
        annualBonus: 0,
        useBPJS: true,
        zakat: 0,
        salaryGrowthRate: 8,
        inflationRate: 4,
        ptkpStatus: 'TK/0',
        hasNPWP: true
    });

    // Scenario State
    const [scenarios, setScenarios] = useState<ScenarioInput[]>([
        { name: 'Karyawan', type: 'EMPLOYEE', grossIncome: 120000000, expenses: 0, ptkpStatus: 'TK/0', useBPJS: true },
        { name: 'Freelancer', type: 'FREELANCER', grossIncome: 120000000, expenses: 0, ptkpStatus: 'TK/0', useBPJS: false },
    ]);

    // --- Handlers ---
    const handleAdvInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = (e.target as HTMLInputElement);
        setAdvInput(prev => {
            let newValue: any;
            if (type === 'checkbox') {
                newValue = checked;
            } else if (name === 'ptkpStatus') {
                newValue = value;
            } else if (['salaryGrowthRate', 'inflationRate'].includes(name)) {
                newValue = Number(value.replace(',', '.'));
            } else {
                // Currency fields
                const cleanValue = value.replace(/\./g, '');
                newValue = Number(cleanValue);
                if (isNaN(newValue)) newValue = 0;
            }

            return {
                ...prev,
                [name]: newValue
            };
        });
    };

    const handleScenarioChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = (e.target as HTMLInputElement);
        setScenarios(prev => prev.map((scenario, i) => {
            if (i !== index) return scenario;

            let newValue: any;
            if (type === 'checkbox') {
                newValue = checked;
            } else if (['name', 'type', 'ptkpStatus'].includes(name)) {
                newValue = value;
            } else {
                // Currency fields
                const cleanValue = value.replace(/\./g, '');
                newValue = Number(cleanValue);
                if (isNaN(newValue)) newValue = 0;
            }
            return { ...scenario, [name]: newValue };
        }));
    };

    const addScenario = () => {
        setScenarios(prev => [...prev, { name: `Skenario ${prev.length + 1}`, type: 'EMPLOYEE', grossIncome: 100000000, expenses: 0, ptkpStatus: 'TK/0', useBPJS: true }]);
    };

    const removeScenario = (index: number) => {
        setScenarios(prev => prev.filter((_, i) => i !== index));
    };

    // --- Render Functions ---

    const renderProjectionTab = () => {
        const years = 10;
        const projectionData = Array.from({ length: years }, (_, i) => {
            const result = calculateAdvancedTax(advInput, i);
            return {
                year: `Tahun ${i + 1}`,
                gross: result.gross,
                tax: result.tax,
                takeHome: result.takeHome,
                realTakeHome: result.realTakeHome,
                bpjs: result.bpjs,
                biayaJabatan: result.biayaJabatan
            };
        });

        const currentYearResult = calculateAdvancedTax(advInput, 0);

        return (
            <div className="rounded-[2rem] bg-white shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
                {/* Input Section */}
                <div className="p-8 lg:p-10 lg:w-5/12 bg-slate-50/50 border-r border-slate-100">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Simulator Proyeksi</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Hitung proyeksi pajak dan take home pay Anda hingga 10 tahun ke depan dengan asumsi kenaikan gaji dan inflasi.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Income Group */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                                <Wallet size={16} /> Pemasukan
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <FormInput label="Gaji Bulanan" name="monthlySalary" value={advInput.monthlySalary} onChange={handleAdvInputChange} icon="Rp" isCurrency />
                                <FormInput label="Tunjangan Bulanan" name="monthlyAllowance" value={advInput.monthlyAllowance} onChange={handleAdvInputChange} icon="Rp" isCurrency />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="THR Tahunan" name="annualTHR" value={advInput.annualTHR} onChange={handleAdvInputChange} icon="Rp" isCurrency />
                                    <FormInput label="Bonus Tahunan" name="annualBonus" value={advInput.annualBonus} onChange={handleAdvInputChange} icon="Rp" isCurrency />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200 my-4"></div>

                        {/* Settings Group */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                <Settings size={16} /> Pengaturan
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <FormSelect
                                    label="Status PTKP"
                                    name="ptkpStatus"
                                    value={advInput.ptkpStatus}
                                    onChange={handleAdvInputChange}
                                    options={[
                                        { value: 'TK/0', label: 'TK/0 - Lajang' },
                                        { value: 'TK/1', label: 'TK/1 - Lajang, 1 Tanggungan' },
                                        { value: 'K/0', label: 'K/0 - Menikah' },
                                        { value: 'K/1', label: 'K/1 - Menikah, 1 Anak' },
                                        { value: 'K/2', label: 'K/2 - Menikah, 2 Anak' },
                                        { value: 'K/3', label: 'K/3 - Menikah, 3 Anak' },
                                    ]}
                                />
                                <FormInput label="Zakat / Sumbangan (Tahunan)" name="zakat" value={advInput.zakat} onChange={handleAdvInputChange} icon="Rp" isCurrency />

                                <div className="flex items-center gap-4 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${advInput.useBPJS ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                                            {advInput.useBPJS && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        <input type="checkbox" name="useBPJS" checked={advInput.useBPJS} onChange={handleAdvInputChange} className="hidden" />
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">Hitung BPJS</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${advInput.hasNPWP ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                                            {advInput.hasNPWP && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        <input type="checkbox" name="hasNPWP" checked={advInput.hasNPWP} onChange={handleAdvInputChange} className="hidden" />
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">Punya NPWP</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200 my-4"></div>

                        {/* Growth Group */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                                <TrendingUp size={16} /> Asumsi Pertumbuhan
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Kenaikan Gaji (%)" name="salaryGrowthRate" value={advInput.salaryGrowthRate} onChange={handleAdvInputChange} icon="%" />
                                <FormInput label="Inflasi (%)" name="inflationRate" value={advInput.inflationRate} onChange={handleAdvInputChange} icon="%" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                <div className="lg:w-7/12 bg-white p-8 lg:p-10 flex flex-col">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Take Home Pay (Tahun Ini)</p>
                            <p className="text-2xl font-black text-slate-900">{formatCurrency(currentYearResult.takeHome)}</p>
                            <p className="text-xs text-slate-500 mt-1">/ tahun</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-red-50 border border-red-100">
                            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Pajak (Tahun Ini)</p>
                            <p className="text-2xl font-black text-slate-900">{formatCurrency(currentYearResult.tax)}</p>
                            <p className="text-xs text-slate-500 mt-1">Effective Rate: {((currentYearResult.tax / currentYearResult.gross) * 100).toFixed(1)}%</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="flex-1 min-h-[300px] bg-slate-50 rounded-3xl p-6 border border-slate-100 relative">
                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Activity size={16} className="text-blue-500" />
                            Proyeksi 10 Tahun
                        </h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTakeHome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis hide />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="gross" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorGross)" name="Gross Income" />
                                <Area type="monotone" dataKey="takeHome" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorTakeHome)" name="Net Take Home" />
                                <Area type="monotone" dataKey="realTakeHome" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorReal)" name="Real Value (Daya Beli)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderScenarioTab = () => {
        return (
            <div className="rounded-[2rem] bg-white shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
                {/* Inputs */}
                <div className="p-8 lg:p-10 lg:w-4/12 bg-slate-50/50 border-r border-slate-100 overflow-y-auto max-h-[800px]">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Skenario</h2>
                        <button
                            onClick={addScenario}
                            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                            <PlusCircle size={14} /> Tambah
                        </button>
                    </div>

                    <div className="space-y-6">
                        {scenarios.map((scenario, index) => (
                            <div key={index} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative group hover:border-blue-300 transition-all">
                                {scenarios.length > 1 && (
                                    <button
                                        onClick={() => removeScenario(index)}
                                        className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                )}
                                <div className="space-y-3">
                                    <FormInput
                                        label={`Nama Skenario ${index + 1}`}
                                        name="name"
                                        value={scenario.name}
                                        onChange={(e: any) => handleScenarioChange(index, e)}
                                        type="text"
                                        icon={<Target size={14} />}
                                    />
                                    <FormSelect
                                        label="Tipe Pekerjaan"
                                        name="type"
                                        value={scenario.type}
                                        onChange={(e: any) => handleScenarioChange(index, e)}
                                        options={[
                                            { value: 'EMPLOYEE', label: 'Karyawan' },
                                            { value: 'FREELANCER', label: 'Freelancer (Norma)' },
                                            { value: 'UMKM', label: 'UMKM (PP 23)' },
                                        ]}
                                    />
                                    <FormInput
                                        label="Penghasilan Bruto"
                                        name="grossIncome"
                                        value={scenario.grossIncome}
                                        onChange={(e: any) => handleScenarioChange(index, e)}
                                        icon="Rp"
                                        isCurrency
                                    />
                                    {scenario.type !== 'EMPLOYEE' && (
                                        <FormInput
                                            label="Pengeluaran Usaha"
                                            name="expenses"
                                            value={scenario.expenses}
                                            onChange={(e: any) => handleScenarioChange(index, e)}
                                            icon="Rp"
                                            isCurrency
                                        />
                                    )}
                                    <FormSelect
                                        label="Status PTKP"
                                        name="ptkpStatus"
                                        value={scenario.ptkpStatus}
                                        onChange={(e: any) => handleScenarioChange(index, e)}
                                        options={[
                                            { value: 'TK/0', label: 'TK/0' },
                                            { value: 'K/0', label: 'K/0' },
                                            { value: 'K/1', label: 'K/1' },
                                            { value: 'K/2', label: 'K/2' },
                                            { value: 'K/3', label: 'K/3' },
                                        ]}
                                    />
                                    {scenario.type === 'EMPLOYEE' && (
                                        <label className="flex items-center gap-3 cursor-pointer pt-2">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${scenario.useBPJS ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                                                {scenario.useBPJS && <Check size={12} strokeWidth={4} />}
                                            </div>
                                            <input type="checkbox" name="useBPJS" checked={scenario.useBPJS} onChange={(e) => handleScenarioChange(index, e)} className="hidden" />
                                            <span className="text-xs font-bold text-slate-600">Hitung BPJS</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comparison Results */}
                <div className="lg:w-8/12 bg-white p-8 lg:p-10 flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">Perbandingan Hasil</h2>

                    {/* Chart */}
                    <div className="h-[300px] w-full mb-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={scenarios.map(s => ({
                                    name: s.name,
                                    ...calculateScenario(s)
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                barSize={60}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend />
                                <Bar dataKey="tax" fill="#ef4444" name="Pajak" stackId="a" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="bpjs" fill="#64748b" name="BPJS" stackId="a" />
                                <Bar dataKey="net" fill="#22c55e" name="Net Take Home" stackId="a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Detailed Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Skenario</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Bruto</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Pajak</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Netto</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {scenarios.map((scenario, index) => {
                                    const result = calculateScenario(scenario);
                                    return (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-900">{scenario.name}</div>
                                                <div className="text-xs text-slate-500">{scenario.type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-600">
                                                {formatCurrency(scenario.grossIncome)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-500">
                                                {formatCurrency(result.tax)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-emerald-600">
                                                {formatCurrency(result.net)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderRecommendationTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all group">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                    <Lightbulb size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Freelancer vs Karyawan</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Jika penghasilan Anda di atas Rp 250 Juta/tahun, menjadi Freelancer dengan NPPN (Norma) seringkali lebih hemat pajak dibandingkan Karyawan karena hanya 50% penghasilan yang dihitung pajak.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wide">
                    Tips Strategi <ArrowRight size={14} />
                </div>
            </div >

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                    <Briefcase size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Manfaat PT Perorangan</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Untuk omzet di bawah Rp 4.8 Miliar, mendirikan PT Perorangan memungkinkan Anda menggunakan tarif UMKM 0.5% Final. Ini jauh lebih rendah dibanding tarif progresif pribadi yang bisa mencapai 35%.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wide">
                    Tips Legalitas <ArrowRight size={14} />
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-200/50 transition-all group">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                    <DollarSign size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Optimalisasi Tunjangan</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Minta perusahaan memberikan tunjangan dalam bentuk Natura (Fasilitas) seperti tempat tinggal atau kendaraan dinas, karena di aturan terbaru Natura tertentu bebas pajak bagi karyawan.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wide">
                    Tips Gaji <ArrowRight size={14} />
                </div>
            </div>
        </div >
    );

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Navigation Tabs */}
            {/* Navigation Tabs */}
            <div className="flex justify-center mb-10">
                <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-lg shadow-blue-900/5 inline-flex gap-1">
                    <button
                        onClick={() => setActiveTab('PROJECTION')}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'PROJECTION'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                    >
                        <TrendingUp size={18} />
                        Simulator Proyeksi
                    </button>
                    <button
                        onClick={() => setActiveTab('SCENARIO')}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'SCENARIO'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                    >
                        <Scale size={18} />
                        Komparasi
                    </button>
                    <button
                        onClick={() => setActiveTab('RECOMMENDATION')}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'RECOMMENDATION'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                    >
                        <Target size={18} />
                        Rekomendasi
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px] animate-enter">
                {activeTab === 'PROJECTION' && renderProjectionTab()}
                {activeTab === 'SCENARIO' && renderScenarioTab()}
                {activeTab === 'RECOMMENDATION' && renderRecommendationTab()}
            </div>

            {/* Methodology Explanation */}
            <TaxPlannerMethodology />
        </div>
    );
};

export default TaxPlanner;

import React, { useState, useEffect } from 'react';
import { MaritalStatus } from '../types';
import { formatCurrency } from '../services/taxLogic';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Calendar, Save, Download, Upload, RefreshCw, Activity, Info } from 'lucide-react';

interface MonthlyData {
    month: number;
    grossSalary: number;
    allowance: number;
    bonus: number;
    withholding: number; // Actual tax withheld (from payslip)
}

interface ReconciliationState {
    year: number;
    ptkpStatus: MaritalStatus;
    dependents: number;
    hasNPWP: boolean;
    monthlyData: MonthlyData[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

const TaxReconciliation: React.FC<{ onContextUpdate: (ctx: string) => void }> = ({ onContextUpdate }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11

    const [state, setState] = useState<ReconciliationState>(() => {
        // Load from localStorage
        const saved = localStorage.getItem(`taxReconciliation_${currentYear}`);
        if (saved) {
            return JSON.parse(saved);
        }

        // Initialize empty state
        return {
            year: currentYear,
            ptkpStatus: MaritalStatus.TK,
            dependents: 0,
            hasNPWP: true,
            monthlyData: Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                grossSalary: 0,
                allowance: 0,
                bonus: 0,
                withholding: 0
            }))
        };
    });

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem(`taxReconciliation_${currentYear}`, JSON.stringify(state));
    }, [state, currentYear]);

    // Calculate PTKP
    const calculatePTKP = () => {
        let ptkp = 54000000; // TK/0 base
        if (state.ptkpStatus === MaritalStatus.K) ptkp += 4500000;
        ptkp += state.dependents * 4500000;
        return ptkp;
    };

    // Calculate annual tax using Pasal 17 (actual liability)
    const calculateAnnualTax = (annualIncome: number) => {
        const ptkp = calculatePTKP();
        const pkp = Math.max(0, annualIncome - ptkp);

        let tax = 0;
        if (pkp <= 60000000) {
            tax = pkp * 0.05;
        } else if (pkp <= 250000000) {
            tax = 60000000 * 0.05 + (pkp - 60000000) * 0.15;
        } else if (pkp <= 500000000) {
            tax = 60000000 * 0.05 + 190000000 * 0.15 + (pkp - 250000000) * 0.25;
        } else if (pkp <= 5000000000) {
            tax = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (pkp - 500000000) * 0.30;
        } else {
            tax = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + 4500000000 * 0.30 + (pkp - 5000000000) * 0.35;
        }

        return state.hasNPWP ? tax : tax * 1.2;
    };

    // Calculate YTD values
    const calculateYTD = () => {
        let ytdMonthlyIncome = 0; // Sum of actual monthly income
        let ytdWithholding = 0;
        let monthCount = 0;

        state.monthlyData.forEach((month, idx) => {
            if (idx <= currentMonth) { // Only count months up to current
                ytdMonthlyIncome += (month.grossSalary + month.allowance + month.bonus);
                ytdWithholding += month.withholding;
                monthCount++;
            }
        });

        // Annualize: project full year income based on YTD average
        const annualIncome = monthCount > 0 ? (ytdMonthlyIncome / monthCount) * 12 : 0;
        const ytdActualTax = calculateAnnualTax(annualIncome);

        // Calculate what the tax SHOULD be for the months that have passed
        const ytdExpectedTax = (ytdActualTax / 12) * monthCount;
        const difference = ytdWithholding - ytdExpectedTax;

        return {
            ytdIncome: annualIncome,
            ytdWithholding,
            ytdActualTax: ytdExpectedTax, // This is YTD expected, not full year
            difference
        };
    };

    // Project December adjustment
    const projectDecember = () => {
        // Sum all 12 months of income
        const totalMonthlyIncome = state.monthlyData.reduce((sum, m) =>
            sum + m.grossSalary + m.allowance + m.bonus, 0
        );

        // Calculate average monthly income and annualize
        const avgMonthlyIncome = totalMonthlyIncome / 12;
        const annualIncome = avgMonthlyIncome * 12;

        const totalAnnualTax = calculateAnnualTax(annualIncome);
        const jan_nov_withholding = state.monthlyData.slice(0, 11).reduce((sum, m) => sum + m.withholding, 0);
        const decemberTax = totalAnnualTax - jan_nov_withholding;

        return { totalAnnualTax, jan_nov_withholding, decemberTax };
    };

    const handleMonthlyChange = (monthIndex: number, field: keyof MonthlyData, value: string) => {
        const numValue = value.replace(/[^0-9]/g, '');
        const parsed = numValue ? parseInt(numValue) : 0;

        setState(prev => ({
            ...prev,
            monthlyData: prev.monthlyData.map((m, idx) =>
                idx === monthIndex ? { ...m, [field]: parsed } : m
            )
        }));
    };

    const handleCopyToAll = (monthIndex: number) => {
        const sourceMonth = state.monthlyData[monthIndex];
        setState(prev => ({
            ...prev,
            monthlyData: prev.monthlyData.map((m, idx) =>
                idx > monthIndex ? { ...m, grossSalary: sourceMonth.grossSalary, allowance: sourceMonth.allowance } : m
            )
        }));
    };

    const handleReset = () => {
        if (confirm('Hapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
            // Reset to empty state
            const emptyData: ReconciliationState = {
                year: currentYear,
                ptkpStatus: MaritalStatus.TK,
                dependents: 0,
                hasNPWP: true,
                monthlyData: Array.from({ length: 12 }, (_, i) => ({
                    month: i + 1,
                    grossSalary: 0,
                    allowance: 0,
                    bonus: 0,
                    withholding: 0
                }))
            };
            setState(emptyData);
        }
    };

    const handleLoadDummy = () => {
        // Load example data
        const dummyData: ReconciliationState = {
            year: currentYear,
            ptkpStatus: MaritalStatus.TK,
            dependents: 0,
            hasNPWP: true,
            monthlyData: [
                { month: 1, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 2, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 3, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 4, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 5, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 6, grossSalary: 15000000, allowance: 2000000, bonus: 15000000, withholding: 2420000 }, // THR in June
                { month: 7, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 8, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 9, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 10, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 11, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 725000 },
                { month: 12, grossSalary: 15000000, allowance: 2000000, bonus: 0, withholding: 0 } // December empty for adjustment
            ]
        };
        setState(dummyData);
    };

    const ytd = calculateYTD();
    const december = projectDecember();

    const overpaymentPercentage = ytd.ytdActualTax > 0 ? ((ytd.difference / ytd.ytdActualTax) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans">
            {/* Educational Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500 rounded-lg shrink-0">
                        <Info size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-blue-900 mb-2">Cara Kerja Rekonsiliasi PPh 21</h3>
                        <p className="text-sm text-blue-800 leading-relaxed mb-3">
                            Perusahaan memotong pajak Anda setiap bulan menggunakan <span className="font-semibold">TER (Tarif Efektif Rata-rata)</span>.
                            Di akhir tahun, pajak dihitung ulang menggunakan <span className="font-semibold">Pasal 17 (tarif progresif)</span>.
                            Jika TER lebih besar dari Pasal 17, Anda <span className="font-semibold text-emerald-700">lebih bayar</span>.
                            Jika lebih kecil, Anda <span className="font-semibold text-red-700">kurang bayar</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* YTD Position */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-xl ${ytd.difference > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {ytd.difference > 0 ? <TrendingUp size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Posisi YTD</p>
                            <p className="text-sm text-slate-400">{MONTHS[currentMonth]} {currentYear}</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                        {formatCurrency(Math.abs(ytd.difference))}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                        {ytd.difference > 0 ? '✅ Lebih bayar' : '⚠️ Kurang bayar'} {Math.abs(overpaymentPercentage).toFixed(1)}%
                    </p>

                    {/* Explanation */}
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                        <p className="font-semibold text-slate-700">Cara Hitung:</p>
                        <div className="space-y-1">
                            <p>• <span className="font-medium">Pajak Dipotong:</span> {formatCurrency(ytd.ytdWithholding)}</p>
                            <p className="text-[11px] text-slate-500 ml-3">(Total kolom "Pajak Dipotong" Jan-{MONTHS[currentMonth]})</p>
                        </div>
                        <div className="space-y-1">
                            <p>• <span className="font-medium">Pajak Seharusnya:</span> {formatCurrency(ytd.ytdActualTax)}</p>
                            <p className="text-[11px] text-slate-500 ml-3">(Dihitung pakai Pasal 17 dari total pendapatan)</p>
                        </div>
                        <div className="pt-2 border-t border-slate-50">
                            <p className="font-semibold text-slate-700">
                                = {ytd.difference > 0 ? 'Lebih bayar' : 'Kurang bayar'} {formatCurrency(Math.abs(ytd.difference))}
                            </p>
                        </div>
                    </div>
                </div>

                {/* December Projection */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proyeksi Desember</p>
                            <p className="text-sm text-slate-400">Penyesuaian Akhir Tahun</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                        {formatCurrency(Math.abs(december.decemberTax))}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                        {december.decemberTax < 0 ? '💰 Refund/Lebih Bayar' : '💳 Kurang Bayar'}
                    </p>

                    {/* Explanation */}
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                        <p className="font-semibold text-slate-700">Kenapa Desember Beda?</p>
                        <div className="space-y-1">
                            <p>• <span className="font-medium">Pajak Setahun:</span> {formatCurrency(december.totalAnnualTax)}</p>
                            <p className="text-[11px] text-slate-500 ml-3">(Pasal 17 dari total 12 bulan)</p>
                        </div>
                        <div className="space-y-1">
                            <p>• <span className="font-medium">Sudah Dipotong Jan-Nov:</span> {formatCurrency(december.jan_nov_withholding)}</p>
                            <p className="text-[11px] text-slate-500 ml-3">(Total pemotongan 11 bulan)</p>
                        </div>
                        <div className="pt-2 border-t border-slate-50">
                            <p className="font-semibold text-slate-700">
                                = Des {december.decemberTax < 0 ? 'Refund' : 'Bayar'} {formatCurrency(Math.abs(december.decemberTax))}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                                {december.decemberTax < 0 ? 'Anda dapat pengembalian pajak' : 'Anda harus bayar tambahan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</p>
                            <p className="text-sm text-slate-400">Perbandingan TER vs Pasal 17</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        {Math.abs(overpaymentPercentage) < 5 ? (
                            <>
                                <CheckCircle className="text-emerald-500" size={28} />
                                <span className="text-lg font-bold text-emerald-600">On Track</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="text-amber-500" size={28} />
                                <span className="text-lg font-bold text-amber-600">Perlu Perhatian</span>
                            </>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                        <p className="font-semibold text-slate-700">Basis Penilaian:</p>
                        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                                <div>
                                    <p className="font-medium text-emerald-700">On Track (Aman)</p>
                                    <p className="text-[11px] text-slate-500">Selisih &lt; 5% dari total pajak</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"></div>
                                <div>
                                    <p className="font-medium text-amber-700">Perlu Perhatian</p>
                                    <p className="text-[11px] text-slate-500">Selisih ≥ 5% dari total pajak</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 italic pt-2">
                            Status Anda: Selisih {Math.abs(overpaymentPercentage).toFixed(1)}%
                            {Math.abs(overpaymentPercentage) < 5 ? ' (Masih wajar ✓)' : ' (Cukup besar, cek data!)'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-lg shadow-slate-200/50">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Pengaturan Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status PTKP</label>
                        <select
                            value={state.ptkpStatus}
                            onChange={(e) => setState(prev => ({ ...prev, ptkpStatus: e.target.value as MaritalStatus }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        >
                            <option value={MaritalStatus.TK}>TK (Lajang)</option>
                            <option value={MaritalStatus.K}>K (Menikah)</option>
                            <option value={MaritalStatus.HB}>HB (Pisah)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggungan</label>
                        <select
                            value={state.dependents}
                            onChange={(e) => setState(prev => ({ ...prev, dependents: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        >
                            {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NPWP</label>
                        <button
                            onClick={() => setState(prev => ({ ...prev, hasNPWP: !prev.hasNPWP }))}
                            className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all ${state.hasNPWP ? 'bg-blue-50 text-blue-700 border border-blue-300' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                        >
                            {state.hasNPWP ? 'Ada NPWP (Tarif Normal)' : 'Tidak Ada (+20%)'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Monthly Data Grid */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-lg shadow-slate-200/50 overflow-x-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Data Bulanan {currentYear}</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLoadDummy}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all flex items-center gap-2"
                        >
                            <Download size={14} />
                            Load Dummy
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all flex items-center gap-2"
                        >
                            <RefreshCw size={14} />
                            Reset Data
                        </button>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-2 font-bold text-slate-600 uppercase text-xs">Bulan</th>
                            <th className="text-right py-3 px-2 font-bold text-slate-600 uppercase text-xs">Gaji Pokok</th>
                            <th className="text-right py-3 px-2 font-bold text-slate-600 uppercase text-xs">Tunjangan</th>
                            <th className="text-right py-3 px-2 font-bold text-slate-600 uppercase text-xs">Bonus/THR</th>
                            <th className="text-right py-3 px-2 font-bold text-slate-600 uppercase text-xs">Pajak Dipotong</th>
                            <th className="text-center py-3 px-2 font-bold text-slate-600 uppercase text-xs">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.monthlyData.map((month, idx) => (
                            <tr key={idx} className={`border-b border-slate-100 ${idx <= currentMonth ? 'bg-white' : 'bg-slate-50 opacity-60'}`}>
                                <td className="py-3 px-2 font-bold text-slate-700">{MONTHS[idx]}</td>
                                <td className="py-3 px-2">
                                    <input
                                        type="text"
                                        value={month.grossSalary ? new Intl.NumberFormat('id-ID').format(month.grossSalary) : ''}
                                        onChange={(e) => handleMonthlyChange(idx, 'grossSalary', e.target.value)}
                                        className="w-full text-right px-2 py-1.5 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-semibold"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="py-3 px-2">
                                    <input
                                        type="text"
                                        value={month.allowance ? new Intl.NumberFormat('id-ID').format(month.allowance) : ''}
                                        onChange={(e) => handleMonthlyChange(idx, 'allowance', e.target.value)}
                                        className="w-full text-right px-2 py-1.5 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-semibold"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="py-3 px-2">
                                    <input
                                        type="text"
                                        value={month.bonus ? new Intl.NumberFormat('id-ID').format(month.bonus) : ''}
                                        onChange={(e) => handleMonthlyChange(idx, 'bonus', e.target.value)}
                                        className="w-full text-right px-2 py-1.5 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-semibold"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="py-3 px-2">
                                    <input
                                        type="text"
                                        value={month.withholding ? new Intl.NumberFormat('id-ID').format(month.withholding) : ''}
                                        onChange={(e) => handleMonthlyChange(idx, 'withholding', e.target.value)}
                                        className="w-full text-right px-2 py-1.5 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-semibold bg-yellow-50"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <button
                                        onClick={() => handleCopyToAll(idx)}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                        title="Copy to remaining months"
                                    >
                                        Copy →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaxReconciliation;

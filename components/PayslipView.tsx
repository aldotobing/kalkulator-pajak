import React from 'react';
import { PPh21State, PPh21Method } from '../types';
import { formatCurrency } from '../services/taxLogic';
import { Building2, CalendarDays } from 'lucide-react';

interface Props {
    result: any; // Using any for now to match the result type from calculator
    formState: PPh21State;
}

const PayslipView: React.FC<Props> = ({ result, formState }) => {
    const currentDate = new Date();
    const period = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // Calculate totals
    const totalEarnings = result.grossForTax; // This includes Tax Allowance if Gross Up
    const totalDeductions = result.monthlyTax + result.pensionDeduction + (Math.min(formState.grossSalary, 12000000) * 0.01);
    const takeHomePay = totalEarnings - totalDeductions;

    return (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 font-mono text-sm shadow-sm">
            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">PT. MAJU SEJAHTERA</h3>
                        <p className="text-xs text-slate-500">Confidential Payslip</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 text-slate-500 justify-end mb-1">
                        <CalendarDays size={14} />
                        <span className="font-bold uppercase text-xs">Periode</span>
                    </div>
                    <p className="font-bold text-slate-900">{period}</p>
                </div>
            </div>

            {/* Employee Info */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 grid grid-cols-2 gap-4 text-xs">
                <div>
                    <span className="text-slate-400 block mb-1">Employee Name</span>
                    <span className="font-bold text-slate-700">KARYAWAN TETAP</span>
                </div>
                <div className="text-right">
                    <span className="text-slate-400 block mb-1">Tax Status</span>
                    <span className="font-bold text-slate-700">{formState.maritalStatus}/{formState.children} ({formState.hasNPWP ? 'NPWP' : 'Non-NPWP'})</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Earnings */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">EARNINGS (PENERIMAAN)</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Gaji Pokok</span>
                            <span className="font-bold text-slate-900">{formatCurrency(formState.grossSalary)}</span>
                        </div>
                        {formState.allowance > 0 && (
                            <div className="flex justify-between">
                                <span className="text-slate-600">Tunjangan Tetap</span>
                                <span className="font-bold text-slate-900">{formatCurrency(formState.allowance)}</span>
                            </div>
                        )}
                        {formState.method === PPh21Method.GROSS_UP && (
                            <div className="flex justify-between text-emerald-600">
                                <span>Tunjangan Pajak (Gross Up)</span>
                                <span className="font-bold">{formatCurrency(result.taxAllowance)}</span>
                            </div>
                        )}
                        {result.insuranceAmount > 0 && (
                            <div className="flex justify-between text-slate-400 italic text-xs">
                                <span>Tunjangan JKK/JKM (Non-Cash)</span>
                                <span>{formatCurrency(result.insuranceAmount)}</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-slate-700">Total Gross Pay</span>
                        <span className="font-bold text-slate-900">{formatCurrency(totalEarnings)}</span>
                    </div>
                </div>

                {/* Deductions */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">DEDUCTIONS (POTONGAN)</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-red-600">
                            <span>PPh 21 (TER {result.terCategory} - {(result.terRate * 100).toFixed(2)}%)</span>
                            <span className="font-bold">({formatCurrency(result.monthlyTax)})</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>BPJS Ketenagakerjaan (JHT 2%)</span>
                            <span className="font-bold">({formatCurrency(result.pensionDeduction)})</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>BPJS Kesehatan (1%)</span>
                            <span className="font-bold">({formatCurrency(Math.min(formState.grossSalary, 12000000) * 0.01)})</span>
                        </div>
                        {result.insuranceAmount > 0 && (
                            <div className="flex justify-between text-slate-400 italic text-xs">
                                <span>Potongan JKK/JKM (Contra)</span>
                                <span>({formatCurrency(result.insuranceAmount)})</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-slate-700">Total Deductions</span>
                        <span className="font-bold text-red-600">({formatCurrency(totalDeductions)})</span>
                    </div>
                </div>

                {/* Net Pay */}
                <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg shadow-slate-200">
                    <div>
                        <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">TAKE HOME PAY</span>
                        <span className="text-xs text-emerald-400 font-medium">Transfer to BCA ****1234</span>
                    </div>
                    <div className="text-xl font-bold">
                        {formatCurrency(takeHomePay)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayslipView;

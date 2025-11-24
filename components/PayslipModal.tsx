import React from 'react';
import { createPortal } from 'react-dom';
import { PPh21State, PPh21Method } from '../types';
import { formatCurrency } from '../services/taxLogic';
import { X, Printer, Building2, CalendarDays, FileText } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    result: any;
    formState: PPh21State;
}

const PayslipModal: React.FC<Props> = ({ isOpen, onClose, result, formState }) => {
    const [companyName, setCompanyName] = React.useState('PT. MAJU SEJAHTERA');
    const [companyAddress, setCompanyAddress] = React.useState('Jl. Sudirman No. 123, Jakarta Selatan');
    const [employeeName, setEmployeeName] = React.useState('KARYAWAN TETAP');

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const currentDate = new Date();
    const period = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // Calculate totals
    const totalEarnings = result.grossForTax;
    const bpjsJHT = result.pensionDeduction; // 2%
    const bpjsHealth = Math.min(formState.grossSalary, 12000000) * 0.01; // 1%
    const totalDeductions = result.monthlyTax + bpjsJHT + bpjsHealth + (formState.zakat || 0);
    const takeHomePay = totalEarnings - totalDeductions;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm modal-container">
            {/* Modal Content */}
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] receipt-modal">

                {/* Header - Hidden on Print */}
                <div className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-start no-print">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <FileText size={20} className="text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold">Slip Gaji</h2>
                        </div>
                        <p className="text-slate-400 text-sm">Dihasilkan oleh PajakKu Pro &bull; {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 md:p-8 print:p-[1cm]">

                        {/* Print Header (Only visible when printing) */}
                        <div className="hidden print-only border-b-2 border-slate-800 mb-8 pb-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Slip Gaji</h1>
                                    <p className="text-sm text-slate-500">Periode: {period}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Tanggal Cetak</p>
                                    <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Company & Employee Info */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-6 print:bg-transparent print:border print:border-slate-300 print:mb-6">
                            <div className="flex items-start gap-4 mb-4 print:mb-3">
                                <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-400 print:border-slate-300">
                                    <Building2 size={24} />
                                </div>
                                <div className="flex-1">
                                    {/* Editable Company Name */}
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="font-bold text-slate-900 text-lg bg-transparent border-b border-dashed border-slate-300 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors w-full print:border-none"
                                        placeholder="Nama Perusahaan"
                                    />
                                    {/* Editable Company Address */}
                                    <input
                                        type="text"
                                        value={companyAddress}
                                        onChange={(e) => setCompanyAddress(e.target.value)}
                                        className="text-xs text-slate-500 bg-transparent border-b border-dashed border-slate-200 hover:border-blue-400 focus:border-blue-400 focus:outline-none transition-colors w-full mt-1 print:border-none"
                                        placeholder="Alamat Perusahaan"
                                    />
                                    <p className="text-[10px] text-blue-500 mt-1 no-print italic">Klik untuk edit</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-slate-500 justify-end mb-1">
                                        <CalendarDays size={14} />
                                        <span className="font-bold uppercase text-xs">Periode</span>
                                    </div>
                                    <p className="font-bold text-slate-900">{period}</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4 text-sm print:gap-y-1">
                                <div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Nama Karyawan</span>
                                    {/* Editable Employee Name */}
                                    <input
                                        type="text"
                                        value={employeeName}
                                        onChange={(e) => setEmployeeName(e.target.value)}
                                        className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors w-full print:border-none"
                                        placeholder="Nama Karyawan"
                                    />
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Status Pajak</span>
                                    <span className="font-bold text-slate-900">{formState.maritalStatus}/{formState.children} ({formState.hasNPWP ? 'NPWP' : 'Non-NPWP'})</span>
                                </div>
                            </div>
                        </div>

                        {/* Earnings & Deductions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:gap-8 print:mb-6">
                            {/* Earnings */}
                            <div className="space-y-4 print:space-y-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Penerimaan (Earnings)</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">Gaji Pokok</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(formState.grossSalary)}</span>

                                    {formState.allowance > 0 && (
                                        <>
                                            <span className="text-slate-500 print:text-slate-600">Tunjangan Tetap</span>
                                            <span className="font-bold text-slate-900 text-right">{formatCurrency(formState.allowance)}</span>
                                        </>
                                    )}

                                    {formState.method === PPh21Method.GROSS_UP && (
                                        <>
                                            <span className="text-emerald-600 font-medium print:text-slate-600">Tunjangan Pajak</span>
                                            <span className="font-bold text-emerald-600 text-right print:text-slate-900">{formatCurrency(result.taxAllowance)}</span>
                                        </>
                                    )}

                                    {result.insuranceAmount > 0 && (
                                        <>
                                            <span className="text-slate-400 text-xs print:text-slate-600">Tunjangan JKK/JKM</span>
                                            <span className="text-slate-400 text-xs text-right print:text-slate-900">{formatCurrency(result.insuranceAmount)}</span>
                                        </>
                                    )}

                                    <div className="col-span-2 h-px bg-slate-100 my-1 print:bg-slate-200"></div>

                                    <span className="font-bold text-slate-900">Total Penerimaan</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(totalEarnings)}</span>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="space-y-4 print:space-y-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Potongan (Deductions)</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">PPh 21 (TER {result.terCategory})</span>
                                    <span className="font-medium text-red-500 text-right print:text-slate-900">({formatCurrency(result.monthlyTax)})</span>

                                    <span className="text-slate-500 print:text-slate-600">BPJS JHT (2%)</span>
                                    <span className="font-medium text-red-500 text-right print:text-slate-900">({formatCurrency(bpjsJHT)})</span>

                                    <span className="text-slate-500 print:text-slate-600">BPJS Kesehatan (1%)</span>
                                    <span className="font-medium text-red-500 text-right print:text-slate-900">({formatCurrency(bpjsHealth)})</span>

                                    {formState.zakat > 0 && (
                                        <>
                                            <span className="text-slate-500 print:text-slate-600">Zakat/Sumbangan</span>
                                            <span className="font-medium text-red-500 text-right print:text-slate-900">({formatCurrency(formState.zakat)})</span>
                                        </>
                                    )}

                                    {result.insuranceAmount > 0 && (
                                        <>
                                            <span className="text-slate-400 text-xs print:text-slate-600">Potongan JKK/JKM</span>
                                            <span className="text-slate-400 text-xs text-right print:text-slate-900">({formatCurrency(result.insuranceAmount)})</span>
                                        </>
                                    )}

                                    <div className="col-span-2 h-px bg-slate-100 my-1 print:bg-slate-200"></div>

                                    <span className="font-bold text-slate-900">Total Potongan</span>
                                    <span className="font-bold text-red-600 text-right print:text-slate-900">({formatCurrency(totalDeductions)})</span>
                                </div>
                            </div>
                        </div>

                        {/* Take Home Pay - Prominent */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-6 print:bg-transparent print:border-none print:p-0 print:mb-6">
                            <div className="flex justify-between items-center p-4 bg-slate-900 rounded-lg text-white print:bg-slate-900 print:text-white print:border print:border-slate-900">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1 tracking-wider">GAJI BERSIH (TAKE HOME PAY)</p>
                                    <p className="text-xs text-emerald-400 font-medium">Transfer ke BCA ****1234</p>
                                </div>
                                <p className="text-2xl font-bold print:text-xl">{formatCurrency(takeHomePay)}</p>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
                            <p className="font-bold mb-1">Catatan:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>Slip gaji ini adalah simulasi berdasarkan data yang diinputkan.</li>
                                <li>Potongan PPh 21 menggunakan metode TER (Tarif Efektif Rata-rata) sesuai PP 58/2023.</li>
                                <li>BPJS dihitung berdasarkan peraturan terbaru dengan batasan upah maksimal.</li>
                                <li>Untuk keperluan resmi, silakan gunakan slip gaji dari HRD perusahaan Anda.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 no-print">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2 group"
                    >
                        <Printer size={16} className="group-hover:scale-110 transition-transform" />
                        Cetak Slip Gaji
                    </button>
                </div>

            </div>
        </div >,
        document.body
    );
};

export default PayslipModal;

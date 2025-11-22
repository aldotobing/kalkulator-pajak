import React from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../services/taxLogic';
import { X, Printer, FileText, Calculator, Info } from './Icons';

interface TaxLayer {
    layer: string;
    rate: number;
    amount: number;
}

interface FreelancerResultData {
    grossIncome: number;
    professionLabel: string;
    normaRate: number;
    netIncome: number;
    maritalStatus: string;
    children: number;
    ptkp: number;
    pkp: number;
    annualTax: number;
    taxLayers: TaxLayer[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: FreelancerResultData;
}

const FreelancerResultModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm modal-container">
            {/* Modal Content - This is what gets printed */}
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] receipt-modal">

                {/* Header - Hidden on Print */}
                <div className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-start no-print">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <FileText size={20} className="text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold">Laporan Pajak Freelancer</h2>
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
                                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Laporan Pajak Freelancer</h1>
                                    <p className="text-sm text-slate-500">Metode: Norma Penghitungan Penghasilan Neto (NPPN)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Tanggal Cetak</p>
                                    <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:gap-8 print:mb-6">
                            <div className="space-y-4 print:space-y-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Data Penghasilan</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">Profesi</span>
                                    <span className="font-bold text-slate-900 text-right">{data.professionLabel}</span>

                                    <span className="text-slate-500 print:text-slate-600">Omzet Bruto</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(data.grossIncome)}</span>

                                    <span className="text-slate-500 print:text-slate-600">Tarif Norma</span>
                                    <span className="font-bold text-blue-600 text-right print:text-slate-900">{(data.normaRate * 100)}%</span>

                                    <div className="col-span-2 h-px bg-slate-100 my-1 print:bg-slate-200"></div>

                                    <span className="font-bold text-slate-900">Penghasilan Neto</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(data.netIncome)}</span>
                                </div>
                            </div>

                            <div className="space-y-4 print:space-y-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Status & Pengurang</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">Status PTKP</span>
                                    <span className="font-bold text-slate-900 text-right">{data.maritalStatus}/{data.children}</span>

                                    <span className="text-slate-500 print:text-slate-600">Nilai PTKP</span>
                                    <span className="font-medium text-red-500 text-right print:text-slate-900">({formatCurrency(data.ptkp)})</span>

                                    <div className="col-span-2 h-px bg-slate-100 my-1 print:bg-slate-200"></div>

                                    <span className="font-bold text-slate-900">PKP</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(data.pkp)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Calculation Result Box */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8 print:bg-transparent print:border-none print:p-0 print:mb-6">
                            {/* Screen Header */}
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 print:hidden">
                                <Calculator size={16} className="text-blue-600" />
                                Rincian Pajak (Progresif)
                            </h3>

                            {/* Print Header - Consistent Style */}
                            <div className="hidden print:flex justify-between items-end mb-3 border-b border-slate-200 pb-2">
                                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rincian Pajak</h3>
                                <div className="text-xs text-slate-500">
                                    Metode: <span className="font-bold text-slate-900">Tarif Pasal 17 UU HPP</span>
                                </div>
                            </div>

                            <div className="space-y-4 print:space-y-2">
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0 print:items-end">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-600 print:mb-0">Total Pajak Terutang</p>
                                        <p className="text-xs text-blue-600 font-medium print:text-slate-500">Setahun</p>
                                    </div>
                                    <p className="text-xl font-bold text-slate-900 print:text-lg">{formatCurrency(data.annualTax)}</p>
                                </div>

                                {/* Tax Layers Breakdown */}
                                <div className="space-y-2 print:space-y-1 mt-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 print:text-slate-600">Rincian Lapisan Tarif</p>
                                    {data.taxLayers.length > 0 ? data.taxLayers.map((layer, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-slate-100 print:border-none print:p-0">
                                            <span className="text-slate-600">Lapisan {idx + 1} ({layer.layer})</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(layer.amount)}</span>
                                        </div>
                                    )) : (
                                        <div className="text-sm text-slate-500 italic">Tidak ada pajak terutang.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
                            <p className="font-bold mb-1">Catatan:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>Perhitungan ini menggunakan Norma Penghitungan Penghasilan Neto (NPPN) untuk Wajib Pajak Orang Pribadi dengan peredaran bruto &lt; Rp 4,8 Miliar setahun.</li>
                                <li>Tarif pajak menggunakan tarif progresif Pasal 17 UU HPP terbaru.</li>
                                <li>Hasil ini adalah simulasi dan estimasi. Silakan konsultasikan dengan konsultan pajak atau AR untuk kepastian hukum.</li>
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
                        Cetak Laporan
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default FreelancerResultModal;

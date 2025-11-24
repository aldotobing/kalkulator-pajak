import React from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../services/taxLogic';
import { X, Printer, FileText, Calculator, Building2 } from './Icons';

interface PPhBadanResultData {
    omzet: number;
    hpp: number;
    expenses: number;
    fiscalCorrection: number;
    commercialProfit: number;
    pkpFinal: number;
    taxAmount: number;
    taxMethod: string;
    useUMKM: boolean;
    isSmallBusiness: boolean;
    isMediumBusiness: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: PPhBadanResultData;
}

const PPhBadanResultModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
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
                                <Building2 size={20} className="text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold">Laporan PPh Badan</h2>
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
                                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Laporan PPh Badan</h1>
                                    <p className="text-sm text-slate-500">Perhitungan Pajak Penghasilan Korporasi</p>
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
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Data Keuangan</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">Peredaran Bruto</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(data.omzet)}</span>

                                    {!data.useUMKM && (
                                        <>
                                            <span className="text-slate-500 print:text-slate-600">HPP</span>
                                            <span className="font-bold text-slate-900 text-right">{formatCurrency(data.hpp)}</span>

                                            <span className="text-slate-500 print:text-slate-600">Biaya Operasional</span>
                                            <span className="font-bold text-slate-900 text-right">{formatCurrency(data.expenses)}</span>

                                            <div className="col-span-2 h-px bg-slate-100 my-1 print:bg-slate-200"></div>

                                            <span className="font-bold text-slate-900">Laba Komersial</span>
                                            <span className="font-bold text-slate-900 text-right">{formatCurrency(data.commercialProfit)}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 print:space-y-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Metode Perhitungan</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">Skema Pajak</span>
                                    <span className="font-bold text-slate-900 text-right">{data.useUMKM ? 'UMKM (0.5%)' : 'Tarif Umum'}</span>

                                    {!data.useUMKM && (
                                        <>
                                            <span className="text-slate-500 print:text-slate-600">Koreksi Fiskal</span>
                                            <span className="font-bold text-slate-900 text-right">{formatCurrency(data.fiscalCorrection)}</span>

                                            <div className="col-span-2 h-px bg-slate-100 my-1 print:bg-slate-200"></div>

                                            <span className="font-bold text-slate-900">PKP (Fiskal)</span>
                                            <span className="font-bold text-emerald-600 text-right print:text-slate-900">{formatCurrency(data.pkpFinal)}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Calculation Result Box */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8 print:bg-transparent print:border-none print:p-0 print:mb-6">
                            {/* Screen Header */}
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 print:hidden">
                                <Calculator size={16} className="text-blue-600" />
                                Hasil Perhitungan
                            </h3>

                            {/* Print Header - Consistent Style */}
                            <div className="hidden print:flex justify-between items-end mb-3 border-b border-slate-200 pb-2">
                                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hasil Perhitungan</h3>
                                <div className="text-xs text-slate-500">
                                    Metode: <span className="font-bold text-slate-900">{data.taxMethod}</span>
                                </div>
                            </div>

                            <div className="space-y-4 print:space-y-2">
                                {/* Tax Amount */}
                                <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0 print:items-end print:border-t print:border-slate-200 print:pt-2">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-900 print:text-sm print:mb-0">Pajak Terutang (Tahunan)</p>
                                        <p className="text-xs text-blue-600 font-medium print:text-slate-500">{data.taxMethod}</p>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 print:text-lg">{formatCurrency(data.taxAmount)}</p>
                                </div>

                                {/* Method Info */}
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg print:border-none print:bg-transparent print:p-0">
                                    <p className="text-xs text-blue-800 leading-relaxed print:text-slate-600">
                                        {data.useUMKM ? (
                                            <>
                                                <strong>Perhitungan UMKM:</strong> Pajak = 0.5% × Omzet Bruto. Skema ini berlaku untuk peredaran bruto &lt; 4.8 Miliar per tahun (PP 23/2018).
                                            </>
                                        ) : (
                                            <>
                                                <strong>Perhitungan Tarif Umum:</strong> {data.isSmallBusiness
                                                    ? 'Seluruh PKP mendapat fasilitas diskon 50% (tarif efektif 11%) karena omzet < 4.8M (Pasal 31E).'
                                                    : data.isMediumBusiness
                                                        ? 'Fasilitas diskon 50% diberikan secara proporsional. Sebagian PKP kena 11%, sisanya 22%.'
                                                        : 'Seluruh PKP dikenakan tarif normal 22% karena omzet > 50M.'}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Breakdown (Only for Non-UMKM) */}
                        {!data.useUMKM && (
                            <div className="mb-8 print:mb-6">
                                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">Rincian Laba Fiskal</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Laba Komersial</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(data.commercialProfit)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Koreksi Fiskal</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(data.fiscalCorrection)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                        <span className="font-bold text-slate-900">Penghasilan Kena Pajak (PKP)</span>
                                        <span className="font-bold text-emerald-600 print:text-slate-900">{formatCurrency(data.pkpFinal)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Disclaimer */}
                        <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
                            <p className="font-bold mb-1">Catatan:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>Perhitungan berdasarkan UU PPh Pasal 17 dan PP 23/2018.</li>
                                {data.useUMKM && <li>PPh Final UMKM memiliki batas waktu: 3 tahun untuk PT, 4 tahun untuk CV.</li>}
                                {!data.useUMKM && <li>Koreksi fiskal mencakup biaya yang tidak dapat dibebankan untuk pajak (natura, dll).</li>}
                                <li>Hasil ini merupakan estimasi. Konsultasikan dengan konsultan pajak untuk keakuratan.</li>
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

export default PPhBadanResultModal;

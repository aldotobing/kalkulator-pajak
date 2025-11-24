import React from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../services/taxLogic';
import { X, Printer, FileText, Calculator, Car } from './Icons';

interface PKBResultData {
    njkb: number;
    vehicleType: 'MOTOR' | 'MOBIL';
    progressiveIdx: number;
    provinceLabel: string;
    provinceLegal: string;
    progressiveRate: number;
    pkbPokok: number;
    swdkllj: number;
    adminStnk: number;
    totalEstimate: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: PKBResultData;
}

const PKBResultModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
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
                                <Car size={20} className="text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold">Laporan Pajak Kendaraan</h2>
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
                                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Laporan Pajak Kendaraan</h1>
                                    <p className="text-sm text-slate-500">Estimasi Biaya Perpanjangan STNK Tahunan</p>
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
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Data Kendaraan</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">Wilayah</span>
                                    <span className="font-bold text-slate-900 text-right">{data.provinceLabel}</span>

                                    <span className="text-slate-500 print:text-slate-600">Jenis Kendaraan</span>
                                    <span className="font-bold text-slate-900 text-right">{data.vehicleType}</span>

                                    <span className="text-slate-500 print:text-slate-600">Kepemilikan</span>
                                    <span className="font-bold text-slate-900 text-right">Ke-{data.progressiveIdx}</span>

                                    <div className="col-span-2 h-px bg-slate-100 my-1 print:bg-slate-200"></div>

                                    <span className="font-bold text-slate-900">NJKB</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(data.njkb)}</span>
                                </div>
                            </div>

                            <div className="space-y-4 print:space-y-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Tarif Progresif</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">Tarif PKB</span>
                                    <span className="font-bold text-blue-600 text-right print:text-slate-900">{(data.progressiveRate * 100).toFixed(2)}%</span>

                                    <span className="text-slate-500 print:text-slate-600">SWDKLLJ</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(data.swdkllj)}</span>

                                    <span className="text-slate-500 print:text-slate-600">Admin STNK</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(data.adminStnk)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Calculation Result Box */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8 print:bg-transparent print:border-none print:p-0 print:mb-6">
                            {/* Screen Header */}
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 print:hidden">
                                <Calculator size={16} className="text-blue-600" />
                                Rincian Biaya
                            </h3>

                            {/* Print Header - Consistent Style */}
                            <div className="hidden print:flex justify-between items-end mb-3 border-b border-slate-200 pb-2">
                                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rincian Biaya</h3>
                                <div className="text-xs text-slate-500">
                                    Tarif: <span className="font-bold text-slate-900">{(data.progressiveRate * 100).toFixed(2)}%</span>
                                </div>
                            </div>

                            <div className="space-y-4 print:space-y-2">
                                {/* PKB Pokok */}
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0 print:items-end">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-600 print:mb-0">PKB Pokok</p>
                                        <p className="text-xs text-blue-600 font-medium print:text-slate-500">Pajak Kendaraan Bermotor</p>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">{formatCurrency(data.pkbPokok)}</p>
                                </div>

                                {/* SWDKLLJ */}
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0 print:items-end">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-600 print:mb-0">SWDKLLJ</p>
                                        <p className="text-xs text-blue-600 font-medium print:text-slate-500">Asuransi Jasa Raharja</p>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">{formatCurrency(data.swdkllj)}</p>
                                </div>

                                {/* Admin STNK */}
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0 print:items-end">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-600 print:mb-0">Admin STNK</p>
                                        <p className="text-xs text-blue-600 font-medium print:text-slate-500">Biaya Administrasi Tahunan</p>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">{formatCurrency(data.adminStnk)}</p>
                                </div>

                                {/* Total */}
                                <div className="p-3 bg-white rounded-lg border border-slate-100 print:border-none print:shadow-none print:p-0 print:flex print:justify-between print:items-end print:mt-4 print:border-t print:border-slate-200 print:pt-2">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-900 print:text-sm print:mb-0">Total Estimasi Pajak</p>
                                    <p className="text-xl font-bold text-indigo-600 print:text-lg print:text-slate-900">{formatCurrency(data.totalEstimate)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
                            <p className="font-bold mb-1">Catatan:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>Acuan hukum: {data.provinceLegal}</li>
                                <li>Tarif progresif berlaku untuk kendaraan dalam satu Kartu Keluarga (KK).</li>
                                <li>Estimasi ini untuk pengesahan STNK tahunan. Pajak 5 tahunan memiliki biaya tambahan TNKB & cetak STNK.</li>
                                <li>NJKB bukan harga pasar, melainkan nilai penetapan pemerintah (cek di STNK lama atau website Samsat).</li>
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

export default PKBResultModal;

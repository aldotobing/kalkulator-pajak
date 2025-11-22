import React from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../services/taxLogic';
import { X, Printer, FileText, Calculator, Home } from './Icons';

interface BPHTBResultData {
    price: number;
    region: string;
    npoptkp: number;
    pphAmount: number;
    sellerReceived: number;
    bphtbAmount: number;
    includeLegalFees: boolean;
    notaryFee: number;
    pnbpFee: number;
    totalLegalFees: number;
    buyerCost: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: BPHTBResultData;
}

const BPHTBResultModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
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
                                <Home size={20} className="text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold">Laporan Pajak Jual Beli Rumah</h2>
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
                                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Laporan Pajak Properti</h1>
                                    <p className="text-sm text-slate-500">Perhitungan BPHTB & PPh Jual Beli</p>
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
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Data Transaksi</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">Harga Transaksi</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(data.price)}</span>

                                    <span className="text-slate-500 print:text-slate-600">Wilayah</span>
                                    <span className="font-bold text-slate-900 text-right">{data.region}</span>

                                    <div className="col-span-2 h-px bg-slate-100 my-1 print:bg-slate-200"></div>

                                    <span className="font-bold text-slate-900">NPOPTKP</span>
                                    <span className="font-bold text-slate-900 text-right">{formatCurrency(data.npoptkp)}</span>
                                </div>
                            </div>

                            <div className="space-y-4 print:space-y-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 print:text-slate-600 print:border-slate-200">Ringkasan Biaya</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm print:gap-y-1">
                                    <span className="text-slate-500 print:text-slate-600">Pajak Penjual (PPh)</span>
                                    <span className="font-bold text-emerald-600 text-right print:text-slate-900">{formatCurrency(data.pphAmount)}</span>

                                    <span className="text-slate-500 print:text-slate-600">Pajak Pembeli (BPHTB)</span>
                                    <span className="font-bold text-blue-600 text-right print:text-slate-900">{formatCurrency(data.bphtbAmount)}</span>

                                    {data.includeLegalFees && (
                                        <>
                                            <span className="text-slate-500 print:text-slate-600">Biaya Legal</span>
                                            <span className="font-bold text-orange-500 text-right print:text-slate-900">{formatCurrency(data.totalLegalFees)}</span>
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
                                Detail Perhitungan
                            </h3>

                            {/* Print Header - Consistent Style */}
                            <div className="hidden print:flex justify-between items-end mb-3 border-b border-slate-200 pb-2">
                                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Detail Perhitungan</h3>
                                <div className="text-xs text-slate-500">
                                    Metode: <span className="font-bold text-slate-900">PPh Final & BPHTB</span>
                                </div>
                            </div>

                            <div className="space-y-6 print:space-y-4">
                                {/* Penjual Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 print:text-slate-600">Pihak Penjual</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0 print:items-end">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-600 print:mb-0">PPh Final (2.5%)</p>
                                                <p className="text-xs text-blue-600 font-medium print:text-slate-500">Pajak Penghasilan</p>
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">{formatCurrency(data.pphAmount)}</p>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0 print:items-end">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-600 print:mb-0">Diterima Bersih</p>
                                                <p className="text-xs text-emerald-600 font-medium print:text-slate-500">Net Proceeds</p>
                                            </div>
                                            <p className="text-lg font-bold text-emerald-600 print:text-slate-900">{formatCurrency(data.sellerReceived)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pembeli Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 print:text-slate-600">Pihak Pembeli</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0 print:items-end">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-600 print:mb-0">BPHTB (5%)</p>
                                                <p className="text-xs text-blue-600 font-medium print:text-slate-500">Bea Perolehan Hak</p>
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">{formatCurrency(data.bphtbAmount)}</p>
                                        </div>

                                        {data.includeLegalFees && (
                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm print:border-none print:shadow-none print:p-0 print:items-end">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-600 print:mb-0">Biaya Legal & Admin</p>
                                                    <p className="text-xs text-orange-500 font-medium print:text-slate-500">Notaris & PNBP</p>
                                                </div>
                                                <p className="text-lg font-bold text-slate-900">{formatCurrency(data.totalLegalFees)}</p>
                                            </div>
                                        )}

                                        <div className="p-3 bg-white rounded-lg border border-slate-100 print:border-none print:shadow-none print:p-0 print:flex print:justify-between print:items-end print:mt-2 print:border-t print:border-slate-200 print:pt-2">
                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1 print:text-slate-900 print:text-sm print:mb-0">Total Biaya Pembelian</p>
                                            <p className="text-xl font-bold text-slate-900 print:text-lg">{formatCurrency(data.buyerCost)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
                            <p className="font-bold mb-1">Catatan:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>PPh Final (2.5%) ditanggung oleh Penjual.</li>
                                <li>BPHTB (5%) ditanggung oleh Pembeli setelah dikurangi NPOPTKP.</li>
                                <li>Biaya Notaris/PPAT dan PNBP adalah estimasi dan dapat bervariasi.</li>
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

export default BPHTBResultModal;

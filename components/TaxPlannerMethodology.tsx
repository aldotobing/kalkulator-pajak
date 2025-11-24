import React from 'react';
import { Info, Calculator, BookOpen, ShieldCheck, Briefcase, Building2, User, Activity, TrendingUp, HelpCircle } from 'lucide-react';

const TaxPlannerMethodology: React.FC = () => {
    return (
        <div className="mt-16 border-t border-slate-200 pt-12">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Metodologi Perhitungan</h2>
                    <p className="text-slate-500 text-sm mt-1">Transparansi & logika di balik angka-angka simulator</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Card 1: PPh 21 Logic */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Calculator size={20} />
                        </div>
                        Dasar Perhitungan PPh 21
                    </h3>

                    <div className="space-y-4">
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Kami menggunakan metode <strong>Annualized (Disetahunkan)</strong> dengan tarif Pasal 17, bukan TER bulanan.
                        </p>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                            <HelpCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-900 leading-relaxed">
                                <strong className="block mb-1 text-amber-700">Kenapa bukan TER?</strong>
                                TER hanya untuk potongan slip gaji bulanan. Untuk perencanaan keuangan yang akurat, kami menghitung <strong>pajak riil akhir tahun</strong> yang wajib Anda laporkan di SPT Tahunan.
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Alur Perhitungan</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm text-slate-700">
                                    <span className="font-bold text-slate-400">1.</span>
                                    <span>
                                        <span className="font-semibold">Bruto Setahun:</span> (Gaji + Tunjangan) x 12 + Bonus/THR
                                    </span>
                                </li>
                                <li className="flex gap-3 text-sm text-slate-700">
                                    <span className="font-bold text-slate-400">2.</span>
                                    <span>
                                        <span className="font-semibold">Pengurang:</span> Biaya Jabatan (Max 6jt) + BPJS + Zakat
                                    </span>
                                </li>
                                <li className="flex gap-3 text-sm text-slate-700">
                                    <span className="font-bold text-slate-400">3.</span>
                                    <span>
                                        <span className="font-semibold">PKP:</span> (Bruto - Pengurang) - PTKP
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Card 2: Assumptions */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <ShieldCheck size={20} />
                        </div>
                        Asumsi & Batasan (Rules)
                    </h3>

                    <div className="space-y-4">
                        <div className="flex gap-4 items-start pb-4 border-b border-slate-100">
                            <div className="mt-1">
                                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">BPJS</span>
                            </div>
                            <div className="text-sm text-slate-600">
                                <p className="mb-1"><strong className="text-slate-900">Kesehatan:</strong> 1% (Max upah 12 Juta)</p>
                                <p><strong className="text-slate-900">Jaminan Pensiun:</strong> 1% (Max upah 10.042.300)</p>
                                <p className="text-xs text-slate-400 mt-1">*Sesuai aturan terbaru 2024</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="mt-1">
                                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">PTKP</span>
                            </div>
                            <div className="text-sm text-slate-600">
                                <p className="mb-1"><strong className="text-slate-900">TK/0:</strong> Rp 54.000.000 (Dasar)</p>
                                <p className="mb-1"><strong className="text-slate-900">Menikah:</strong> +Rp 4.500.000</p>
                                <p><strong className="text-slate-900">Anak/Tanggungan:</strong> +Rp 4.500.000/orang (Max 3)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Scenarios */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Info size={20} />
                        </div>
                        Logika Komparasi
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User size={16} className="text-blue-500 mt-1 shrink-0" />
                            <div className="text-sm">
                                <strong className="block text-slate-900">Karyawan</strong>
                                <span className="text-slate-600">Tarif Progresif Pasal 17. Otomatis hitung Biaya Jabatan & BPJS.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Briefcase size={16} className="text-purple-500 mt-1 shrink-0" />
                            <div className="text-sm">
                                <strong className="block text-slate-900">Freelancer (Norma)</strong>
                                <span className="text-slate-600">Asumsi Norma 50%. Rumus: (Bruto x 50%) - PTKP = PKP.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Building2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                            <div className="text-sm">
                                <strong className="block text-slate-900">UMKM (PP 23)</strong>
                                <span className="text-slate-600">Tarif Final 0.5% dari Bruto. Bebas pajak untuk 500 Juta pertama (Orang Pribadi).</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 4: Growth */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        Proyeksi & Inflasi
                    </h3>

                    <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                        <p>
                            Simulator ini memproyeksikan masa depan dengan 2 variabel kunci:
                        </p>
                        <ul className="space-y-3">
                            <li className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <strong className="block text-slate-900 mb-1">CAGR (Compound Growth)</strong>
                                Kenaikan gaji dihitung secara majemuk (bunga-berbunga) setiap tahunnya, bukan linear.
                            </li>
                            <li className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <strong className="block text-slate-900 mb-1">Real Value (Daya Beli)</strong>
                                <span className="text-slate-500">Garis putus-putus kuning</span> menunjukkan nilai gaji Anda setelah dikurangi dampak inflasi. Ini adalah "uang nyata" yang Anda rasakan.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxPlannerMethodology;

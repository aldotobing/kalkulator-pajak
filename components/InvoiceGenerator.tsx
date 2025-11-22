
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../services/taxLogic';
import { Printer, Plus, Trash, FileText, Save, AlertCircle, Download } from './Icons';

// Types
interface InvoiceItem {
   id: string;
   desc: string;
   qty: number;
   price: number;
}

const InvoiceGenerator: React.FC = () => {
   // Invoice Details
   const [invoiceNo, setInvoiceNo] = useState(`INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-001`);
   const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

   // Sender (You)
   const [senderName, setSenderName] = useState('Nama Perusahaan / Freelancer');
   const [senderInfo, setSenderInfo] = useState('Jalan Sudirman No. 1, Jakarta\nNPWP: 00.000.000.0-000.000\nEmail: contact@business.com');

   // Client
   const [clientName, setClientName] = useState('Nama Klien');
   const [clientInfo, setClientInfo] = useState('Alamat Klien\nNPWP: 00.000.000.0-000.000');

   // Items
   const [items, setItems] = useState<InvoiceItem[]>([
      { id: '1', desc: 'Jasa Konsultasi', qty: 1, price: 5000000 },
   ]);

   // Tax Config
   const [includePPN, setIncludePPN] = useState(false);
   const [includePPh23, setIncludePPh23] = useState(false); // As deduction info

   // Bank Details
   const [paymentInfo, setPaymentInfo] = useState('BCA 1234567890\na.n. Nama Pemilik Rekening');

   // --- Logic ---
   const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
   const ppnAmount = includePPN ? subtotal * 0.11 : 0;
   const pph23Amount = includePPh23 ? subtotal * 0.02 : 0;
   const total = subtotal + ppnAmount; // Grand Total (Tagihan)
   const netReceived = total - pph23Amount; // Estimate received after Withholding Tax

   const handleAddItem = () => {
      const newItem: InvoiceItem = {
         id: Date.now().toString(),
         desc: 'Item Baru',
         qty: 1,
         price: 0
      };
      setItems([...items, newItem]);
   };

   const handleRemoveItem = (id: string) => {
      if (items.length > 1) {
         setItems(items.filter(i => i.id !== id));
      }
   };

   const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
      setItems(items.map(i => {
         if (i.id === id) return { ...i, [field]: value };
         return i;
      }));
   };

   return (
      <div className="max-w-5xl mx-auto pb-12 font-sans text-slate-900">

         {/* TOOLBAR (Hidden on Print) */}
         <div className="no-print mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 p-4 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-600 rounded-lg">
                  <FileText size={20} />
               </div>
               <div>
                  <h2 className="font-bold text-lg">Invoice Generator</h2>
                  <p className="text-xs text-slate-400">Buat Faktur & Invoice profesional PDF siap cetak.</p>
               </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="flex gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                  <button
                     onClick={() => setIncludePPN(!includePPN)}
                     className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${includePPN ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                     + PPN 11%
                  </button>
                  <button
                     onClick={() => setIncludePPh23(!includePPh23)}
                     className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${includePPh23 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                     - PPh 23 (Info)
                  </button>
               </div>

               <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-blue-50 rounded-xl font-bold text-sm transition-colors ml-auto"
               >
                  <Printer size={16} />
                  Cetak / PDF
               </button>
            </div>
         </div>

         {/* PAPER CONTAINER */}
         {/* Reduced font sizes and margins for compact professional layout */}
         <div className="invoice-preview bg-white shadow-2xl shadow-slate-200/50 min-h-[29.7cm] w-full max-w-[21cm] mx-auto p-8 md:p-16 relative print:shadow-none print:p-[1cm] print:w-full print:max-w-none print:min-h-0 print:m-0">

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
               <div className="w-1/2">
                  <input
                     type="text"
                     value={senderName}
                     onChange={(e) => setSenderName(e.target.value)}
                     className="text-xl font-black text-slate-900 w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none transition-colors placeholder:text-slate-300 mb-1 print:placeholder:hidden"
                     placeholder="Nama Perusahaan Anda"
                  />
                  <textarea
                     value={senderInfo}
                     onChange={(e) => setSenderInfo(e.target.value)}
                     className="text-xs text-slate-500 w-full bg-transparent border-l-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none transition-colors resize-none h-16 pl-2 print:placeholder:hidden leading-tight"
                     placeholder="Alamat, NPWP, Email..."
                  />
               </div>
               <div className="text-right w-1/3">
                  <h1 className="text-3xl font-black text-slate-300 tracking-widest uppercase mb-2 print:text-slate-300">INVOICE</h1>
                  <div className="flex justify-between items-center mb-0.5">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Nomor</span>
                     <input
                        type="text"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        className="text-xs font-bold text-slate-900 text-right bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none w-28"
                     />
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Tanggal</span>
                     <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="text-xs font-bold text-slate-900 text-right bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none w-28"
                     />
                  </div>
               </div>
            </div>

            {/* Client Info */}
            <div className="mb-8">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ditagihkan Kepada (Client)</h3>
               <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-lg font-bold text-slate-900 w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none transition-colors placeholder:text-slate-300 mb-0.5 print:placeholder:hidden"
                  placeholder="Nama Klien"
               />
               <textarea
                  value={clientInfo}
                  onChange={(e) => setClientInfo(e.target.value)}
                  className="text-xs text-slate-500 w-full bg-transparent border-l-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none transition-colors resize-none h-12 pl-2 print:placeholder:hidden leading-tight"
                  placeholder="Alamat Klien..."
               />
            </div>

            {/* Table */}
            <div className="mb-6">
               <div className="grid grid-cols-12 gap-4 border-b border-slate-900 pb-1 mb-2">
                  <div className="col-span-6 text-[10px] font-bold text-slate-900 uppercase tracking-wider">Deskripsi Item</div>
                  <div className="col-span-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider text-right">Qty</div>
                  <div className="col-span-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider text-right">Harga Satuan</div>
                  <div className="col-span-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider text-right">Total</div>
               </div>

               <div className="space-y-1">
                  {items.map((item) => (
                     <div key={item.id} className="grid grid-cols-12 gap-4 items-start group">
                        <div className="col-span-6">
                           <input
                              type="text"
                              value={item.desc}
                              onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)}
                              className="w-full font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1"
                              placeholder="Nama Barang/Jasa"
                           />
                        </div>
                        <div className="col-span-2">
                           <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)}
                              className="w-full text-right font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1"
                           />
                        </div>
                        <div className="col-span-2">
                           <input
                              type="text"
                              value={new Intl.NumberFormat('id-ID').format(item.price)}
                              onChange={(e) => {
                                 const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                                 handleItemChange(item.id, 'price', val);
                              }}
                              className="w-full text-right font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1"
                           />
                        </div>
                        <div className="col-span-2 text-right font-bold text-slate-900 text-xs py-1 relative">
                           {formatCurrency(item.qty * item.price)}
                           <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="absolute -right-6 top-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all no-print"
                           >
                              <Trash size={12} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>

               <button
                  onClick={handleAddItem}
                  className="mt-3 flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors no-print"
               >
                  <Plus size={12} /> Tambah Item
               </button>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
               <div className="w-1/2 md:w-1/3 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                     <span>Subtotal</span>
                     <span className="font-bold text-slate-700">{formatCurrency(subtotal)}</span>
                  </div>

                  {includePPN && (
                     <div className="flex justify-between text-xs text-slate-500">
                        <span>PPN (11%)</span>
                        <span className="font-bold text-slate-700">{formatCurrency(ppnAmount)}</span>
                     </div>
                  )}

                  <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-900 pt-2">
                     <span>TOTAL TAGIHAN</span>
                     <span>{formatCurrency(total)}</span>
                  </div>

                  {includePPh23 && (
                     <div className="mt-2 pt-1 border-t border-dashed border-slate-300">
                        <div className="flex justify-between text-[10px] text-slate-400 italic">
                           <span>Info: Estimasi PPh 23 (2%)</span>
                           <span>({formatCurrency(pph23Amount)})</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-emerald-600 mt-0.5">
                           <span>Estimasi Diterima Bersih</span>
                           <span>{formatCurrency(netReceived)}</span>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Footer & Bank */}
            <div className="grid grid-cols-2 gap-12 break-inside-avoid">
               <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Info Pembayaran</h3>
                  <textarea
                     value={paymentInfo}
                     onChange={(e) => setPaymentInfo(e.target.value)}
                     className="text-xs font-medium text-slate-700 w-full bg-slate-50/50 border-l-2 border-blue-500 hover:bg-blue-50 focus:bg-white outline-none transition-colors resize-none h-16 pl-2 py-1 rounded-r-md print:bg-transparent print:border-l-2 print:border-blue-500 print:pl-2 print:placeholder:hidden leading-tight"
                     placeholder="Bank BCA 123456789 a.n Nama..."
                  />
               </div>
               <div className="text-center mt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-10">Hormat Kami,</p>
                  <input
                     type="text"
                     value={senderName}
                     readOnly
                     className="text-xs font-bold text-slate-900 text-center w-full bg-transparent border-none outline-none"
                  />
               </div>
            </div>

            {/* Print Disclaimer */}
            <div className="absolute bottom-6 left-0 right-0 text-center print:block hidden">
               <p className="text-[8px] text-slate-300">Generated by PajakKu Pro</p>
            </div>

         </div>
      </div>
   );
};

export default InvoiceGenerator;

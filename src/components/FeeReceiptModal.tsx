/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Users, X, FileText, Download } from "lucide-react";
import { FeeReceiptData } from "../utils/feeReceipt";

interface FeeReceiptModalProps {
  isOpen: boolean;
  receiptData: FeeReceiptData | null;
  onClose: () => void;
}

export function FeeReceiptModal({ isOpen, receiptData, onClose }: FeeReceiptModalProps) {
  if (!isOpen || !receiptData) return null;

  const footerEmail = receiptData.footerEmail || "parent@example.com";

  const handlePrint = () => {
    const printContents = document.getElementById("receipt-print-area")?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Academy Flow Receipt - ${receiptData.transactionId}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="p-8 bg-white font-sans text-xs">
          <div class="max-w-md mx-auto border p-6 rounded-2xl shadow-sm">
            ${printContents}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-150 dark:border-slate-800 flex flex-col interactive">
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs font-black uppercase text-slate-400">Payment Receipt Details</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-455 interactive"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div id="receipt-print-area" className="p-6 space-y-6 text-xs font-bold bg-white dark:bg-slate-950">
          <div className="flex justify-between items-center border-b-2 border-dashed border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#f27a3d] rounded-xl text-white shadow-md">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm tracking-wider text-slate-900 dark:text-white uppercase leading-none">
                  Academy Flow
                </h3>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block mt-0.5">
                  Academic CRM Portal
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border border-emerald-200/50">
                {receiptData.paymentStatus}
              </span>
            </div>
          </div>

          <div className="space-y-4 leading-normal font-bold">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Student Name</span>
                <span className="font-black text-slate-850 dark:text-white text-sm">{receiptData.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Parent Member</span>
                <span className="font-black text-slate-850 dark:text-white text-sm">{receiptData.parentName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Transaction ID</span>
                <span className="font-black text-slate-850 dark:text-white text-sm text-indigo-650 dark:text-indigo-400">
                  {receiptData.transactionId}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Payment Method</span>
                <span className="font-black text-slate-850 dark:text-white text-sm uppercase">
                  {receiptData.paymentMethod}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Payment Date</span>
                <span className="font-black text-slate-850 dark:text-white text-sm">{receiptData.paymentDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Tuition Item Description</span>
                <span
                  className="font-black text-slate-850 dark:text-white text-sm truncate block"
                  title={receiptData.invoiceTitle}
                >
                  {receiptData.invoiceTitle}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center border border-slate-155 dark:border-slate-800">
            <span className="text-slate-700 dark:text-slate-350 font-black text-sm uppercase tracking-wider">
              Amount Paid Successfully
            </span>
            <span className="text-emerald-600 dark:text-emerald-450 text-xl font-black">
              ${receiptData.amountPaid}.00
            </span>
          </div>

          <div className="text-center text-[10px] text-slate-400 leading-relaxed pt-2">
            Thank you for your tuition payment! An official ledger notification has been logged in institutional
            rosters and sent to {footerEmail}.
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-150 dark:border-slate-800 flex justify-between gap-3">
          <button
            onClick={handlePrint}
            type="button"
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 interactive"
          >
            <FileText className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={() => {
              alert("Downloading official PDF Receipt to local machine... (Simulated download)");
              onClose();
            }}
            type="button"
            className="px-4 py-2 bg-[#f27a3d] hover:bg-[#ff8950] text-white font-extrabold text-xs rounded-xl shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 interactive"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import PayslipForm from '../components/forms/Payslipform';
import OfferLetterForm from '../components/forms/offerletterform';

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'payslip' | 'offer'>('offer');

  // --- 1. LANDING PAGE VIEW ---
  if (!isStarted) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50/50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-300 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Text & CTA */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-bold tracking-wide shadow-sm border border-blue-200">
              <i className="bi bi-shield-lock-fill"></i> Secured Internal Portal
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
              Agenthum Official <br /> Document Generator
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Empower our HR operations with Agenthum&apos;s proprietary document engine. Seamlessly generate standardized, compliant offer letters for new hires and accurate monthly salary slips for our team in just a few clicks.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => { setActiveTab('offer'); setIsStarted(true); }}
                className="bg-[#E63946] hover:bg-red-700 text-white font-bold py-4 px-8 rounded shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 tracking-wider"
              >
                GENERATE OFFER LETTER
              </button>
              <button
                onClick={() => { setActiveTab('payslip'); setIsStarted(true); }}
                className="bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 font-bold py-4 px-8 rounded shadow-sm hover:shadow transition-all tracking-wider"
              >
                CREATE PAYSLIP
              </button>
            </div>
          </div>

          {/* Right Column: CSS Illustration */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Background Blob for depth */}
            <div className="absolute w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

            {/* Abstract Document Card */}
            <div className="relative bg-white p-8 rounded-xl shadow-2xl w-80 transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-100">

              {/* Header profile row */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-blue-600 to-cyan-400 p-1 shadow-inner">
                  <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-end justify-center">
                    <i className="bi bi-person-fill text-5xl text-slate-300 -mb-2"></i>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="h-3 bg-blue-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>

              {/* Skeleton Document Lines */}
              <div className="space-y-4 mb-10">
                <div className="h-2 bg-slate-100 rounded w-full"></div>
                <div className="h-2 bg-slate-100 rounded w-full"></div>
                <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                <div className="h-2 bg-slate-100 rounded w-4/6"></div>
              </div>

              {/* Abstract Signature Box */}
              <div className="border-2 border-dashed border-teal-200 rounded-lg p-3 w-32 bg-teal-50/30">
                <svg viewBox="0 0 100 30" className="w-full h-full stroke-current text-slate-800" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5,20 Q15,5 25,20 T45,10 T65,25 T85,15 T95,20" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </main>
    );
  }

  // --- 2. GENERATOR APP VIEW ---
  return (
    <main className="min-h-screen bg-gray-50 py-8 animate-fade-in">

      {/* Top Navigation & Back Button */}
      <div className="max-w-400 mx-auto px-4 flex flex-col md:flex-row justify-between items-center mb-6 gap-4 no-print">
        <button
          onClick={() => setIsStarted(false)}
          className="text-slate-500 hover:text-blue-600 font-medium transition-colors shrink-0"
        >
          <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
        </button>

        {/* Tab Toggle */}
        <div className="bg-white p-1 rounded-pill shadow-sm border border-gray-200 inline-flex flex-wrap justify-center">
          <button
            onClick={() => setActiveTab('offer')}
            className={`px-6 py-2.5 rounded-pill font-bold transition-all ${activeTab === 'offer'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
          >
            <i className="bi bi-envelope-paper me-2"></i> Offer Letter
          </button>
          <button
            onClick={() => setActiveTab('payslip')}
            className={`px-6 py-2.5 rounded-pill font-bold transition-all ${activeTab === 'payslip'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
          >
            <i className="bi bi-receipt me-2"></i> Payslip
          </button>
        </div>

        {/* Empty div to balance flex-between */}
        <div className="hidden md:block w-30"></div>
      </div>

      {/* Render Active Component */}
      {activeTab === 'payslip' ? <PayslipForm /> : <OfferLetterForm />}

    </main>
  );
}
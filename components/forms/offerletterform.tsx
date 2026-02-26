"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import OfferLetterTemp from '../templates/Offerlettertemp';

const OfferLetterForm = () => {
    // Refs & State
    const offerRef = useRef<HTMLDivElement>(null);
    const [expandedSection, setExpandedSection] = useState<string>('candidate');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    // Default Data
    const defaultData = {
        candidateName: '',
        address: '',
        designation: 'Trainee App Developer',
        department: 'Technology & Application Development',
        ctc: '',
        performanceBonus: '',
        offerDate: new Date().toISOString().split('T')[0],
        joiningDate: '',
        expiryDate: ''
    };

    const [data, setData] = useState(defaultData);

    // 1. Load Data from LocalStorage (with safety merge)
    useEffect(() => {
        const savedData = localStorage.getItem('offerLetterData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // By spreading defaultData first, we ensure no fields are ever undefined!
                setData({ ...defaultData, ...parsed });
            } catch (e) {
                console.error("Failed to parse saved offer letter data");
            }
        }
        setIsLoaded(true);
    }, []);

    // 2. Save Data to LocalStorage whenever state changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('offerLetterData', JSON.stringify(data));
        }
    }, [data, isLoaded]);

    // Handle PDF Download
    const handleDownloadPdf = useReactToPrint({
        contentRef: offerRef,
        documentTitle: `Offer_Letter_${(data.candidateName || '').replace(/\s+/g, '_') || 'Candidate'}`,
        pageStyle: `@page { size: A4; margin: 15mm; } @media print { body { -webkit-print-color-adjust: exact; } }`,
    });

    // Handle Input Changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    // Handle Form Reset
    const handleReset = () => {
        if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
            setData(defaultData);
            localStorage.removeItem('offerLetterData');
            setExpandedSection('candidate');
            setErrorMsg('');
        }
    };

    // Accordion Toggle & Validation Logic (Now Crash-Proof)
    const toggleSection = (targetSection: string) => {
        setErrorMsg('');
        if (expandedSection) {
            let isValid = true;
            if (expandedSection === 'candidate') {
                isValid = (data.candidateName || '').trim() !== '';
            } else if (expandedSection === 'job') {
                // Safely handle undefined values using || ''
                isValid = (data.designation || '').trim() !== '' && 
                          (data.department || '').trim() !== '' && 
                          (data.offerDate || '').trim() !== '';
            } else if (expandedSection === 'salary') {
                isValid = String(data.ctc || '').trim() !== '';
            }
            if (!isValid) {
                setErrorMsg('Please fill required fields (*) before moving on.');
                return; 
            }
        }
        setExpandedSection(expandedSection === targetSection ? '' : targetSection);
    };

    // Reusable Accordion Header
    const AccordionHeader = ({ title, sectionId, borderColor }: { title: string, sectionId: string, borderColor: string }) => (
        <button type="button" onClick={() => toggleSection(sectionId)} className={`w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-l-4 ${borderColor} border-b border-t border-r border-gray-200`}>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${expandedSection === sectionId ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
    );

    const inputStyles = "w-full border border-gray-300 text-gray-900 placeholder-gray-400 bg-white rounded p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";

    if (!isLoaded) return null;

    return (
        <div className="flex flex-col xl:flex-row gap-8 max-w-400 mx-auto p-4 items-start animate-fade-in">
            
            {/* LEFT COLUMN: THE FORM */}
            <div className="w-full xl:w-1/3 bg-white shadow-sm rounded-md border border-gray-100 p-6">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Offer Letter Generator</h1>
                </div>

                {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium text-center transition-all">{errorMsg}</div>}

                <form className="space-y-4">
                    
                    {/* 1. Candidate Details Accordion */}
                    <div>
                        <AccordionHeader title="Candidate Details" sectionId="candidate" borderColor="border-blue-500" />
                        <div className={`p-4 border border-t-0 border-gray-200 transition-all ${expandedSection === 'candidate' ? 'block' : 'hidden'}`}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="candidateName" value={data.candidateName} onChange={handleChange} placeholder="e.g. Rahul Sharma" className={inputStyles} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea name="address" value={data.address} onChange={handleChange} placeholder="Full Address" rows={3} className={inputStyles} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Job Details Accordion */}
                    <div>
                        <AccordionHeader title="Job Details" sectionId="job" borderColor="border-teal-500" />
                        <div className={`p-4 border border-t-0 border-gray-200 transition-all ${expandedSection === 'job' ? 'block' : 'hidden'}`}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position / Designation <span className="text-red-500">*</span></label>
                                    <input type="text" name="designation" value={data.designation || ''} onChange={handleChange} className={inputStyles} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                                    <input type="text" name="department" value={data.department || ''} onChange={handleChange} className={inputStyles} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Date <span className="text-red-500">*</span></label>
                                    <input type="date" name="offerDate" value={data.offerDate || ''} onChange={handleChange} className={inputStyles} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                                    <input type="date" name="joiningDate" value={data.joiningDate || ''} onChange={handleChange} className={inputStyles} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Expiry Date</label>
                                    <input type="date" name="expiryDate" value={data.expiryDate || ''} onChange={handleChange} className={inputStyles} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Salary Details Accordion */}
                    <div>
                        <AccordionHeader title="Salary Details" sectionId="salary" borderColor="border-indigo-500" />
                        <div className={`p-4 border border-t-0 border-gray-200 transition-all ${expandedSection === 'salary' ? 'block' : 'hidden'}`}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual CTC (₹) <span className="text-red-500">*</span></label>
                                    <input type="number" name="ctc" value={data.ctc || ''} onChange={handleChange} placeholder="e.g. 240000" className={inputStyles} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Performance Bonus (₹)</label>
                                    <input type="number" name="performanceBonus" value={data.performanceBonus || ''} onChange={handleChange} placeholder="e.g. 50000" className={inputStyles} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Review Accordion */}
                    <div>
                        <AccordionHeader title="Review Details" sectionId="review" borderColor="border-purple-500" />
                        <div className={`p-4 border border-t-0 border-gray-200 bg-purple-50 transition-all ${expandedSection === 'review' ? 'block' : 'hidden'}`}>
                            <h3 className="text-sm font-bold text-purple-900 mb-4 border-b border-purple-200 pb-2">Final Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-purple-100 pb-1">
                                    <span className="text-gray-600">Candidate Name:</span>
                                    <span className="font-semibold text-gray-900">{data.candidateName || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-purple-100 pb-1">
                                    <span className="text-gray-600">Position:</span>
                                    <span className="font-semibold text-gray-900">{data.designation || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-purple-100 pb-1">
                                    <span className="text-gray-600">Department:</span>
                                    <span className="font-semibold text-gray-900">{data.department || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-purple-100 pb-1">
                                    <span className="text-gray-600">Offer Date:</span>
                                    <span className="font-semibold text-gray-900">{data.offerDate ? new Date(data.offerDate).toLocaleDateString('en-GB') : '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-purple-100 pb-1">
                                    <span className="text-gray-600">Date of Joining:</span>
                                    <span className="font-semibold text-gray-900">{data.joiningDate ? new Date(data.joiningDate).toLocaleDateString('en-GB') : '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-purple-100 pb-1">
                                    <span className="text-gray-600">Annual CTC:</span>
                                    <span className="font-semibold text-gray-900">{data.ctc ? `₹${Number(data.ctc).toLocaleString('en-IN')}` : '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-purple-100 pb-1">
                                    <span className="text-gray-600">Bonus:</span>
                                    <span className="font-semibold text-gray-900">{data.performanceBonus ? `₹${Number(data.performanceBonus).toLocaleString('en-IN')}` : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8 pt-4">
                        <button 
                            type="button" 
                            onClick={handleReset}
                            className="w-1/3 flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3 px-4 rounded shadow-sm transition-all"
                        >
                            Reset
                        </button>
                        <button 
                            type="button" 
                            onClick={handleDownloadPdf}
                            className="w-2/3 flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded shadow-md transition-all"
                        >
                            <i className="bi bi-download"></i> Download PDF
                        </button>
                    </div>
                </form>
            </div>

            {/* RIGHT COLUMN: THE LIVE PREVIEW */}
            <div className="w-full xl:w-2/3 bg-gray-200 p-8 rounded-lg shadow-inner overflow-x-auto flex justify-center border-4 border-dashed border-gray-300">
                <div ref={offerRef}>
                    <OfferLetterTemp data={data} />
                </div>
            </div>

        </div>
    );
};

export default OfferLetterForm;
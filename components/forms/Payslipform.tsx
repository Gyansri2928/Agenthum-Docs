"use client";

import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useReactToPrint } from 'react-to-print';         // Added react-to-print
import Sliptemp from '../templates/Sliptemp';
// Helper function to convert INR numbers to words
const numberToWordsINR = (num: number): string => {
    if (num === 0) return 'Zero';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const numStr = Math.floor(num).toString();
    const n = ('000000000' + numStr).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] !== '00') ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
    str += (n[2] !== '00') ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
    str += (n[3] !== '00') ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
    str += (n[4] !== '0') ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
    str += (n[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
    return str.trim();
};

const PayslipForm = () => {
    const [expandedSection, setExpandedSection] = useState<string>('employee');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    // Default States
    const defaultEmployee = { month: 'February', year: '2026', empName: '', empId: '', doj: '', paidDays: '', department: '', designation: '', bankName: '', accNumber: '', pan: '' };
    const defaultEarnings = { basic: '', hra: '', medical: '', other: '' };
    const defaultDeductions = { pf: '', tds: '', pt: '', esi: '' };

    // State
    const [employee, setEmployee] = useState(defaultEmployee);
    const [earnings, setEarnings] = useState(defaultEarnings);
    const [deductions, setDeductions] = useState(defaultDeductions);
    const [totals, setTotals] = useState({ gross: 0, totalDeductions: 0, net: 0 });
    const [words, setWords] = useState('Zero');
    // 1. Create a reference for the PDF component
    const payslipRef = useRef<HTMLDivElement>(null);

    // 2. Setup the print function
    const handleDownloadPdf = useReactToPrint({
        contentRef: payslipRef,
        documentTitle: `Payslip_${employee?.empName || 'Employee'}_${employee?.month}`,
        // Add this line to force standard A4 margins and hide browser headers
        pageStyle: `@page { size: A4; margin: 15mm; } @media print { body { -webkit-print-color-adjust: exact; } }`,
    });

    // 1. Load Data from LocalStorage on initial mount
    useEffect(() => {
        const savedData = localStorage.getItem('payslipData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.employee) setEmployee(parsed.employee);
                if (parsed.earnings) setEarnings(parsed.earnings);
                if (parsed.deductions) setDeductions(parsed.deductions);
            } catch (e) {
                console.error("Failed to parse saved data");
            }
        }
        setIsLoaded(true); // Mark as loaded so we can start saving
    }, []);

    // 2. Save Data to LocalStorage whenever state changes (but only after initial load)
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('payslipData', JSON.stringify({ employee, earnings, deductions }));
        }
    }, [employee, earnings, deductions, isLoaded]);

    // Calculate Totals
    useEffect(() => {
        const gross = (Number(earnings.basic) || 0) + (Number(earnings.hra) || 0) + (Number(earnings.medical) || 0) + (Number(earnings.other) || 0);
        const totalDeds = (Number(deductions.pf) || 0) + (Number(deductions.tds) || 0) + (Number(deductions.pt) || 0) + (Number(deductions.esi) || 0);
        const netPay = gross - totalDeds;

        setTotals({ gross, totalDeductions: totalDeds, net: netPay });
        setWords(numberToWordsINR(netPay));
    }, [earnings, deductions]);

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setEmployee({ ...employee, [e.target.name]: e.target.value });
    const handleEarningChange = (e: React.ChangeEvent<HTMLInputElement>) => setEarnings({ ...earnings, [e.target.name]: e.target.value });
    const handleDeductionChange = (e: React.ChangeEvent<HTMLInputElement>) => setDeductions({ ...deductions, [e.target.name]: e.target.value });

    // Reset Function
    const handleReset = () => {
        if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
            setEmployee(defaultEmployee);
            setEarnings(defaultEarnings);
            setDeductions(defaultDeductions);
            localStorage.removeItem('payslipData');
            setExpandedSection('employee');
            setErrorMsg('');
        }
    };

    const toggleSection = (targetSection: string) => {
        setErrorMsg('');
        if (expandedSection) {
            let isValid = true;
            if (expandedSection === 'employee') {
                isValid = Object.values(employee).every(val => String(val).trim() !== '');
            } else if (expandedSection === 'salary') {
                isValid = earnings.basic.trim() !== '';
            }
            if (!isValid) {
                setErrorMsg('Please fill required fields (*) before moving on.');
                return;
            }
        }
        setExpandedSection(expandedSection === targetSection ? '' : targetSection);
    };

    const AccordionHeader = ({ title, sectionId, borderColor }: { title: string, sectionId: string, borderColor: string }) => (
        <button type="button" onClick={() => toggleSection(sectionId)} className={`w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-l-4 ${borderColor} border-b border-t border-r border-gray-200`}>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${expandedSection === sectionId ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
    );

    const inputStyles = "w-full border border-gray-300 text-gray-900 placeholder-gray-400 bg-white rounded p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";

    // Prevent rendering the UI until localStorage is checked to avoid UI flickering
    if (!isLoaded) return null;

    return (
        <div className="flex flex-col xl:flex-row gap-8 max-w mx-auto p-4 items-start">

            {/* LEFT COLUMN: THE FORM */}
            <div className="w-full xl:w-1/3 bg-white shadow-sm rounded-md border border-gray-100 p-6">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Pay Slip Generator</h1>
                </div>

                {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium text-center transition-all">{errorMsg}</div>}

                <form className="space-y-4">

                    {/* Employee Details Section */}
                    <div>
                        <AccordionHeader title="Employee Details" sectionId="employee" borderColor="border-blue-500" />
                        <div className={`p-4 border border-t-0 border-gray-200 transition-all ${expandedSection === 'employee' ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-1 sm:col-span-2 flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Month <span className="text-red-500">*</span></label>
                                        <select name="month" value={employee.month} onChange={handleEmployeeChange} className={inputStyles}>
                                            <option>January</option><option>February</option><option>March</option>
                                            <option>April</option><option>May</option><option>June</option>
                                            <option>July</option><option>August</option><option>September</option>
                                            <option>October</option><option>November</option><option>December</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
                                        <input type="text" name="year" value={employee.year} onChange={handleEmployeeChange} className={inputStyles} />
                                    </div>
                                </div>
                                {[
                                    { label: 'Employee Name', name: 'empName', type: 'text', placeholder: 'e.g. John Doe', req: true },
                                    { label: 'Employee ID', name: 'empId', type: 'text', placeholder: 'e.g. AG-001', req: true },
                                    { label: 'Date of Joining', name: 'doj', type: 'date', placeholder: '', req: true },
                                    { label: 'Paid Days', name: 'paidDays', type: 'number', placeholder: 'e.g. 30', req: true },
                                    { label: 'Department', name: 'department', type: 'text', placeholder: 'e.g. Engineering', req: true },
                                    { label: 'Designation', name: 'designation', type: 'text', placeholder: 'e.g. App Developer', req: true },
                                    { label: 'Bank Name', name: 'bankName', type: 'text', placeholder: 'e.g. HDFC Bank', req: true },
                                    { label: 'Account Number', name: 'accNumber', type: 'text', placeholder: 'e.g. 1234567890', req: true },
                                    { label: 'PAN Number', name: 'pan', type: 'text', placeholder: 'e.g. ABCDE1234F', req: true },
                                ].map((field, idx) => (
                                    <div key={idx} className={field.name === 'pan' ? 'col-span-1 sm:col-span-2' : ''}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.label} {field.req && <span className="text-red-500">*</span>}
                                        </label>
                                        <input type={field.type} name={field.name} value={(employee as any)[field.name]} onChange={handleEmployeeChange} placeholder={field.placeholder} className={inputStyles} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Salary Structure Section */}
                    <div>
                        <AccordionHeader title="Salary Structure" sectionId="salary" borderColor="border-teal-500" />
                        <div className={`p-4 border border-t-0 border-gray-200 transition-all ${expandedSection === 'salary' ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary <span className="text-red-500">*</span></label><input type="number" name="basic" placeholder="0" value={earnings.basic} onChange={handleEarningChange} className={inputStyles} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">HRA</label><input type="number" name="hra" placeholder="0" value={earnings.hra} onChange={handleEarningChange} className={inputStyles} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Medical Allowance</label><input type="number" name="medical" placeholder="0" value={earnings.medical} onChange={handleEarningChange} className={inputStyles} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Other Allowance</label><input type="number" name="other" placeholder="0" value={earnings.other} onChange={handleEarningChange} className={inputStyles} /></div>

                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Provident Fund (PF)</label><input type="number" name="pf" placeholder="0" value={deductions.pf} onChange={handleDeductionChange} className={inputStyles} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">TDS</label><input type="number" name="tds" placeholder="0" value={deductions.tds} onChange={handleDeductionChange} className={inputStyles} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Professional Tax</label><input type="number" name="pt" placeholder="0" value={deductions.pt} onChange={handleDeductionChange} className={inputStyles} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">ESI</label><input type="number" name="esi" placeholder="0" value={deductions.esi} onChange={handleDeductionChange} className={inputStyles} /></div>
                            </div>
                        </div>
                    </div>

                    {/* Salary Calculations Summary */}
                    <div className="border border-indigo-200 bg-indigo-50 rounded-md p-4 flex justify-between items-center mt-4">
                        <span className="font-bold text-indigo-900 uppercase">Net Payable</span>
                        <span className="font-bold text-indigo-900 text-xl">₹ {totals.net.toFixed(2)}</span>
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
                            Download PDF
                        </button>
                    </div>
                </form>
            </div>

            {/* RIGHT COLUMN: THE LIVE PREVIEW */}
            <div className="w-full xl:w-2/3 bg-gray-200 p-8 rounded-lg shadow-inner overflow-x-auto flex justify-center border-4 border-dashed border-gray-300">
                <div ref={payslipRef}>
                    <Sliptemp
                        employee={employee}
                        earnings={earnings}
                        deductions={deductions}
                        totals={totals}
                        amountInWords={words}
                    />
                </div>
            </div>

        </div>
    );
};

export default PayslipForm;
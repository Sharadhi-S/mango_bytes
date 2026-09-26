import { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Users,
  IndianRupee,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  X,
  FileCheck,
} from 'lucide-react';
import { Card, Button, formatINR } from './ui';
import type { Tender, TenderWorkforceItem } from '@/types';
import { SAMPLE_TENDER_DOC, simulateAITenderExtraction, type ExtractedTenderData } from '@/backend/aiExtractionService';

interface AddTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Tender) => void;
  t: (key: string) => string;
}

type Step = 'choose' | 'uploading' | 'analyzing' | 'review' | 'manual';

export function AddTenderModal({ isOpen, onClose, onProjectCreated, t }: AddTenderModalProps) {
  const [step, setStep] = useState<Step>('choose');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedTenderData | null>(null);

  // Editable review form state
  const [title, setTitle] = useState('');
  const [tenderId, setTenderId] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [value, setValue] = useState(82000000);
  const [requirements, setRequirements] = useState<TenderWorkforceItem[]>([]);
  const [newSkillName, setNewSkillName] = useState('');

  const analysisSteps = [
    'Reading tender document (OCR & structure parsing)...',
    'Identifying issuing authority & project metadata...',
    'Extracting trade-by-trade workforce requirements...',
    'Analyzing statutory wage rates & skill certifications...',
    'Identifying project location, schedule & start dates...',
    'Synthesizing deployment readiness plan...',
  ];

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('choose');
      setSelectedFile(null);
      setAnalysisStepIndex(0);
      setExtractedData(null);
    }
  }, [isOpen]);

  // Handle analysis progression
  useEffect(() => {
    if (step === 'analyzing') {
      const interval = setInterval(() => {
        setAnalysisStepIndex((prev) => {
          if (prev < analysisSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            // Move to review
            const data = simulateAITenderExtraction(selectedFile?.name);
            setExtractedData(data);
            setTitle(data.title);
            setTenderId(data.tenderId);
            setClient(data.client);
            setLocation(data.location);
            setStartDate(data.startDate);
            setDuration(data.duration);
            setValue(data.value);
            setRequirements(data.workforceRequirements);
            setStep('review');
            return prev;
          }
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [step, selectedFile]);

  if (!isOpen) return null;

  const handleStartAnalysis = (fileInfo: { name: string; size: string }) => {
    setSelectedFile(fileInfo);
    setStep('analyzing');
    setAnalysisStepIndex(0);
  };

  const handleLoadSample = () => {
    handleStartAnalysis({
      name: SAMPLE_TENDER_DOC.fileName,
      size: SAMPLE_TENDER_DOC.fileSize,
    });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleStartAnalysis({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    }
  };

  const handleHeadcountChange = (id: string, delta: number) => {
    setRequirements((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, headcount: Math.max(1, r.headcount + delta) } : r
      )
    );
  };

  const handleWageChange = (id: string, wage: number) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, dailyWageRate: Math.max(100, wage) } : r))
    );
  };

  const handleDeleteTrade = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddCustomTrade = () => {
    if (!newSkillName.trim()) return;
    const newId = `wf-custom-${Date.now()}`;
    setRequirements((prev) => [
      ...prev,
      {
        id: newId,
        skill: newSkillName.trim(),
        headcount: 5,
        assignedCount: 0,
        dailyWageRate: 850,
        category: 'skilled',
        notes: 'Custom added trade requirement',
      },
    ]);
    setNewSkillName('');
  };

  const handleConfirmAndCreate = () => {
    const totalWorkers = requirements.reduce((s, r) => s + r.headcount, 0);
    const assignedCount = requirements.reduce((s, r) => s + (r.assignedCount || 0), 0);
    const fulfillmentPercent = totalWorkers > 0 ? Math.round((assignedCount / totalWorkers) * 100) : 0;

    const newProject: Tender = {
      id: `T-${Date.now()}`,
      tenderId: tenderId || `Tender #KA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title || 'Highway Construction Work Order',
      client: client || 'Public Works Department (PWD)',
      dept: client || 'Public Works Department',
      location: location || 'Belagavi, Karnataka',
      startDate: startDate || '10 Oct 2026',
      duration: duration || '6 months',
      durationMonths: 6,
      value: value || 82000000,
      closing: startDate || '10 Oct 2026',
      category: 'Infrastructure',
      match: 95,
      documentName: selectedFile?.name || 'Belagavi_Highway_Package_4_WorkOrder.pdf',
      documentSize: selectedFile?.size || '2.4 MB',
      aiExtracted: true,
      skills: requirements.map((r) => r.skill),
      eligibility: ['Awarded Work Order Contract', 'BOCW Compliance Mandatory'],
      docs: ['Work Order Copy', 'BOCW Registration', 'Safety Plan'],
      workforceRequirements: requirements,
      otherRequirements: {
        workingHours: extractedData?.workingHours || '8:00 AM – 5:00 PM',
        accommodation: extractedData?.accommodation || 'Site labor camp provided',
        transportation: extractedData?.transportation || 'Site shuttle available',
        safety: extractedData?.safety || 'Mandatory safety helmets and boots',
        compliance: extractedData?.compliance || ['BOCW Act compliant', 'EPFO verified'],
      },
      fulfillmentPercent,
      dynamicFee: {
        budget: value,
        baseFee: 8000,
        cgst: 720,
        sgst: 720,
        totalFee: 9440,
        ratePercent: 0.01,
        tierLabel: 'Awarded Project',
      },
      status: 'active_fulfillment',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onProjectCreated(newProject);
    onClose();
  };

  const totalHeadcount = requirements.reduce((s, r) => s + r.headcount, 0);
  const totalAssigned = requirements.reduce((s, r) => s + (r.assignedCount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <FileCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">
                {step === 'analyzing'
                  ? 'AI Tender Document Analysis'
                  : step === 'review'
                  ? 'Review & Confirm Extracted Requirements'
                  : 'Add Tender / Work Order'}
              </h2>
              <p className="text-xs text-gray-500">
                Turn your awarded project into a ready-to-deploy workforce
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: CHOOSE METHOD */}
          {step === 'choose' && (
            <div className="space-y-5">
              <div className="text-center max-w-md mx-auto">
                <p className="text-sm font-extrabold text-gray-900">
                  Have you received a tender award or work order?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Upload your tender document. Our AI will extract the scope, required trades, headcounts, and statutory requirements in seconds.
                </p>
              </div>

              {/* Upload Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-brand-300 hover:border-brand-500 bg-brand-50/40 rounded-2xl p-8 text-center transition-colors cursor-pointer group"
                onClick={() => {
                  const input = document.getElementById('tender-pdf-input');
                  if (input) input.click();
                }}
              >
                <input
                  type="file"
                  id="tender-pdf-input"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleStartAnalysis({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` });
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-white text-brand-600 mx-auto flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-3">
                  <UploadCloud size={28} />
                </div>
                <p className="text-sm font-black text-gray-900">
                  Drag & drop your Tender / Work Order PDF here
                </p>
                <p className="text-xs text-gray-500 mt-1">or browse files from your computer</p>
                <span className="inline-block mt-3 px-3 py-1 bg-white border border-brand-200 rounded-full text-[10px] font-bold text-brand-700">
                  Supported formats: PDF, DOCX
                </span>
              </div>

              {/* 1-Click Demo Sample Button */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-950">Quick Hackathon Demo:</p>
                    <p className="text-[11px] text-amber-800">
                      Load official sample: <strong>Belagavi Highway Package 4 Work Order (PDF)</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shrink-0 shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Sparkles size={14} />
                  Load Sample PDF
                </button>
              </div>

              {/* Fallback to Manual Entry */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    const data = simulateAITenderExtraction();
                    setExtractedData(data);
                    setTitle(data.title);
                    setTenderId(data.tenderId);
                    setClient(data.client);
                    setLocation(data.location);
                    setStartDate(data.startDate);
                    setDuration(data.duration);
                    setValue(data.value);
                    setRequirements(data.workforceRequirements);
                    setStep('review');
                  }}
                  className="text-xs font-extrabold text-gray-500 hover:text-gray-800 underline underline-offset-4"
                >
                  Or enter project details manually without uploading a document
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ANIMATED AI ANALYSIS */}
          {step === 'analyzing' && (
            <div className="py-8 space-y-6 max-w-lg mx-auto">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white mx-auto flex items-center justify-center shadow-float animate-pulse">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-base font-black text-gray-900">
                  AI Analyzing Tender Document...
                </h3>
                <p className="text-xs text-brand-600 font-semibold">
                  Document: {selectedFile?.name || SAMPLE_TENDER_DOC.fileName} ({selectedFile?.size || '2.4 MB'})
                </p>
              </div>

              <div className="space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-200/80">
                {analysisSteps.map((s, idx) => {
                  const isDone = idx < analysisStepIndex;
                  const isCurrent = idx === analysisStepIndex;
                  return (
                    <div
                      key={s}
                      className={`flex items-center gap-3 text-xs transition-all ${
                        isDone
                          ? 'text-emerald-700 font-bold'
                          : isCurrent
                          ? 'text-brand-700 font-extrabold scale-[1.01]'
                          : 'text-gray-400'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <span>{s}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-gray-400 text-center italic">
                Simulating neural NLP document parsing & BOCW workforce schedule synthesis.
              </p>
            </div>
          )}

          {/* STEP 3: REVIEW & EDIT EXTRACTED REQUIREMENTS */}
          {step === 'review' && (
            <div className="space-y-5 animate-fade-in">
              {/* AI Extraction Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>AI Extraction Complete. Please review and adjust fields as needed.</span>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-200/60 px-2 py-0.5 rounded-full">
                  100% Editable
                </span>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 mb-1">
                    Project / Work Order Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 mb-1">
                    Tender / Work Order ID
                  </label>
                  <input
                    type="text"
                    value={tenderId}
                    onChange={(e) => setTenderId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 mb-1">
                    Client / Issuing Department
                  </label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 mb-1">
                    Project Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 mb-1">
                    Start Date & Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start date"
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Duration"
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-gray-700 mb-1">
                    Awarded Contract Value (₹)
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Editable Workforce Requirements Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
                      Workforce Requirements (Extracted by AI)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Adjust headcounts or statutory wages. Total required: <strong>{totalHeadcount} workers</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {requirements.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-gray-900">{r.skill}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{r.notes}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Daily wage rate */}
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 font-medium">₹</span>
                          <input
                            type="number"
                            value={r.dailyWageRate}
                            onChange={(e) => handleWageChange(r.id, Number(e.target.value))}
                            className="w-16 p-1.5 rounded-lg border border-gray-300 text-center font-bold text-xs"
                          />
                          <span className="text-gray-400 text-[10px]">/day</span>
                        </div>

                        {/* Headcount stepper */}
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-gray-200">
                          <button
                            type="button"
                            onClick={() => handleHeadcountChange(r.id, -1)}
                            className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200 text-gray-700"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-black text-xs text-gray-900">
                            {r.headcount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleHeadcountChange(r.id, 1)}
                            className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200 text-gray-700"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTrade(r.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 rounded"
                          title="Remove trade"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Trade Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add missing trade (e.g. Tile Layers, Bar Benders)..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTrade}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Trade
                  </button>
                </div>
              </div>

              {/* Other Extracted Requirements Card */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                <p className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Statutory & Site Facilities Extracted:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300">
                  <p>• Working hours: 8:00 AM – 5:00 PM</p>
                  <p>• Daily shuttle transportation provided</p>
                  <p>• Site labor camp with solar lighting & water</p>
                  <p>• Mandatory BOCW & EPFO compliance</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          {step === 'review' && (
            <Button
              onClick={handleConfirmAndCreate}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-float"
            >
              <CheckCircle2 size={16} />
              Confirm Requirements & Generate Project
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

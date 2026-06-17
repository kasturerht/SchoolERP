"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface OnboardingFormData {
  schoolName: string;
  schoolPhone: string;
  schoolAddress: string;
  schoolWebsite: string;
  branchName: string;
  branchCode: string;
  branchAddress: string;
  branchPhone: string;
  academicYearName: string;
  startDate: string;
  endDate: string;
}

// Custom Stripe/Vercel-style Dark Form Input
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  iconName?: string;
}

function FormInput({ label, error, required, iconName, ...props }: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
        {label} {required && <span className="text-teal-400">*</span>}
      </label>
      <div className="relative flex items-center h-12 rounded-xl border border-white/10 bg-white/5 hover:border-white/15 focus-within:border-teal-400/80 focus-within:ring-4 focus-within:ring-teal-400/15 focus-within:bg-slate-950/70 transition-all duration-300">
        {iconName && (
          <span className="pl-3.5 text-slate-500 shrink-0 flex items-center justify-center">
            <Icon name={iconName} size={18} />
          </span>
        )}
        <input
          className="w-full h-full bg-transparent px-3.5 text-sm text-white placeholder-slate-600 outline-none disabled:cursor-not-allowed"
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-red-400 px-1 font-semibold">{error}</p>}
    </div>
  );
}

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<OnboardingFormData>({
    schoolName: "",
    schoolPhone: "",
    schoolAddress: "",
    schoolWebsite: "",
    branchName: "",
    branchCode: "",
    branchAddress: "",
    branchPhone: "",
    academicYearName: "",
    startDate: "",
    endDate: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const redirectingRef = useRef(false);

  // Generate branch code from school name
  function deriveBranchCode(name: string): string {
    const clean = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (clean.length === 0) return "";
    const code = clean.slice(0, 3);
    return `${code}-MAIN`;
  }

  // Pre-fill Academic Year based on current date
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    let startYear = currentYear;
    if (currentMonth < 6) {
      startYear = currentYear - 1;
    }

    const endYear = startYear + 1;
    const defaultYearName = `${startYear}-${String(endYear).slice(-2)}`;
    const defaultStart = `${startYear}-06-01`;
    const defaultEnd = `${endYear}-05-31`;

    setFormState((prev) => {
      const nextState = { ...prev };
      if (!nextState.academicYearName) nextState.academicYearName = defaultYearName;
      if (!nextState.startDate) nextState.startDate = defaultStart;
      if (!nextState.endDate) nextState.endDate = defaultEnd;
      return nextState;
    });
  }, []);

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("school_onboarding_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormState((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse onboarding draft", e);
      }
    }
    setMounted(true);
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("school_onboarding_draft", JSON.stringify(formState));
    }
  }, [formState, mounted]);

  // Set logo preview local URL
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoPreview(null);
    }
  }, [logoFile]);

  if (status === "loading" || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin"></div>
            <Icon name="school" size={24} className="absolute text-teal-400 animate-pulse" />
          </div>
          <p className="text-body-md text-slate-450 font-semibold tracking-wide">Connecting to ERP Server...</p>
        </div>
      </div>
    );
  }

  if (session && session.user.roleName !== "SCHOOL_ADMIN") {
    router.replace("/onboarding/pending");
    return null;
  }

  const handleSchoolNameChange = (val: string) => {
    setFormState((prev) => {
      const nextState = { ...prev, schoolName: val };

      const oldBranchName = prev.schoolName ? `${prev.schoolName} - Main Branch` : "";
      if (!prev.branchName || prev.branchName === oldBranchName) {
        nextState.branchName = val ? `${val} - Main Branch` : "";
      }

      const oldBranchCode = prev.schoolName ? deriveBranchCode(prev.schoolName) : "";
      if (!prev.branchCode || prev.branchCode === oldBranchCode) {
        nextState.branchCode = val ? deriveBranchCode(val) : "";
      }

      return nextState;
    });
  };

  const validateStep = (s: number) => {
    if (s === 1) {
      return formState.schoolName.trim().length >= 2;
    }
    if (s === 2) {
      return (
        formState.branchName.trim().length >= 2 &&
        formState.branchCode.trim().length >= 2
      );
    }
    if (s === 3) {
      return (
        formState.academicYearName.trim().length >= 2 &&
        formState.startDate !== "" &&
        formState.endDate !== "" &&
        new Date(formState.endDate) > new Date(formState.startDate)
      );
    }
    return true;
  };

  // Canvas confetti animation
  const triggerConfetti = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#0D9488", "#14B8A6", "#5EEAD4", "#0284C7", "#38BDF8", "#F59E0B", "#F43F5E"];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      gravity: number;
      oscillation: number;
      oscillationSpeed: number;
      opacity: number;
    }> = [];

    const addParticles = (startX: number, angleRange: [number, number]) => {
      for (let i = 0; i < 100; i++) {
        const angle = angleRange[0] + Math.random() * (angleRange[1] - angleRange[0]);
        const speed = 14 + Math.random() * 18;
        particles.push({
          x: startX,
          y: canvas.height + 10,
          size: 7 + Math.random() * 9,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.cos(angle) * speed,
          speedY: -Math.sin(angle) * speed,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          gravity: 0.3 + Math.random() * 0.15,
          oscillation: Math.random() * Math.PI * 2,
          oscillationSpeed: 0.04 + Math.random() * 0.06,
          opacity: 1,
        });
      }
    };

    addParticles(60, [Math.PI / 6, Math.PI / 3.2]);
    addParticles(canvas.width - 60, [Math.PI * 2 / 3.2, Math.PI * 5 / 6]);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      for (let p of particles) {
        if (p.opacity <= 0) continue;

        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += p.gravity;
        p.rotation += p.rotationSpeed;
        p.oscillation += p.oscillationSpeed;
        p.x += Math.sin(p.oscillation) * 0.7;
        p.speedX *= 0.98;

        if (p.y > canvas.height - 150) {
          p.opacity -= 0.012;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        ctx.restore();

        if (p.opacity > 0) {
          active = true;
        }
      }

      if (active) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setErrorMsg("Please fill in all mandatory fields with valid data.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("schoolName", formState.schoolName.trim());
      if (formState.schoolPhone) formData.append("schoolPhone", formState.schoolPhone.trim());
      if (formState.schoolAddress) formData.append("schoolAddress", formState.schoolAddress.trim());
      if (formState.schoolWebsite) formData.append("schoolWebsite", formState.schoolWebsite.trim());
      formData.append("branchName", formState.branchName.trim());
      formData.append("branchCode", formState.branchCode.trim().toUpperCase());
      if (formState.branchPhone) formData.append("branchPhone", formState.branchPhone.trim());
      if (formState.branchAddress) formData.append("branchAddress", formState.branchAddress.trim());
      formData.append("academicYearName", formState.academicYearName.trim());
      formData.append("startDate", formState.startDate);
      formData.append("endDate", formState.endDate);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await fetch("/api/v1/organizations/onboard", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to finalize organization setup");
      }

      localStorage.removeItem("school_onboarding_draft");
      setLaunchSuccess(true);
      setIsSubmitting(false); // Enable the action button in the success modal
      
      setTimeout(() => {
        if (canvasRef.current) {
          triggerConfetti(canvasRef.current);
        }
      }, 100);

      // Auto-redirect to dashboard after 3.5 seconds of confetti celebration
      setTimeout(() => {
        handleLaunchDashboard();
      }, 3500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while compiling your portal details.");
      setIsSubmitting(false);
    }
  };

  const handleQuickLaunch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const defaultSchoolName = session?.user?.organizationName || "My School";
      const defaultBranchName = `${defaultSchoolName} - Main Branch`;
      const defaultBranchCode = deriveBranchCode(defaultSchoolName) || "SCH-MAIN";

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      let startYear = currentYear;
      if (currentMonth < 6) {
        startYear = currentYear - 1;
      }
      const endYear = startYear + 1;
      const defaultYearName = `${startYear}-${String(endYear).slice(-2)}`;
      const defaultStart = `${startYear}-06-01`;
      const defaultEnd = `${endYear}-05-31`;

      const formData = new FormData();
      formData.append("schoolName", defaultSchoolName);
      formData.append("branchName", defaultBranchName);
      formData.append("branchCode", defaultBranchCode);
      formData.append("academicYearName", defaultYearName);
      formData.append("startDate", defaultStart);
      formData.append("endDate", defaultEnd);

      const res = await fetch("/api/v1/organizations/onboard", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Quick Launch was unable to pre-populate database settings");
      }

      localStorage.removeItem("school_onboarding_draft");
      setLaunchSuccess(true);
      setIsSubmitting(false); // Enable the action button in the success modal

      setTimeout(() => {
        if (canvasRef.current) {
          triggerConfetti(canvasRef.current);
        }
      }, 100);

      // Auto-redirect to dashboard after 3.5 seconds of confetti celebration
      setTimeout(() => {
        handleLaunchDashboard();
      }, 3500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during Quick Launch sequence.");
      setIsSubmitting(false);
    }
  };

  const handleLaunchDashboard = async () => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    setIsSubmitting(true);
    try {
      await update({ organizationIsSetupComplete: true });
    } catch (err) {
      console.error("Failed to update NextAuth session:", err);
    }
    window.location.href = "/dashboard";
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Styles for premium floating and glow effects */}
      <style>{`
        @keyframes rotateGlow {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes mockupFloat {
          0%, 100% { transform: perspective(1200px) rotateY(-8deg) rotateX(4deg) translateY(0px); }
          50% { transform: perspective(1200px) rotateY(-6deg) rotateX(2deg) translateY(-8px); }
        }
        .animate-rotate-glow {
          animation: rotateGlow 15s linear infinite;
        }
        .animate-mockup-float {
          animation: mockupFloat 7s ease-in-out infinite;
        }
        input[type="date"] {
          color-scheme: dark;
        }
      `}</style>

      {/* Confetti overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50 pointer-events-none w-full h-full"
      />

      {/* Background ambient lighting (mesh glow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[140px] animate-rotate-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/8 blur-[140px]" />
      </div>

      {/* LEFT FORM PANEL (55% on large screens, luxury frosted glass container) */}
      <div className="w-full lg:w-[55%] flex flex-col h-full bg-slate-950/40 backdrop-blur-md relative z-10 border-r border-white/5 overflow-hidden">
        
        {/* App bar logo header */}
        <header className="h-20 px-8 md:px-12 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20 font-black">
              <Icon name="school" size={20} className="text-slate-950" />
            </div>
            <div>
              <span className="block font-black text-body-lg text-white tracking-tight leading-none">CSV ERP SYSTEM</span>
              <span className="block text-[9px] text-teal-400 font-bold uppercase tracking-widest mt-0.5">Setup & Onboarding</span>
            </div>
          </div>
          
          <button
            onClick={handleQuickLaunch}
            disabled={isSubmitting}
            className="group text-body-sm text-teal-400 hover:text-teal-300 font-bold tracking-wider transition-colors focus:outline-none cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>Skip to Dashboard</span>
            <Icon name="arrow_forward" size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </header>

        {/* Stepper Progress bar */}
        <div className="px-8 md:px-12 pt-4 shrink-0">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((id) => (
                <div
                  key={id}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                    step === id
                      ? "bg-gradient-to-r from-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(20,184,166,0.6)]"
                      : step > id
                      ? "bg-teal-500/40"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-455">
              <span>Step {step} of 4</span>
              <span className="text-teal-400">
                {step === 1 ? "Organization Profile" : step === 2 ? "Branch Details" : step === 3 ? "Academic Session" : "Review Setup"}
              </span>
            </div>
          </div>
        </div>

        {/* Form panel container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-12 md:py-8 flex flex-col justify-center max-w-xl mx-auto w-full">
          
          {/* Card wrapper */}
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl space-y-6">
            
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 text-red-300 border border-red-500/25 flex items-start gap-3 shadow-lg animate-fade-in text-body-sm">
                <Icon name="warning" size={18} className="shrink-0 mt-0.5 text-red-400" />
                <div className="font-semibold leading-relaxed">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: ORGANIZATION PROFILE */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h2 className="text-title-lg md:text-headline-sm font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
                      Create School Profile
                    </h2>
                    <p className="text-body-sm text-slate-450 leading-relaxed">
                      Register your primary organization identity. Fill in details to display customization assets and logos across the platform.
                    </p>
                  </div>

                  {/* Logo Drag/Drop */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">School Branding Logo</label>
                    <div className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 hover:border-teal-500/30 rounded-2xl bg-white/[0.02] hover:bg-teal-950/10 transition-all duration-300 cursor-pointer">
                      {logoPreview ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <img src={logoPreview} alt="Branding logo preview" className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogoFile(null);
                            }}
                            className="text-[10px] font-bold text-red-400 hover:text-red-355 tracking-wider uppercase transition-colors"
                          >
                            Remove Logo
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-2" onClick={() => document.getElementById("logo-input-field")?.click()}>
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 text-slate-400 group-hover:text-teal-400 group-hover:bg-teal-500/10 transition-all duration-300">
                            <Icon name="upload" size={20} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-body-sm font-bold text-slate-200">Click to upload logo</p>
                            <p className="text-[10px] text-slate-500">Supports PNG, JPG, or SVG (Max 5MB)</p>
                          </div>
                        </div>
                      )}
                      <input
                        id="logo-input-field"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <FormInput
                    label="School Name"
                    required
                    value={formState.schoolName}
                    onChange={(e) => handleSchoolNameChange(e.target.value)}
                    placeholder="e.g. Silver Oak International School"
                    iconName="school"
                  />

                  <FormInput
                    label="Website URL"
                    value={formState.schoolWebsite}
                    onChange={(e) => setFormState({ ...formState, schoolWebsite: e.target.value })}
                    placeholder="e.g. www.silveroakacademy.org"
                    iconName="settings"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Contact Phone"
                      value={formState.schoolPhone}
                      onChange={(e) => setFormState({ ...formState, schoolPhone: e.target.value })}
                      placeholder="e.g. +91 99999 88888"
                      iconName="phone"
                    />
                    <FormInput
                      label="Main Address"
                      value={formState.schoolAddress}
                      onChange={(e) => setFormState({ ...formState, schoolAddress: e.target.value })}
                      placeholder="e.g. Outer Ring Rd, Bengaluru"
                      iconName="location_city"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: BRANCH INFORMATION */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h2 className="text-title-lg md:text-headline-sm font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
                      Main Branch Settings
                    </h2>
                    <p className="text-body-sm text-slate-405 leading-relaxed">
                      Every setup initializes a headquarters. We have pre-compiled the names and unique index code for this main branch.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <FormInput
                        label="Branch Name"
                        required
                        value={formState.branchName}
                        onChange={(e) => setFormState({ ...formState, branchName: e.target.value })}
                        placeholder="e.g. Main Branch"
                        iconName="domain"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <FormInput
                        label="Branch Code"
                        required
                        value={formState.branchCode}
                        onChange={(e) => setFormState({ ...formState, branchCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. SIL-MAIN"
                        iconName="tag"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Branch Office Phone"
                      value={formState.branchPhone}
                      onChange={(e) => setFormState({ ...formState, branchPhone: e.target.value })}
                      placeholder="e.g. +91 99999 88889"
                      iconName="phone"
                    />
                    <FormInput
                      label="Branch Campus Address"
                      value={formState.branchAddress}
                      onChange={(e) => setFormState({ ...formState, branchAddress: e.target.value })}
                      placeholder="e.g. Main Campus, Sector 5, Bengaluru"
                      iconName="location_city"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: ACADEMIC CALENDAR */}
              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h2 className="text-title-lg md:text-headline-sm font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
                      First Academic Session
                    </h2>
                    <p className="text-body-sm text-slate-405 leading-relaxed">
                      Initialize the active academic calendar. System timelines, schedules, grading parameters, and student profiles align to this term.
                    </p>
                  </div>

                  <FormInput
                    label="Academic Session Name"
                    required
                    value={formState.academicYearName}
                    onChange={(e) => setFormState({ ...formState, academicYearName: e.target.value })}
                    placeholder="e.g. 2026-27"
                    iconName="calendar_today"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Session Start Date"
                      type="date"
                      required
                      value={formState.startDate}
                      onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                      iconName="event"
                      style={{ colorScheme: "dark" }}
                    />
                    <FormInput
                      label="Session End Date"
                      type="date"
                      required
                      value={formState.endDate}
                      onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
                      iconName="event_busy"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {step === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h2 className="text-title-lg md:text-headline-sm font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
                      Review Workspaces
                    </h2>
                    <p className="text-body-sm text-slate-405 leading-relaxed">
                      Please confirm your portal specifications. Re-check the branch code and session dates before launching.
                    </p>
                  </div>

                  {/* Frosted Review Card */}
                  <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-6 space-y-4 shadow-xl">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black shadow-md overflow-hidden">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-title-lg font-black text-slate-950">{formState.schoolName ? formState.schoolName.charAt(0) : "S"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-title-md font-bold text-white leading-tight">{formState.schoolName || "My School"}</h3>
                        <span className="text-[11px] text-teal-400 font-bold uppercase tracking-wider">{formState.schoolWebsite || "No website"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-body-sm">
                      <div>
                        <span className="block text-slate-500 font-black uppercase tracking-widest text-[9px]">Primary Branch</span>
                        <span className="text-slate-200 font-medium truncate block mt-0.5">{formState.branchName}</span>
                        <span className="text-teal-400 text-[11px] font-bold block mt-0.5">{formState.branchCode}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-black uppercase tracking-widest text-[9px]">Academic Term</span>
                        <span className="text-slate-200 font-medium block mt-0.5">{formState.academicYearName}</span>
                        <span className="text-slate-400 block text-[10px] mt-0.5">{formState.startDate} to {formState.endDate}</span>
                      </div>
                      {formState.schoolPhone && (
                        <div className="col-span-2 border-t border-white/5 pt-3">
                          <span className="block text-slate-500 font-black uppercase tracking-widest text-[9px]">Contact & Address</span>
                          <span className="text-slate-200 block mt-0.5">{formState.schoolPhone}</span>
                          {formState.schoolAddress && (
                            <span className="block text-slate-400 text-[11px] truncate mt-0.5">{formState.schoolAddress}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-500/5 border border-teal-500/10 text-teal-300">
                    <Icon name="sparkles" size={18} className="shrink-0 text-teal-400" />
                    <span className="text-[11px] font-semibold leading-relaxed">
                      Launching will initialize organization states, allocate DB keys, and assign you Owner permissions.
                    </span>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="pt-6 flex items-center justify-between border-t border-white/5 mt-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="h-11 px-5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold tracking-wider uppercase cursor-pointer flex items-center gap-2"
                  >
                    <Icon name="arrow_back" size={16} />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(step) || isSubmitting}
                    className="h-11 px-6 rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition-all text-xs font-bold tracking-wider uppercase disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    <span>Continue</span>
                    <Icon name="arrow_forward" size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 px-8 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black hover:opacity-90 active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer flex items-center gap-2 shadow-lg shadow-teal-500/25"
                  >
                    {isSubmitting ? (
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span>Launch Portal</span>
                        <Icon name="celebration" size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* RIGHT LIVE PREVIEW PANEL (45% on desktop, floating angled mockups) */}
      <div className="hidden lg:flex lg:w-[45%] h-full bg-slate-950 items-center justify-center p-8 relative overflow-hidden select-none border-l border-white/5">
        
        {/* Background glow orb */}
        <div className="absolute top-[35%] right-[-10%] w-96 h-96 rounded-full bg-teal-500/10 blur-[130px]" />
        
        {/* High-Fidelity 3D-angled Window container */}
        <div 
          className="w-full max-w-[440px] h-[550px] rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-700 ease-out animate-mockup-float"
          style={{ 
            boxShadow: "0 30px 60px -15px rgba(0,0,0,0.8), 0 0 50px -10px rgba(20,184,166,0.15)"
          }}
        >
          {/* OS Window header */}
          <div className="h-8 border-b border-white/5 bg-slate-950/80 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <span className="text-[9px] text-slate-550 font-bold font-mono tracking-wide">school-portal.erp / dashboard</span>
            <div className="w-10" />
          </div>

          {/* App Header */}
          <div className="h-12 border-b border-white/5 bg-slate-900/95 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Icon name="menu" size={14} className="text-slate-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboard</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Branch Switcher */}
              <div className="px-2 py-0.5 rounded-md bg-slate-950 text-teal-400 border border-white/5 text-[9px] font-black tracking-wide">
                {formState.branchCode ? formState.branchCode.toUpperCase() : "MAIN"}
              </div>
              
              {/* Term */}
              <div className="px-2 py-0.5 rounded-md bg-teal-950/40 text-teal-300 border border-teal-500/10 text-[9px] font-black">
                {formState.academicYearName || "2026-27"}
              </div>

              {/* User Avatar */}
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[9px] font-black text-slate-350">
                A
              </div>
            </div>
          </div>

          {/* App Drawer & Content container */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            
            {/* Sidebar nav */}
            <div className="w-36 border-r border-white/5 bg-slate-950/40 p-3 space-y-4 shrink-0 flex flex-col">
              
              {/* Profile Header in sidebar */}
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-950">{formState.schoolName ? formState.schoolName.charAt(0) : "S"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-black text-white leading-tight">
                    {formState.schoolName || "Your School"}
                  </span>
                  <span className="block text-[7px] font-bold tracking-widest text-primary uppercase mt-0.5">
                    ERP Portal
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1.5 flex-1">
                <span className="block text-[7px] font-bold text-slate-500 uppercase tracking-widest px-1">Main menu</span>
                <div className="px-2 py-1 rounded bg-teal-500/10 text-teal-400 text-[9px] font-bold flex items-center gap-1.5 border border-teal-500/15">
                  <Icon name="dashboard" size={11} className="text-teal-400" />
                  <span>Dashboard</span>
                </div>
                {[
                  { label: "Students", icon: "group" },
                  { label: "Staff", icon: "people" },
                  { label: "Classes", icon: "school" },
                  { label: "Fees", icon: "payments" },
                ].map((item) => (
                  <div key={item.label} className="px-2 py-1 text-slate-500 hover:text-slate-350 text-[9px] font-bold flex items-center gap-1.5 transition-colors">
                    <Icon name={item.icon} size={11} className="text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Workspace content */}
            <div className="flex-1 bg-slate-950/20 p-4 space-y-4 overflow-y-auto">
              
              {/* Banner widget */}
              <div className="rounded-xl p-3 bg-gradient-to-r from-teal-950/60 to-slate-900/80 border border-teal-500/10 space-y-1">
                <span className="block text-[7px] font-bold text-teal-400 uppercase tracking-widest">Workspace Enabled</span>
                <h4 className="text-body-sm font-black text-white leading-tight truncate">
                  {formState.schoolName || "Your ERP Hub"}
                </h4>
                <p className="text-[9px] text-slate-400">Branding preview active</p>
              </div>

              {/* Branch stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5 space-y-0.5">
                  <span className="block text-[7px] text-slate-500 font-bold uppercase tracking-widest">Main Campus</span>
                  <span className="block text-[9px] font-bold text-slate-300 truncate">
                    {formState.branchName || "Main Branch"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5 space-y-0.5">
                  <span className="block text-[7px] text-slate-500 font-bold uppercase tracking-widest">Session Term</span>
                  <span className="block text-[9px] font-bold text-slate-300">
                    {formState.academicYearName || "Current Session"}
                  </span>
                </div>
              </div>

              {/* Simulated widget */}
              <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Total Enrollments</span>
                  <span className="text-[8px] text-teal-400 font-bold px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/10">Active</span>
                </div>
                <div className="space-y-1.5">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4.5 h-4.5 rounded-full bg-slate-800" />
                        <div className="w-12 h-1.5 rounded bg-slate-800" />
                      </div>
                      <div className="w-8 h-1.5 rounded bg-slate-800/40" />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* PREMIUM SUCCESS LAUNCH MODAL */}
      {launchSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-lg animate-fade-in p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 text-center space-y-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.95),_0_0_80px_-10px_rgba(20,184,166,0.25)] transform scale-100 transition-transform duration-300">
            
            {/* Glowing success badge */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg animate-bounce">
              <Icon name="verified" size={42} className="text-teal-400" />
              <div className="absolute inset-[-10px] rounded-full border border-teal-500/10 animate-ping duration-2000" />
            </div>

            <div className="space-y-2">
              <h3 className="text-headline-sm font-black text-white tracking-tight leading-snug">Portal Configured Successfully!</h3>
              <p className="text-body-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                Congratulations! <strong>{formState.schoolName || session?.user?.organizationName || "Your School"}</strong> database nodes have been successfully deployed.
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-xs mx-auto">
                Main branch keys & academic years initialized
              </p>
            </div>

            <div className="pt-2">
              <button
                disabled={isSubmitting}
                onClick={handleLaunchDashboard}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black hover:opacity-90 transition-all text-sm tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span>Enter Workspace Dashboard</span>
                    <Icon name="arrow_forward" size={18} />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

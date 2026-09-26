"use client";

import { useEffect, useState } from "react";
import { Settings, Lock, User, HelpCircle, X, Check, Eye, EyeOff, Mail, Phone, AlertCircle, Heart, Users, Shield, Smartphone, BookOpen, LifeBuoy, ArrowRight, LogOut, UserPlus, Key } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SettingsTab = "privacy" | "profile" | "security" | "help";

const TAB_CONFIG = {
  privacy: { icon: Lock, label: "privacy", desc: "privacyDesc" },
  profile: { icon: User, label: "profile", desc: "profileDesc" },
  security: { icon: Key, label: "security", desc: "securityDesc" },
  help: { icon: HelpCircle, label: "help", desc: "helpDesc" },
} as const;

function ShieldIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
}
function LockIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
}
function FileTextIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
}
function UsersIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
}
function HeartIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
}
function AlertCircleIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
}
function MailIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
}
function MessageCircleIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
}
function SmartphoneIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
}
function BookOpenIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
}
function LifeBuoyIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>;
}
function KeyIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21 2-9 9L4 8"></path><path d="M15.5 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"></path></svg>;
}
function LogOutIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
}
function ArrowRightIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
}
function CheckIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>;
}
function MaleIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="5" r="3"></circle><path d="M12 8v10M5 14h14"></path></svg>;
}
function FemaleIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="5" r="3"></circle><path d="M12 8v10M5 14h14"></path><circle cx="12" cy="18" r="3"></circle></svg>;
}

export function SettingsModal() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("privacy");
  const [profileMode, setProfileMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t.settings?.title || "Paramètres"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
      >
        <Settings size={19} />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t.settings?.title || "Paramètres"}
        description={t.settings?.modalDesc || "Gérez votre compte, confidentialité et préférences"}
        className="max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex border-b border-line bg-surface/50 px-2" role="tablist">
            {(Object.keys(TAB_CONFIG) as SettingsTab[]).map((tab) => {
              const config = TAB_CONFIG[tab];
              const isActive = activeTab === tab;
              const Icon = config.icon;
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors rounded-t-lg",
                    isActive
                      ? "text-brand bg-white border-b-2 border-brand -mb-px z-10"
                      : "text-ink-muted hover:text-ink hover:bg-surface-2"
                  )}
                >
                  <Icon size={15} aria-hidden />
                  <span>{t.settings?.[config.label]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "privacy" && <PrivacyTab />}
            {activeTab === "profile" && <ProfileTab mode={profileMode} onModeChange={setProfileMode} />}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "help" && <HelpTab />}
          </div>
        </div>
      </Dialog>
    </>
  );
}

function PrivacyTab() {
  const { t } = useLang();
  const sections = [
    { key: "dataProtection", icon: ShieldIcon },
    { key: "anonymity", icon: LockIcon },
    { key: "dataUsage", icon: FileTextIcon },
    { key: "sharing", icon: UsersIcon },
    { key: "rights", icon: HeartIcon },
    { key: "limits", icon: AlertCircleIcon },
    { key: "contact", icon: MailIcon },
  ] as const;

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <p className="text-sm text-ink-muted">{t.confidentialite?.intro}</p>
      {sections.map((section) => {
        const s = t.confidentialite?.sections?.[section.key];
        return (
          <div key={section.key} className="rounded-xl border border-line bg-surface p-4">
            <h3 className="font-semibold text-ink flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <section.icon className="h-5 w-5" />
              </span>
              {s?.title}
            </h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              {s?.content}
            </p>
          </div>
        );
      })}
      <div className="rounded-xl border border-brand/50 bg-brand-soft/50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircleIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-brand" />
          <div>
            <h4 className="font-semibold text-ink">{t.confidentialite?.importantTitle}</h4>
            <p className="mt-1 text-sm text-ink-muted">{t.confidentialite?.importantContent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ mode, onModeChange }: { mode: "login" | "signup"; onModeChange: (m: "login" | "signup") => void }) {
  const { t } = useLang();
  const isLogin = mode === "login";

  // Login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [form, setForm] = useState({ pseudo: "", gender: "", identifier: "", password: "", confirmPassword: "" });
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const isEmail = identifier.includes("@");
  const isPhone = /^[\d\s\+\-]{8,}$/.test(identifier);
  const signupIsEmail = form.identifier.includes("@");
  const signupIsPhone = /^[\d\s\+\-]{8,}$/.test(form.identifier);

  const EmailIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
  const PhoneIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!identifier.trim() || !password) { setLoginError(t.connexion?.errors?.required); return; }
    if (!isEmail && !isPhone) { setLoginError(t.connexion?.errors?.invalidIdentifier); return; }
    setLoginLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoginSuccess(true); setLoginLoading(false);
    setTimeout(() => window.location.href = "/", 2000);
  };

  const handleSignupChange = (field: string, value: string) => { setForm((p) => ({ ...p, [field]: value })); if (signupError) setSignupError(""); };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSignupError("");
    if (!form.pseudo.trim() || !form.gender || !form.identifier.trim() || !form.password || !form.confirmPassword) { setSignupError(t.inscription?.errors?.required); return; }
    if (form.pseudo.trim().length < 2) { setSignupError(t.inscription?.errors?.nameTooShort); return; }
    if (!signupIsEmail && !signupIsPhone) { setSignupError(t.inscription?.errors?.invalidIdentifier); return; }
    if (form.password.length < 6) { setSignupError(t.inscription?.errors?.passwordTooShort); return; }
    if (form.password !== form.confirmPassword) { setSignupError(t.inscription?.errors?.passwordMismatch); return; }
    setSignupLoading(true); await new Promise((r) => setTimeout(r, 1500));
    setSignupSuccess(true); setSignupLoading(false); setTimeout(() => window.location.href = "/", 2000);
  };

  return (
    <div className="space-y-4">
      {/* Mode switcher */}
      <div className="flex gap-2 bg-surface-2 rounded-xl p-1">
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
            isLogin ? "bg-white text-brand shadow-sm" : "text-ink-muted hover:text-ink"
          )}
        >
          {t.connexion?.title || "Connexion"}
        </button>
        <button
          type="button"
          onClick={() => onModeChange("signup")}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
            !isLogin ? "bg-white text-brand shadow-sm" : "text-ink-muted hover:text-ink"
          )}
        >
          {t.inscription?.title || "Inscription"}
        </button>
      </div>

      {isLogin ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginSuccess && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700">
              <CheckIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{t.connexion?.successMessage}</span>
            </div>
          )}
          {loginError && (
            <div className="flex items-center gap-3 rounded-xl bg-danger-soft p-4 text-danger">
              <AlertCircleIcon className="h-5 w-5" />
              <span className="text-sm">{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-2">{t.connexion?.identifierLabel}</label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-subtle">
                {isEmail ? <EmailIcon /> : <PhoneIcon />}
              </div>
              <Input
                type={isEmail ? "email" : "tel"}
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setLoginError(""); }}
                placeholder={isEmail ? "vous@exemple.com" : "+261 3X XX XX XX"}
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">{t.connexion?.passwordLabel}</label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-subtle" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                placeholder={t.connexion?.passwordPlaceholder}
                className="w-full h-11 pl-11 pr-12 rounded-xl border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11" disabled={loginLoading || loginSuccess} loading={loginLoading}>
            {t.connexion?.submit}
          </Button>

          <p className="text-center text-sm text-ink-muted">
            {t.connexion?.noAccount} <button type="button" onClick={() => onModeChange("signup")} className="font-semibold text-brand hover:underline">{t.connexion?.signupLink}</button>
          </p>
          <p className="text-center text-xs text-ink-subtle">{t.connexion?.demoNote}</p>
        </form>
      ) : (
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          {signupSuccess && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700">
              <CheckIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{t.inscription?.successMessage}</span>
            </div>
          )}
          {signupError && (
            <div className="flex items-center gap-3 rounded-xl bg-danger-soft p-4 text-danger">
              <AlertCircleIcon className="h-5 w-5" />
              <span className="text-sm">{signupError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-2">{t.inscription?.pseudoLabel}</label>
            <Input type="text" value={form.pseudo} onChange={(e) => handleSignupChange("pseudo", e.target.value)} placeholder={t.inscription?.pseudoPlaceholder} className="w-full h-11 pl-4 pr-4 rounded-xl border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">{t.inscription?.genderLabel}</label>
            <div className="flex gap-3">
              {["male", "female"].map((g) => (
                <button key={g} type="button" onClick={() => handleSignupChange("gender", g)} className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border-2 text-sm font-medium transition-all",
                  form.gender === g ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-line text-ink-muted hover:border-brand-line"
                )}>
                  {g === "male" ? <MaleIcon className="h-5 w-5" /> : <FemaleIcon className="h-5 w-5" />}
                  {t.inscription?.genderOptions?.[g as keyof typeof t.inscription.genderOptions]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">{t.inscription?.identifierLabel}</label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-subtle">
                {signupIsEmail ? <EmailIcon /> : <PhoneIcon />}
              </div>
              <Input type={signupIsEmail ? "email" : "tel"} value={form.identifier} onChange={(e) => handleSignupChange("identifier", e.target.value)} placeholder={signupIsEmail ? "vous@exemple.com" : "+261 3X XX XX XX"} className="w-full h-11 pl-11 pr-4 rounded-xl border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">{t.inscription?.passwordLabel}</label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-subtle" />
              <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => handleSignupChange("password", e.target.value)} placeholder={t.inscription?.passwordPlaceholder} className="w-full h-11 pl-11 pr-12 rounded-xl border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">{t.inscription?.confirmPasswordLabel}</label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-subtle" />
              <Input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => handleSignupChange("confirmPassword", e.target.value)} placeholder={t.inscription?.confirmPasswordPlaceholder} className="w-full h-11 pl-11 pr-12 rounded-xl border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
          </div>

          <Button type="submit" className="w-full h-11" disabled={signupLoading || signupSuccess} loading={signupLoading}>
            {t.inscription?.submit}
          </Button>

          <p className="text-center text-sm text-ink-muted">
            {t.inscription?.hasAccount} <button type="button" onClick={() => onModeChange("login")} className="font-semibold text-brand hover:underline">{t.inscription?.loginLink}</button>
          </p>
          <p className="text-center text-xs text-ink-subtle">{t.inscription?.termsNote} <Link href="/confidentialite" className="text-brand hover:underline">{t.inscription?.termsLink}</Link></p>
          <p className="text-center text-xs text-ink-subtle">{t.inscription?.demoNote}</p>
        </form>
      )}
    </div>
  );
}

function SecurityTab() {
  const { t } = useLang();

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem("mythenena.auth");
    localStorage.removeItem("mythenena.user");
    // Redirect to home
    window.location.href = "/";
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <p className="text-sm text-ink-muted">{t.settings?.securityDesc}</p>

      {/* Current session */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <User className="h-5 w-5" />
          </span>
          {t.settings?.loggedInAs}
        </h3>
        <p className="mt-2 text-sm text-ink-muted">
          {t.settings?.notLoggedIn}
        </p>
      </div>

      {/* Logout button */}
      <div className="rounded-xl border border-danger/50 bg-danger-soft/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-soft text-danger">
              <LogOutIcon className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-semibold text-ink">{t.settings?.logout}</h4>
              <p className="text-sm text-ink-muted">{t.settings?.logoutDesc}</p>
            </div>
          </div>
          <Button variant="danger" onClick={handleLogout} className="h-11 px-5">
            {t.settings?.logout}
          </Button>
        </div>
      </div>

      {/* Security options */}
      <div className="space-y-3">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <KeyIcon className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-semibold text-ink">Changer le mot de passe</h4>
                <p className="text-sm text-ink-muted">Mettez à jour votre mot de passe pour plus de sécurité</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Modifier</Button>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <SmartphoneIcon className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-semibold text-ink">Appareils connectés</h4>
                <p className="text-sm text-ink-muted">Gérez les appareils ayant accès à votre compte</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Voir</Button>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-semibold text-ink">Vérification en deux étapes</h4>
                <p className="text-sm text-ink-muted">Ajoutez une couche de sécurité supplémentaire</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Activer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HelpTab() {
  const { t } = useLang();

  const quickLinks = [
    { key: "evaluation", icon: HeartIcon, label: "evaluation", desc: "evaluation", href: "/sondage" },
    { key: "forum", icon: MessageCircleIcon, label: "forum", desc: "forum", href: "/forum" },
    { key: "chat", icon: SmartphoneIcon, label: "chat", desc: "chat", href: "/chat" },
    { key: "resources", icon: BookOpenIcon, label: "resources", desc: "resources", href: "/ressources" },
    { key: "annuaire", icon: UsersIcon, label: "annuaire", desc: "annuaire", href: "/annuaire" },
    { key: "premium", icon: ShieldIcon, label: "premium", desc: "premium", href: "/annuaire" },
  ] as const;

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <p className="text-sm text-ink-muted">{t.aide?.modalIntro}</p>

      <div className="space-y-3">
        {quickLinks.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-all hover:border-brand-line hover:bg-brand-soft/50 hover:shadow-md"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <link.icon className="h-6 w-6" />
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-ink group-hover:text-brand transition-colors">
                {t.aide?.quickLinks?.[link.label as keyof typeof t.aide.quickLinks]}
              </h4>
              <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                {t.aide?.quickLinksDesc?.[link.desc as keyof typeof t.aide.quickLinksDesc]}
              </p>
            </div>
            <ArrowRightIcon className="flex-shrink-0 h-5 w-5 text-ink-subtle group-hover:text-brand transition-colors" aria-hidden />
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-brand/50 bg-brand-soft/50 p-4">
        <h4 className="font-semibold text-ink">{t.aide?.contactTitle}</h4>
        <p className="mt-1 text-sm text-ink-muted">{t.aide?.contactDesc}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link href="/connexion" className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-line-strong bg-surface text-ink font-semibold text-sm hover:border-brand hover:bg-brand-softer hover:text-brand transition-all">
            {t.aide?.contactEmail}
          </Link>
          <Link href="/forum" className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-line-strong bg-surface text-ink font-semibold text-sm hover:border-brand hover:bg-brand-softer hover:text-brand transition-all">
            {t.aide?.contactForum}
          </Link>
        </div>
      </div>

<div className="rounded-xl border border-danger/50 bg-danger-soft/50 p-4">
          <div className="flex items-start gap-3">
            <LifeBuoyIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-danger" />
            <div>
              <h4 className="font-semibold text-ink">{t.aide?.emergencyTitle}</h4>
              <p className="mt-1 text-sm text-ink-muted">{t.aide?.emergencyDesc}</p>
              <Link href="/ressources" className="mt-2 inline-flex items-center gap-2 font-semibold text-danger hover:underline">{t.aide?.emergencyLink} <ArrowRightIcon className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
    </div>
  );
}

import { User, Shield, CreditCard, Users, ArrowRight, Lock, Bell, Mail } from 'lucide-react';
import { Button } from './UI';

interface SettingsPageProps {
  onNavigateToSecurity: () => void;
}

export function SettingsPage({ onNavigateToSecurity }: SettingsPageProps) {
  return (
    <div className="p-8 pb-32 max-w-4xl mx-auto w-full pt-16">
      <div className="mb-12">
        <h1 className="font-headline text-5xl font-bold text-white mb-3 tracking-tight">Settings</h1>
        <p className="text-slate-400 text-lg">Manage your account preferences, billing, and organizational security.</p>
      </div>

      {/* Profile Header */}
      <section className="mb-12 flex flex-col md:flex-row items-center md:items-start gap-10 border-b border-[#1e293b] pb-12">
        <div className="relative group cursor-pointer shadow-2xl">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#1e293b] group-hover:border-[#3B82F6] transition-all">
            <img 
              alt="Alex Sterling" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDeBl3A41NQRnwZy3UeG6R3RBqXBU6_YPEm-Mfu1Eq1CKIpLRAWDkH5YALbgnlF2SnSw45osCQ6MHp_yGrgYktvnCS_IoczzyLZOq_LXlYAlshr7YVJSbhRavGkt9Jhy0TsaLpBBSFu3wjxVIBTWoQQcdijbn78osR_ePJ5MpKkFRswERbvVoZsL5dl4bsDBPlsF19pPDjMBh0NeLx0muaVpPNCqZTK2iRR3leCmdjLbJ8WhLmVi-4QLBu8348cyN7RzddhaRTP9w" 
            />
          </div>
          <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6]">Edit</span>
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="font-headline text-4xl font-bold text-white mb-1 leading-none">Alex Sterling</h1>
          <p className="text-lg text-slate-400 mb-6">alex.sterling@enterprise-inc.com</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 px-3 py-1.5 rounded-lg font-headline text-[10px] font-extrabold uppercase tracking-widest">Enterprise Admin</span>
            <span className="bg-[#020617]est text-slate-400 border border-[#1e293b] px-3 py-1.5 rounded-lg font-headline text-[10px] font-extrabold uppercase tracking-widest">Risk Analyst</span>
          </div>
        </div>
        <Button variant="secondary" className="mt-4 md:mt-0 px-6 py-3">
          <Lock className="w-4 h-4" /> Reset Password
        </Button>
      </section>

      {/* Settings Grid */}
      <div className="grid gap-6">
        <SettingsCard 
          icon={User} 
          title="Account Settings" 
          description="Manage your personal profile details, notification preferences, and platform localization." 
          tags={["Profile", "Localization", "Notifications"]}
          onClick={() => {}}
        />
        <SettingsCard 
          icon={Shield} 
          title="Security & Privacy" 
          description="Maintain 2FA, review login history, and manage active sessions across all devices." 
          tags={["2FA", "Audit Logs", "Encryption"]}
          onClick={onNavigateToSecurity}
          active
        />
        <SettingsCard 
          icon={CreditCard} 
          title="Billing Information" 
          description="Update payment methods, view invoices, and manage your current subscription plan." 
          tags={["Invoices", "Plan: Professional", "Payments"]}
          onClick={() => {}}
        />
        <SettingsCard 
          icon={Lock}
          title="API Configuration"
          description="Manage API Key credentials and configure the Neural Temperature limits for the engine."
          tags={["Neural Temperature", "API Key Management", "Institutional Rate"]}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, description, tags, onClick, active }: any) {
  return (
    <button 
      onClick={onClick}
      className="group text-left block bg-[#020617] border border-[#1e293b] rounded-2xl p-8 hover:border-[#3B82F6]/50 hover:bg-[#020617] transition-all relative overflow-hidden shadow-sm"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#3B82F6] transition-all"></div>
      <div className="flex items-start gap-8">
        <div className="w-14 h-14 rounded-xl bg-[#020617] flex items-center justify-center border border-[#1e293b] group-hover:border-[#3B82F6]/30 transition-colors shrink-0 shadow-inner">
          <Icon className="w-6 h-6 text-slate-400 group-hover:text-[#3B82F6] transition-colors" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline text-2xl font-bold text-white flex items-center gap-3">
              {title}
              <ArrowRight className="w-4 h-4 text-[#3B82F6] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h2>
          </div>
          <p className="text-slate-400 mb-6 leading-relaxed max-w-2xl">{description}</p>
          <div className="flex flex-wrap gap-4">
            {tags.map((tag: string) => (
              <span key={tag} className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-white px-3 py-1 bg-[#020617]est/50 rounded-lg border border-[#1e293b]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

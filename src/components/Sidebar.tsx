import { LayoutDashboard, Scale, ShieldAlert, Settings, LogOut, FileText } from 'lucide-react';

export function Sidebar({ activePage, onNavigate }: any) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'compare', icon: Scale, label: 'Benchmarking' },
    { id: 'reports', icon: FileText, label: 'Audit History' },
    { id: 'financials', icon: FileText, label: 'Financials' },
    { id: 'security', icon: ShieldAlert, label: 'Security' },
  ];

  return (
    <aside className="w-64 bg-[#0a192f] border-r border-white/5 flex flex-col py-8 px-4">
      <div className="px-4 mb-12">
        <h1 className="text-2xl font-black tracking-tighter text-blue-500">VERIRISK</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              activePage === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="pt-8 border-t border-white/5 space-y-2">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white transition-all font-bold text-sm">
          <Settings size={20} /> Settings
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
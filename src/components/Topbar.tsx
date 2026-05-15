import { Bell, UserCircle, Search } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-20 bg-[#020617] border-b border-[#1e293b] flex items-center justify-between px-8">
      <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-[#1e293b] w-96">
        <Search size={18} className="text-gray-500" />
        <input 
          placeholder="Global Command Search..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-white">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-[#051121]"></span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-[#1e293b]">
          <div className="text-right">
            <p className="text-xs font-bold">Aman Sinha</p>
            <p className="text-[10px] text-gray-500 font-mono">FINANCE_MBA_ADMIN</p>
          </div>
          <UserCircle size={32} className="text-blue-500" />
        </div>
      </div>
    </header>
  );
}
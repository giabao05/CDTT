'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import {
  Search, ShieldCheck, Plus, HardDrive, FileText,
  CheckCircle, AlertTriangle, ClipboardList, RefreshCw, X,
  Clock, Wrench, XCircle, Phone, Mail, User, Wand2
} from 'lucide-react';
import type { Product } from '@/types/admin';

interface ImeiTracking {
  id: number; imeiCode: string; productVariantId: number;
  status: string; orderId: number | null; importDate: string;
  exportDate: string | null; warrantyEndDate: string | null;
}
interface WarrantyRequest {
  id: number; imeiCode: string; customerName: string; customerPhone: string;
  customerEmail?: string; orderId?: number; productName?: string;
  issueDescription: string; status: string; technicianNote?: string;
  receivedDate: string; completedDate?: string; warrantyEndDate?: string;
}

const WARRANTY_STATUSES = [
  { value: 'RECEIVED', label: 'Da tiep nhan', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', Icon: Clock },
  { value: 'IN_PROGRESS', label: 'Dang sua chua', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', Icon: Wrench },
  { value: 'DONE', label: 'Hoan thanh', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', Icon: CheckCircle },
  { value: 'REJECTED', label: 'Tu choi', color: 'text-red-400 bg-red-500/10 border-red-500/20', Icon: XCircle },
];

export default function WarrantyPage() {
  const [activeTab, setActiveTab] = useState<'imei' | 'warranty'>('warranty');
  const [imeis, setImeis] = useState<ImeiTracking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warranties, setWarranties] = useState<WarrantyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imeiSearch, setImeiSearch] = useState('');
  const [searchImeiCode, setSearchImeiCode] = useState('');
  const [foundImei, setFoundImei] = useState<ImeiTracking | null>(null);
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | ''>('');
  const [imeiInput, setImeiInput] = useState('');
  const [autoGenCount, setAutoGenCount] = useState(1);
  const [warrantySearch, setWarrantySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyRequest | null>(null);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [techNote, setTechNote] = useState('');
  const [newWarranty, setNewWarranty] = useState({
    imeiCode: '', customerName: '', customerPhone: '', customerEmail: '',
    productName: '', issueDescription: '', warrantyEndDate: '',
  });

  const fetchAll = useCallback(async () => {
    try {
      const [ir, pr, wr] = await Promise.all([api.get('/imeis'), api.get('/products'), api.get('/warranty')]);
      setImeis(ir.data); setProducts(pr.data); setWarranties(wr.data);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSearchImei = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchImeiCode.trim()) return;
    try {
      const res = await api.get(`/imeis/search/${searchImeiCode.trim()}`);
      setFoundImei(res.data ?? null);
      if (!res.data) alert('Khong tim thay IMEI!');
    } catch { alert('Khong tim thay IMEI!'); setFoundImei(null); }
  };

  const handleSaveImei = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId || !imeiInput.trim()) { alert('Vui long chon san pham va nhap IMEI'); return; }
    const list = imeiInput.split(/[\n,]+/).map((i: string) => i.trim()).filter(Boolean);
    try {
      await Promise.all(list.map((imei: string) => api.post('/imeis', { imeiCode: imei, productVariantId: selectedVariantId, status: 'IN_STOCK' })));
      alert(`Da them ${list.length} IMEI!`);
      setIsImeiModalOpen(false); fetchAll();
    } catch { alert('Co loi xay ra.'); }
  };

  // Generate unique random IMEI/Serial codes not duplicating existing ones
  const generateRandomImei = () => {
    const existingCodes = new Set(imeis.map(i => i.imeiCode));
    const generated: string[] = [];
    let attempts = 0;
    while (generated.length < autoGenCount && attempts < 1000) {
      attempts++;
      // Generate a 15-digit IMEI-like code: TAC(8) + serial(6) + check(1)
      const tac = '35' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      const serial = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      // Luhn checksum
      const base = tac + serial;
      let sum = 0;
      for (let i = 0; i < 14; i++) {
        let d = parseInt(base[i]);
        if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
        sum += d;
      }
      const check = (10 - (sum % 10)) % 10;
      const code = base + check;
      if (!existingCodes.has(code) && !generated.includes(code)) {
        generated.push(code);
        existingCodes.add(code);
      }
    }
    setImeiInput(prev => {
      const existing = prev.trim();
      return existing ? existing + '\n' + generated.join('\n') : generated.join('\n');
    });
  };


  const handleCreateWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarranty.imeiCode || !newWarranty.customerName || !newWarranty.customerPhone || !newWarranty.issueDescription) {
      alert('Vui long dien day du thong tin.'); return;
    }
    try {
      // Strip empty optional fields so backend doesn't reject empty strings
      const payload: any = {
        imeiCode: newWarranty.imeiCode.trim(),
        customerName: newWarranty.customerName.trim(),
        customerPhone: newWarranty.customerPhone.trim(),
        issueDescription: newWarranty.issueDescription.trim(),
      };
      if (newWarranty.customerEmail?.trim()) payload.customerEmail = newWarranty.customerEmail.trim();
      if (newWarranty.productName?.trim()) payload.productName = newWarranty.productName.trim();
      if (newWarranty.warrantyEndDate?.trim()) payload.warrantyEndDate = newWarranty.warrantyEndDate.trim();

      await api.post('/warranty', payload);
      alert('Tiep nhan thanh cong!');
      setIsWarrantyModalOpen(false);
      setNewWarranty({ imeiCode: '', customerName: '', customerPhone: '', customerEmail: '', productName: '', issueDescription: '', warrantyEndDate: '' });
      fetchAll();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Co loi xay ra.';
      alert('Loi: ' + msg);
    }
  };


  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/warranty/${id}/status`, { status, technicianNote: techNote });
      setIsDetailOpen(false); setTechNote(''); fetchAll();
    } catch { alert('Cap nhat that bai.'); }
  };

  const imeiStatusBadge = (status: string) => {
    const m: Record<string,string> = { IN_STOCK:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', SOLD:'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', WARRANTY:'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    const l: Record<string,string> = { IN_STOCK:'Trong kho', SOLD:'Da ban', WARRANTY:'Dang BH' };
    return <span className={`px-2 py-0.5 border rounded text-xs font-medium ${m[status]||'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>{l[status]||status}</span>;
  };

  const warrantyBadge = (status: string) => {
    const s = WARRANTY_STATUSES.find(x => x.value === status);
    if (!s) return <span className="px-2 py-0.5 rounded text-xs bg-slate-500/10 text-slate-400">{status}</span>;
    return <span className={`px-2 py-0.5 border rounded text-xs font-medium ${s.color}`}>{s.label}</span>;
  };

  const filteredImeis = imeis.filter(i => i.imeiCode.toLowerCase().includes(imeiSearch.toLowerCase())).slice(0, 100);
  const filteredWarranties = warranties.filter(w => {
    const ms = statusFilter === 'all' || w.status === statusFilter;
    const q = warrantySearch.toLowerCase();
    const mq = !q || w.imeiCode.toLowerCase().includes(q) || w.customerName.toLowerCase().includes(q) || w.customerPhone.includes(q);
    return ms && mq;
  });
  const sp = products.find(p => p.id === selectedProductId);
  const stats = { total: warranties.length, received: warranties.filter(w=>w.status==='RECEIVED').length, inProgress: warranties.filter(w=>w.status==='IN_PROGRESS').length, done: warranties.filter(w=>w.status==='DONE').length };

  const INP = 'w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Quan ly IMEI & Bao hanh</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tra cuu Serial/IMEI, tiep nhan va theo doi lich su bao hanh</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsImeiModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium"><HardDrive size={15}/> Nhap Kho IMEI</button>
          <button onClick={() => setIsWarrantyModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"><Plus size={15}/> Tiep nhan Bao hanh</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {label:'Tong phieu',value:stats.total,color:'text-indigo-400',bg:'bg-indigo-500/10'},
          {label:'Cho xu ly',value:stats.received,color:'text-blue-400',bg:'bg-blue-500/10'},
          {label:'Dang sua',value:stats.inProgress,color:'text-amber-400',bg:'bg-amber-500/10'},
          {label:'Hoan thanh',value:stats.done,color:'text-emerald-400',bg:'bg-emerald-500/10'},
        ].map(s=>(
          <div key={s.label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}><ShieldCheck size={22} className={s.color}/></div>
            <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-[#0d1117] p-1 rounded-xl w-fit">
        {[{key:'warranty',label:'Phieu Bao Hanh',Icon:ClipboardList},{key:'imei',label:'Kho IMEI',Icon:HardDrive}].map(({key,label,Icon})=>(
          <button key={key} onClick={()=>setActiveTab(key as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab===key?'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-sm':'text-slate-500 hover:text-slate-700'}`}><Icon size={15}/> {label}</button>
        ))}
      </div>

      {activeTab==='warranty' && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-[#1e293b] flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={warrantySearch} onChange={e=>setWarrantySearch(e.target.value)} placeholder="Tim theo IMEI, ten, SDT..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"/>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[{value:'all',label:'Tat ca'},...WARRANTY_STATUSES.map(s=>({value:s.value,label:s.label}))].map(f=>(
                <button key={f.value} onClick={()=>setStatusFilter(f.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter===f.value?'bg-indigo-600 text-white':'bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>{f.label}</button>
              ))}
            </div>
            <button onClick={fetchAll} className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-indigo-400"><RefreshCw size={13}/> Lam moi</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#0d1117] text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>{['Ma phieu','IMEI/Serial','Khach hang','Thiet bi','Mo ta loi','Ngay TN','Trang thai','Thao tac'].map(h=><th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                {isLoading?(<tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Dang tai...</td></tr>)
                :filteredWarranties.length===0?(<tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400"><ShieldCheck size={40} className="mx-auto mb-3 opacity-30"/><p>Chua co phieu bao hanh nao</p></td></tr>)
                :filteredWarranties.map(w=>(
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-[#1a2235] transition-colors">
                    <td className="px-4 py-3 font-mono text-indigo-400 font-bold text-xs">#{w.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-white">{w.imeiCode}</td>
                    <td className="px-4 py-3"><p className="font-medium text-xs text-slate-900 dark:text-white">{w.customerName}</p><p className="text-slate-400 text-[11px]">{w.customerPhone}</p></td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{w.productName||'-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[180px] truncate">{w.issueDescription}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{new Date(w.receivedDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3">{warrantyBadge(w.status)}</td>
                    <td className="px-4 py-3"><button onClick={()=>{setSelectedWarranty(w);setTechNote(w.technicianNote||'');setIsDetailOpen(true);}} className="px-3 py-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-lg text-xs font-medium">Xem & Cap nhat</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab==='imei' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Search size={20} className="text-indigo-400"/></div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tra cuu nhanh</h2></div>
            <form onSubmit={handleSearchImei} className="mb-4 flex gap-2">
              <input type="text" placeholder="Nhap ma IMEI/Serial..." value={searchImeiCode} onChange={e=>setSearchImeiCode(e.target.value)} className="flex-1 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"/>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Tim</button>
            </form>
            {foundImei&&(<div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-4">
              <div className="flex justify-between items-start mb-3"><h3 className="font-mono font-bold text-indigo-400">{foundImei.imeiCode}</h3>{imeiStatusBadge(foundImei.status)}</div>
              <div className="space-y-2 text-xs text-slate-500">
                <p className="flex justify-between"><span>Variant ID:</span><span className="font-mono text-white">#{foundImei.productVariantId}</span></p>
                <p className="flex justify-between"><span>Ngay nhap:</span><span>{new Date(foundImei.importDate).toLocaleDateString('vi-VN')}</span></p>
                {foundImei.orderId&&<p className="flex justify-between"><span>Don hang:</span><span className="font-mono text-emerald-400">#{foundImei.orderId}</span></p>}
                {foundImei.warrantyEndDate&&<p className="flex justify-between"><span>Han BH:</span><span className="text-amber-400">{new Date(foundImei.warrantyEndDate).toLocaleDateString('vi-VN')}</span></p>}
              </div>
              {foundImei.status==='SOLD'&&(<button onClick={()=>{setNewWarranty(p=>({...p,imeiCode:foundImei.imeiCode}));setIsWarrantyModalOpen(true);}} className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2"><AlertTriangle size={14}/> Tiep nhan Bao hanh</button>)}
            </div>)}
          </div>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden flex flex-col lg:col-span-2" style={{maxHeight:'500px'}}>
            <div className="p-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center">
              <h2 className="font-semibold text-slate-900 dark:text-white">Kho IMEI He thong</h2>
              <div className="relative w-56"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={imeiSearch} onChange={e=>setImeiSearch(e.target.value)} placeholder="Loc danh sach IMEI..." className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-[#1e293b] rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"/></div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-[#0d1117] text-slate-400 text-[11px] uppercase sticky top-0">
                  <tr>{['IMEI/Serial','Trang thai','Variant','Ngay nhap','Don hang'].map(h=><th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                  {filteredImeis.map(item=>(
                    <tr key={item.id} onClick={()=>{setSearchImeiCode(item.imeiCode);setFoundImei(item);}} className="hover:bg-slate-50 dark:hover:bg-[#1a2235] cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-xs text-slate-900 dark:text-white">{item.imeiCode}</td>
                      <td className="px-4 py-3">{imeiStatusBadge(item.status)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">#{item.productVariantId}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(item.importDate).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3 text-xs">{item.orderId?<span className="font-mono text-indigo-400">#{item.orderId}</span>:<span className="text-slate-500">-</span>}</td>
                    </tr>
                  ))}
                  {filteredImeis.length===0&&<tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Khong tim thay ma IMEI nao.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isImeiModalOpen&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"><HardDrive size={18} className="text-indigo-400"/> Nhap Kho IMEI Moi</h3>
              <button onClick={()=>setIsImeiModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveImei} className="p-6 space-y-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex gap-3"><FileText size={18} className="text-indigo-400 shrink-0 mt-0.5"/><p className="text-xs text-indigo-300">Nhap nhieu IMEI bang dau phay (,) hoac xuong dong.</p></div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">1. Chon San pham</label>
                <select value={selectedProductId} onChange={e=>{setSelectedProductId(Number(e.target.value));setSelectedVariantId('');}} className={INP} required>
                  <option value="" disabled>-- Chon dong dien thoai --</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {sp&&(<div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">2. Chon Phien ban</label>
                <select value={selectedVariantId} onChange={e=>setSelectedVariantId(Number(e.target.value))} className={INP} required>
                  <option value="" disabled>-- Chon cau hinh may --</option>
                  {sp.variants?.map(v=><option key={v.id} value={v.id}>{v.storage} - {v.color}</option>)}
                </select>
              </div>)}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">3. Nhap hoac Tao ma IMEI / Serial</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={1} max={50} value={autoGenCount}
                      onChange={e => setAutoGenCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                      className="w-14 bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded px-2 py-1 text-xs text-center text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button type="button" onClick={generateRandomImei}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/30 rounded-lg text-xs font-medium transition-colors">
                      <Wand2 size={13}/> Tao tu dong
                    </button>
                    {imeiInput && (
                      <button type="button" onClick={() => setImeiInput('')}
                        className="px-2 py-1.5 text-slate-400 hover:text-red-400 text-xs transition-colors">
                        Xoa het
                      </button>
                    )}
                  </div>
                </div>
                <textarea required value={imeiInput} onChange={e=>setImeiInput(e.target.value)} rows={5}
                  placeholder={"355320110998877\n355320110998878\n(Hoac bam 'Tao tu dong' de sinh ma ngau nhien)"}
                  className={INP+' font-mono'}/>
                {imeiInput && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {imeiInput.split(/[\n,]+/).filter(Boolean).length} ma IMEI
                  </p>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#1e293b]">
                <button type="button" onClick={()=>setIsImeiModalOpen(false)} className="px-4 py-2 text-sm bg-slate-100 dark:bg-[#1e293b] text-slate-700 dark:text-slate-300 rounded-lg">Huy</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Luu vao Kho</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isWarrantyModalOpen&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center sticky top-0 bg-white dark:bg-[#0d1117]">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"><ShieldCheck size={18} className="text-amber-400"/> Tiep nhan Phieu Bao hanh</h3>
              <button onClick={()=>setIsWarrantyModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateWarranty} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-medium text-slate-400 mb-1.5">Ma IMEI / Serial *</label><input value={newWarranty.imeiCode} onChange={e=>setNewWarranty(p=>({...p,imeiCode:e.target.value}))} placeholder="Nhap ma IMEI hoac Serial" className={INP+' font-mono'} required/></div>
                <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Ho va ten KH *</label><input value={newWarranty.customerName} onChange={e=>setNewWarranty(p=>({...p,customerName:e.target.value}))} placeholder="Nguyen Van A" className={INP} required/></div>
                <div><label className="block text-xs font-medium text-slate-400 mb-1.5">So dien thoai *</label><input value={newWarranty.customerPhone} onChange={e=>setNewWarranty(p=>({...p,customerPhone:e.target.value}))} placeholder="0901234567" className={INP} required/></div>
                <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label><input type="email" value={newWarranty.customerEmail} onChange={e=>setNewWarranty(p=>({...p,customerEmail:e.target.value}))} placeholder="email@example.com" className={INP}/></div>
                <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Ten san pham</label><input value={newWarranty.productName} onChange={e=>setNewWarranty(p=>({...p,productName:e.target.value}))} placeholder="iPhone 15 Pro Max" className={INP}/></div>
                <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Han bao hanh den</label><input type="date" value={newWarranty.warrantyEndDate} onChange={e=>setNewWarranty(p=>({...p,warrantyEndDate:e.target.value}))} className={INP}/></div>
                <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Don hang lien quan</label><input type="number" placeholder="ID don hang (neu co)" className={INP}/></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-slate-400 mb-1.5">Mo ta loi / Yeu cau *</label><textarea value={newWarranty.issueDescription} onChange={e=>setNewWarranty(p=>({...p,issueDescription:e.target.value}))} rows={3} placeholder="Mo ta chi tiet loi cua thiet bi..." className={INP} required/></div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#1e293b]">
                <button type="button" onClick={()=>setIsWarrantyModalOpen(false)} className="px-4 py-2 text-sm bg-slate-100 dark:bg-[#1e293b] text-slate-300 rounded-lg">Huy</button>
                <button type="submit" className="px-5 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center gap-2"><ShieldCheck size={15}/> Tiep nhan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailOpen&&selectedWarranty&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center sticky top-0 bg-white dark:bg-[#0d1117]">
              <div><h3 className="text-base font-semibold text-slate-900 dark:text-white">Phieu BH #{selectedWarranty.id}</h3><p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedWarranty.imeiCode}</p></div>
              <button onClick={()=>setIsDetailOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 dark:bg-[#111827] rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Thong tin khach hang</h4>
                <div className="flex items-center gap-3 text-sm"><User size={14} className="text-slate-400"/><span className="text-slate-900 dark:text-white font-medium">{selectedWarranty.customerName}</span></div>
                <div className="flex items-center gap-3 text-sm"><Phone size={14} className="text-slate-400"/><span className="text-slate-600 dark:text-slate-300">{selectedWarranty.customerPhone}</span></div>
                {selectedWarranty.customerEmail&&<div className="flex items-center gap-3 text-sm"><Mail size={14} className="text-slate-400"/><span className="text-slate-300">{selectedWarranty.customerEmail}</span></div>}
              </div>
              <div className="bg-slate-50 dark:bg-[#111827] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Thong tin thiet bi</h4>
                <div className="space-y-2 text-sm">
                  {selectedWarranty.productName&&<p className="flex justify-between"><span className="text-slate-400">Thiet bi:</span><span className="text-slate-900 dark:text-white font-medium">{selectedWarranty.productName}</span></p>}
                  <p className="flex justify-between"><span className="text-slate-400">Ngay TN:</span><span className="text-slate-900 dark:text-white">{new Date(selectedWarranty.receivedDate).toLocaleDateString('vi-VN')}</span></p>
                  {selectedWarranty.warrantyEndDate&&<p className="flex justify-between"><span className="text-slate-400">Han BH:</span><span className="text-amber-400">{new Date(selectedWarranty.warrantyEndDate).toLocaleDateString('vi-VN')}</span></p>}
                  <p className="flex justify-between"><span className="text-slate-400">Trang thai:</span>{warrantyBadge(selectedWarranty.status)}</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mo ta loi</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#111827] rounded-xl p-4">{selectedWarranty.issueDescription}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ghi chu ky thuat vien</label>
                <textarea value={techNote} onChange={e=>setTechNote(e.target.value)} rows={3} placeholder="Nhap ghi chu hoac ket qua kiem tra..." className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"/>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cap nhat trang thai</h4>
                <div className="grid grid-cols-2 gap-2">
                  {WARRANTY_STATUSES.map(s=>(
                    <button key={s.value} onClick={()=>handleUpdateStatus(selectedWarranty.id,s.value)} disabled={selectedWarranty.status===s.value}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium border transition-all ${selectedWarranty.status===s.value?`${s.color} opacity-60 cursor-not-allowed`:'bg-slate-50 dark:bg-[#1e293b] border-slate-200 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 hover:border-indigo-500/50 hover:text-indigo-400'}`}>
                      <s.Icon size={13}/> {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

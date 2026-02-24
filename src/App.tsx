import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Mail, 
  Plus, 
  Settings, 
  Package, 
  Tag, 
  ArrowRight, 
  X, 
  CheckCircle2,
  Lock,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Category, Supplier } from './types';

export default function App() {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Form states for adding supplier
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    registration_code: '',
    items: '',
    address: '',
    phone: '',
    category_id: ''
  });

  const [newCategory, setNewCategory] = useState('');
  const [inlineCategoryName, setInlineCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, [search, selectedCategory]);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (selectedCategory) params.append('categoryId', selectedCategory.toString());
    
    const res = await fetch(`/api/suppliers?${params.toString()}`);
    const data = await res.json();
    setSuppliers(data);
    setLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory })
    });
    if (res.ok) {
      alert('Categoria cadastrada com sucesso!');
      setNewCategory('');
      fetchCategories();
    } else {
      const data = await res.json();
      alert(`Erro: ${data.error || 'Falha ao cadastrar categoria'}`);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newSupplier,
        category_id: parseInt(newSupplier.category_id)
      })
    });
    if (res.ok) {
      alert('Fornecedor cadastrado com sucesso!');
      setNewSupplier({ name: '', email: '', registration_code: '', items: '', address: '', phone: '', category_id: '' });
      fetchSuppliers();
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth as requested: "papel admi no nome Source Prysmian"
    // We'll use "PrysmianAdmin" as a mock password for this demo
    if (adminPassword === 'PrysmianAdmin') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setView('admin');
    } else {
      alert('Código de acesso inválido.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-brand-deep text-white py-4 px-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setView('home')}
          >
            <div className="bg-brand-accent p-2 rounded-lg">
              <Building2 size={24} />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight">Source <span className="text-brand-accent">Prysmian</span></h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setView('home')}
              className={`hover:text-brand-accent transition-colors ${view === 'home' ? 'text-brand-accent' : ''}`}
            >
              Consultar
            </button>
            <button 
              onClick={() => isAdmin ? setView('admin') : setShowAdminLogin(true)}
              className={`flex items-center gap-2 hover:text-brand-accent transition-colors ${view === 'admin' ? 'text-brand-accent' : ''}`}
            >
              <Settings size={18} />
              Admin
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === 'home' ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-display font-bold text-brand-deep"
              >
                Encontre o Fornecedor Ideal
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-500 text-lg max-w-2xl mx-auto"
              >
                Pesquise por itens, categorias ou e-mail na base de dados da Source Prysmian.
              </motion.p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="O que você está procurando? (ex: Servidores, Laptops...)"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl focus:ring-2 focus:ring-brand-accent text-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Categories Filter - Written List Format */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Tag size={14} /> Selecione uma Categoria
                </h4>
                <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className={`text-sm font-medium transition-all relative py-1 ${!selectedCategory ? 'text-brand-accent' : 'text-slate-500 hover:text-brand-deep'}`}
                  >
                    Todas as Categorias
                    {!selectedCategory && <motion.div layoutId="cat-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent rounded-full" />}
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`text-sm font-medium transition-all relative py-1 ${selectedCategory === cat.id ? 'text-brand-accent' : 'text-slate-500 hover:text-brand-deep'}`}
                    >
                      {cat.name}
                      {selectedCategory === cat.id && <motion.div layoutId="cat-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent rounded-full" />}
                    </button>
                  ))}
                </div>

                {isAdmin && (
                  <div className="pt-6 border-t border-slate-100">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Cadastrar Nova Categoria</h5>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const name = inlineCategoryName.trim();
                        if (!name) return;
                        
                        fetch('/api/categories', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name })
                        }).then(res => res.json()).then(data => {
                          if (data.id) {
                            fetchCategories();
                            setInlineCategoryName('');
                          } else {
                            alert('Erro ao criar categoria. Verifique se já existe.');
                          }
                        }).catch(() => alert('Erro de conexão com o servidor.'));
                      }}
                      className="flex items-center gap-2"
                    >
                      <input 
                        type="text" 
                        placeholder="Ex: Ferramentas, Tintas..."
                        className="max-w-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-accent/50 text-sm outline-none transition-all"
                        value={inlineCategoryName}
                        onChange={(e) => setInlineCategoryName(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="bg-brand-accent text-white p-2 rounded-lg hover:bg-brand-deep transition-all shadow-sm flex items-center justify-center"
                        title="Salvar Categoria"
                      >
                        <Plus size={18} />
                      </button>
                      <span className="text-[10px] font-medium text-slate-400 italic ml-2">Pressione Enter para salvar</span>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {suppliers.map((supplier) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={supplier.id}
                    className="glass-card rounded-2xl p-6 flex flex-col justify-between group hover:border-brand-accent/30 transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 p-3 rounded-xl text-brand-deep group-hover:bg-brand-accent group-hover:text-white transition-colors">
                          <Building2 size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          {supplier.category_name}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-brand-deep mb-1">{supplier.name}</h3>
                      <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                        <Lock size={12} /> Cód: {supplier.registration_code || 'N/A'}
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <Package size={16} className="mt-1 shrink-0 text-brand-accent" />
                          <span>{supplier.items}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={16} className="shrink-0 text-brand-accent" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                        {supplier.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand-accent"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            <span>{supplier.phone}</span>
                          </div>
                        )}
                        {supplier.address && (
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-brand-accent"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span className="line-clamp-2">{supplier.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <a 
                      href={`mailto:${supplier.email}?subject=Consulta de Fornecimento - Source Prysmian`}
                      className="btn-primary w-full justify-center"
                    >
                      Contatar via E-mail
                      <ArrowRight size={18} />
                    </a>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {!loading && suppliers.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-600">Nenhum fornecedor encontrado</h3>
                <p className="text-slate-400">Tente ajustar sua busca ou filtros.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-display font-bold text-brand-deep">Painel Administrativo</h2>
              <button 
                onClick={() => setView('home')}
                className="text-slate-500 hover:text-brand-deep flex items-center gap-2"
              >
                <X size={20} /> Sair do Admin
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Stats/Info */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-brand-deep text-white p-6 rounded-2xl shadow-lg">
                  <h4 className="text-sm uppercase tracking-widest opacity-70 mb-2">Total Fornecedores</h4>
                  <p className="text-4xl font-bold">{suppliers.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Categorias</h4>
                  <div className="space-y-2 mb-6">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex justify-between items-center text-sm">
                        <span>{cat.name}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold">
                          {suppliers.filter(s => s.category_id === cat.id).length}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">Nova Categoria</h5>
                    <form onSubmit={handleAddCategory} className="space-y-2">
                      <input 
                        type="text" 
                        className="input-field text-sm py-1.5" 
                        placeholder="Nome da categoria"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                      />
                      <button type="submit" className="btn-primary w-full justify-center py-1.5 text-sm">
                        Adicionar
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Add Supplier Form */}
              <div className="md:col-span-2">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                  <h3 className="text-xl font-bold text-brand-deep mb-6 flex items-center gap-2">
                    <Plus className="text-brand-accent" />
                    Cadastrar Novo Fornecedor
                  </h3>
                  <form onSubmit={handleAddSupplier} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-500">Nome da Empresa</label>
                        <input 
                          required
                          type="text" 
                          className="input-field" 
                          placeholder="Ex: Prysmian Group"
                          value={newSupplier.name}
                          onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-500">E-mail de Contato</label>
                        <input 
                          required
                          type="email" 
                          className="input-field" 
                          placeholder="contato@empresa.com"
                          value={newSupplier.email}
                          onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-500">Código de Cadastro</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="Ex: PRY-2024-001"
                          value={newSupplier.registration_code}
                          onChange={e => setNewSupplier({...newSupplier, registration_code: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-500">Categoria</label>
                        <select 
                          required
                          className="input-field"
                          value={newSupplier.category_id}
                          onChange={e => setNewSupplier({...newSupplier, category_id: e.target.value})}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-500">Endereço (Opcional)</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="Rua, Número, Cidade, Estado"
                          value={newSupplier.address}
                          onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-500">Telefone (Opcional)</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="(00) 00000-0000"
                          value={newSupplier.phone}
                          onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-500">Itens / Serviços (separados por vírgula)</label>
                      <textarea 
                        required
                        className="input-field min-h-[100px]" 
                        placeholder="Ex: Cabos elétricos, Fibra óptica, Conectores..."
                        value={newSupplier.items}
                        onChange={e => setNewSupplier({...newSupplier, items: e.target.value})}
                      />
                    </div>

                    <button type="submit" className="btn-primary w-full justify-center py-3 text-lg mt-4">
                      Finalizar Cadastro
                      <CheckCircle2 size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminLogin(false)}
              className="absolute inset-0 bg-brand-deep/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
            >
              <div className="text-center space-y-4 mb-8">
                <div className="bg-brand-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-brand-accent">
                  <Lock size={32} />
                </div>
                <h3 className="text-2xl font-bold text-brand-deep">Acesso Restrito</h3>
                <p className="text-slate-500">Insira o código de acesso administrativo para continuar.</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Código de Acesso</label>
                  <input 
                    type="password" 
                    autoFocus
                    className="input-field text-center text-2xl tracking-widest"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-4 text-lg">
                  Entrar no Painel
                  <ChevronRight size={20} />
                </button>
              </form>
              
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="w-full text-center mt-6 text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                Voltar para consulta
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Building2 size={20} className="text-brand-accent" />
              <span className="font-display font-bold text-brand-deep">Source Prysmian</span>
            </div>
            <p className="text-slate-400 text-sm">© 2024 Prysmian Group. Todos os direitos reservados.</p>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-brand-accent transition-colors">Privacidade</a>
            <a href="#" className="hover:text-brand-accent transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-brand-accent transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

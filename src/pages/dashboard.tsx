import React, { useState } from "react";
import {
  Search,
  Bell,
  Code,
  Compass,
  Plus,
  User,
  Star,
  Users,
  Menu,
  X,
} from "lucide-react";

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState({
    language: "all",
    level: "all",
    popularity: "all",
  });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const projects = [
    {
      id: 1,
      title: "Visualiseur de Réseau Neuronal",
      description:
        "Outil de visualisation de modèles ML avec graphiques d'entraînement en temps réel",
      language: "Python",
      participants: 12,
      stars: 234,
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
    },
    {
      id: 2,
      title: "Explorateur Blockchain",
      description:
        "Navigateur de registre décentralisé avec analyse de transactions",
      language: "JavaScript",
      participants: 8,
      stars: 189,
      image:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop",
    },
    {
      id: 3,
      title: "Simulateur d'Algorithme Quantique",
      description:
        "Simulez des algorithmes de calcul quantique en environnement classique",
      language: "Rust",
      participants: 5,
      stars: 156,
      image:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
    },
    {
      id: 4,
      title: "Auditeur de Smart Contract",
      description:
        "Analyse de sécurité automatisée pour les smart contracts Solidity",
      language: "TypeScript",
      participants: 15,
      stars: 312,
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop",
    },
    {
      id: 5,
      title: "File de Tâches Distribuée",
      description:
        "Système de traitement de tâches asynchrones haute performance",
      language: "Go",
      participants: 9,
      stars: 201,
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop",
    },
    {
      id: 6,
      title: "Éditeur Collaboratif Temps Réel",
      description:
        "Éditeur de code basé sur WebSocket avec curseurs en direct et chat",
      language: "JavaScript",
      participants: 22,
      stars: 445,
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop",
    },
  ];

  const languages = [
    "Tous",
    "Python",
    "JavaScript",
    "TypeScript",
    "Rust",
    "Go",
  ];
  const levels = ["Tous", "Débutant", "Intermediare", "Sénior"];
  const popularityOptions = ["Tous", "A la une", "Mieux notés", "Plus actifs"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-[#00ff88]/20 flex items-center px-4 sm:px-6 z-50">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-[#00ff88]/10 rounded transition-all mr-3"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-[#00ff88]" />
          ) : (
            <Menu className="w-5 h-5 text-[#00ff88]" />
          )}
        </button>

        {/* Logo */}
        <div className="hidden lg:flex items-center mr-6">
          <h1 className="text-lg font-bold text-[#00ff88] tracking-wider">
            <span className="flex items-center justify-center">clode_</span>
          </h1>
        </div>

        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#00ff88]" />
            <input
              type="text"
              placeholder="Rechercher des projets..."
              className="w-full bg-[#111] border border-[#00ff88]/30 rounded px-10 py-2 text-sm focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 ml-3 sm:ml-6">
          <button className="relative p-2 hover:bg-[#00ff88]/10 rounded transition-all group">
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-[#00ff88]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#00ff88] rounded-full shadow-[0_0_8px_rgba(0,255,136,0.8)]"></span>
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-[#00ff88] to-[#00cc6a] rounded-full border-2 border-[#00ff88]/50 shadow-[0_0_12px_rgba(0,255,136,0.4)]"></div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Left Sidebar */}
      <div
        className={`fixed left-0 top-16 bottom-0 w-64 border-r border-[#00ff88]/20 p-4 bg-[#0a0a0a] z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Mobile Logo */}
        <div className="lg:hidden mb-6 pb-4 border-b border-[#00ff88]/20">
          <h1 className="text-lg font-bold text-[#00ff88] tracking-wider">
            <span className="flex items-center justify-center">clode_</span>
          </h1>
        </div>

        <nav className="space-y-5">
          {[
            {
              id: "explore",
              icon: Compass,
              label: "Explorer les projets",
              active: true,
            },
            {
              id: "create",
              icon: Plus,
              label: "Créer un projet",
              active: false,
            },
            { id: "profile", icon: User, label: "Mon profil", active: false },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded transition-all ${
                item.active
                  ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                  : "text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/5 border border-transparent"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-4xl my-4 text-[#00ff88] font-semibold">
            Explorez les projets
          </h1>
          <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
            Découvrez et collaborez sur des projets du monde entier
          </p>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 p-4 bg-[#111] border border-[#00ff88]/20 rounded max-w-full">
            <select className="bg-[#0a0a0a] border border-[#00ff88]/30 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#00ff88] text-gray-300 cursor-pointer">
              {languages.map((lang) => (
                <option key={lang}>{lang}</option>
              ))}
            </select>
            <select className="bg-[#0a0a0a] border border-[#00ff88]/30 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#00ff88] text-gray-300 cursor-pointer">
              {levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <select className="bg-[#0a0a0a] border border-[#00ff88]/30 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#00ff88] text-gray-300 cursor-pointer">
              {popularityOptions.map((pop) => (
                <option key={pop}>{pop}</option>
              ))}
            </select>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onMouseEnter={() => setHoveredCard(project.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`bg-[#111] border rounded p-5 sm:p-6 transition-all cursor-pointer ${
                  hoveredCard === project.id
                    ? "border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.3)] transform -translate-y-1"
                    : "border-[#00ff88]/20 hover:border-[#00ff88]/50"
                }`}
              >
                <div className="mb-3">
                  <img src={project.image} className="" />
                </div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-white flex-1 mr-2">
                    {project.title}
                  </h3>
                  <span className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded text-xs text-[#00ff88] whitespace-nowrap">
                    {project.language}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.participants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#00ff88] text-[#00ff88]" />
                    <span className="text-[#00ff88]">{project.stars}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grid Background Effect */}
          <div
            className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
            style={{
              backgroundImage:
                "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

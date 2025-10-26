import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Terminal,
  Database,
  Package,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
  Menu,
  X,
  Book,
  Zap,
  Settings,
  Search,
  Moon,
  Sun,
  Image,
  Video,
} from "lucide-react";

// Types
interface Solution {
  steps: string[];
  commands?: string[];
  images?: string[];
  videos?: string[];
  notes?: string[];
}

interface TroubleshootingItem {
  id: string;
  title: string;
  error: string;
  solution: Solution;
  tags?: string[];
  category: "postgresql" | "odoo";
}

interface InstallStep {
  title: string;
  content: string;
  commands?: string[];
  images?: string[];
  videos?: string[];
}

interface InstallGuideData {
  title: string;
  icon: any;
  color: keyof typeof colorClasses;
  steps: InstallStep[];
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  color: keyof typeof colorClasses;
  children?: NavItem[];
}

// Data
const troubleshootingData: Record<string, TroubleshootingItem[]> = {
  postgresql: [
    {
      id: "pg-access-denied",
      title: "Accès refusé au démarrage",
      category: "postgresql",
      tags: ["permissions", "démarrage"],
      error: `pg_ctl -D "F:\\PostgreSQL\\18\\data" -l logfile start
en attente du démarrage du serveur....Accès refusé.
pg_ctl : n'a pas pu démarrer le serveur`,
      solution: {
        steps: [
          "Exécuter CMD en tant qu'administrateur",
          "Vérifier les permissions du dossier data",
          "Utiliser le bon chemin (C:\\ au lieu de F:\\)",
          "Vérifier si un service PostgreSQL existe déjà",
        ],
        commands: [
          'pg_ctl -D "C:\\PostgreSQL\\18\\data" -l "C:\\PostgreSQL\\18\\data\\logfile.log" start',
          'icacls "C:\\PostgreSQL\\18\\data"',
          "net start postgresql-x64-18",
        ],
      },
    },
    {
      id: "pg-connection-refused",
      title: "Connection refused",
      category: "postgresql",
      tags: ["connexion", "port"],
      error: `psql: erreur : la connexion au serveur sur « localhost » (::1), port 5432 a échoué : Connection refused
Le serveur est-il actif sur cet hôte et accepte-t-il les connexions ?`,
      solution: {
        steps: [
          "PostgreSQL n'est pas démarré",
          "Redémarrer le serveur PostgreSQL",
          "Vérifier le statut du service",
        ],
        commands: [
          'pg_ctl -D "C:\\PostgreSQL\\18\\data" start',
          'pg_ctl status -D "C:\\PostgreSQL\\18\\data"',
          "netstat -ano | findstr :5432",
        ],
      },
    },
    {
      id: "pg-missing-column",
      title: "Erreur : colonne manquante lors d’une requête",
      category: "postgresql",
      tags: ["requête", "colonnes", "erreur SQL"],
      error: `Erreur : column analytics_events.created_at does not exist
Code: 42703`,
      solution: {
        steps: [
          'Vérifier que la colonne "created_at" existe bien dans la table concernée.',
          "Si elle n’existe pas, la créer via une migration ou une commande SQL.",
          "Toujours synchroniser la base après une mise à jour du schéma (par exemple via Prisma ou Supabase migration).",
        ],
        commands: [
          "ALTER TABLE analytics_events ADD COLUMN created_at TIMESTAMP DEFAULT NOW();",
          "\\d analytics_events  -- pour vérifier les colonnes existantes",
        ],
        notes: [
          "Cette erreur arrive souvent quand on modifie la structure de la table sans mettre à jour la base.",
          "Toujours vérifier les migrations appliquées sur Supabase ou PostgreSQL local.",
        ],
      },
    },
  ],

  odoo: [
    {
      id: "odoo-unicode-error",
      title: "UnicodeDecodeError lors de la connexion",
      category: "odoo",
      tags: ["encodage", "utf8"],
      error: `UnicodeDecodeError: 'utf-8' codec can't decode byte 0xf4 in position 73: invalid continuation byte`,
      solution: {
        steps: [
          "Supprimer ou commenter la ligne db_uri_encoding dans odoo.conf",
          "Vérifier l'encodage PostgreSQL (doit être UTF8)",
          "Redémarrer Odoo",
        ],
        commands: [
          "# Dans odoo.conf, commenter : # db_uri_encoding = utf8",
          "SHOW server_encoding; -- Dans psql",
          "python odoo-bin -c odoo.conf",
        ],
      },
    },
    {
      id: "odoo-relation-not-exist",
      title: "La relation ir_module_module n'existe pas",
      category: "odoo",
      tags: ["base de données", "initialisation"],
      error: `ERROR: ERREUR: la relation « ir_module_module » n'existe pas
LINE 3: FROM ir_module_module`,
      solution: {
        steps: [
          "La base de données existe mais est vide",
          "Supprimer la base corrompue",
          "Créer une nouvelle base via l'interface web",
          "Ou initialiser en ligne de commande",
        ],
        commands: [
          "DROP DATABASE odoo_db; -- Dans psql",
          "CREATE DATABASE odoo_prod OWNER openpg;",
          "python odoo-bin -c odoo.conf -d odoo_prod -i base --stop-after-init",
        ],
      },
    },
    {
      id: "odoo-internal-server-error",
      title: "Internal Server Error sur l'interface web",
      category: "odoo",
      tags: ["serveur", "base de données"],
      error: `Internal Server Error
The server encountered an internal error and was unable to complete your request.`,
      solution: {
        steps: [
          "Base de données corrompue ou vide",
          "Arrêter Odoo",
          "Supprimer la base vide dans PostgreSQL",
          "Créer une nouvelle base via http://localhost:8069",
        ],
        commands: [
          "DROP DATABASE odoo_db;",
          "\\l -- Vérifier la suppression",
          "python odoo-bin -c odoo.conf",
          "# Puis aller sur http://localhost:8069",
        ],
      },
    },
    {
      id: "odoo-psycopg2-connection",
      title: "OperationalError: could not connect to server",
      category: "odoo",
      tags: ["connexion", "postgresql", "port"],
      error: `psycopg2.OperationalError: could not connect to server: Connection refused
Is the server running on host "localhost" and accepting TCP/IP connections on port 5432?`,
      solution: {
        steps: [
          "Vérifier que PostgreSQL est bien démarré sur le port 5432.",
          "Vérifier les identifiants de connexion dans odoo.conf (db_user, db_password).",
          "Autoriser les connexions locales dans pg_hba.conf et postgresql.conf.",
        ],
        commands: [
          'pg_ctl -D "C:\\PostgreSQL\\18\\data" start',
          "netstat -ano | findstr :5432",
          'notepad "C:\\PostgreSQL\\18\\data\\pg_hba.conf"',
        ],
        notes: [
          "Erreur fréquente quand PostgreSQL est arrêté ou mal configuré.",
          "Toujours redémarrer Odoo après modification du fichier de conf.",
        ],
      },
    },
  ],
};

const installGuides: Record<string, InstallGuideData> = {
  postgresql: {
    title: "Installation PostgreSQL 18",
    icon: Database,
    color: "blue",
    steps: [
      {
        title: "Téléchargement",
        content:
          "Télécharger PostgreSQL 18 depuis le site officiel postgresql.org",
        commands: [],
      },
      {
        title: "Installation",
        content:
          "Installer dans C:\\PostgreSQL\\18 (éviter Program Files pour les permissions)",
        commands: ["Chemin recommandé: C:\\PostgreSQL\\18"],
      },
      {
        title: "Configuration",
        content: "Définir le mot de passe postgres et le port 5432",
        commands: [],
      },
      {
        title: "Démarrage",
        content: "Démarrer le serveur PostgreSQL",
        commands: [
          'pg_ctl -D "C:\\PostgreSQL\\18\\data" start',
          "psql -U postgres",
        ],
      },
    ],
  },
  odoo: {
    title: "Installation Odoo 19",
    icon: Package,
    color: "orange",
    steps: [
      {
        title: "Prérequis",
        content: "Python 3.12, PostgreSQL 18 installé et démarré",
        commands: ["python --version", "psql -U postgres"],
      },
      {
        title: "Créer l'utilisateur PostgreSQL",
        content: "Créer un utilisateur dédié pour Odoo",
        commands: [
          "CREATE USER openpg WITH PASSWORD 'openpgpwd';",
          "ALTER USER openpg CREATEDB;",
        ],
      },
      {
        title: "Configuration odoo.conf",
        content: "Configurer le fichier odoo.conf avec les bonnes credentials",
        commands: [
          "db_host = localhost",
          "db_port = 5432",
          "db_user = openpg",
          "db_password = openpgpwd",
        ],
      },
      {
        title: "Premier démarrage",
        content: "Lancer Odoo et créer la base via l'interface web",
        commands: [
          "python odoo-bin -c odoo.conf",
          "# Ouvrir http://localhost:8069",
        ],
      },
    ],
  },
};

const navigation: NavItem[] = [
  { id: "overview", label: "Vue d'ensemble", icon: Book, color: "yellow" },
  {
    id: "installation",
    label: "Installation",
    icon: Zap,
    color: "orange",
    children: [
      {
        id: "install-pg",
        label: "PostgreSQL 18",
        icon: Database,
        color: "blue",
      },
      { id: "install-odoo", label: "Odoo 19", icon: Package, color: "orange" },
    ],
  },
  {
    id: "troubleshooting",
    label: "Dépannage",
    icon: Settings,
    color: "red",
    children: [
      {
        id: "troubleshoot-pg",
        label: "PostgreSQL",
        icon: Terminal,
        color: "blue",
      },
      {
        id: "troubleshoot-odoo",
        label: "Odoo",
        icon: AlertCircle,
        color: "red",
      },
    ],
  },
];

const colorClasses = {
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: "text-yellow-600 dark:text-yellow-500",
    hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
    active:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-400",
    icon: "text-orange-600 dark:text-orange-500",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30",
    active:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    icon: "text-red-600 dark:text-red-500",
    hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
    active: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-500",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
    active: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
};

const CodeBlock: React.FC<{ code: string; language?: string }> = ({
  code,
  language = "bash",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleCopy}
          className="p-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <Check size={16} className="text-emerald-400" />
          ) : (
            <Copy size={16} className="text-slate-300" />
          )}
        </button>
      </div>
      <pre className="bg-slate-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
        <code className="text-sm text-slate-100 font-mono">{code}</code>
      </pre>
    </div>
  );
};

const MediaViewer: React.FC<{ images?: string[]; videos?: string[] }> = ({
  images,
  videos,
}) => {
  if (!images?.length && !videos?.length) return null;

  return (
    <div className="space-y-4">
      {images && images.length > 0 && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Image size={16} />
            Images
          </h6>
          <div className="grid grid-cols-2 gap-2">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Screenshot ${idx + 1}`}
                className="rounded-lg border border-slate-200 dark:border-slate-700"
              />
            ))}
          </div>
        </div>
      )}
      {videos && videos.length > 0 && (
        <div className="space-y-2">
          <h6 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Video size={16} />
            Vidéos
          </h6>
          {videos.map((video, idx) => (
            <video
              key={idx}
              controls
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <source src={video} />
            </video>
          ))}
        </div>
      )}
    </div>
  );
};

const ErrorCard: React.FC<{
  error: TroubleshootingItem;
  solution: Solution;
}> = ({ error, solution }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="mt-1 flex-shrink-0">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <AlertCircle size={20} className="text-red-600 dark:text-red-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {error.title}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate font-mono">
            {error.error.split("\n")[0]}
          </p>
        </div>
        <div className="flex-shrink-0 mt-2">
          {expanded ? (
            <ChevronDown size={20} className="text-slate-400" />
          ) : (
            <ChevronRight size={20} className="text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700 space-y-6">
          <div>
            <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Erreur complète
            </h5>
            <CodeBlock code={error.error} language="text" />
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle
                size={18}
                className="text-emerald-600 dark:text-emerald-500"
              />
              <h5 className="text-sm font-semibold text-emerald-900 dark:text-emerald-400">
                Solution
              </h5>
            </div>

            <ol className="space-y-2 mb-4">
              {solution.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="text-sm text-slate-700 dark:text-slate-300 flex gap-3"
                >
                  <span className="font-semibold text-emerald-600 dark:text-emerald-500 flex-shrink-0">
                    {idx + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {solution.commands && solution.commands.length > 0 && (
              <div className="space-y-2 mb-4">
                {solution.commands.map((cmd, idx) => (
                  <CodeBlock key={idx} code={cmd} />
                ))}
              </div>
            )}

            <MediaViewer images={solution.images} videos={solution.videos} />

            {solution.notes && solution.notes.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h6 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-2">
                  Notes
                </h6>
                <ul className="space-y-1">
                  {solution.notes.map((note, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-blue-800 dark:text-blue-300"
                    >
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InstallGuide: React.FC<{ guide: InstallGuideData }> = ({ guide }) => {
  const Icon = guide.icon;
  const colors = colorClasses[guide.color];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}
        >
          <Icon size={24} className={colors.icon} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {guide.title}
        </h2>
      </div>

      <div className="space-y-6">
        {guide.steps.map((step, idx) => (
          <div key={idx} className="flex gap-6">
            <div className="flex-shrink-0">
              <div
                className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center ${colors.text} font-bold`}
              >
                {idx + 1}
              </div>
            </div>
            <div className="flex-1 pb-6 border-b border-slate-200 dark:border-slate-700 last:border-0">
              <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {step.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {step.content}
              </p>
              {step.commands && step.commands.length > 0 && (
                <div className="space-y-2 mb-4">
                  {step.commands.map((cmd, cmdIdx) => (
                    <CodeBlock key={cmdIdx} code={cmd} />
                  ))}
                </div>
              )}
              <MediaViewer images={step.images} videos={step.videos} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{
  item: NavItem;
  activeTab: string;
  setActiveTab: (id: string) => void;
  level?: number;
}> = ({ item, activeTab, setActiveTab, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;
  const isActive = activeTab === item.id;
  const colors = colorClasses[item.color];

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else {
            setActiveTab(item.id);
          }
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
          isActive
            ? colors.active
            : `text-slate-700 dark:text-slate-300 ${colors.hover}`
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        <Icon size={18} className="flex-shrink-0" />
        <span className="flex-1 font-medium text-sm">{item.label}</span>
        {hasChildren &&
          (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
      </button>
      {hasChildren && expanded && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function HelloGuide() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allErrors = useMemo(() => {
    return [...troubleshootingData.postgresql, ...troubleshootingData.odoo];
  }, []);

  const filteredErrors = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return allErrors.filter(
      (error) =>
        error.title.toLowerCase().includes(query) ||
        error.error.toLowerCase().includes(query) ||
        error.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery, allErrors]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const getCurrentContent = () => {
    if (filteredErrors) {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Résultats de recherche
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {filteredErrors.length} résultat
              {filteredErrors.length > 1 ? "s" : ""} pour "{searchQuery}"
            </p>
          </div>

          {filteredErrors.length > 0 ? (
            <div className="space-y-4">
              {filteredErrors.map((item) => (
                <ErrorCard
                  key={item.id}
                  error={item}
                  solution={item.solution}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                Aucun résultat trouvé
              </p>
            </div>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-12 min-w-full max-w-[1200px]">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Guide PostgreSQL & Odoo
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Documentation complète pour installer et configurer PostgreSQL
                18 et Odoo 19 sur Windows.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                  <img
                    src="https://www.postgresql.org/media/img/about/press/elephant.png"
                    alt="PostgreSQL Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  PostgreSQL 18
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Système de gestion de base de données relationnelle open
                  source
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-white dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                  <img
                    src="./odoo.png"
                    alt="Odoo Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Odoo 19
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Suite d'applications de gestion d'entreprise open source
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Démarrage rapide
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { text: "Installer PostgreSQL 18", color: "blue" as const },
                  {
                    text: "Créer l'utilisateur openpg",
                    color: "yellow" as const,
                  },
                  { text: "Installer Odoo 19", color: "orange" as const },
                  { text: "Créer la base de données", color: "red" as const },
                ].map((step, idx) => {
                  const colors = colorClasses[step.color];
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 ${colors.bg} rounded-lg p-4`}
                    >
                      <div
                        className={`w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center ${colors.text} font-bold flex-shrink-0`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {step.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "install-pg":
        return <InstallGuide guide={installGuides.postgresql} />;

      case "install-odoo":
        return <InstallGuide guide={installGuides.odoo} />;

      case "troubleshoot-pg":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Dépannage PostgreSQL
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Solutions aux erreurs courantes rencontrées lors de
                l'installation et l'utilisation de PostgreSQL.
              </p>
            </div>

            <div className="space-y-4">
              {troubleshootingData.postgresql.map((item) => (
                <ErrorCard
                  key={item.id}
                  error={item}
                  solution={item.solution}
                />
              ))}
            </div>
          </div>
        );

      case "troubleshoot-odoo":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Dépannage Odoo
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Solutions aux erreurs courantes rencontrées lors de
                l'installation et l'utilisation d'Odoo.
              </p>
            </div>

            <div className="space-y-4">
              {troubleshootingData.odoo.map((item) => (
                <ErrorCard
                  key={item.id}
                  error={item}
                  solution={item.solution}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X size={20} className="text-slate-900 dark:text-slate-100" />
                ) : (
                  <Menu
                    size={20}
                    className="text-slate-900 dark:text-slate-100"
                  />
                )}
              </button>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Hello Guide
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-48 sm:w-64">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                />
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {darkMode ? (
                  <Sun size={20} className="text-slate-300" />
                ) : (
                  <Moon size={20} className="text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <aside
          className={`
          fixed lg:sticky top-16 left-0 bottom-0 z-40 h-[calc(100vh-4rem)]
          w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6
          transition-transform lg:translate-x-0 overflow-y-auto flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <nav className="space-y-1">
            {navigation.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                activeTab={activeTab}
                setActiveTab={(id) => {
                  setActiveTab(id);
                  setSidebarOpen(false);
                  setSearchQuery("");
                }}
              />
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:min-w-[1200px] min-w-0 px-4 sm:px-6 lg:px-12 py-8">
          {getCurrentContent()}
        </main>
      </div>
    </div>
  );
}

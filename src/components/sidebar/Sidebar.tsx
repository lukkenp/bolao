import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Calculator, Star, Shuffle } from 'lucide-react';

type SidebarLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
};

const SidebarLink = ({ to, icon, label, active }: SidebarLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors",
        active && "bg-sidebar-accent font-medium"
      )}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside className="w-64 bg-sidebar border-r border-border h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Bolão Online</h2>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <SidebarLink
          to="/dashboard"
          icon={<span>📊</span>}
          label="Dashboard"
          active={location.pathname === '/dashboard'}
        />
        <SidebarLink
          to="/my-pools"
          icon={<span>🎲</span>}
          label="Meus Bolões"
          active={location.pathname === '/my-pools'}
        />
        <SidebarLink
          to="/simulador"
          icon={<Calculator className="h-4 w-4" />}
          label="Simulador"
          active={location.pathname === '/simulador'}
        />
        <SidebarLink
          to="/gerador-jogos"
          icon={<Shuffle className="h-4 w-4" />}
          label="Gerador de Jogos"
          active={location.pathname === '/gerador-jogos'}
        />
        <SidebarLink
          to="/favoritos"
          icon={<Star className="h-4 w-4" />}
          label="Favoritos"
          active={location.pathname === '/favoritos'}
        />
      </nav>

      <div className="p-4 mt-auto border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
              <User className="mr-2 h-4 w-4" />
              <span>{user?.email}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

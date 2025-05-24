import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

// Páginas
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import MyPools from "@/pages/MyPools";
import PoolDetail from "@/pages/PoolDetail";
import SearchResults from "@/pages/SearchResults";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Simulador from "@/pages/Simulador";
import FavoriteTickets from "@/pages/FavoriteTickets";
import GeradorJogos from "@/pages/GeradorJogos";

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<SearchResults />} />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/my-pools"
              element={
                <AuthGuard>
                  <MyPools />
                </AuthGuard>
              }
            />
            <Route
              path="/pool/:id"
              element={
                <AuthGuard>
                  <PoolDetail />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              }
            />
            <Route path="/simulador" element={<Simulador />} />
            <Route
              path="/favoritos"
              element={
                <AuthGuard>
                  <FavoriteTickets />
                </AuthGuard>
              }
            />
            <Route
              path="/gerador-jogos"
              element={
                <AuthGuard>
                  <GeradorJogos />
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sparkles, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#b38728] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="font-cinzel font-bold text-xl text-white group-hover:text-gold-gradient transition-all">
              InviteAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/#features" 
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
              data-testid="nav-features"
            >
              Features
            </Link>
            <Link 
              to="/#pricing" 
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
              data-testid="nav-pricing"
            >
              Pricing
            </Link>
            <Link 
              to="/#gallery" 
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
              data-testid="nav-gallery"
            >
              Gallery
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/create')}
                  className="btn-gold rounded-full px-6"
                  data-testid="nav-create-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create New
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-2 hover:bg-white/5 rounded-full p-1 pr-3 transition-colors"
                      data-testid="nav-user-menu"
                    >
                      {user.picture ? (
                        <img 
                          src={user.picture} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full border border-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-white/80 text-sm font-medium hidden lg:block">
                        {user.name?.split(' ')[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#171717] border-white/10">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-white/60">{user.email}</p>
                      {user.is_founding_member && (
                        <span className="inline-block mt-1 text-xs bg-gradient-to-r from-[#bf953f] to-[#b38728] text-black px-2 py-0.5 rounded-full font-medium">
                          Founding Member
                        </span>
                      )}
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/dashboard')}
                      className="cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/5"
                      data-testid="nav-dashboard-link"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-white/5"
                      data-testid="nav-logout-btn"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={login}
                  className="text-white/80 hover:text-white hover:bg-white/5"
                  data-testid="nav-signin-btn"
                >
                  Sign In
                </Button>
                <Button
                  onClick={login}
                  className="btn-gold rounded-full px-6"
                  data-testid="nav-start-free-btn"
                >
                  Start Free
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white"
            data-testid="nav-mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5">
          <div className="px-4 py-4 space-y-4">
            <Link 
              to="/#features" 
              className="block text-white/70 hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/#pricing" 
              className="block text-white/70 hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/#gallery" 
              className="block text-white/70 hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </Link>

            {user ? (
              <>
                <Button
                  onClick={() => {
                    navigate('/create');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full btn-gold rounded-full"
                  data-testid="nav-mobile-create-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create New
                </Button>
                <Button
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/5"
                  data-testid="nav-mobile-dashboard-btn"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="w-full text-red-400 hover:text-red-300 hover:bg-white/5"
                  data-testid="nav-mobile-logout-btn"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  login();
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-gold rounded-full"
                data-testid="nav-mobile-signin-btn"
              >
                Sign In Free
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

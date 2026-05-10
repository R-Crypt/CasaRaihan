
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { auth, RoomAPI, BookingAPI, BlockedDateAPI, SettingsAPI, CoreAPI } from '@/api';
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, LogOut, User, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const userData = await auth.me();
          setUser(userData);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="text-2xl font-light tracking-widest text-gray-800 hover:text-amber-700 transition-colors">
              CASA RAIHAN
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to={createPageUrl('Home')} 
                className={`text-sm tracking-wide transition-colors ${
                  currentPageName === 'Home' ? 'text-amber-700 font-medium' : 'text-gray-600 hover:text-amber-700'
                }`}
              >
                HOME
              </Link>
              <Link 
                to={createPageUrl('Rooms')} 
                className={`text-sm tracking-wide transition-colors ${
                  currentPageName === 'Rooms' ? 'text-amber-700 font-medium' : 'text-gray-600 hover:text-amber-700'
                }`}
              >
                ROOMS
              </Link>
              <Link 
                to={createPageUrl('Profile')} 
                className={`text-sm tracking-wide transition-colors ${
                  currentPageName === 'Profile' ? 'text-amber-700 font-medium' : 'text-gray-600 hover:text-amber-700'
                }`}
              >
                PROFILE
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to={createPageUrl('AdminDashboard')} 
                  className={`text-sm tracking-wide transition-colors ${
                    currentPageName === 'AdminDashboard' ? 'text-amber-700 font-medium' : 'text-gray-600 hover:text-amber-700'
                  }`}
                >
                  ADMIN
                </Link>
              )}
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="w-4 h-4" />
                      <span>{user?.full_name || 'Account'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Profile')}>
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => auth.redirectToLogin()}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  Login
                </Button>
              )}
              
              <Link to={createPageUrl('Rooms')}>
                <Button className="bg-amber-700 hover:bg-amber-800 text-white">
                  Book Now
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-800" />
              ) : (
                <Menu className="w-6 h-6 text-gray-800" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t pt-4">
              <Link 
                to={createPageUrl('Home')} 
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm tracking-wide transition-colors py-2 ${
                  currentPageName === 'Home' ? 'text-amber-700 font-medium' : 'text-gray-600'
                }`}
              >
                HOME
              </Link>
              <Link 
                to={createPageUrl('Rooms')} 
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm tracking-wide transition-colors py-2 ${
                  currentPageName === 'Rooms' ? 'text-amber-700 font-medium' : 'text-gray-600'
                }`}
              >
                ROOMS
              </Link>
              <Link 
                to={createPageUrl('Profile')} 
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm tracking-wide transition-colors py-2 ${
                  currentPageName === 'Profile' ? 'text-amber-700 font-medium' : 'text-gray-600'
                }`}
              >
                PROFILE
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to={createPageUrl('AdminDashboard')} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-sm tracking-wide transition-colors py-2 ${
                    currentPageName === 'AdminDashboard' ? 'text-amber-700 font-medium' : 'text-gray-600'
                  }`}
                >
                  ADMIN
                </Link>
              )}
              
              <div className="pt-3 border-t space-y-3">
                {isAuthenticated ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        window.location.href = createPageUrl('Profile');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4" />
                      {user?.full_name || 'My Profile'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      auth.redirectToLogin();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4" />
                    Login
                  </Button>
                )}
                
                <Link to={createPageUrl('Rooms')} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-light tracking-widest mb-4">CASA RAIHAN</h3>
              <p className="text-gray-400 leading-relaxed">
                A boutique homestay in the heart of Coorg, blending plantation life with warm hospitality.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-amber-500">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Virajpet, Coorg, Karnataka, India</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span>+91 9480083984</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span>rayaankhaaan@gmail.com</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-amber-500">Quick Links</h4>
              <div className="space-y-2">
                <Link to={createPageUrl('Home')} className="block text-gray-400 hover:text-amber-500 transition-colors">
                  Home
                </Link>
                <Link to={createPageUrl('Rooms')} className="block text-gray-400 hover:text-amber-500 transition-colors">
                  Rooms
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-amber-500">Legal</h4>
              <div className="space-y-2">
                <Link to={createPageUrl('PrivacyPolicy')} className="block text-gray-400 hover:text-amber-500 transition-colors">
                  Privacy Policy
                </Link>
                <Link to={createPageUrl('TermsAndConditions')} className="block text-gray-400 hover:text-amber-500 transition-colors">
                  Terms & Conditions
                </Link>
                <Link to={createPageUrl('RefundPolicy')} className="block text-gray-400 hover:text-amber-500 transition-colors">
                  Refund Policy
                </Link>
                <Link to={createPageUrl('CookiePolicy')} className="block text-gray-400 hover:text-amber-500 transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Casa Raihan Homestay. All rights reserved.</p>
            <p className="mt-2">Hosted by BK - Coffee Planter turned Entrepreneur</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Utensils, Bell, Compass, BookOpen, Home as HomeIcon, ShoppingBag, Waves, Sparkles } from 'lucide-react';
import WelcomeCard from './features/welcome/WelcomeCard';
import WifiQuickConnect from './features/welcome/WifiQuickConnect';
import StatusWidget from './features/status/StatusWidget';
import TideWidget from './features/status/TideWidget';
import MenuCatalog from './features/menu/MenuCatalog';
import OrderDrawer from './features/menu/OrderDrawer';
import QuickActionButtons from './features/requests/QuickActionButtons';
import LocalGuideGrid from './features/guide/LocalGuideGrid';
import RulesAccordion from './features/rules/RulesAccordion';
import GlobalSearchBar from './features/search/GlobalSearchBar';
import BreakfastMusicVote from './features/breakfast-music/BreakfastMusicVote';
import BreakfastMenuCustomizer from './features/breakfast-menu/BreakfastMenuCustomizer';
import RoomDeliveryCatalog from './features/delivery/RoomDeliveryCatalog';
import ConvenienceCatalog from './features/delivery/ConvenienceCatalog';
import ToursSection from './features/tours/ToursSection';
import LaundryRequest from './features/laundry/LaundryRequest';
import BeachRentalRequest from './features/beach-rental/BeachRentalRequest';
import DivingRentalRequest from './features/diving-rental/DivingRentalRequest';
import Toast from './shared/components/Toast';

import { resolveCurrentRoom, saveStoredRoomNumber } from './shared/utils/roomDetector';
import { resolveGuestSession, saveGuestSession } from './shared/utils/guestSession';
import { addToCart, removeFromCart, updateCartItemQuantity } from './shared/utils/cartService';
import { assetUrl } from './shared/utils/assetPath';
import i18nData from './data/json/i18n.json';
import settings from './data/json/settings.json';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [guestSession, setGuestSession] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('04');
  const [currentLang, setCurrentLang] = useState('pt');
  const [activeTab, setActiveTab] = useState('home');
  
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: '', type: 'success' });

  useEffect(() => {
    // 1. Resolve sessão do hóspede via URL / token / storage
    const session = resolveGuestSession();
    setGuestSession(session);

    // 2. Resolve quarto prioritário
    const room = session?.room || resolveCurrentRoom();
    setCurrentRoom(room);

    // 3. Registra Service Worker para PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(assetUrl('/sw.js')).catch(err => console.log('SW registration failed:', err));
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleRoomChange = (newRoom) => {
    setCurrentRoom(newRoom);
    saveStoredRoomNumber(newRoom);
    if (guestSession) {
      const updated = { ...guestSession, room: newRoom };
      setGuestSession(updated);
      saveGuestSession(updated);
    }
    showToast(`Acomodação atualizada para: ${newRoom}`, 'info');
  };

  const showToast = (message, type = 'success') => {
    setToastInfo({ message, type });
  };

  const handleAddToCart = (item, quantity = 1, notes = '') => {
    setCartItems(prev => addToCart(prev, item, quantity, notes));
  };

  const handleUpdateCartQty = (index, newQty) => {
    setCartItems(prev => updateCartItemQuantity(prev, index, newQty));
  };

  const handleRemoveCartItem = (index) => {
    setCartItems(prev => removeFromCart(prev, index));
  };

  // Helper i18n
  const t = (key) => {
    const langObj = i18nData[currentLang] || i18nData.pt;
    return langObj[key] || i18nData.pt[key] || key;
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="app-container">
      {/* Toast Popup */}
      <Toast
        message={toastInfo.message}
        type={toastInfo.type}
        onClose={() => setToastInfo({ message: '', type: 'success' })}
      />

      {/* App Top Header com Visual Boutique */}
      <header className="app-header glass-panel">
        <img src={assetUrl('/images/pousada_header.jpg')} alt="Pousada Mar de Moreré" className="hero-banner-img" />
        <div className="hero-overlay">
          <div>
            <h1 className="hero-brand-title">{settings.pousadaName}</h1>
            <p className="hero-brand-sub">
              {guestSession?.guestName && guestSession.guestName !== 'Hóspede' ? `${guestSession.guestName} • ` : ''}
              {currentRoom.startsWith('Quarto') || currentRoom.startsWith('Chalé') ? currentRoom : `Quarto ${currentRoom}`}
            </p>
          </div>

          <button className="btn-theme-toggle" onClick={toggleTheme} title="Alternar Tema">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
          </button>
        </div>
      </header>

      {/* Pesquisa Global Indexada */}
      <GlobalSearchBar
        onAddToCart={handleAddToCart}
        onShowToast={showToast}
        t={t}
      />

      {/* Conteúdo Dinâmico por Aba ou Visão Geral */}
      {activeTab === 'home' && (
        <>
          <WelcomeCard
            currentRoom={currentRoom}
            onRoomChange={handleRoomChange}
            currentLang={currentLang}
            onLangChange={setCurrentLang}
            guestSession={guestSession}
            t={t}
          />

          {/* Tábua de Marés & Fase da Lua em Moreré */}
          <TideWidget t={t} />

          <WifiQuickConnect
            onShowToast={showToast}
            t={t}
          />

          <StatusWidget t={t} />

          <QuickActionButtons
            currentRoom={currentRoom}
            onShowToast={showToast}
            t={t}
          />

          <ConvenienceCatalog
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
            t={t}
          />

          <MenuCatalog
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
            cartCount={totalCartCount}
            onOpenCart={() => setIsCartOpen(true)}
          />

          <BreakfastMusicVote onShowToast={showToast} />

          <BreakfastMenuCustomizer currentRoom={currentRoom} onShowToast={showToast} />

          <RoomDeliveryCatalog currentRoom={currentRoom} onShowToast={showToast} />

          <ToursSection currentRoom={currentRoom} onShowToast={showToast} />

          <LaundryRequest currentRoom={currentRoom} onShowToast={showToast} />

          <BeachRentalRequest currentRoom={currentRoom} onShowToast={showToast} />

          <DivingRentalRequest currentRoom={currentRoom} onShowToast={showToast} />

          <LocalGuideGrid t={t} />

          <RulesAccordion t={t} />
        </>
      )}

      {activeTab === 'menu' && (
        <>
          <MenuCatalog
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
            cartCount={totalCartCount}
            onOpenCart={() => setIsCartOpen(true)}
          />
          <BreakfastMenuCustomizer currentRoom={currentRoom} onShowToast={showToast} />
        </>
      )}

      {activeTab === 'convenience' && (
        <>
          <ConvenienceCatalog
            onAddToCart={handleAddToCart}
            onShowToast={showToast}
            t={t}
          />
          <RoomDeliveryCatalog currentRoom={currentRoom} onShowToast={showToast} />
          <BeachRentalRequest currentRoom={currentRoom} onShowToast={showToast} />
          <DivingRentalRequest currentRoom={currentRoom} onShowToast={showToast} />
        </>
      )}

      {activeTab === 'tides' && (
        <>
          <TideWidget t={t} />
          <ToursSection currentRoom={currentRoom} onShowToast={showToast} />
          <LocalGuideGrid t={t} />
        </>
      )}

      {activeTab === 'requests' && (
        <>
          <QuickActionButtons
            currentRoom={currentRoom}
            onShowToast={showToast}
            t={t}
          />
          <WifiQuickConnect
            onShowToast={showToast}
            t={t}
          />
          <LaundryRequest currentRoom={currentRoom} onShowToast={showToast} />
        </>
      )}

      {activeTab === 'rules' && (
        <>
          <RulesAccordion t={t} />
          <StatusWidget t={t} />
        </>
      )}

      {/* Drawer de Carrinho / Comanda */}
      <OrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        currentRoom={currentRoom}
        onShowToast={showToast}
        t={t}
      />

      {/* Barra de Navegação Inferior (Mobile Bottom Nav Bar) */}
      <nav className="bottom-nav-bar">
        <button
          className={`nav-item-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <HomeIcon size={20} />
          <span>Início</span>
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <Utensils size={20} />
          <span>Cardápio</span>
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'convenience' ? 'active' : ''}`}
          onClick={() => setActiveTab('convenience')}
        >
          <ShoppingBag size={20} />
          <span>Praia & Loja</span>
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'tides' ? 'active' : ''}`}
          onClick={() => setActiveTab('tides')}
        >
          <Waves size={20} />
          <span>Marés & Tour</span>
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <Bell size={20} />
          <span>Quarto</span>
        </button>

        {totalCartCount > 0 && (
          <button
            className="nav-item-btn comanda-active-btn"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={20} className="text-amber" />
            <span className="badge-counter-pill">{totalCartCount}</span>
          </button>
        )}
      </nav>
    </div>
  );
}

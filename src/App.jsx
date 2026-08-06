import React, { useState, useEffect } from 'react';
import { Sun, Moon, Utensils, Bell, Compass, BookOpen, Home as HomeIcon, Phone, ShoppingBag } from 'lucide-react';
import WelcomeCard from './features/welcome/WelcomeCard';
import WifiQuickConnect from './features/welcome/WifiQuickConnect';
import StatusWidget from './features/status/StatusWidget';
import MenuCatalog from './features/menu/MenuCatalog';
import OrderDrawer from './features/menu/OrderDrawer';
import QuickActionButtons from './features/requests/QuickActionButtons';
import LocalGuideGrid from './features/guide/LocalGuideGrid';
import RulesAccordion from './features/rules/RulesAccordion';
import GlobalSearchBar from './features/search/GlobalSearchBar';
import BreakfastMusicVote from './features/breakfast-music/BreakfastMusicVote';
import BreakfastMenuCustomizer from './features/breakfast-menu/BreakfastMenuCustomizer';
import RoomDeliveryCatalog from './features/delivery/RoomDeliveryCatalog';
import ToursSection from './features/tours/ToursSection';
import LaundryRequest from './features/laundry/LaundryRequest';
import BeachRentalRequest from './features/beach-rental/BeachRentalRequest';
import DivingRentalRequest from './features/diving-rental/DivingRentalRequest';
import Toast from './shared/components/Toast';

import { resolveCurrentRoom, saveStoredRoomNumber } from './shared/utils/roomDetector';
import { addToCart, removeFromCart, updateCartItemQuantity } from './shared/utils/cartService';
import { assetUrl } from './shared/utils/assetPath';
import i18nData from './data/json/i18n.json';
import settings from './data/json/settings.json';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentRoom, setCurrentRoom] = useState('04');
  const [currentLang, setCurrentLang] = useState('pt');
  const [activeTab, setActiveTab] = useState('home');
  
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const room = resolveCurrentRoom();
    setCurrentRoom(room);

    // Registra Service Worker para PWA
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
    showToast(`Quarto atualizado para Quarto ${newRoom}`, 'info');
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

      {/* App Top Header */}
      <header className="app-header glass-panel">
        <img src={assetUrl('/images/pousada_header.jpg')} alt="Pousada Mar & Sol" className="hero-banner-img" />
        <div className="hero-overlay">
          <div>
            <h1 className="hero-brand-title">{settings.pousadaName}</h1>
            <p className="hero-brand-sub">Portal do Hóspede • Quarto {currentRoom}</p>
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
            t={t}
          />

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
        <MenuCatalog
          onAddToCart={handleAddToCart}
          onShowToast={showToast}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {activeTab === 'requests' && (
        <QuickActionButtons
          currentRoom={currentRoom}
          onShowToast={showToast}
          t={t}
        />
      )}

      {activeTab === 'guide' && (
        <LocalGuideGrid t={t} />
      )}

      {activeTab === 'rules' && (
        <RulesAccordion t={t} />
      )}

      {/* Drawer de Carrinho de Room Service */}
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
          className={`nav-item-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <Bell size={20} />
          <span>Quarto</span>
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          <Compass size={20} />
          <span>Guia</span>
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <BookOpen size={20} />
          <span>Regras</span>
        </button>

        {totalCartCount > 0 && (
          <button
            className="nav-item-btn text-amber-400"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={20} />
            <span>Comanda ({totalCartCount})</span>
          </button>
        )}
      </nav>
    </div>
  );
}

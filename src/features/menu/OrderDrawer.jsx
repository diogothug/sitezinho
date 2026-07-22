import React, { useState } from 'react';
import { ShoppingBag, Trash2, Send, X, CreditCard } from 'lucide-react';
import { calculateCartTotal } from '../../shared/utils/cartService';
import { formatRoomOrderMessage, buildWhatsAppLink } from '../../shared/utils/whatsappFormatter';
import settings from '../../data/json/settings.json';

export default function OrderDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, currentRoom, onShowToast, t }) {
  const [paymentMethod, setPaymentMethod] = useState('Cobrar na Comanda do Quarto');
  const [generalNotes, setGeneralNotes] = useState('');

  if (!isOpen) return null;

  const total = calculateCartTotal(cartItems);

  const handleSendWhatsAppOrder = () => {
    if (cartItems.length === 0) {
      if (onShowToast) onShowToast('Seu carrinho está vazio!', 'error');
      return;
    }

    const message = formatRoomOrderMessage({
      roomNumber: currentRoom,
      items: cartItems,
      total,
      paymentOption: paymentMethod,
      generalNotes
    });

    const waLink = buildWhatsAppLink(settings.whatsappNumber, message);
    window.open(waLink, '_blank');
    if (onShowToast) onShowToast('Pedido formatado e enviado ao WhatsApp!', 'success');
  };

  return (
    <div className="drawer-backdrop fade-in" onClick={onClose}>
      <div className="drawer-panel slide-left glass-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-amber-400" size={20} />
            <h3 className="drawer-title">{t('cartTitle')}</h3>
          </div>
          <button className="btn-close-drawer" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-room-banner">
            <span>Quarto Selecionado: <strong>Quarto {currentRoom}</strong></span>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingBag size={48} className="empty-icon" />
              <p>{t('cartEmpty')}</p>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item-row">
                  <div className="cart-item-info">
                    <h5 className="cart-item-name">{item.title}</h5>
                    {item.notes && <p className="cart-item-notes">└ {item.notes}</p>}
                    <span className="cart-item-price">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  <div className="cart-item-qty-actions">
                    <div className="mini-qty">
                      <button onClick={() => onUpdateQuantity(index, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(index, item.quantity + 1)}>+</button>
                    </div>

                    <button 
                      className="btn-remove-item"
                      onClick={() => onRemoveItem(index)}
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="cart-options-section">
              <label htmlFor="paymentMethod" className="option-label">
                <CreditCard size={16} /> Forma de Pagamento:
              </label>
              <select
                id="paymentMethod"
                className="select-payment"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="Cobrar na Comanda do Quarto">Cobrar no Quarto (Check-out)</option>
                <option value="PIX / Cartão na Entrega">PIX ou Cartão na Entrega</option>
                <option value="Dinheiro">Dinheiro na Entrega</option>
              </select>

              <label htmlFor="genNotes" className="option-label">Instruções de Entrega:</label>
              <input
                id="genNotes"
                type="text"
                className="input-delivery-notes"
                placeholder="Ex: Entregar na área da piscina, bater 2 vezes..."
                value={generalNotes}
                onChange={e => setGeneralNotes(e.target.value)}
              />
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-total-row">
              <span>{t('total')}:</span>
              <span className="total-amount">R$ {total.toFixed(2)}</span>
            </div>

            <button className="btn-send-whatsapp btn-glow" onClick={handleSendWhatsAppOrder}>
              <Send size={18} />
              <span>{t('sendOrder')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

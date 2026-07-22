import { describe, it, expect } from 'vitest';
import { addToCart, removeFromCart, updateCartItemQuantity, calculateCartTotal } from '../../shared/utils/cartService';

describe('Apple-Style Test Suite: cartService (Carrinho & Cálculo de Comanda)', () => {
  const item1 = { id: 'm1', title: 'Tapioca', price: 20.0 };
  const item2 = { id: 'm2', title: 'Suco', price: 10.0 };

  it('deve adicionar um item ao carrinho vazio', () => {
    const cart = addToCart([], item1, 1, 'sem açúcar');
    expect(cart.length).toBe(1);
    expect(cart[0].title).toBe('Tapioca');
    expect(cart[0].quantity).toBe(1);
    expect(cart[0].notes).toBe('sem açúcar');
  });

  it('deve incrementar a quantidade se o mesmo item com as mesmas observações for adicionado novamente', () => {
    let cart = addToCart([], item1, 1, 'sem manteiga');
    cart = addToCart(cart, item1, 2, 'sem manteiga');
    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(3);
  });

  it('deve tratar como itens separados se as observações forem diferentes', () => {
    let cart = addToCart([], item1, 1, 'sem manteiga');
    cart = addToCart(cart, item1, 1, 'com manteiga extra');
    expect(cart.length).toBe(2);
  });

  it('deve calcular corretamente o valor total do carrinho', () => {
    let cart = addToCart([], item1, 2); // 2 * 20 = 40
    cart = addToCart(cart, item2, 3); // 3 * 10 = 30
    expect(calculateCartTotal(cart)).toBe(70.0);
  });

  it('deve remover item quando a quantidade é atualizada para 0', () => {
    let cart = addToCart([], item1, 1);
    cart = updateCartItemQuantity(cart, 0, 0);
    expect(cart.length).toBe(0);
  });
});

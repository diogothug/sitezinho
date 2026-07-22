/**
 * Gerenciador de carrinho de compras / comanda para o Room Service.
 */

export function addToCart(cartItems, menuItem, quantity = 1, notes = '') {
  const existingIndex = cartItems.findIndex(i => i.id === menuItem.id && (i.notes || '') === (notes || ''));

  if (existingIndex > -1) {
    const updated = [...cartItems];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + quantity
    };
    return updated;
  }

  return [
    ...cartItems,
    {
      id: menuItem.id,
      title: menuItem.title,
      price: menuItem.price,
      quantity,
      notes
    }
  ];
}

export function removeFromCart(cartItems, itemIndex) {
  return cartItems.filter((_, idx) => idx !== itemIndex);
}

export function updateCartItemQuantity(cartItems, itemIndex, newQuantity) {
  if (newQuantity <= 0) {
    return removeFromCart(cartItems, itemIndex);
  }
  const updated = [...cartItems];
  updated[itemIndex] = {
    ...updated[itemIndex],
    quantity: newQuantity
  };
  return updated;
}

export function calculateCartTotal(cartItems) {
  if (!Array.isArray(cartItems)) return 0;
  return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

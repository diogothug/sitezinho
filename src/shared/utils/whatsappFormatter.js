/**
 * Formata mensagens para o WhatsApp da Recepção de maneira organizada e profissional.
 */

export function formatRoomOrderMessage({ roomNumber, items, total, paymentOption = 'Cobrar na Conta do Quarto', generalNotes = '' }) {
  const room = roomNumber || 'Não Informado';
  let msg = `*--- 🍽️ PEDIDO DE ROOM SERVICE ---*\n`;
  msg += `*Quarto:* ${room}\n\n`;

  msg += `*ITENS:* \n`;
  items.forEach((item, index) => {
    msg += `${index + 1}. *${item.quantity}x ${item.title}* - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    if (item.notes && item.notes.trim()) {
      msg += `   └ _Obs: ${item.notes.trim()}_\n`;
    }
  });

  msg += `\n*TOTAL:* R$ ${total.toFixed(2)}\n`;
  msg += `*Forma de Pagamento:* ${paymentOption}\n`;

  if (generalNotes && generalNotes.trim()) {
    msg += `*Observação Geral:* ${generalNotes.trim()}\n`;
  }

  msg += `\n_Enviado através do Portal Digital do Hóspede_`;

  return msg;
}

export function formatGuestRequestMessage({ roomNumber, requestType, customDetails = '' }) {
  const room = roomNumber || 'Não Informado';
  let msg = `*--- 🛎️ SOLICITAÇÃO DO HÓSPEDE ---*\n`;
  msg += `*Quarto:* ${room}\n`;
  msg += `*Solicitação:* ${requestType}\n`;

  if (customDetails && customDetails.trim()) {
    msg += `*Detalhes:* ${customDetails.trim()}\n`;
  }

  msg += `\n_Aguardando confirmação da recepção._`;
  return msg;
}

export function buildWhatsAppLink(phoneNumber, message) {
  const cleanPhone = (phoneNumber || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

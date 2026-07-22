import { describe, it, expect } from 'vitest';
import { formatRoomOrderMessage, formatGuestRequestMessage, buildWhatsAppLink } from '../../shared/utils/whatsappFormatter';

describe('Apple-Style Test Suite: whatsappFormatter (Formatação Estruturada de Comunicação)', () => {
  describe('Especificação: Formatação de pedido de room service', () => {
    it('deve gerar mensagem estruturada com número do quarto, lista de itens e total', () => {
      const payload = {
        roomNumber: '05',
        items: [
          { title: 'Tapioca da Terra', price: 24.0, quantity: 2, notes: 'sem manteiga' },
          { title: 'Água de Coco', price: 10.0, quantity: 1, notes: '' }
        ],
        total: 58.0,
        paymentOption: 'Cobrar no Quarto'
      };

      const formatted = formatRoomOrderMessage(payload);

      expect(formatted).toContain('*Quarto:* 05');
      expect(formatted).toContain('2x Tapioca da Terra');
      expect(formatted).toContain('sem manteiga');
      expect(formatted).toContain('*TOTAL:* R$ 58.00');
      expect(formatted).toContain('Cobrar no Quarto');
    });
  });

  describe('Especificação: Formatação de solicitações rápidas do quarto', () => {
    it('deve formatar pedido de toalha extra com clareza para a recepção', () => {
      const formatted = formatGuestRequestMessage({
        roomNumber: '12',
        requestType: 'Toalhas de Banho Extras',
        customDetails: 'Favor trazer 2 toalhas de rosto também.'
      });

      expect(formatted).toContain('*Quarto:* 12');
      expect(formatted).toContain('Toalhas de Banho Extras');
      expect(formatted).toContain('Favor trazer 2 toalhas de rosto também.');
    });
  });

  describe('Especificação: Construção de Link wa.me', () => {
    it('deve gerar URL do WhatsApp sanitizando caracteres não numéricos do telefone', () => {
      const url = buildWhatsAppLink('(73) 99988-7766', 'Olá Recepção');
      expect(url).toContain('https://wa.me/73999887766');
      expect(url).toContain('text=Ol%C3%A1%20Recep%C3%A7%C3%A3o');
    });
  });
});

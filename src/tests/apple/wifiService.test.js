import { describe, it, expect } from 'vitest';
import { getGuestWifiCredentials, formatWifiQrCodeData, validateWifiPassword } from '../../shared/utils/wifiService';

describe('Apple-Style Test Suite: wifiService (Conexão & Senha do Wi-Fi dos Hóspedes)', () => {
  it('deve retornar a senha configurada "bainema123" por padrão para os hóspedes', () => {
    const credentials = getGuestWifiCredentials();
    expect(credentials.password).toBe('bainema123');
    expect(credentials.network).toBe('Mar de Morere');
  });

  it('deve permitir sobrescrever configurações de Wi-Fi customizadas', () => {
    const customConfig = {
      wifi: {
        network: 'Rede VIP',
        password: 'bainema123',
        speed: '1Gbps'
      }
    };
    const credentials = getGuestWifiCredentials(customConfig);
    expect(credentials.network).toBe('Rede VIP');
    expect(credentials.password).toBe('bainema123');
    expect(credentials.speed).toBe('1Gbps');
  });

  it('deve formatar corretamente a string de QR Code Wi-Fi no padrão WPA', () => {
    const credentials = { network: 'Mar de Morere', password: 'bainema123' };
    const qrString = formatWifiQrCodeData(credentials);
    expect(qrString).toBe('WIFI:S:Mar de Morere;T:WPA;P:bainema123;;');
  });

  it('deve retornar string vazia se o nome da rede não for informado no QR Code', () => {
    const qrString = formatWifiQrCodeData({});
    expect(qrString).toBe('');
  });

  it('deve validar que a senha "bainema123" atende aos requisitos de segurança WPA', () => {
    const validation = validateWifiPassword('bainema123');
    expect(validation.isValid).toBe(true);
    expect(validation.message).toBe('Senha válida.');
  });

  it('deve rejeitar senhas com menos de 8 caracteres', () => {
    const validation = validateWifiPassword('12345');
    expect(validation.isValid).toBe(false);
    expect(validation.message).toContain('no mínimo 8 caracteres');
  });

  it('deve rejeitar senhas vazias ou nulas', () => {
    const validationEmpty = validateWifiPassword('');
    expect(validationEmpty.isValid).toBe(false);
    
    const validationNull = validateWifiPassword(null);
    expect(validationNull.isValid).toBe(false);
  });
});

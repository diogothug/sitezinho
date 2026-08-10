import settings from '../../data/json/settings.json';

/**
 * Obtém as credenciais de Wi-Fi configuradas para os hóspedes.
 * @param {Object} [customSettings] - Objeto de configurações opcional (fallback para settings.json)
 * @returns {{ network: string, password: string, speed: string }}
 */
export function getGuestWifiCredentials(customSettings = settings) {
  const wifiConfig = customSettings?.wifi || {};
  return {
    network: wifiConfig.network || 'Mar de Morere',
    password: wifiConfig.password || 'bainema123',
    speed: wifiConfig.speed || 'Fibra Óptica de Alta Velocidade'
  };
}

/**
 * Formata a string de conexão rápida para QR Code no padrão WPA/WPA2.
 * @param {{ network: string, password: string }} credentials
 * @returns {string} String formatada para leitores de QR Code Wi-Fi
 */
export function formatWifiQrCodeData(credentials) {
  const { network = '', password = '' } = credentials || {};
  if (!network) return '';
  return `WIFI:S:${network};T:WPA;P:${password};;`;
}

/**
 * Valida a senha do Wi-Fi de hóspedes.
 * @param {string} password - Senha a ser validada
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateWifiPassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'A senha não pode ser vazia.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'A senha do Wi-Fi WPA deve ter no mínimo 8 caracteres.' };
  }
  return { isValid: true, message: 'Senha válida.' };
}

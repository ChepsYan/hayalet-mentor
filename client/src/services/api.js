const API_BASE = '/api';

export const api = {
  // Get all characters
  async getCharacters() {
    const res = await fetch(`${API_BASE}/characters`);
    if (!res.ok) throw new Error('Karakterler yüklenemedi');
    return res.json();
  },

  // Get conversation history for a character
  async getHistory(characterId) {
    const res = await fetch(`${API_BASE}/history/${characterId}`);
    if (!res.ok) throw new Error('Geçmiş yüklenemedi');
    return res.json();
  },

  // Clear conversation history for a character
  async clearHistory(characterId) {
    const res = await fetch(`${API_BASE}/history/${characterId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Geçmiş temizlenemedi');
    return res.json();
  },

  // Send a message to a character
  async sendMessage(characterId, message) {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, message }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Bir hata oluştu');
    }
    
    return data;
  },
};

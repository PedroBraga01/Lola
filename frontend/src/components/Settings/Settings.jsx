import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Calendar, Save } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const [commuteTime, setCommuteTime] = useState(60);
  const [autoRoutine, setAutoRoutine] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Aqui vai no futuro o salvamento pro backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="hero-section">
        <h1 className="greeting">Configurações de Rotina</h1>
        <p className="subtitle">Ajuste como a Lola planeja seus dias.</p>
      </div>

      <div className="settings-grid">
        <div className="glass-card settings-card">
          <div className="card-header">
            <Bell className="card-icon" />
            <h2>Alarmes & Deslocamento</h2>
          </div>
          
          <div className="setting-group">
            <label>Tempo de antecedência (escola)</label>
            <p className="setting-desc">Quantos minutos a Lola deve começar a te acordar antes do horário que você precisa sair?</p>
            <div className="input-with-suffix">
              <input 
                type="number" 
                value={commuteTime} 
                onChange={(e) => setCommuteTime(e.target.value)} 
                min="10" 
                max="120" 
              />
              <span>minutos</span>
            </div>
          </div>
        </div>

        <div className="glass-card settings-card">
          <div className="card-header">
            <Calendar className="card-icon" />
            <h2>Automação da Grade</h2>
          </div>
          
          <div className="setting-group toggle-group">
            <div>
              <label>Rotina Autônoma</label>
              <p className="setting-desc">Permitir que a Lola agende alarmes de segunda a sexta baseados na sua grade escolar sem te perguntar.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={autoRoutine} 
                onChange={(e) => setAutoRoutine(e.target.checked)} 
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} />
          {saved ? 'Salvo!' : 'Salvar Preferências'}
        </button>
      </div>
    </div>
  );
}

import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

  :root {
    --primary: #00ffff;
    --secondary: #ff00ff;
    --accent: #ffff00;
    --success: #00ff41;
    --danger: #ff0040;
    --warning: #ff8000;
    --bg-primary: #0a0a0f;
    --bg-secondary: #1a1a2e;
    --bg-tertiary: #16213e;
    --glass: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(0, 255, 255, 0.3);
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --shadow-neon: 0 0 20px;
    --shadow-glow: 0 0 40px;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Rajdhani', sans-serif;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 255, 0, 0.1) 0%, transparent 50%);
    z-index: -2;
    animation: quantumShift 30s ease-in-out infinite;
  }

  body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    z-index: -1;
    animation: float 20s ease-in-out infinite;
  }

  @keyframes quantumShift {
    0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.8; }
    25% { transform: rotate(90deg) scale(1.1); opacity: 1; }
    50% { transform: rotate(180deg) scale(0.9); opacity: 0.6; }
    75% { transform: rotate(270deg) scale(1.05); opacity: 0.9; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  /* Scrollbar futurístico */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-primary);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, var(--primary), var(--secondary));
    border-radius: 10px;
    box-shadow: var(--shadow-neon) var(--primary);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, var(--secondary), var(--accent));
  }

  /* Seleção de texto */
  ::selection {
    background: var(--primary);
    color: var(--bg-primary);
  }

  /* Classes utilitárias */
  .glass-card {
    background: var(--glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
  }

  .glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  .glass-card:hover::before {
    left: 100%;
  }

  .neon-text {
    text-shadow: 
      0 0 5px currentColor,
      0 0 10px currentColor,
      0 0 15px currentColor,
      0 0 20px currentColor;
    animation: textGlow 2s ease-in-out infinite alternate;
  }

  @keyframes textGlow {
    from { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
    to { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
  }

  .gradient-text {
    background: linear-gradient(45deg, var(--primary), var(--secondary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200% 200%;
    animation: gradientShift 3s ease-in-out infinite;
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .btn-quantum {
    background: linear-gradient(45deg, var(--primary), var(--secondary));
    border: none;
    border-radius: 25px;
    padding: 12px 24px;
    color: var(--bg-primary);
    font-weight: 700;
    font-family: 'Orbitron', monospace;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-neon) var(--primary);
  }

  .btn-quantum::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
  }

  .btn-quantum:hover::before {
    left: 100%;
  }

  .btn-quantum:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--shadow-glow) var(--primary);
  }

  .btn-quantum:active {
    transform: translateY(0) scale(0.98);
  }

  .btn-success {
    background: linear-gradient(45deg, var(--success), #00cc33);
    box-shadow: var(--shadow-neon) var(--success);
  }

  .btn-success:hover {
    box-shadow: var(--shadow-glow) var(--success);
  }

  .btn-danger {
    background: linear-gradient(45deg, var(--danger), #cc0033);
    box-shadow: var(--shadow-neon) var(--danger);
  }

  .btn-danger:hover {
    box-shadow: var(--shadow-glow) var(--danger);
  }

  .btn-warning {
    background: linear-gradient(45deg, var(--warning), #cc6600);
    box-shadow: var(--shadow-neon) var(--warning);
  }

  .btn-warning:hover {
    box-shadow: var(--shadow-glow) var(--warning);
  }

  .input-quantum {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--glass-border);
    border-radius: 15px;
    padding: 15px 20px;
    color: var(--text-primary);
    font-size: 16px;
    font-family: 'Rajdhani', sans-serif;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .input-quantum:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--shadow-neon) var(--primary);
    background: rgba(0, 255, 255, 0.05);
  }

  .input-quantum::placeholder {
    color: var(--text-secondary);
  }

  .select-quantum {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--glass-border);
    border-radius: 15px;
    padding: 15px 20px;
    color: var(--text-primary);
    font-size: 16px;
    font-family: 'Rajdhani', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .select-quantum:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--shadow-neon) var(--primary);
  }

  .select-quantum option {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .progress-quantum {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 15px;
    height: 12px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .progress-quantum-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    border-radius: 15px;
    transition: width 0.8s ease;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-neon) var(--primary);
  }

  .progress-quantum-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: progressShine 2s ease-in-out infinite;
  }

  @keyframes progressShine {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: 'Orbitron', monospace;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .status-ganhou {
    background: rgba(0, 255, 65, 0.2);
    color: var(--success);
    border: 1px solid var(--success);
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  }

  .status-perdeu {
    background: rgba(255, 0, 64, 0.2);
    color: var(--danger);
    border: 1px solid var(--danger);
    box-shadow: 0 0 10px rgba(255, 0, 64, 0.3);
  }

  .status-reembolsada {
    background: rgba(255, 128, 0, 0.2);
    color: var(--warning);
    border: 1px solid var(--warning);
    box-shadow: 0 0 10px rgba(255, 128, 0, 0.3);
  }

  .loading-quantum {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--primary);
    animation: quantumSpin 1s ease-in-out infinite;
  }

  @keyframes quantumSpin {
    to { transform: rotate(360deg); }
  }

  /* Animações de entrada */
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }

  .animate-slide-up {
    animation: slideUp 0.6s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.4s ease-out;
  }

  .animate-slide-left {
    animation: slideLeft 0.6s ease-out;
  }

  .animate-slide-right {
    animation: slideRight 0.6s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes slideLeft {
    from { transform: translateX(-30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideRight {
    from { transform: translateX(30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* Responsividade */
  @media (max-width: 768px) {
    .glass-card {
      margin: 10px;
      border-radius: 15px;
    }
    
    .btn-quantum {
      padding: 10px 20px;
      font-size: 14px;
    }
    
    .input-quantum, .select-quantum {
      padding: 12px 16px;
      font-size: 14px;
    }
  }

  /* Modo escuro aprimorado */
  @media (prefers-color-scheme: dark) {
    :root {
      --glass: rgba(255, 255, 255, 0.03);
      --glass-border: rgba(0, 255, 255, 0.2);
    }
  }
`;
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Surebet } from '../services/oddsApi';

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  max-width: 400px;
`;

const Notification = styled(motion.div)<{ type: 'success' | 'warning' | 'info' }>`
  background: ${props => 
    props.type === 'success' ? 'linear-gradient(45deg, #00ff00, #40ff40)' :
    props.type === 'warning' ? 'linear-gradient(45deg, #ffff00, #ffff80)' :
    'linear-gradient(45deg, #00ffff, #40ffff)'
  };
  color: #000;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.div`
  font-weight: bold;
  font-size: 1rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #000;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationContent = styled.div`
  font-size: 0.9rem;
  line-height: 1.4;
`;

const SettingsButton = styled(motion.button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(45deg, #00ffff, #0080ff);
  border: none;
  color: #000;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
`;

const SettingsModal = styled(motion.div)`
  position: fixed;
  bottom: 90px;
  right: 20px;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  width: 300px;
  backdrop-filter: blur(20px);
  z-index: 1001;
`;

const SettingsTitle = styled.h3`
  color: #00ffff;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const SettingItem = styled.div`
  margin-bottom: 1rem;
`;

const SettingLabel = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const SettingInput = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.5rem;
  color: #fff;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
`;

const SettingCheckbox = styled.input`
  margin-right: 0.5rem;
`;

interface NotificationData {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  content: string;
  timestamp: number;
}

interface SurebetNotificationsProps {
  surebets: Surebet[];
  previousSurebets: Surebet[];
}

const SurebetNotifications: React.FC<SurebetNotificationsProps> = ({ 
  surebets, 
  previousSurebets 
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    minProfit: 1,
    soundEnabled: true,
    highProfitThreshold: 5
  });

  useEffect(() => {
    if (!settings.enabled || previousSurebets.length === 0) return;

    // Detectar novas surebets
    const newSurebets = surebets.filter(current => 
      !previousSurebets.some(prev => prev.id === current.id)
    );

    newSurebets.forEach(surebet => {
      if (surebet.profit >= settings.minProfit) {
        const notificationType = surebet.profit >= settings.highProfitThreshold ? 'success' : 'info';
        
        addNotification({
          type: notificationType,
          title: surebet.profit >= settings.highProfitThreshold ? '🚀 ALTA OPORTUNIDADE!' : '🎯 Nova Surebet',
          content: `${surebet.homeTeam} vs ${surebet.awayTeam} - Lucro: +${surebet.profit}%`
        });

        // Som de notificação
        if (settings.soundEnabled) {
          playNotificationSound();
        }
      }
    });

    // Detectar surebets que desapareceram
    const removedSurebets = previousSurebets.filter(prev => 
      !surebets.some(current => current.id === prev.id)
    );

    if (removedSurebets.length > 0) {
      addNotification({
        type: 'warning',
        title: '⚠️ Oportunidades Perdidas',
        content: `${removedSurebets.length} surebet(s) não estão mais disponíveis`
      });
    }
  }, [surebets, previousSurebets, settings]);

  const addNotification = (notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Máximo 5 notificações

    // Auto-remover após 10 segundos
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const playNotificationSound = () => {
    // Criar um som simples usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  return (
    <>
      <NotificationContainer>
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              type={notification.type}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
            >
              <NotificationHeader>
                <NotificationTitle>{notification.title}</NotificationTitle>
                <CloseButton onClick={() => removeNotification(notification.id)}>
                  ×
                </CloseButton>
              </NotificationHeader>
              <NotificationContent>{notification.content}</NotificationContent>
            </Notification>
          ))}
        </AnimatePresence>
      </NotificationContainer>

      <SettingsButton
        onClick={() => setShowSettings(!showSettings)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🔔
      </SettingsButton>

      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <SettingsTitle>Configurações de Notificação</SettingsTitle>
            
            <SettingItem>
              <SettingLabel>
                <SettingCheckbox
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
                />
                Ativar Notificações
              </SettingLabel>
            </SettingItem>

            <SettingItem>
              <SettingLabel>Lucro Mínimo (%)</SettingLabel>
              <SettingInput
                type="number"
                step="0.1"
                value={settings.minProfit}
                onChange={(e) => setSettings({...settings, minProfit: Number(e.target.value)})}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel>Limite para Alta Oportunidade (%)</SettingLabel>
              <SettingInput
                type="number"
                step="0.1"
                value={settings.highProfitThreshold}
                onChange={(e) => setSettings({...settings, highProfitThreshold: Number(e.target.value)})}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel>
                <SettingCheckbox
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                />
                Som de Notificação
              </SettingLabel>
            </SettingItem>
          </SettingsModal>
        )}
      </AnimatePresence>
    </>
  );
};

export default SurebetNotifications;
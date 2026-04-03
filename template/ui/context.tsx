// @ts-nocheck
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertButton, AlertState } from './types';

interface AlertContextType {
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = (title: string, message: string, buttons: AlertButton[] = [{ text: 'OK' }]) => {
    setAlert({ visible: true, title, message, buttons });
  };

  const dismiss = () => setAlert(s => ({ ...s, visible: false }));

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal transparent visible={alert.visible} animationType="fade" onRequestClose={dismiss}>
        <View style={styles.overlay}>
          <View style={styles.box}>
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.message}>{alert.message}</Text>
            <View style={styles.buttons}>
              {(alert.buttons.length ? alert.buttons : [{ text: 'OK' }]).map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.btn, btn.style === 'destructive' && styles.btnDestructive]}
                  onPress={() => { btn.onPress?.(); dismiss(); }}
                >
                  <Text style={[styles.btnText, btn.style === 'destructive' && styles.btnTextDestructive]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlertContext must be used within AlertProvider');
  return ctx;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340, gap: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#111827' },
  message: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#3B82F6' },
  btnDestructive: { backgroundColor: '#EF4444' },
  btnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  btnTextDestructive: { color: '#fff' },
});

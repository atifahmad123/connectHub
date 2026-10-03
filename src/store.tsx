import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import { initialState, prototypeReducer, type DomainAction } from './state';
import { announcementStatus, isAudience, isFeatureEnabled, uid } from './utils';
import type { Feature } from './types/domain';

function useStore() {
  const [state, dispatch] = useReducer(prototypeReducer, undefined, () => {
    const state = initialState();
    // Explicit demo deep links make disabled modules reviewable after a full page load.
    if (new URLSearchParams(window.location.search).get('demoInstance') === 'crescentValley') state.activeInstanceId = 'crescentValley';
    return state;
  });
  const [toast, setToast] = useState('');
  useEffect(() => { if (toast) { const timer = window.setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer); } }, [toast]);
  const activeInstance = state.instances[state.activeInstanceId];
  const config = activeInstance.config;
  const userId = state.selectedAlumni[state.activeInstanceId];
  const personas = [...activeInstance.alumni, ...activeInstance.pendingRegistrations];
  const me = personas.find(p => p.id === userId)!;
  const people = activeInstance.alumni.filter(p => p.status === 'approved');
  const myNotices = activeInstance.notifications.filter(n => n.userId === userId);
  const myConnections = people.filter(p => p.id !== userId && activeInstance.connections.some(c => c.status === 'accepted' && [c.senderId, c.recipientId].includes(userId) && [c.senderId, c.recipientId].includes(p.id)));
  function send(action: DomainAction, message?: string) {
    dispatch({ ...action, meta: { id: uid(), now: new Date().toISOString() } });
    if (message) setToast(message);
    else if (['SWITCH_INSTANCE', 'SWITCH_ROLE', 'SELECT_ALUMNI', 'RESET_DEMO'].includes(action.type)) setToast('');
  }
  return {
    state, activeInstance, config, people, personas, me, userId, send, toast, notify: setToast,
    isEnabled: (feature: Feature) => isFeatureEnabled(config, feature),
    myNotices, unread: myNotices.filter(n => !n.read).length, myConnections,
    connectionFor: (id: string) => activeInstance.connections.find(c => c.status !== 'declined' && [c.senderId, c.recipientId].includes(userId) && [c.senderId, c.recipientId].includes(id)),
    connectionCount: (id: string) => activeInstance.connections.filter(c => c.status === 'accepted' && [c.senderId, c.recipientId].includes(id)).length,
    mySessions: activeInstance.sessions.filter(r => [r.mentorAlumniId, r.requesterAlumniId].includes(userId)),
    receivedRequests: activeInstance.connections.filter(c => c.recipientId === userId && c.status === 'pending'),
    sentRequests: activeInstance.connections.filter(c => c.senderId === userId && c.status === 'pending'),
    pending: activeInstance.pendingRegistrations.filter(p => p.status === 'pending'),
    pendingJobs: activeInstance.opportunities.filter(o => o.status === 'pending_review'),
    myAnnouncements: activeInstance.announcements.filter(n => announcementStatus(n) === 'Published' && isAudience(n, me)),
  };
}
const Context = createContext<ReturnType<typeof useStore> | null>(null);
export function Store({ children }: { children: ReactNode }) { const store = useStore(); return <Context.Provider value={store}>{children}</Context.Provider>; }
export function useApp() { const context = useContext(Context); if (!context) throw new Error('Prototype store is missing.'); return context; }

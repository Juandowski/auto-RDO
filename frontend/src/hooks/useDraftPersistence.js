import { useState, useEffect, useCallback, useRef } from 'react';
import { saveDraft, loadDraft, clearDraft, checkStorageQuota } from '../services/draftService';

const AUTO_SAVE_INTERVAL_MS = 30_000; // 30 segundos

/**
 * Hook responsável por toda a lógica de persistência de rascunho.
 *
 * @param {{ campos: object, diasDados: object[] }} state - estado atual do formulário
 * @returns {{
 *   temRascunhoSalvo: boolean,
 *   ultimoSalvamento: Date | null,
 *   quotaStatus: 'OK' | 'WARNING' | 'CRITICAL',
 *   salvarAgora: () => void,
 *   descartarRascunho: () => void,
 *   carregarRascunho: () => object | null,
 * }}
 */
export function useDraftPersistence(state) {
  const [temRascunhoSalvo, setTemRascunhoSalvo] = useState(false);
  const [ultimoSalvamento, setUltimoSalvamento] = useState(null);
  const [quotaStatus, setQuotaStatus] = useState('OK');

  // Ref para evitar stale closure no auto-save sem re-registrar o intervalo
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Verifica existência de rascunho na montagem inicial
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setTemRascunhoSalvo(true);
      setUltimoSalvamento(new Date(draft.savedAt));
    }
  }, []);

  // Auto-save a cada 30 segundos — só dispara se o formulário tiver conteúdo
  useEffect(() => {
    const interval = setInterval(() => {
      const current = stateRef.current;
      const temConteudo = current.campos?.cliente || current.diasDados?.length > 0;
      if (!temConteudo) return;

      const result = saveDraft(current);

      if (result.success) {
        const agora = new Date();
        setUltimoSalvamento(agora);
        setTemRascunhoSalvo(true);

        // Verifica quota após salvar
        const { status } = checkStorageQuota(current);
        setQuotaStatus(status);
      } else if (result.error === 'storage_full') {
        setQuotaStatus('CRITICAL');
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []); // sem dependências — usa stateRef para acessar o estado atual

  // Salvamento manual acionado pelo botão na UI
  const salvarAgora = useCallback(() => {
    const result = saveDraft(stateRef.current);

    if (result.success) {
      setUltimoSalvamento(new Date());
      setTemRascunhoSalvo(true);
      const { status } = checkStorageQuota(stateRef.current);
      setQuotaStatus(status);
    } else if (result.error === 'storage_full') {
      setQuotaStatus('CRITICAL');
    }

    return result;
  }, []);

  // Descarta o rascunho e reseta os indicadores
  const descartarRascunho = useCallback(() => {
    clearDraft();
    setTemRascunhoSalvo(false);
    setUltimoSalvamento(null);
    setQuotaStatus('OK');
  }, []);

  // Retorna os dados do rascunho para reidratação no formulário
  const carregarRascunho = useCallback(() => {
    return loadDraft();
  }, []);

  return {
    temRascunhoSalvo,
    ultimoSalvamento,
    quotaStatus,
    salvarAgora,
    descartarRascunho,
    carregarRascunho,
  };
}
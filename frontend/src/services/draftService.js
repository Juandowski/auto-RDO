const DRAFT_KEY = 'autorde:draft:v1';
const SCHEMA_VERSION = 1;
const QUOTA_LIMIT_BYTES = 5 * 1024 * 1024; // 5MB estimado por origem
const QUOTA_WARNING_RATIO = 0.8;            // Alerta em 80%

/**
 * @typedef {'OK' | 'WARNING' | 'CRITICAL'} QuotaStatus
 */

/**
 * Serializa e salva o estado completo do formulário no localStorage.
 * @param {{ campos: object, diasDados: object[] }} state
 * @returns {{ success: boolean, error?: string }}
 */
export function saveDraft(state) {
  try {
    const payload = JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      campos: state.campos,
      diasDados: state.diasDados,
    });

    localStorage.setItem(DRAFT_KEY, payload);
    return { success: true };
  } catch (err) {
    // QuotaExceededError — storage cheio
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      return { success: false, error: 'storage_full' };
    }
    return { success: false, error: 'unknown' };
  }
}

/**
 * Lê e desserializa o rascunho salvo.
 * Retorna null se não houver rascunho ou se o dado estiver corrompido.
 * @returns {{ schemaVersion: number, savedAt: string, campos: object, diasDados: object[] } | null}
 */
export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return migrateDraft(parsed);
  } catch {
    // JSON corrompido — limpa o storage para evitar falhas futuras
    clearDraft();
    return null;
  }
}

/**
 * Remove o rascunho salvo do localStorage.
 */
export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Falha silenciosa — não deve interromper o fluxo do usuário
  }
}

/**
 * Verifica o tamanho estimado do payload e retorna o status da quota.
 * @param {{ campos: object, diasDados: object[] }} state
 * @returns {{ status: QuotaStatus, usedBytes: number, ratio: number }}
 */
export function checkStorageQuota(state) {
  try {
    const serialized = JSON.stringify(state);
    const usedBytes = new Blob([serialized]).size;
    const ratio = usedBytes / QUOTA_LIMIT_BYTES;

    let status = 'OK';
    if (ratio >= 1) status = 'CRITICAL';
    else if (ratio >= QUOTA_WARNING_RATIO) status = 'WARNING';

    return { status, usedBytes, ratio };
  } catch {
    return { status: 'OK', usedBytes: 0, ratio: 0 };
  }
}

/**
 * Aplica migrações de schema para compatibilidade com versões anteriores.
 * Adicione novos cases aqui conforme o schema evolui.
 * @param {object} draft
 * @returns {object | null}
 */
function migrateDraft(draft) {
  if (!draft || typeof draft.schemaVersion === 'undefined') return null;

  return draft;
}
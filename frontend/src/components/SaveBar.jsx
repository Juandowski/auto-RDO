import styles from './SaveBar.module.css';

export const QUOTA_CONFIG_PADRAO = {
  OK:       { classe: '',               mensagem: null },
  WARNING:  { classe: 'warning',        mensagem: '⚠️ Armazenamento quase cheio. Considere enviar o RDO em breve.' },
  CRITICAL: { classe: 'critical',       mensagem: '🚨 Armazenamento cheio. Não foi possível salvar. Envie o RDO agora.' },
};

function SaveBar({
  ultimoSalvamento,
  quotaStatus,
  onSalvar,
  quotaConfig = QUOTA_CONFIG_PADRAO,
}) {
  const quota = quotaConfig[quotaStatus] ?? quotaConfig.OK;

  // Mapeia o nome da classe para o CSS Module — mantém encapsulamento
  const classeModulo = quota.classe ? styles[quota.classe] : '';

  const horarioFormatado = ultimoSalvamento
    ? ultimoSalvamento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className={`${styles.savebar} ${classeModulo}`}>
      <div className={styles.esquerda}>
        <button type="button" className={styles.btnSalvar} onClick={onSalvar}>
          💾 Salvar progresso
        </button>
        {horarioFormatado && (
          <span className={styles.timestamp}>
            ✓ Salvo às {horarioFormatado}
          </span>
        )}
      </div>

      {quota.mensagem && (
        <p className={styles.alerta}>{quota.mensagem}</p>
      )}
    </div>
  );
}

export default SaveBar;

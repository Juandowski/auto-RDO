import styles from './DraftBanner.module.css';

/**
 * Banner exibido no topo do formulário quando um rascunho salvo é detectado.
 */
function DraftBanner({ ultimoSalvamento, onRetomar, onDescartar }) {
  const horarioFormatado = ultimoSalvamento
    ? ultimoSalvamento.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className={styles.banner} role="alert">
      <div className={styles.info}>
        <span className={styles.icone}>💾</span>
        <div>
          <p className={styles.titulo}>Rascunho encontrado</p>
          <p className={styles.detalhe}>Último salvamento: {horarioFormatado}</p>
        </div>
      </div>
      <div className={styles.acoes}>
        <button type="button" className={styles.btnRetomar} onClick={onRetomar}>
          Retomar preenchimento
        </button>
        <button type="button" className={styles.btnDescartar} onClick={onDescartar}>
          Descartar e começar do zero
        </button>
      </div>
    </div>
  );
}

export default DraftBanner;

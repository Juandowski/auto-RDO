import styles from './InputDinamico.module.css';

/**
 * Campo de formulário dinâmico: renderiza <input> ou <textarea>
 * dependendo da prop `tipo`.
 */
function InputDinamico({ label, value, onChange, placeholder, tipo = 'input', required = false }) {
  return (
    <div className={styles.grupo}>
      <label className={styles.label}>{label}</label>
      {tipo === 'textarea' ? (
        <textarea
          className={styles.textarea}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
}

export default InputDinamico;

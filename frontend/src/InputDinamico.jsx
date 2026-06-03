import React, { useRef, useEffect } from 'react';

const InputDinamico = ({ label, value, onChange, placeholder }) => {
  const textareaRef = useRef(null);

  // Efeito que ajusta a altura sempre que o texto muda ou ao carregar a página
  useEffect(() => {
    if (textareaRef.current) {
      // Reseta a altura para calcular o tamanho real correto do texto interno
      textareaRef.current.style.height = 'auto';
      // Define a nova altura com base no tamanho do scroll interno do texto
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="form-group" style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
      {label && (
        <label style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        rows={1} // Começa parecendo um input de uma única linha
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-estilo-dinamico"
      />
    </div>
  );
};

export default InputDinamico;
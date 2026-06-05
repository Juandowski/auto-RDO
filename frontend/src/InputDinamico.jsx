import React from 'react';

const InputDinamico = ({ label, value, onChange, placeholder, tipo = "input" }) => {
  return (
    <div className="form-group" style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
      {/* Corrigido para "label" com "l" minúsculo */}
      {label && (
        <label style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#333', textAlign: 'left' }}>
          {label}
        </label>
      )}
      
      {tipo === "textarea" ? (
        <textarea
          rows="3"
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="input-estilo-dinamico atividades-textarea"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="input-estilo-dinamico"
          style={{ width: '100%', height: '40px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
      )}
    </div>
  );
};

export default InputDinamico;
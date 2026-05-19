import { useState, useEffect } from 'react';
import './App.css';

// --- FUNÇÕES DE MÁSCARA ---
const mascaraData = (valor) => {
  return valor
    .replace(/\D/g, '') // Remove tudo que não for número
    .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a primeira barra
    .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a segunda barra
    .slice(0, 10); // Limita a 10 caracteres (DD/MM/AAAA)
};

const mascaraHora = (valor) => {
  return valor
    .replace(/\D/g, '') // Remove o que não é número
    .replace(/(\d{2})(\d)/, '$1:$2') // Coloca os dois pontos
    .slice(0, 5); // Limita a 5 caracteres (HH:MM)
};

function App() {
  const [cliente, setCliente] = useState('');
  const [servico, setServico] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [diasDados, setDiasDados] = useState([]);

  // useEffect para calcular os dias quando o usuário digitar as duas datas completas (10 caracteres)
  useEffect(() => {
    if (dataInicio.length === 10 && dataFim.length === 10) {
      // Separa o texto DD/MM/AAAA para criar um objeto Date nativo
      const [diaI, mesI, anoI] = dataInicio.split('/');
      const [diaF, mesF, anoF] = dataFim.split('/');

      const inicio = new Date(`${anoI}-${mesI}-${diaI}T00:00:00`);
      const fim = new Date(`${anoF}-${mesF}-${diaF}T00:00:00`);

      if (inicio > fim) {
        alert("A data de início não pode ser maior que a data final.");
        return;
      }

      const listaDias = [];
      let dataAtual = new Date(inicio);

      while (dataAtual <= fim) {
        // Formata garantindo o zero na frente (ex: 05 ao invés de 5)
        const diaStr = String(dataAtual.getDate()).padStart(2, '0');
        const mesStr = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const anoStr = dataAtual.getFullYear();

        listaDias.push({
          data: `${diaStr}/${mesStr}/${anoStr}`,
          horaInicio: '08:00', // Padrão inicial em 24h
          horaFim: '17:00',
          atividades: ''
        });
        
        dataAtual.setDate(dataAtual.getDate() + 1);
      }

      setDiasDados(listaDias);
    }
  }, [dataInicio, dataFim]);

  const handleDiaChange = (index, campo, valor) => {
    const novosDias = [...diasDados];
    // Se for campo de hora, aplica a máscara. Se for texto, salva normal.
    if (campo === 'horaInicio' || campo === 'horaFim') {
      novosDias[index][campo] = mascaraHora(valor);
    } else {
      novosDias[index][campo] = valor;
    }
    setDiasDados(novosDias);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Agora o payload já vai mastigado com os formatos exatos para o Node
    const payload = {
      cliente,
      servico,
      dataInicio, // Já está DD/MM/AAAA
      dataFim,    // Já está DD/MM/AAAA
      dias: diasDados,
      tipoLayout: 'residencial'
    };

    try {
      const response = await fetch('http://localhost:3001/api/gerar-rdo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Falha ao gerar o arquivo');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RDO_${cliente}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar o PDF. Verifique o servidor.');
    }
  };

  return (
    <div className="container">
      <h1>Relatório Diário de Obra</h1>
      <p className="subtitle">Preenchimento Dinâmico por Período</p>

      <form onSubmit={handleSubmit} className="rdo-form">
        <div className="form-group">
          <label>Cliente:</label>
          <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Descrição do Serviço:</label>
          <input type="text" value={servico} onChange={(e) => setServico(e.target.value)} required />
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Data de Início:</label>
            <input 
              type="text" 
              placeholder="DD/MM/AAAA"
              value={dataInicio} 
              onChange={(e) => setDataInicio(mascaraData(e.target.value))} 
              required 
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Data de Fim:</label>
            <input 
              type="text" 
              placeholder="DD/MM/AAAA"
              value={dataFim} 
              onChange={(e) => setDataFim(mascaraData(e.target.value))} 
              required 
            />
          </div>
        </div>

        {diasDados.length > 0 && (
          <div className="bloco-dias-container">
            <h3>Detalhamento Diário ({diasDados.length} dias correspondentes)</h3>
            
            {diasDados.map((dia, index) => (
              <div key={index} className="dia-box" style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#f8fafc' }}>
                <h4>📅 Dia: {dia.data}</h4>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Hora Entrada (24h):</label>
                    <input 
                      type="text" 
                      placeholder="HH:MM"
                      value={dia.horaInicio} 
                      onChange={(e) => handleDiaChange(index, 'horaInicio', e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Hora Saída (24h):</label>
                    <input 
                      type="text" 
                      placeholder="HH:MM"
                      value={dia.horaFim} 
                      onChange={(e) => handleDiaChange(index, 'horaFim', e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Atividades deste dia:</label>
                  <textarea 
                    value={dia.atividades} 
                    onChange={(e) => handleDiaChange(index, 'atividades', e.target.value)} 
                    placeholder="O que foi feito especificamente nesta data?"
                    rows="3" 
                    required 
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn-submit">Gerar PDF de todo o Período</button>
      </form>
    </div>
  );
}

export default App;
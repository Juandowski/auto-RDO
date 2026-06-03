import { useState, useEffect } from 'react';
import './App.css';
import InputDinamico from './InputDinamico';


const mascaraData = (valor) => {
  return valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 10);
};

const mascaraHora = (valor) => {
  return valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1:$2').slice(0, 5);
};

function App() {
  const [cliente, setCliente] = useState('');
  const [projeto, setProjeto] = useState('');
  const [task, setTask] = useState('');
  const [po, setPo] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [servico, setServico] = useState('');
  const [escopo, setEscopo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [diasDados, setDiasDados] = useState([]);

  useEffect(() => {
    if (dataInicio.length === 10 && dataFim.length === 10) {
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
        const diaStr = String(dataAtual.getDate()).padStart(2, '0');
        const mesStr = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const anoStr = dataAtual.getFullYear();

        listaDias.push({
          data: `${diaStr}/${mesStr}/${anoStr}`,
          horaInicio: '08:00',
          horaFim: '17:00',
          atividades: [{ texto: '', imagens: [] }]
        });
        
        dataAtual.setDate(dataAtual.getDate() + 1);
      }

      setDiasDados(listaDias);
    }
  }, [dataInicio, dataFim]);

  const handleDiaChange = (index, campo, valor) => {
    const novosDias = [...diasDados];
    novosDias[index][campo] = campo.includes('hora') ? mascaraHora(valor) : valor;
    setDiasDados(novosDias);
  };

  const handleAtividadeChange = (indexDia, indexAtiv, campo, valor) => {
    // 1. Cria uma cópia limpa do array de dias para não atualizar o estado direto na memória
    const novosDias = [...diasDados];
    
    // 2. Atualiza exatamente o campo que foi modificado ('titulo' ou 'texto')
    novosDias[indexDia].atividades[indexAtiv][campo] = valor;
    
    // 3. Devolve o novo valor para o React atualizar a tela em tempo real
    setDiasDados(novosDias);
  };

  const addNovaAtividade = (indexDia) => {
    const novosDias = [...diasDados];
    novosDias[indexDia].atividades.push({ texto: '', imagens: [] });
    setDiasDados(novosDias);
  };

  const removerAtividade = (indexDia, indexAtividade) => {
    const novosDias = [...diasDados];
    if (novosDias[indexDia].atividades.length > 1) {
      novosDias[indexDia].atividades.splice(indexAtividade, 1);
      setDiasDados(novosDias);
    }
  };

  // UPLOAD DA IMAGEM VINCULADA AO ITEM
  const handleImageUpload = (indexDia, indexAtividade, event) => {
    const files = Array.from(event.target.files);
    
    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    })).then(base64Images => {
      const novosDias = [...diasDados];
      novosDias[indexDia].atividades[indexAtividade].imagens.push(...base64Images);
      setDiasDados(novosDias);
    });
  };

  // FUNÇÃO PARA REMOVER UMA FOTO ESPECÍFICA
  const removerImagem = (indexDia, indexAtividade, indexImagem) => {
    const novosDias = [...diasDados];
    novosDias[indexDia].atividades[indexAtividade].imagens.splice(indexImagem, 1);
    setDiasDados(novosDias);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { cliente, projeto, task, po, tecnico, servico, escopo, dataInicio, dataFim, dias: diasDados, tipoLayout: 'residencial' };
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
      alert('Erro ao gerar o PDF. Verifique o servidor.');
    }
  };

  return (
    <div className="container">
      <h1>Relatório Diário de Obra</h1>
      <p className="subtitle">Preenchimento Dinâmico por Período</p>

      <form onSubmit={handleSubmit} className="rdo-form">
        
        <InputDinamico 
          label="Cliente:" 
          value={cliente} 
          onChange={(e) => setCliente(e.target.value)} 
          placeholder="Digite o nome do cliente..."
        />

        <InputDinamico 
          label="Projeto:" 
          value={projeto} 
          onChange={(e) => setProjeto(e.target.value)} 
          placeholder="Nome do projeto..."
        />

        <InputDinamico 
          label="Task:" 
          value={task} 
          onChange={(e) => setTask(e.target.value)} 
          placeholder="Número da Task..."
        />

        <InputDinamico 
          label="PO:" 
          value={po} 
          onChange={(e) => setPo(e.target.value)} 
          placeholder="Product Owner..."
        />

        <InputDinamico 
          label="Serviço:" 
          value={servico} 
          onChange={(e) => setServico(e.target.value)} 
          placeholder="Descreva o serviço..."
        />

        <InputDinamico 
          label="Escopo do Serviço Contratado:" 
          value={escopo} 
          onChange={(e) => setEscopo(e.target.value)} 
          placeholder="Digite o escopo detalhado..."
        />

        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}><label>Data de Início:</label><input type="text" placeholder="DD/MM/AAAA" value={dataInicio} onChange={(e) => setDataInicio(mascaraData(e.target.value))} required /></div>
          <div className="form-group" style={{ flex: 1 }}><label>Data de Fim:</label><input type="text" placeholder="DD/MM/AAAA" value={dataFim} onChange={(e) => setDataFim(mascaraData(e.target.value))} required /></div>
        </div>

        {diasDados.length > 0 && (
          <div className="bloco-dias-container">
            <h3>Detalhamento Diário</h3>
            
            {diasDados.map((dia, indexDia) => (
              <div key={indexDia} className="dia-box" style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>📅 Dia: {dia.data}</h4>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                  <div className="form-group" style={{ flex: 1 }}><label>Hora Entrada:</label><input type="text" placeholder="HH:MM" value={dia.horaInicio} onChange={(e) => handleDiaChange(indexDia, 'horaInicio', e.target.value)} required /></div>
                  <div className="form-group" style={{ flex: 1 }}><label>Hora Saída:</label><input type="text" placeholder="HH:MM" value={dia.horaFim} onChange={(e) => handleDiaChange(indexDia, 'horaFim', e.target.value)} required /></div>
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label>Atividades deste dia:</label>
                  
                  {dia.atividades.map((ativ, indexAtiv) => (
                    <div key={indexAtiv} style={{ marginBottom: '20px', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'stretch' }}>
                        {/* Número indicador à esquerda */}
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 15px', backgroundColor: '#e2e8f0', borderRadius: '6px 0 0 6px', fontWeight: 'bold', border: '1px solid #cbd5e1', borderRight: 'none' }}>
                          {indexAtiv + 1}.
                        </span>

                        {/* Bloco empilhado com Título + Descrição */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRight: dia.atividades.length > 1 ? 'none' : '1px solid #cbd5e1', borderRadius: dia.atividades.length > 1 ? '0' : '0 6px 6px 0', backgroundColor: '#ffffff' }}>
                          
                          {/* Novo campo de Título */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Título da Atividade:</label>
                            <input 
                              type="text"
                              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                              value={ativ.titulo || ''} 
                              onChange={(e) => handleAtividadeChange(indexDia, indexAtiv, 'titulo', e.target.value)} // Note o 'titulo' aqui
                              placeholder="Ex: Infraestrutura de leitos, Lançamento de cabos..."
                              required 
                            />
                          </div>

                          {/* Seu campo de descrição adaptado */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Descrição Detalhada:</label>
                            <textarea 
                              style={{ borderRadius: '4px', border: '1px solid #cbd5e1', padding: '10px', resize: 'vertical', minHeight: '60px', fontFamily: 'inherit', fontSize: '14px', outline: 'none' }}
                              value={ativ.texto} 
                              onChange={(e) => handleAtividadeChange(indexDia, indexAtiv, 'texto', e.target.value)} // Note o 'texto' aqui
                              placeholder="Descreva detalhadamente o que foi feito..."
                              rows="2" required 
                            />
                          </div>

                        </div>

                        {dia.atividades.length > 1 && (
                          <button type="button" onClick={() => removerAtividade(indexDia, indexAtiv)} style={{ padding: '0 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0 6px 6px 0', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                        )}
                      </div>

                      <div style={{ marginTop: '10px', paddingLeft: '45px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', cursor: 'pointer', display: 'inline-block', backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          📷 Anexar Foto a este item
                          <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(indexDia, indexAtiv, e)} style={{ display: 'none' }} />
                        </label>
                        
                        {ativ.imagens.length > 0 && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {ativ.imagens.map((img, i) => (
                              <div key={i} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                                <button type="button" onClick={() => removerImagem(indexDia, indexAtiv, i)} style={{ position: 'absolute', top: '-5px', right: '-5px', width: '20px', height: '20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                  X
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={() => addNovaAtividade(indexDia)} style={{ alignSelf: 'flex-start', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                    + Adicionar outro item
                  </button>
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
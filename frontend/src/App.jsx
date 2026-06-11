import InputDinamico from './components/InputDinamico';
import DiaBox from './components/DiaBox';
import { useRdoForm } from './hooks/useRdoForm';
import { mascaraData } from './utils/mascaras';
import styles from './App.module.css';

/**
 * App — componente raiz, responsável apenas por composição e layout.
 * Toda a lógica de estado vive em useRdoForm().
 */
function App() {
  const {
    campos,
    diasDados,
    carregando,
    erro,
    handleCampoChange,
    handleDiaChange,
    handleAtividadeChange,
    addNovaAtividade,
    removerAtividade,
    handleImageUpload,
    removerImagem,
    handleSubmit,
  } = useRdoForm();

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Relatório Diário de Obra</h1>
      <p className={styles.subtitulo}>Preencha o formulário para gerar o RDO automático</p>

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* Dados do cabeçalho */}
        <InputDinamico label="Cliente" value={campos.cliente} onChange={(e) => handleCampoChange('cliente', e.target.value)} placeholder="Nome do cliente..." required />
        <InputDinamico label="Projeto" value={campos.projeto} onChange={(e) => handleCampoChange('projeto', e.target.value)} placeholder="Nome do projeto..." required />
        <InputDinamico label="Task" value={campos.task} onChange={(e) => handleCampoChange('task', e.target.value)} placeholder="Número da Task..." />
        <InputDinamico label="PO" value={campos.po} onChange={(e) => handleCampoChange('po', e.target.value)} placeholder="Product Owner..." />
        <InputDinamico label="Técnico" value={campos.tecnico} onChange={(e) => handleCampoChange('tecnico', e.target.value)} placeholder="Nome do técnico..." required />
        <InputDinamico label="Serviço" value={campos.servico} onChange={(e) => handleCampoChange('servico', e.target.value)} placeholder="Descreva o serviço..." required />
        <InputDinamico label="Escopo do Serviço Contratado" value={campos.escopo} onChange={(e) => handleCampoChange('escopo', e.target.value)} placeholder="Digite o escopo detalhado..." tipo="textarea" required />

        {/* Intervalo de datas */}
        <div className={styles.linhaHorizontal}>
          <div className={styles.formGroup}>
            <label>Data de Início</label>
            <input
              type="text"
              placeholder="DD/MM/AAAA"
              value={campos.dataInicio}
              onChange={(e) => handleCampoChange('dataInicio', mascaraData(e.target.value))}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Data de Fim</label>
            <input
              type="text"
              placeholder="DD/MM/AAAA"
              value={campos.dataFim}
              onChange={(e) => handleCampoChange('dataFim', mascaraData(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Mensagem de erro */}
        {erro && <p className={styles.erro}>{erro}</p>}

        {/* Detalhamento diário */}
        {diasDados.length > 0 && (
          <section className={styles.secaoDias}>
            <h3 className={styles.secaoTitulo}>Detalhamento Diário</h3>

            {diasDados.map((dia, indexDia) => (
              <DiaBox
                key={dia.data}
                dia={dia}
                indexDia={indexDia}
                onDiaChange={handleDiaChange}
                onAtividadeChange={handleAtividadeChange}
                onAddAtividade={addNovaAtividade}
                onRemoverAtividade={removerAtividade}
                onImageUpload={handleImageUpload}
                onRemoverImagem={removerImagem}
              />
            ))}
          </section>
        )}

        <button type="submit" className={styles.btnSubmit} disabled={carregando}>
          {carregando ? 'Gerando PDF...' : 'Gerar PDF de todo o Período'}
        </button>

      </form>
    </div>
  );
}

export default App;

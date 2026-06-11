import { useState, useEffect } from 'react';
import { mascaraData, mascaraHora } from '../utils/mascaras';
import { gerarRdoPdf, baixarBlob } from '../services/rdoService';

const CAMPOS_INICIAIS = {
  cliente: '',
  projeto: '',
  task: '',
  po: '',
  tecnico: '',
  servico: '',
  escopo: '',
  dataInicio: '',
  dataFim: '',
};

const ATIVIDADE_VAZIA = () => ({ titulo: '', texto: '', imagens: [] });

const DIA_PADRAO = (dataStr) => ({
  data: dataStr,
  horaInicio: '08:00',
  horaFim: '17:00',
  atividades: [ATIVIDADE_VAZIA()],
});

/**
 * Gera a lista de dias entre duas datas (inclusive).
 * @param {string} dataInicio - formato DD/MM/AAAA
 * @param {string} dataFim    - formato DD/MM/AAAA
 * @returns {object[]}
 */
function gerarListaDias(dataInicio, dataFim) {
  const [diaI, mesI, anoI] = dataInicio.split('/');
  const [diaF, mesF, anoF] = dataFim.split('/');

  const inicio = new Date(`${anoI}-${mesI}-${diaI}T00:00:00`);
  const fim = new Date(`${anoF}-${mesF}-${diaF}T00:00:00`);

  if (inicio > fim) return null; // sinal de intervalo inválido

  const dias = [];
  let dataAtual = new Date(inicio);

  while (dataAtual <= fim) {
    const dd = String(dataAtual.getDate()).padStart(2, '0');
    const mm = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const aaaa = dataAtual.getFullYear();
    dias.push(DIA_PADRAO(`${dd}/${mm}/${aaaa}`));
    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return dias;
}

/**
 * Hook principal do formulário RDO.
 * Centraliza estado, efeitos e handlers — mantendo o componente de UI limpo.
 */
export function useRdoForm() {
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  const [diasDados, setDiasDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // --- Geração automática dos dias ao completar o intervalo de datas ---
  useEffect(() => {
    const { dataInicio, dataFim } = campos;
    if (dataInicio.length !== 10 || dataFim.length !== 10) return;

    const lista = gerarListaDias(dataInicio, dataFim);

    if (lista === null) {
      setErro('A data de início não pode ser maior que a data final.');
      return;
    }

    setErro(null);
    setDiasDados(lista);
  }, [campos.dataInicio, campos.dataFim]);

  // --- Atualização de campos simples do cabeçalho ---
  const handleCampoChange = (nome, valor) => {
    const valorFormatado =
      nome === 'dataInicio' || nome === 'dataFim' ? mascaraData(valor) : valor;
    setCampos((prev) => ({ ...prev, [nome]: valorFormatado }));
  };

  // --- Atualização de hora/data de um dia específico ---
  const handleDiaChange = (indexDia, campo, valor) => {
    const valorFormatado = campo.includes('hora') ? mascaraHora(valor) : valor;
    setDiasDados((prev) =>
      prev.map((dia, i) => (i === indexDia ? { ...dia, [campo]: valorFormatado } : dia))
    );
  };

  // --- Atualização de um campo dentro de uma atividade ---
  const handleAtividadeChange = (indexDia, indexAtiv, campo, valor) => {
    setDiasDados((prev) =>
      prev.map((dia, i) =>
        i !== indexDia
          ? dia
          : {
              ...dia,
              atividades: dia.atividades.map((ativ, j) =>
                j === indexAtiv ? { ...ativ, [campo]: valor } : ativ
              ),
            }
      )
    );
  };

  // --- Adicionar nova atividade vazia a um dia ---
  const addNovaAtividade = (indexDia) => {
    setDiasDados((prev) =>
      prev.map((dia, i) =>
        i === indexDia
          ? { ...dia, atividades: [...dia.atividades, ATIVIDADE_VAZIA()] }
          : dia
      )
    );
  };

  // --- Remover uma atividade de um dia (mínimo de 1 mantido) ---
  const removerAtividade = (indexDia, indexAtiv) => {
    setDiasDados((prev) =>
      prev.map((dia, i) => {
        if (i !== indexDia || dia.atividades.length <= 1) return dia;
        return {
          ...dia,
          atividades: dia.atividades.filter((_, j) => j !== indexAtiv),
        };
      })
    );
  };

  // --- Upload de imagens (leitura assíncrona com FileReader) ---
  const handleImageUpload = (indexDia, indexAtiv, files) => {
    Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
          })
      )
    ).then((base64Images) => {
      setDiasDados((prev) =>
        prev.map((dia, i) =>
          i !== indexDia
            ? dia
            : {
                ...dia,
                atividades: dia.atividades.map((ativ, j) =>
                  j === indexAtiv
                    ? { ...ativ, imagens: [...ativ.imagens, ...base64Images] }
                    : ativ
                ),
              }
        )
      );
    });
  };

  // --- Remover uma imagem específica de uma atividade ---
  const removerImagem = (indexDia, indexAtiv, indexImagem) => {
    setDiasDados((prev) =>
      prev.map((dia, i) =>
        i !== indexDia
          ? dia
          : {
              ...dia,
              atividades: dia.atividades.map((ativ, j) =>
                j === indexAtiv
                  ? { ...ativ, imagens: ativ.imagens.filter((_, k) => k !== indexImagem) }
                  : ativ
              ),
            }
      )
    );
  };

  // --- Submissão: chama o serviço e dispara o download ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const payload = { ...campos, dias: diasDados, tipoLayout: 'residencial' };
      const blob = await gerarRdoPdf(payload);
      baixarBlob(blob, `RDO_${campos.cliente}.pdf`);
    } catch (err) {
      setErro('Erro ao gerar o PDF. Verifique o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return {
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
  };
}
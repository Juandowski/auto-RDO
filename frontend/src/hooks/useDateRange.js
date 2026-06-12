import { useEffect } from 'react';

const DIA_PADRAO = (dataStr) => ({
  data: dataStr,
  horaInicio: '08:00',
  horaFim: '17:00',
  atividades: [{ titulo: '', texto: '', imagens: [] }],
});

/**
 * Gera a lista de dias entre duas datas (inclusive).
 *
 * @param {string} dataInicio - DD/MM/AAAA
 * @param {string} dataFim    - DD/MM/AAAA
 * @returns {{ dias: object[], erro: string | null }}
 */
export function gerarIntervalo(dataInicio, dataFim) {
  const [diaI, mesI, anoI] = dataInicio.split('/');
  const [diaF, mesF, anoF] = dataFim.split('/');

  const inicio = new Date(`${anoI}-${mesI}-${diaI}T00:00:00`);
  const fim    = new Date(`${anoF}-${mesF}-${diaF}T00:00:00`);

  if (inicio > fim) {
    return { dias: null, erro: 'A data de início não pode ser maior que a data final.' };
  }

  const dias = [];
  let dataAtual = new Date(inicio);

  while (dataAtual <= fim) {
    const dd   = String(dataAtual.getDate()).padStart(2, '0');
    const mm   = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const aaaa = dataAtual.getFullYear();
    dias.push(DIA_PADRAO(`${dd}/${mm}/${aaaa}`));
    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return { dias, erro: null };
}

/**
 * Hook que observa o intervalo de datas e notifica via callback
 * quando uma lista de dias válida for gerada.
 *
 * @param {string} dataInicio
 * @param {string} dataFim
 * @param {{ onDiasGerados: (dias: object[]) => void, onErro: (msg: string) => void }} callbacks
 */
export function useDateRange(dataInicio, dataFim, { onDiasGerados, onErro }) {
  useEffect(() => {
    if (dataInicio.length !== 10 || dataFim.length !== 10) return;

    const { dias, erro } = gerarIntervalo(dataInicio, dataFim);

    if (erro) {
      onErro(erro);
    } else {
      onDiasGerados(dias);
    }
  }, [dataInicio, dataFim]);
}
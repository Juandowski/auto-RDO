/**
 * Atualiza um dia pelo índice de forma imutável.
 * @param {object[]} dias
 * @param {number} indexDia
 * @param {(dia: object) => object} updater
 * @returns {object[]}
 */
export function atualizarDia(dias, indexDia, updater) {
  return dias.map((dia, i) => (i !== indexDia ? dia : updater(dia)));
}

/**
 * Atualiza uma atividade dentro de um dia de forma imutável.
 * @param {object[]} dias
 * @param {number} indexDia
 * @param {number} indexAtiv
 * @param {(ativ: object) => object} updater
 * @returns {object[]}
 */
export function atualizarAtividade(dias, indexDia, indexAtiv, updater) {
  return atualizarDia(dias, indexDia, (dia) => ({
    ...dia,
    atividades: dia.atividades.map((ativ, j) =>
      j !== indexAtiv ? ativ : updater(ativ)
    ),
  }));
}
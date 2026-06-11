/**
 * Aplica máscara de data no formato DD/MM/AAAA.
 * @param {string} valor
 * @returns {string}
 */
export const mascaraData = (valor) =>
  valor
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 10);

/**
 * Aplica máscara de hora no formato HH:MM.
 * @param {string} valor
 * @returns {string}
 */
export const mascaraHora = (valor) =>
  valor
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1:$2')
    .slice(0, 5);
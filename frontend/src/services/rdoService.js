const API_URL = 'https://auto-rdo.onrender.com/api/gerar-rdo';

/**
 * Envia os dados do formulário para a API e retorna o Blob do PDF gerado.
 * @param {object} payload
 * @returns {Promise<Blob>}
 * @throws {Error} se a resposta HTTP não for ok
 */
export async function gerarRdoPdf(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Falha ao gerar o PDF (status ${response.status})`);
  }

  return response.blob();
}

/**
 * Dispara o download de um Blob no navegador com o nome de arquivo fornecido.
 * @param {Blob} blob
 * @param {string} nomeArquivo
 */
export function baixarBlob(blob, nomeArquivo) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomeArquivo);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
/**
 * Contrato base para todos os renderizadores de seção do RDO.
 */
class SectionRenderer {
  /**
   * @param {PDFDocument} doc
   * @param {object} dados
   * @param {RdoLayoutConfig} config
   */
  render(doc, dados, config) {
    throw new Error(`${this.constructor.name} deve implementar o método render()`);
  }
}

module.exports = SectionRenderer;
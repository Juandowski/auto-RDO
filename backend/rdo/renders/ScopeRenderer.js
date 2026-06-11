const SectionRenderer = require('./SectionRenderer');

/**
 * Renderiza o bloco de Escopo do Serviço Contratado.
 */
class ScopeRenderer extends SectionRenderer {
  render(doc, dados, config) {
    const { margin, pageWidth, contentWidth } = config;
    const escopoY = doc.y;

    const textEscopo = dados.escopo || '';
    const heightEscopo = doc.heightOfString(textEscopo, { width: contentWidth - 10 });
    const totalBoxHeight = heightEscopo + 35;

    doc.rect(margin, escopoY, pageWidth, totalBoxHeight).stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#000000')
      .text('Escopo do Serviço Contratado:', margin + 10, escopoY + 8);

    doc
      .font('Helvetica')
      .text(textEscopo, margin + 10, escopoY + 24, {
        width: contentWidth - 10,
        align: 'left',
      });

    doc.y = escopoY + totalBoxHeight + 15;
  }
}

module.exports = ScopeRenderer;
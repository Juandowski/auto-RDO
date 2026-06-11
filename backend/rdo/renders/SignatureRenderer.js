const SectionRenderer = require('./SectionRenderer');

/**
 * Renderiza o bloco fixo de assinaturas no final do documento.
 */
class SignatureRenderer extends SectionRenderer {
  render(doc, dados, config) {
    const { margin, pageWidth, bottomEdge } = config;

    if (doc.y + 60 > bottomEdge) {
      doc.addPage();
    }

    const block5Y = 750;

    doc.rect(margin, block5Y, pageWidth, 60).stroke();
    doc
      .moveTo(margin + pageWidth / 2, block5Y)
      .lineTo(margin + pageWidth / 2, block5Y + 60)
      .stroke();
    doc
      .moveTo(margin, block5Y + 20)
      .lineTo(margin + pageWidth, block5Y + 20)
      .stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#000000')
      .text(`Elaborado por: ${dados.tecnico}`, margin + 5, block5Y + 6, { lineBreak: false })
      .text('Assinatura Emerson', margin + 150, block5Y + 26, { lineBreak: false })
      .text('Fiscalização / Cliente:', margin + pageWidth / 2 + 5, block5Y + 6, { lineBreak: false })
      .text('Assinatura Fiscal/Cliente', margin + pageWidth / 2 + 150, block5Y + 26, { lineBreak: false });
  }
}

module.exports = SignatureRenderer;
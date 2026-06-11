const SectionRenderer = require('./SectionRenderer');

/**
 * Renderiza o bloco de identificação: Cliente, Projeto, Task, PO e Serviço.
 * A altura da caixa é calculada dinamicamente para acomodar texto longo.
 */
class InfoBoxRenderer extends SectionRenderer {
  render(doc, dados, config) {
    const { margin, pageWidth, contentWidth } = config;
    const currentY = doc.y;

    const heights = this._measureLines(doc, dados, contentWidth);
    const totalBoxHeight = heights.cliente + heights.projetoTaskPo + heights.servico + 20;

    doc.rect(margin, currentY, pageWidth, totalBoxHeight).stroke();

    this._printCliente(doc, dados, margin, currentY, heights);
    this._printProjetoTaskPo(doc, dados, margin, currentY, heights);
    this._printServico(doc, dados, margin, currentY, heights);

    doc.y = currentY + totalBoxHeight + 15;
  }

  _measureLines(doc, dados, contentWidth) {
    const innerWidth = contentWidth - 50;

    return {
      cliente: doc.heightOfString(dados.cliente || '', { width: innerWidth }),
      projetoTaskPo: doc.heightOfString(
        `${dados.projeto || ''}   |   Task: ${dados.task || ''}   |   PO: ${dados.po || ''}`,
        { width: innerWidth }
      ),
      servico: doc.heightOfString(dados.servico || '', { width: innerWidth }),
    };
  }

  _printCliente(doc, dados, margin, currentY, heights) {
    const textY = currentY + 8;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('Cliente: ', margin + 10, textY, { continued: true });
    doc.font('Helvetica').text(dados.cliente || '');
  }

  _printProjetoTaskPo(doc, dados, margin, currentY, heights) {
    const textY = currentY + 8 + heights.cliente + 4;
    doc.font('Helvetica-Bold').text('Projeto: ', margin + 10, textY, { continued: true });
    doc.font('Helvetica').text(`${dados.projeto || ''}   `, { continued: true });
    doc.font('Helvetica-Bold').text('|   Task: ', { continued: true });
    doc.font('Helvetica').text(`${dados.task || ''}   `, { continued: true });
    doc.font('Helvetica-Bold').text('|   PO: ', { continued: true });
    doc.font('Helvetica').text(dados.po || '');
  }

  _printServico(doc, dados, margin, currentY, heights) {
    const textY = currentY + 8 + heights.cliente + 4 + heights.projetoTaskPo + 4;
    doc.font('Helvetica-Bold').text('Serviço: ', margin + 10, textY, { continued: true });
    doc.font('Helvetica').text(dados.servico || '');
  }
}

module.exports = InfoBoxRenderer;
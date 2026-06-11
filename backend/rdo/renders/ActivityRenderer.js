const ImageBlockRenderer = require('./ImageBlockRenderer');

/**
 * Renderiza uma única atividade (item numerado) dentro de um dia.
 * Gerencia o grid de bordas que pode se estender por múltiplas páginas.
 */
class ActivityRenderer {
  constructor() {
    this.imageBlockRenderer = new ImageBlockRenderer();
  }

  render(doc, ativ, index, config) {
    const { margin, pageWidth, bottomEdge, vertLineX } = config;

    if (doc.y + 30 > bottomEdge) {
      doc.addPage();
      doc.y = config.contentStartY;
    }

    const startPage = doc.bufferedPageRange().count - 1;
    const startY = doc.y;

    this._printItemNumber(doc, ativ, index, margin, startY, vertLineX);
    this._printContent(doc, ativ, vertLineX, startY, config);
    this.imageBlockRenderer.render(doc, ativ.imagens, config);

    if (!ativ.imagens || ativ.imagens.length === 0) {
      doc.y += 8;
    }

    const endPage = doc.bufferedPageRange().count - 1;
    const endY = doc.y;

    this._drawGrid(doc, startPage, endPage, startY, endY, config);

    doc.switchToPage(endPage);
    doc.y = endY;
  }

  _printItemNumber(doc, ativ, index, margin, startY, vertLineX) {
    const isFiller = ativ.texto === 'Sem relatos.' && (!ativ.imagens || ativ.imagens.length === 0);
    if (!isFiller) {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#000000')
        .text(`${index + 1}`, margin, startY + 8, { width: 35, align: 'center', lineBreak: false });
    }
  }

  _printContent(doc, ativ, vertLineX, startY, config) {
    const originalLeftMargin = doc.page.margins.left;
    doc.page.margins.left = vertLineX + 8;
    doc.x = vertLineX + 8;
    doc.y = startY + 8;

    if (ativ.titulo) {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text(ativ.titulo, { width: 445, align: 'left' });
      doc.y += 4;
    }

    doc.font('Helvetica').fontSize(10).fillColor('#000000').text(ativ.texto || 'Sem relatos.', { width: 445, align: 'left' });

    doc.page.margins.left = originalLeftMargin;
    doc.x = config.margin;
  }

  _drawGrid(doc, startPage, endPage, startY, endY, config) {
    const { margin, pageWidth, bottomEdge, vertLineX, contentStartY } = config;

    for (let i = startPage; i <= endPage; i++) {
      doc.switchToPage(i);

      const topBoundary = i === startPage ? startY : contentStartY;
      const bottomBoundary = i === endPage ? endY : bottomEdge;

      doc.moveTo(margin, topBoundary).lineTo(margin, bottomBoundary).stroke();
      doc.moveTo(vertLineX, topBoundary).lineTo(vertLineX, bottomBoundary).stroke();
      doc.moveTo(margin + pageWidth, topBoundary).lineTo(margin + pageWidth, bottomBoundary).stroke();
      doc.moveTo(margin, bottomBoundary).lineTo(margin + pageWidth, bottomBoundary).stroke();

      if (i > startPage) {
        doc.moveTo(margin, contentStartY).lineTo(margin + pageWidth, contentStartY).stroke();
      }
    }
  }
}

module.exports = ActivityRenderer;
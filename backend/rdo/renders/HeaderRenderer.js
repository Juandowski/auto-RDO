const fs = require('fs');
const path = require('path');
const SectionRenderer = require('./SectionRenderer');

/**
 * Responsável exclusivamente por desenhar o cabeçalho do RDO.
 * Registra-se automaticamente no evento 'pageAdded' do PDFKit.
 */
class HeaderRenderer extends SectionRenderer {
  render(doc, dados, config) {
    const drawHeader = () => this._drawHeader(doc, dados, config);

    doc.on('pageAdded', drawHeader);
    drawHeader();

    doc.y = config.contentStartY;
  }

  _drawHeader(doc, dados, config) {
    const { margin, pageWidth, headerY, headerHeight } = config;

    doc.rect(margin, headerY, pageWidth, headerHeight).stroke();
    doc.moveTo(180, headerY).lineTo(180, headerY + headerHeight).stroke();
    doc.moveTo(400, headerY).lineTo(400, headerY + headerHeight).stroke();

    this._drawLogo(doc, margin, headerY);
    this._drawTitle(doc, headerY);
    this._drawPeriod(doc, dados, headerY);

    doc.x = doc.page.margins.left;
    doc.y = config.contentStartY + 8;
    doc.font('Helvetica').fontSize(10);
  }

  _drawLogo(doc, margin, headerY) {
    const logoPath = path.join(__dirname, '../../assets/logo.png');

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin + 5, headerY + 5, {
        fit: [120, 40],
        align: 'center',
        valign: 'center',
      });
    } else {
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#999999')
        .text('Adicione logo.png na pasta assets', margin + 5, headerY + 20, {
          width: 120,
          align: 'center',
        });
    }
  }

  _drawTitle(doc, headerY) {
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#000000')
      .text('RELATÓRIO DIÁRIO DE OBRA', 180, headerY + 15, { width: 220, align: 'center' });

    doc.fontSize(12).text('(RDO)', 180, headerY + 30, { width: 220, align: 'center' });
  }

  _drawPeriod(doc, dados, headerY) {
    doc
      .fontSize(10)
      .text('Periodo de atendimento:', 405, headerY + 8)
      .fontSize(9)
      .text(`Início: ${dados.dataInicio}`, 405, headerY + 22)
      .text(`Fim: ${dados.dataFim}`, 405, headerY + 32);
  }
}

module.exports = HeaderRenderer;
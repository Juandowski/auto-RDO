/**
 * Responsável por renderizar o bloco de imagens de uma atividade.
 */
class ImageBlockRenderer {
  render(doc, imagens, config) {
    if (!imagens || imagens.length === 0) return;

    doc.y += 10;

    const { margin, pageWidth, bottomEdge, imageTargetHeight: targetH, imageGap: gap, vertLineX } = config;
    const maxColW = pageWidth - margin - 8;

    let imgStartY = doc.y;
    let currentImgX = vertLineX + 8;

    imagens.forEach((imgBase64) => {
      try {
        const imgBuffer = this._toBuffer(imgBase64);
        const { imgW, imgH } = this._fitImage(doc, imgBuffer, targetH, maxColW);

        if (currentImgX + imgW > margin + pageWidth - 8) {
          currentImgX = vertLineX + 8;
          imgStartY += targetH + gap;
          doc.y = imgStartY;
        }

        if (imgStartY + imgH > bottomEdge) {
          doc.addPage();
          imgStartY = config.contentStartY + 8;
          doc.y = imgStartY;
          currentImgX = vertLineX + 8;
        }

        doc.image(imgBuffer, currentImgX, imgStartY, { width: imgW, height: imgH });
        currentImgX += imgW + gap;
      } catch (error) {
        console.error('Erro ao renderizar foto:', error);
      }
    });

    doc.y = imgStartY + targetH + 10;
  }

  _toBuffer(imgBase64) {
    const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  _fitImage(doc, imgBuffer, targetH, maxColW) {
    const img = doc.openImage(imgBuffer);
    let imgW = (img.width / img.height) * targetH;
    let imgH = targetH;

    if (imgW > maxColW) {
      imgW = maxColW;
      imgH = (img.height / img.width) * maxColW;
    }

    return { imgW, imgH };
  }
}

module.exports = ImageBlockRenderer;
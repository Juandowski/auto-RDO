/**
 * Objeto de valor (Value Object) que centraliza todas as constantes de layout do RDO.
 */
class RdoLayoutConfig {
  constructor({
    margin = 50,
    pageWidth = 495,
    bottomEdge = 750,
    headerHeight = 50,
    headerY = 40,
    contentStartY = 100,
    imageTargetHeight = 130,
    imageGap = 10,
    lineSpacing = 14,
  } = {}) {
    this.margin = margin;
    this.pageWidth = pageWidth;
    this.bottomEdge = bottomEdge;
    this.headerHeight = headerHeight;
    this.headerY = headerY;
    this.contentStartY = contentStartY;
    this.imageTargetHeight = imageTargetHeight;
    this.imageGap = imageGap;
    this.lineSpacing = lineSpacing;
  }

  get contentWidth() {
    return this.pageWidth - 20;
  }

  get rightEdge() {
    return this.margin + this.pageWidth;
  }

  get vertLineX() {
    return this.margin + 35;
  }
}

module.exports = RdoLayoutConfig;
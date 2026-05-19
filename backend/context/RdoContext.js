class RdoContext {
  constructor() {
    this.strategy = null;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async gerarDocumento(pdfDoc, dados) {
    if (!this.strategy) {
      throw new Error("Nenhuma estratégia definida.");
    }
    return await this.strategy.execute(pdfDoc, dados);
  }
}

module.exports = RdoContext;
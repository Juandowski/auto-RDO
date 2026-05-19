// backend/context/RdoContext.js

class RdoContext {
    constructor() {
      this.strategy = null;
    }
  
    // Define qual estratégia usar dinamicamente
    setStrategy(strategy) {
      this.strategy = strategy;
    }
  
    // Executa o comportamento da estratégia definida
    gerarDocumento(pdfDoc, dados) {
      if (!this.strategy) {
        throw new Error("Nenhuma estratégia de geração de RDO foi definida.");
      }
      return this.strategy.execute(pdfDoc, dados);
    }
  }
  
  module.exports = RdoContext;
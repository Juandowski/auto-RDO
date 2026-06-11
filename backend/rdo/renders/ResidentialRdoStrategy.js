const RdoLayoutConfig = require('../RdoLayoutConfig');
const HeaderRenderer = require('./HeaderRenderer');
const InfoBoxRenderer = require('./InfoBoxRenderer');
const ScopeRenderer = require('./ScopeRenderer');
const DayRenderer = require('./DayRenderer');
const SignatureRenderer = require('./SignatureRenderer');

/**
 * Estratégia de geração do RDO Residencial.
 *
 * Atua como orquestrador (Composite): mantém a sequência de renderização
 * e delega cada responsabilidade para o renderer correspondente.
 *
 * Para criar uma variante do documento (ex: RDO Comercial), basta criar uma
 * nova estratégia que reutilize ou substitua apenas os renderers necessários.
 */
class ResidentialRdoStrategy {
  constructor(config = new RdoLayoutConfig()) {
    this.config = config;

    // Injeção de dependência: fácil de substituir em testes ou subclasses
    this.headerRenderer    = new HeaderRenderer();
    this.infoBoxRenderer   = new InfoBoxRenderer();
    this.scopeRenderer     = new ScopeRenderer();
    this.dayRenderer       = new DayRenderer();
    this.signatureRenderer = new SignatureRenderer();
  }

  async execute(doc, dados) {
    this.headerRenderer.render(doc, dados, this.config);
    this.infoBoxRenderer.render(doc, dados, this.config);
    this.scopeRenderer.render(doc, dados, this.config);

    for (const dia of dados.dias) {
      this.dayRenderer.render(doc, dia, this.config);
    }

    this.signatureRenderer.render(doc, dados, this.config);

    return doc;
  }
}

module.exports = ResidentialRdoStrategy;
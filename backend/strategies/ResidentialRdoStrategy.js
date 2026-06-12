const RdoLayoutConfig = require('../RdoLayoutConfig');
const HeaderRenderer = require('./HeaderRenderer');
const InfoBoxRenderer = require('./InfoBoxRenderer');
const ScopeRenderer = require('./ScopeRenderer');
const DayRenderer = require('./DayRenderer');
const SignatureRenderer = require('./SignatureRenderer');


class ResidentialRdoStrategy {
  constructor(
    config = new RdoLayoutConfig(),
    {
      headerRenderer    = new HeaderRenderer(),
      infoBoxRenderer   = new InfoBoxRenderer(),
      scopeRenderer     = new ScopeRenderer(),
      dayRenderer       = new DayRenderer(),
      signatureRenderer = new SignatureRenderer(),
    } = {}
  ) {
    this.config           = config;
    this.headerRenderer   = headerRenderer;
    this.infoBoxRenderer  = infoBoxRenderer;
    this.scopeRenderer    = scopeRenderer;
    this.dayRenderer      = dayRenderer;
    this.signatureRenderer = signatureRenderer;
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
// backend/server.js
const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');

// Importando o padrão Strategy
const RdoContext = require('./context/RdoContext');
const ResidentialRdoStrategy = require('./strategies/ResidentialRdoStrategy');

const app = express();
app.use(cors());
app.use(express.json());

// Mapeamento das estratégias disponíveis
const estrategiasDisponiveis = {
  'residencial': new ResidentialRdoStrategy()
};

app.post('/api/gerar-rdo', (req, res) => {
  const dadosRDO = req.body;
  // Pegamos o tipo de layout enviado pelo Front. Se não enviar, usa 'residencial' como padrão
  const tipoLayout = dadosRDO.tipoLayout || 'residencial'; 

  try {
    const rdoContext = new RdoContext();
    const estrategiaEscolhida = estrategiasDisponiveis[tipoLayout];

    if (!estrategiaEscolhida) {
      return res.status(400).json({ error: "Tipo de RDO não suportado." });
    }

    // Configura a estratégia no contexto
    rdoContext.setStrategy(estrategiaEscolhida);

    // Inicializa o arquivo PDF em branco
    const doc = new PDFDocument({ margin: 50 });

    // Configura os headers HTTP para o navegador entender que é um download de arquivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=RDO_${tipoLayout}.pdf`);

    // Faz o "pipe" (conecta o fluxo do PDF direto na resposta HTTP)
    doc.pipe(res);

    // Delega a escrita do PDF para a nossa Strategy
    rdoContext.gerarDocumento(doc, dadosRDO);

    // Finaliza e envia o PDF
    doc.end();

  } catch (error) {
    console.error("Erro ao processar a Strategy:", error);
    res.status(500).json({ error: "Erro interno ao gerar o PDF." });
  }
});

app.listen(3001, () => {
  console.log("🚀 Servidor Node rodando com sucesso na porta 3001");
});
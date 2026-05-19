// backend/strategies/ResidentialRdoStrategy.js

class ResidentialRdoStrategy {
  async execute(doc, dados) {
    const margin = 50;
    const width = 495;
    const bottomEdge = 750; 

    // --- FUNÇÃO PARA DESENHAR O CABEÇALHO ---
    const desenharCabecalho = () => {
      const y = 40;
      doc.rect(margin, y, width, 50).stroke();
      doc.moveTo(180, y).lineTo(180, y + 50).stroke();
      doc.moveTo(400, y).lineTo(400, y + 50).stroke();
      
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000').text("RELATÓRIO DIÁRIO DE OBRA", 180, y + 15, { width: 220, align: 'center' });
      doc.fontSize(12).text("(RDO)", 180, y + 30, { width: 220, align: 'center' });
      doc.fontSize(9).text(`Início: ${dados.dataInicio}`, 405, y + 12);
      doc.fontSize(9).text(`Fim: ${dados.dataFim}`, 405, y + 28);

      doc.x = doc.page.margins.left;
      
      // A MÁGICA ESTÁ AQUI:
      // O texto que vaza de página agora vai começar no Y = 108.
      // Como a linha da caixa é desenhada no 100, isso cria 8 pixels perfeitos de margem (padding)!
      doc.y = 108; 
    };

    doc.on('pageAdded', () => desenharCabecalho());
    
    desenharCabecalho();
    
    // Força o primeiro bloco do PDF a começar no 100 para ficar alinhado
    doc.y = 100;

    // --- BLOCO: CLIENTE E SERVIÇO ---
    let currentY = doc.y;
    doc.rect(margin, currentY, width, 40).stroke();
    doc.moveTo(margin, currentY + 20).lineTo(margin + width, currentY + 20).stroke();
    
    doc.font('Helvetica-Bold').fontSize(10).text("Cliente / Projeto: ", margin + 5, currentY + 6, { lineBreak: false });
    doc.font('Helvetica', 10).text(dados.cliente, margin + 105, currentY + 6, { lineBreak: false });
    
    doc.font('Helvetica-Bold').fontSize(10).text("Serviço Principal: ", margin + 5, currentY + 26, { lineBreak: false });
    doc.font('Helvetica', 10).text(dados.servico, margin + 105, currentY + 26, { lineBreak: false });
    
    doc.y = currentY + 55;

    // --- LAÇO DOS BLOCOS DIÁRIOS ---
    for (const dia of dados.dias) {
      const atividadesList = dia.atividades.filter(ativ => ativ.texto.trim() !== '' || ativ.imagens.length > 0);
      if (atividadesList.length === 0) atividadesList.push({ texto: 'Sem relatos.', imagens: [] });

      if (doc.y + 40 > bottomEdge) {
        doc.addPage();
        doc.y = 100; // Mantém a coerência da caixa começando no 100
      }

      const dayStartY = doc.y;
      const vertLineX = margin + 35;

      doc.rect(margin, dayStartY, width, 20).fillAndStroke('#f1f5f9', '#000000');
      doc.moveTo(vertLineX, dayStartY).lineTo(vertLineX, dayStartY + 20).stroke();

      doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
      doc.text("ITEM", margin, dayStartY + 6, { width: 35, align: 'center', lineBreak: false });
      doc.text(`DATA: ${dia.data}`, margin + 45, dayStartY + 6, { lineBreak: false });
      doc.text(`HORÁRIO TRABALHADO: ${dia.horaInicio} às ${dia.horaFim}`, margin + 180, dayStartY + 6, { lineBreak: false });

      doc.y = dayStartY + 20;

      // LAÇO DE ATIVIDADES DO DIA
      for (let index = 0; index < atividadesList.length; index++) {
        const ativ = atividadesList[index];

        if (doc.y + 30 > bottomEdge) {
          doc.addPage();
          doc.y = 100;
        }

        const startPage = doc.bufferedPageRange().count - 1; 
        const startY = doc.y; 

        if (ativ.texto !== 'Sem relatos.' || ativ.imagens.length > 0) {
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
          doc.text(`${index + 1}`, margin, startY + 8, { width: 35, align: 'center', lineBreak: false });
        }

        doc.font('Helvetica').fontSize(10).fillColor('#000000');
        
        const originalLeftMargin = doc.page.margins.left;
        doc.page.margins.left = vertLineX + 8;
        doc.x = vertLineX + 8;
        doc.y = startY + 8;

        doc.text(ativ.texto || 'Sem relatos.', { width: 445, align: 'left' });

        doc.page.margins.left = originalLeftMargin;
        doc.x = margin;

        if (ativ.imagens && ativ.imagens.length > 0) {
          doc.y += 10;
          let imgStartY = doc.y;

          ativ.imagens.forEach((imgBase64, imgIndex) => {
            const coluna = imgIndex % 2;
            const linha = Math.floor(imgIndex / 2);

            if (coluna === 0 && imgIndex > 0) {
              imgStartY += 140;
              doc.y = imgStartY;
            }

            if (imgStartY + 130 > bottomEdge) {
              doc.addPage();
              imgStartY = 108; // As fotos também ganham o respiro de 8px!
              doc.y = imgStartY;
            }

            try {
              const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, "");
              const imgBuffer = Buffer.from(base64Data, 'base64');
              const posX = vertLineX + 8 + (coluna * 220);
              doc.image(imgBuffer, posX, imgStartY, { fit: [210, 125] });
            } catch (error) {
              console.error("Erro ao renderizar foto:", error);
            }
          });
          doc.y = imgStartY + 135; 
        } else {
          doc.y += 8; 
        }

        const endPage = doc.bufferedPageRange().count - 1; 
        const endY = doc.y; 

        const activePage = doc.bufferedPageRange().count - 1;

        for (let i = startPage; i <= endPage; i++) {
          doc.switchToPage(i); 

          let topBoundary = (i === startPage) ? startY : 100;
          let bottomBoundary = (i === endPage) ? endY : bottomEdge;

          doc.moveTo(margin, topBoundary).lineTo(margin, bottomBoundary).stroke();
          doc.moveTo(vertLineX, topBoundary).lineTo(vertLineX, bottomBoundary).stroke();
          doc.moveTo(margin + width, topBoundary).lineTo(margin + width, bottomBoundary).stroke();
          
          doc.moveTo(margin, bottomBoundary).lineTo(margin + width, bottomBoundary).stroke();

          if (i > startPage) {
            // A linha desenha rigorosamente no 100, mas o texto lá no começo manda escrever no 108
            doc.moveTo(margin, 100).lineTo(margin + width, 100).stroke();
          }
        }

        doc.switchToPage(activePage);
        doc.y = endY;
      }

      doc.y += 15; 
    }

    // --- BLOCO: ASSINATURAS FIXAS NO FIM ---
    if (doc.y + 60 > bottomEdge) {
      doc.addPage();
    }

    const block5Y = 750;

    doc.rect(margin, block5Y, width, 40).stroke();
    doc.moveTo(margin + width / 2, block5Y).lineTo(margin + width / 2, block5Y + 40).stroke();
    doc.moveTo(margin, block5Y + 20).lineTo(margin + width, block5Y + 20).stroke();
    
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000');
    doc.text("Responsável Execução (Assinatura):", margin + 5, block5Y + 6, { lineBreak: false });
    doc.text(`Emitido em: ${dados.dataInicio}`, margin + 150, block5Y + 26, { lineBreak: false });
    
    doc.text("Fiscalização / Cliente (Assinatura):", margin + width / 2 + 5, block5Y + 6, { lineBreak: false });
    doc.text(`Recebido em: ${dados.dataFim}`, margin + width / 2 + 150, block5Y + 26, { lineBreak: false });

    return doc;
  }
}

module.exports = ResidentialRdoStrategy;
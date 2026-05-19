// backend/strategies/ResidentialRdoStrategy.js
const fs = require('fs');
const path = require('path');

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
      
      // --- LOGO DA EMERSON ---
      // Procura a imagem dentro da pasta 'backend/assets/'
      const logoPath = path.join(__dirname, '../assets/logo.png'); 
      
      if (fs.existsSync(logoPath)) {
        // Encaixa a imagem perfeitamente dentro da primeira caixa (com folga de borda)
        doc.image(logoPath, margin + 5, y + 5, { fit: [120, 40], align: 'center', valign: 'center' });
      } else {
        // Se a imagem não estiver na pasta, não quebra o sistema e deixa um aviso
        doc.font('Helvetica').fontSize(8).fillColor('#999999').text("Adicione logo.png na pasta assets", margin + 5, y + 20, { width: 120, align: 'center' });
      }

      doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000').text("RELATÓRIO DIÁRIO DE OBRA", 180, y + 15, { width: 220, align: 'center' });
      doc.fontSize(12).text("(RDO)", 180, y + 30, { width: 220, align: 'center' });
      doc.fontSize(9).text(`Início: ${dados.dataInicio}`, 405, y + 12);
      doc.fontSize(9).text(`Fim: ${dados.dataFim}`, 405, y + 28);

      doc.x = doc.page.margins.left;
      doc.y = 108; 

      doc.font('Helvetica').fontSize(10);
    };

    doc.on('pageAdded', () => desenharCabecalho());
    
    desenharCabecalho();
    doc.y = 100;

    // --- BLOCO: CLIENTE, PROJETO, TASK, SERVIÇO ---
    let currentY = doc.y;
        
    // 1. Definimos o conteúdo e calculamos a altura necessária
    const infoText = `Cliente: ${dados.cliente}\nProjeto: ${dados.projeto} | Task: ${dados.task}\nServiço: ${dados.servico}`;

    // Calcula a altura que o texto ocupará dentro da largura 'width'
    const infoHeight = doc.heightOfString(infoText, { width: width - 10, align: 'left' });
    const totalBoxHeight = infoHeight + 15; // Padding interno

    // 2. Desenhamos o retângulo com a altura calculada
    doc.rect(margin, currentY, width, totalBoxHeight).stroke();

    // 3. Imprimimos o texto dentro
    doc.font('Helvetica').fontSize(10)
      .text(infoText, margin + 5, currentY + 5, { width: width - 10, align: 'left' });

    // 4. Movemos o cursor para baixo da nova caixa calculada
    doc.y = currentY + totalBoxHeight + 10;

    // --- LAÇO DOS BLOCOS DIÁRIOS ---
    for (const dia of dados.dias) {
      const atividadesList = dia.atividades.filter(ativ => ativ.texto.trim() !== '' || ativ.imagens.length > 0);
      if (atividadesList.length === 0) atividadesList.push({ texto: 'Sem relatos.', imagens: [] });

      if (doc.y + 40 > bottomEdge) {
        doc.addPage();
        doc.y = 100; 
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
          let currentImgX = vertLineX + 8; 
          const gap = 10; 
          const targetH = 130; 
          const maxColW = 435; 

          ativ.imagens.forEach((imgBase64) => {
            try {
              const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, "");
              const imgBuffer = Buffer.from(base64Data, 'base64');
              
              const img = doc.openImage(imgBuffer);
              let imgW = (img.width / img.height) * targetH;
              let imgH = targetH;

              if (imgW > maxColW) {
                imgW = maxColW;
                imgH = (img.height / img.width) * maxColW;
              }

              if (currentImgX + imgW > margin + width - 8) {
                currentImgX = vertLineX + 8; 
                imgStartY += targetH + gap;  
                doc.y = imgStartY;
              }

              if (imgStartY + imgH > bottomEdge) {
                doc.addPage();
                imgStartY = 108; 
                doc.y = imgStartY;
                currentImgX = vertLineX + 8;
              }

              doc.image(imgBuffer, currentImgX, imgStartY, { width: imgW, height: imgH });
              currentImgX += imgW + gap;
            } catch (error) {
              console.error("Erro ao renderizar foto:", error);
            }
          });
          
          doc.y = imgStartY + targetH + 10; 
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

    doc.rect(margin, block5Y, width, 60).stroke();
    doc.moveTo(margin + width / 2, block5Y).lineTo(margin + width / 2, block5Y + 60).stroke();
    doc.moveTo(margin, block5Y + 20).lineTo(margin + width, block5Y + 20).stroke();
    
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000');
    doc.text(`Elaborado por: ${dados.tecnico}`, margin + 5, block5Y + 6, { lineBreak: false });
    doc.text(`Assinatura Emerson`, margin + 150, block5Y + 26, { lineBreak: false });
    
    doc.text("Fiscalização / Cliente:", margin + width / 2 + 5, block5Y + 6, { lineBreak: false });
    doc.text(`Assinatura Fiscal/Cliente`, margin + width / 2 + 150, block5Y + 26, { lineBreak: false });

    return doc;
  }
}

module.exports = ResidentialRdoStrategy;
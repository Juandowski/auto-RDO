const fs = require('fs');
const path = require('path');

class ResidentialRdoStrategy {
  async execute(doc, dados) {
    const margin = 50;
    const width = 495;
    const bottomEdge = 750; 

    // DESENHO DO CABEÇALHO
    const desenharCabecalho = () => {
      const y = 40;
      doc.rect(margin, y, width, 50).stroke();
      doc.moveTo(180, y).lineTo(180, y + 50).stroke();
      doc.moveTo(400, y).lineTo(400, y + 50).stroke();
      
      // LOGO
      const logoPath = path.join(__dirname, '../assets/logo.png'); 
      
      if (fs.existsSync(logoPath)) {
        // ENCAIXA A LOGO DENTRO DO BOX
        doc.image(logoPath, margin + 5, y + 5, { fit: [120, 40], align: 'center', valign: 'center' });
      } else {
        doc.font('Helvetica').fontSize(8).fillColor('#999999').text("Adicione logo.png na pasta assets", margin + 5, y + 20, { width: 120, align: 'center' });
      }

      doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000').text("RELATÓRIO DIÁRIO DE OBRA", 180, y + 15, { width: 220, align: 'center' });
      doc.fontSize(12).text("(RDO)", 180, y + 30, { width: 220, align: 'center' });
      doc.fontSize(10).text(`Periodo de atendimento:`, 405, y + 8);
      doc.fontSize(9).text(`Início: ${dados.dataInicio}`, 405, y + 22);
      doc.fontSize(9).text(`Fim: ${dados.dataFim}`, 405, y + 32);

      doc.x = doc.page.margins.left;
      doc.y = 108; 

      doc.font('Helvetica').fontSize(10);
    };

    doc.on('pageAdded', () => desenharCabecalho());

    desenharCabecalho();
    doc.y = 100; // Define o início do bloco logo abaixo do cabeçalho

    // BOX: CLIENTE, PROJETO, TASK, SERVIÇO ---
    let currentY = doc.y;
    const contentWidth = width - 20; // Largura interna do texto com margem de segurança
    const lineSpacing = 14;          // Espaçamento vertical padrão entre blocos

    // 1. Calcula a altura dinâmica de cada linha (caso o texto quebre devido ao tamanho)
    const textCliente = `${dados.cliente || ''}`;
    const heightCliente = doc.heightOfString(textCliente, { width: contentWidth - 50 }); // Desconta o tamanho do rótulo

    const textProjetoTaskPo = `${dados.projeto || ''}   |   Task: ${dados.task || ''}   |   PO: ${dados.po || ''}`;
    const heightProjetoTaskPo = doc.heightOfString(textProjetoTaskPo, { width: contentWidth - 50 });

    const textServico = `${dados.servico || ''}`;
    const heightServico = doc.heightOfString(textServico, { width: contentWidth - 50 });

    // 2. Soma as alturas calculadas com os devidos respiros para achar o tamanho total da caixa
    const totalBoxHeight = heightCliente + heightProjetoTaskPo + heightServico + 20; // 20px de padding interno total

    // 3. Desenha a moldura (caixa externa) perfeitamente ajustada
    doc.rect(margin, currentY, width, totalBoxHeight).stroke();

    // 4. Carimba os textos misturando Negrito e Normal cirurgicamente com coordenadas relativas
    let textY = currentY + 8; // Posição do primeiro texto dentro da caixa

    // Linha 1: Cliente
    doc.font('Helvetica-Bold').fontSize(10).text('Cliente: ', margin + 10, textY, { continued: true });
    doc.font('Helvetica').text(textCliente);

    // Linha 2: Projeto | Task | PO
    textY += heightCliente + 4; // Empurra para baixo com base na altura real do cliente
    doc.font('Helvetica-Bold').text('Projeto: ', margin + 10, textY, { continued: true });
    doc.font('Helvetica').text(`${dados.projeto || ''}   `, { continued: true });

    doc.font('Helvetica-Bold').text('|   Task: ', { continued: true });
    doc.font('Helvetica').text(`${dados.task || ''}   `, { continued: true });

    doc.font('Helvetica-Bold').text('|   PO: ', { continued: true });
    doc.font('Helvetica').text(`${dados.po || ''}`); // Sem 'continued' para fechar a linha

    // Linha 3: Serviço
    textY += heightProjetoTaskPo + 4; // Empurra para baixo com base na altura real do bloco do meio
    doc.font('Helvetica-Bold').text('Serviço: ', margin + 10, textY, { continued: true });
    doc.font('Helvetica').text(textServico);

    // 5. Move o cursor definitivo do PDFKit para baixo da caixa para os próximos blocos não atropelarem
    doc.y = currentY + totalBoxHeight + 15;

    //----------------------------------------------------------------------------------------------------

    let escopoY = doc.y; // Mudou o nome para não chocar com currentY
    
    const textEscopo = `${dados.escopo || ''}`;
    // Mede o texto do escopo na largura total interna da caixa
    const heightEscopo = doc.heightOfString(textEscopo, { width: contentWidth - 10 }); 

    // Altura total: espaço do título (16px) + altura do texto livre + margens internas
    const totalBoxHeightEscopo = heightEscopo + 35; 

    // Desenha a moldura do escopo
    doc.rect(margin, escopoY, width, totalBoxHeightEscopo).stroke();

    // Carimba o Título em Negrito
    doc.font('Helvetica-Bold').fontSize(10).text('Escopo do Serviço Contratado:', margin + 10, escopoY + 8);
    
    // Carimba o texto longo logo abaixo do título em fonte normal (Sem continued para não bugar se quebrar linha)
    doc.font('Helvetica').text(textEscopo, margin + 10, escopoY + 24, { 
      width: contentWidth - 10, 
      align: 'left' 
    });

    // Move o cursor do PDFKit para baixo da caixa de escopo de forma definitiva
    doc.y = escopoY + totalBoxHeightEscopo + 15;


    //----------------------------------------------------------------------------------------------------

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

        // --- AJUSTE DE MARGEM PARA O CONTEÚDO (TÍTULO E DESCRIÇÃO) ---
        const originalLeftMargin = doc.page.margins.left;
        doc.page.margins.left = vertLineX + 8;
        doc.x = vertLineX + 8;
        doc.y = startY + 8;

        // 1. Imprime o TÍTULO da Atividade em Negrito (Se existir no formulário)
        if (ativ.titulo) {
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
          doc.text(ativ.titulo, { width: 445, align: 'left' });
          doc.y += 4; // Pequeno respiro de 4px entre o título e a descrição
        }

        // 2. Imprime a DESCRIÇÃO Detalhada em Fonte Normal (Seu código original)
        doc.font('Helvetica').fontSize(10).fillColor('#000000');
        doc.text(ativ.texto || 'Sem relatos.', { width: 445, align: 'left' });

        // Restaura a margem padrão do documento
        doc.page.margins.left = originalLeftMargin;
        doc.x = margin;

        // --- RENDERIZAÇÃO DAS IMAGENS (Mantido idêntico) ---
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

        // --- DESENHO DA GRADE / BOX (Mantido idêntico) ---
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

    // BOX: ASSINATURAS FIXAS NO FIM
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
// backend/strategies/ResidentialRdoStrategy.js

class ResidentialRdoStrategy {
  execute(doc, dados) {
    const margin = 50;
    const width = 495;
    let currentY = 50;

    const desenharCabecalho = (y) => {
      doc.rect(margin, y, width, 50).stroke();
      doc.moveTo(180, y).lineTo(180, y + 50).stroke();
      doc.moveTo(400, y).lineTo(400, y + 50).stroke();
      
      doc.font('Helvetica-Bold').fontSize(14).text("RELATÓRIO DIÁRIO DE OBRA", 180, y + 15, { width: 220, align: 'center' });
      doc.fontSize(12).text("(RDO)", 180, y + 30, { width: 220, align: 'center' });
      doc.fontSize(9).text(`Período Início: ${dados.dataInicio}`, 405, y + 12);
      doc.fontSize(9).text(`Período Fim: ${dados.dataFim}`, 405, y + 28);
      return y + 55;
    };

    currentY = desenharCabecalho(currentY);

    // --- BLOCO: CLIENTE E SERVIÇO PRINCIPAL ---
    doc.rect(margin, currentY, width, 40).stroke();
    doc.moveTo(margin, currentY + 20).lineTo(margin + width, currentY + 20).stroke();
    
    doc.font('Helvetica-Bold').fontSize(10).text("Cliente / Projeto: ", margin + 5, currentY + 5, { continued: true })
       .font('Helvetica').text(dados.cliente);
    doc.font('Helvetica-Bold').text("Serviço Principal: ", margin + 5, currentY + 25, { continued: true })
       .font('Helvetica').text(dados.servico);
    
    currentY += 55;

    // --- LOOP DINÂMICO: DESENHAR CADA UM DOS DIAS ---
    dados.dias.forEach((dia) => {
      
      const textoAtividades = dia.atividades || 'Sem relatos.';

      // 1. IMPORTANTE: Precisamos configurar a fonte ANTES de medir o texto, 
      // para que o PDFKit faça o cálculo com o tamanho exato da letra.
      doc.font('Helvetica').fontSize(10);
      
      // 2. Medimos qual será a altura do texto considerando a largura da coluna (220)
      const textHeight = doc.heightOfString(textoAtividades, { width: 220 });
      
      // 3. Calculamos a altura final do bloco: mínimo de 60, ou o tamanho do texto + 40 (para dar margem em cima e embaixo)
      const alturaBlocoDia = Math.max(60, textHeight + 40);

      // 4. Verificamos a quebra de página baseada na nova altura dinâmica.
      // Se a posição atual + altura do bloco passar do limite inferior (730), criamos nova folha.
      if (currentY + alturaBlocoDia > 730) {
        doc.addPage();
        currentY = 50;
        currentY = desenharCabecalho(currentY);
      }

      // 5. Agora sim, desenhamos a caixa e as linhas usando a 'alturaBlocoDia'
      doc.rect(margin, currentY, width, alturaBlocoDia).stroke();
      
      // Linha horizontal de títulos (fixa no topo do bloco)
      doc.moveTo(margin, currentY + 20).lineTo(margin + width, currentY + 20).stroke(); 
      
      // Linhas verticais: agora elas descem até o fundo variável do bloco!
      doc.moveTo(margin + 90, currentY).lineTo(margin + 90, currentY + alturaBlocoDia).stroke(); 
      doc.moveTo(margin + 260, currentY).lineTo(margin + 260, currentY + alturaBlocoDia).stroke(); 

      // Textos dos Cabeçalhos da Tabela
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text("DATA", margin + 5, currentY + 6);
      doc.text("HORÁRIO TRABALHADO", margin + 95, currentY + 6);
      doc.text("EVENTOS / ATIVIDADES REPORTADAS", margin + 265, currentY + 6);

      // Textos das Colunas
      doc.font('Helvetica').fontSize(10);
      doc.text(dia.data, margin + 5, currentY + 30);
      doc.text(`${dia.horaInicio} às ${dia.horaFim}`, margin + 95, currentY + 30);
      
      // Finalmente, inserimos o texto grandão dentro da coluna correta
      doc.text(textoAtividades, margin + 265, currentY + 30, { width: 220 });

      // Avança o Y adicionando a altura dinâmica + um espaço de respiro entre os dias
      currentY += alturaBlocoDia + 15;
    });


    // --- BLOCO: ASSINATURAS (Fixo sempre na última página) ---
    const footerHeight = 40;
    const block5Y = doc.page.height - margin - footerHeight; 

    doc.rect(margin, block5Y, width, footerHeight).stroke();
    doc.moveTo(margin + width / 2, block5Y).lineTo(margin + width / 2, block5Y + footerHeight).stroke();
    doc.moveTo(margin, block5Y + 20).lineTo(margin + width, block5Y + 20).stroke();
    
    doc.font('Helvetica-Bold').fontSize(8);
    doc.text("Responsável Execução (Assinatura):", margin + 5, block5Y + 5);
    doc.text(`Emitido em: ${dados.dataInicio}`, margin + 150, block5Y + 25);
    
    doc.text("Fiscalização / Cliente (Assinatura):", margin + width / 2 + 5, block5Y + 5);
    doc.text(`Recebido em: ${dados.dataFim}`, margin + width / 2 + 150, block5Y + 25);

    return doc;
  }
}

module.exports = ResidentialRdoStrategy;
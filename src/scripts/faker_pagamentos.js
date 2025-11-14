// src/scripts/faker_pagamentos.js
const { getConnection, sql } = require("../config/db");

// Configurações
const CONFIG = {
  BATCH_SIZE: 2000,  // Aumentei o tamanho do lote para ser mais rápido
  PERIODOS: ["2025-08", "2025-09", "2025-10", "2025-11", "2025-12"],
  STATUS: ['pago', 'pendente', 'atrasado']
};

async function gerarPagamentosRapido() {
  console.log('🚀 Iniciando geração RÁPIDA de pagamentos...');
  const { fakerPT_BR } = await import("@faker-js/faker");
  const pool = await getConnection();
  
  try {
    console.time('⏱️  Tempo total de execução');
    
    // 1. Limpar tabela de pagamentos de forma rápida
    console.log('🧹 Limpando pagamentos existentes...');
    await pool.request().query('TRUNCATE TABLE pagamento');
    
    // 2. Buscar matrículas de forma otimizada
    console.log('🔍 Buscando matrículas...');
    const { recordset: matriculas } = await pool.request().query(`
      SELECT m.id_matricula, c.valor_mensalidade
      FROM matricula m
      JOIN turma t ON m.id_turma = t.id_turma
      JOIN curso c ON t.id_curso = c.id_curso
    `);
    
    if (!matriculas.length) {
      console.log('ℹ️  Nenhuma matrícula encontrada!');
      return;
    }
    
    console.log(`📊 ${matriculas.length} matrículas encontradas`);
    console.log(`🔄 Gerando ${matriculas.length * CONFIG.PERIODOS.length} pagamentos...`);
    
    // 3. Gerar e inserir pagamentos em lotes grandes
    const totalPagamentos = await inserirPagamentosEmLoteOtimizado(pool, matriculas, fakerPT_BR);
    
    console.log(`\n🎉 TUDO PRONTO!`);
    console.log(`✅ ${totalPagamentos} pagamentos gerados com sucesso!`);
    console.timeEnd('⏱️  Tempo total de execução');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  } finally {
    await pool.close();
    console.log('🔒 Conexão encerrada');
  }
}

// Função otimizada para inserção em lote
async function inserirPagamentosEmLoteOtimizado(pool, matriculas, fakerPT_BR) {
  let totalInseridos = 0;
  const totalEsperado = matriculas.length * CONFIG.PERIODOS.length;
  let pagamentosBatch = [];
  
  console.log(`🔄 Preparando para inserir ${totalEsperado} pagamentos...`);

  // Gerar todos os pagamentos primeiro
  for (const mat of matriculas) {
    for (const periodo of CONFIG.PERIODOS) {
      const [year, month] = periodo.split('-').map(Number);
      const dia = fakerPT_BR.number.int({ min: 1, max: 28 });
      
      pagamentosBatch.push({
        id_matricula: mat.id_matricula,
        valor: mat.valor_mensalidade,
        data_pagamento: new Date(Date.UTC(year, month - 1, dia, 12, 0, 0)),
        tipo_pagamento: 'mensalidade',
        periodo_referencia: periodo,
        status: CONFIG.STATUS[Math.floor(Math.random() * CONFIG.STATUS.length)]
      });

      // Inserir em lotes grandes
      if (pagamentosBatch.length >= CONFIG.BATCH_SIZE) {
        await inserirLote(pool, pagamentosBatch);
        totalInseridos += pagamentosBatch.length;
        console.log(`✅ ${totalInseridos}/${totalEsperado} pagamentos processados...`);
        pagamentosBatch = [];
      }
    }
  }

  // Inserir o restante
  if (pagamentosBatch.length > 0) {
    await inserirLote(pool, pagamentosBatch);
    totalInseridos += pagamentosBatch.length;
  }

  return totalInseridos;
}

// Função auxiliar para inserir um lote de pagamentos
async function inserirLote(pool, pagamentos) {
  if (pagamentos.length === 0) return;
  
  const table = new sql.Table('pagamento');
  table.columns.add('id_matricula', sql.Int, { nullable: false });
  table.columns.add('valor', sql.Decimal(10, 2), { nullable: false });
  table.columns.add('data_pagamento', sql.DateTime, { nullable: true });
  table.columns.add('tipo_pagamento', sql.VarChar(50), { nullable: true });
  table.columns.add('periodo_referencia', sql.VarChar(10), { nullable: false });
  table.columns.add('status', sql.VarChar(20), { nullable: true });

  for (const p of pagamentos) {
    table.rows.add(
      p.id_matricula,
      p.valor,
      p.data_pagamento,
      p.tipo_pagamento,
      p.periodo_referencia,
      p.status
    );
  }

  const request = new sql.Request(pool);
  await request.bulk(table);
}

// Executar
gerarPagamentosRapido().catch(console.error);
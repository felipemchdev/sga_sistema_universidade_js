// Script de popular 400 alunos e 400 matrículas (50 por turma)
// Uso: npm run seed:alunos

const { getConnection, sql } = require("../config/db");

// Configurações
const CONFIG = {
  TOTAL_ALUNOS: 400,
  BATCH_SIZE: 50, // Tamanho do lote para inserções em batch
  UF_LIST: ["SP", "RJ", "MG", "ES", "PR", "MS", "BA", "RS", "SC", "GO", "MT"],
  STATUS_ALUNO: ["ativo", "inativo", "trancado"],
  STATUS_MATRICULA: ["ativa", "trancada"]
};

// Gera um lote de alunos
function gerarLoteAlunos(qtd, fakerPT_BR) {
  const alunos = [];
  for (let i = 0; i < qtd; i++) {
    alunos.push({
      nome: fakerPT_BR.person.fullName(),
      cidade: fakerPT_BR.location.city(),
      estado: fakerPT_BR.helpers.arrayElement(CONFIG.UF_LIST),
      data_nascimento: fakerPT_BR.date.birthdate({ min: 18, max: 40, mode: "age" }),
      status: fakerPT_BR.helpers.arrayElement(CONFIG.STATUS_ALUNO)
    });
  }
  return alunos;
}

// Insere alunos em lote e retorna os IDs
async function inserirAlunosEmLote(pool, alunos) {
  const table = new sql.Table('aluno');
  
  // Definindo as colunas exatamente como estão no banco de dados
  table.columns.add('nome', sql.NVarChar(200), { nullable: false });
  table.columns.add('cidade', sql.NVarChar(100), { nullable: false });
  table.columns.add('estado', sql.NVarChar(2), { 
    nullable: true, 
    default: 'SP'
  });
  table.columns.add('data_nascimento', sql.Date, { nullable: true });
  table.columns.add('status', sql.NVarChar(20), { 
    nullable: true, 
    default: 'ativo' 
  });

  // Adiciona as linhas à tabela
  alunos.forEach(aluno => {
    table.rows.add(
      aluno.nome,
      aluno.cidade,
      aluno.estado,
      aluno.data_nascimento,
      aluno.status || 'ativo' // Garante um valor padrão
    );
  });

  try {
    // Executa o bulk insert
    const request = new sql.Request(pool);
    await request.bulk(table);
    
    // Obtém os IDs dos alunos inseridos
    const idsResult = await request.query(`
      SELECT TOP ${alunos.length} id_aluno 
      FROM aluno 
      ORDER BY id_aluno DESC
    `);
    
    return idsResult.recordset.map(r => r.id_aluno).reverse();
  } catch (error) {
    console.error('Erro ao inserir alunos em lote:', error);
    throw error;
  }
}

// Insere matrículas em lote
async function inserirMatriculasEmLote(pool, matriculas) {
  const table = new sql.Table('matricula');
  
  // Definindo as colunas exatamente como estão no banco de dados
  table.columns.add('id_aluno', sql.Int, { nullable: false });
  table.columns.add('id_turma', sql.Int, { nullable: false });
  table.columns.add('data_matricula', sql.DateTime, { 
    nullable: true,
    default: new Date() 
  });
  table.columns.add('status_matricula', sql.NVarChar(20), { 
    nullable: true, 
    default: 'ativa' 
  });
  table.columns.add('observacoes', sql.NVarChar(sql.MAX), { nullable: true });

  // Adiciona as linhas à tabela
  matriculas.forEach(matricula => {
    table.rows.add(
      matricula.id_aluno,
      matricula.id_turma,
      new Date(), // data_matricula
      matricula.status_matricula || 'ativa',
      matricula.observacoes || null
    );
  });

  try {
    // Executa o bulk insert
    const request = new sql.Request(pool);
    await request.bulk(table);
  } catch (error) {
    console.error('Erro ao inserir matrículas em lote:', error);
    throw error;
  }
}

async function main() {
  console.time('Tempo total de execução');
  const { fakerPT_BR } = await import("@faker-js/faker");
  let pool;

  try {
    pool = await getConnection();
    console.log('✅ Conectado ao banco de dados com sucesso!');

    // Buscar turmas existentes
    console.log('🔍 Buscando turmas...');
    const turmasResult = await pool.request().query("SELECT id_turma FROM turma ORDER BY id_turma");
    const turmas = turmasResult.recordset.map(t => t.id_turma);

    if (turmas.length === 0) {
      throw new Error("❌ Nenhuma turma encontrada. Abortando.");
    }

    const totalNovosAlunos = CONFIG.TOTAL_ALUNOS;
    const porTurma = Math.floor(totalNovosAlunos / turmas.length);
    const resto = totalNovosAlunos % turmas.length;

    console.log(`📊 Populando ${totalNovosAlunos} alunos e matrículas: ${porTurma} por turma (+${resto} distribuídos nas primeiras turmas).`);
    
    let totalAlunosInseridos = 0;
    let totalMatriculasInseridas = 0;
    
    // Processa cada turma
    for (let idx = 0; idx < turmas.length; idx++) {
      const idTurma = turmas[idx];
      const qtdParaTurma = porTurma + (idx < resto ? 1 : 0);
      
      if (qtdParaTurma === 0) continue;
      
      console.log(`\n🏫 Processando turma ${idx + 1}/${turmas.length} (ID: ${idTurma}) - ${qtdParaTurma} alunos`);
      
      // Processa em lotes para melhor desempenho
      for (let i = 0; i < qtdParaTurma; i += CONFIG.BATCH_SIZE) {
        const batchSize = Math.min(CONFIG.BATCH_SIZE, qtdParaTurma - i);
        console.log(`  🚀 Inserindo lote de ${batchSize} alunos...`);
        
        try {
          // Gera um lote de alunos
          const alunos = gerarLoteAlunos(batchSize, fakerPT_BR);
          
          // Insere os alunos e obtém seus IDs
          const idsAlunos = await inserirAlunosEmLote(pool, alunos);
          totalAlunosInseridos += idsAlunos.length;
          
          // Prepara as matrículas
          const matriculas = idsAlunos.map(idAluno => ({
            id_aluno: idAluno,
            id_turma: idTurma,
            status_matricula: fakerPT_BR.helpers.arrayElement(CONFIG.STATUS_MATRICULA),
            observacoes: fakerPT_BR.helpers.maybe(
              () => fakerPT_BR.lorem.sentence({ min: 3, max: 10 }),
              { probability: 0.4 }
            )
          }));
          
          // Insere as matrículas em lote
          await inserirMatriculasEmLote(pool, matriculas);
          totalMatriculasInseridas += matriculas.length;
          
          console.log(`  ✅ Lote concluído: ${i + batchSize}/${qtdParaTurma} alunos processados`);
        } catch (error) {
          console.error(`❌ Erro ao processar lote ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}:`, error.message);
          throw error;
        }
      }
    }
    
    console.log(`\n🎉 População concluída com sucesso!`);
    console.log(`✅ Total de alunos inseridos: ${totalAlunosInseridos}`);
    console.log(`✅ Total de matrículas realizadas: ${totalMatriculasInseridas}`);
    console.timeEnd('Tempo total de execução');
  } catch (error) {
    console.error('\n❌ Ocorreu um erro durante a execução do script:', error.message);
    process.exit(1);
  } finally {
    // Fecha a conexão com o banco de dados
    if (pool) {
      try {
        await pool.close();
        console.log('🔒 Conexão com o banco de dados encerrada.');
      } catch (err) {
        console.error('Erro ao fechar a conexão:', err.message);
      }
    }
  }
}

// Executa o script
main().catch(err => {
  console.error('❌ Erro ao executar o script:', err);
  process.exit(1);
});

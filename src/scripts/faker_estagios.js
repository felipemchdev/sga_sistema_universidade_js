// Script para popular empresas e estágios
// Uso: npm run seed:estagios

const { getConnection, sql } = require("../config/db");

// Dados das empresas
const empresas = [
  {
    nome: 'Tech Solutions LTDA',
    cnpj: '12.345.678/0001-90',
    endereco: 'Av. Paulista, 1000 - São Paulo/SP',
    telefone: '(11) 1234-5678',
    email: 'rh@techsolutions.com',
    responsavel: 'João Silva'
  },
  {
    nome: 'Inova Sistemas SA',
    cnpj: '23.456.789/0001-01',
    endereco: 'Rua da Inovação, 200 - Campinas/SP',
    telefone: '(19) 8765-4321',
    email: 'contato@inovasistemas.com.br',
    responsavel: 'Maria Oliveira'
  },
  {
    nome: 'Global Tech',
    cnpj: '34.567.890/0001-12',
    endereco: 'Av. Brasil, 1500 - Rio de Janeiro/RJ',
    telefone: '(21) 2345-6789',
    email: 'contato@globaltech.com',
    responsavel: 'Carlos Eduardo'
  },
  {
    nome: 'SoftBlue Tecnologia',
    cnpj: '45.678.901/0001-23',
    endereco: 'Rua das Flores, 300 - Belo Horizonte/MG',
    telefone: '(31) 3456-7890',
    email: 'rh@softblue.com.br',
    responsavel: 'Ana Paula'
  },
  {
    nome: 'DataMind Analytics',
    cnpj: '56.789.012/0001-34',
    endereco: 'Av. Afonso Pena, 2000 - Belo Horizonte/MG',
    telefone: '(31) 9876-5432',
    email: 'contato@datamind.com',
    responsavel: 'Roberto Almeida'
  },
  {
    nome: 'CodeMaster Dev',
    cnpj: '67.890.123/0001-45',
    endereco: 'Rua da Tecnologia, 400 - São Paulo/SP',
    telefone: '(11) 3456-7890',
    email: 'contato@codemaster.com',
    responsavel: 'Fernanda Lima'
  },
  {
    nome: 'WebForge Solutions',
    cnpj: '78.901.234/0001-56',
    endereco: 'Av. Paulista, 2000 - São Paulo/SP',
    telefone: '(11) 9876-5432',
    email: 'contato@webforge.com',
    responsavel: 'Ricardo Santos'
  },
  {
    nome: 'ByteWise Tecnologia',
    cnpj: '89.012.345/0001-67',
    endereco: 'Rua das Palmeiras, 500 - Campinas/SP',
    telefone: '(19) 2345-6789',
    email: 'rh@bytewise.com',
    responsavel: 'Patrícia Oliveira'
  },
  {
    nome: 'Nexus Systems',
    cnpj: '90.123.456/0001-78',
    endereco: 'Av. Rio Branco, 100 - Rio de Janeiro/RJ',
    telefone: '(21) 9876-5432',
    email: 'contato@nexus.com',
    responsavel: 'Gustavo Mendes'
  },
  {
    nome: 'Infinite Loop LTDA',
    cnpj: '01.234.567/0001-89',
    endereco: 'Rua da Inovação, 100 - São Paulo/SP',
    telefone: '(11) 2345-6789',
    email: 'contato@infiniteloop.com',
    responsavel: 'Camila Almeida'
  }
];

// Função para gerar data aleatória
function getRandomDate(from, months) {
  const date = new Date(from);
  date.setMonth(date.getMonth() + Math.floor(Math.random() * months));
  return date;
}

async function main() {
  let pool;
  try {
    pool = await getConnection();
    console.log('🔍 Iniciando seed de empresas e estágios...');

    // Inserir empresas se não existirem
    const empresaCount = await pool.request().query("SELECT COUNT(*) as total FROM empresa_estagio");
    if (empresaCount.recordset[0].total === 0) {
      console.log('🏢 Inserindo empresas...');
      for (const empresa of empresas) {
        await pool.request()
          .input('nome', sql.VarChar, empresa.nome)
          .input('cnpj', sql.VarChar, empresa.cnpj)
          .input('endereco', sql.VarChar, empresa.endereco)
          .input('telefone', sql.VarChar, empresa.telefone)
          .input('email', sql.VarChar, empresa.email)
          .input('responsavel', sql.VarChar, empresa.responsavel)
          .query(`
            INSERT INTO empresa_estagio 
            (nome, cnpj, endereco, telefone, email, responsavel) 
            VALUES (@nome, @cnpj, @endereco, @telefone, @email, @responsavel)
          `);
      }
      console.log(`✅ ${empresas.length} empresas inseridas com sucesso!`);
    } else {
      console.log('ℹ️  Empresas já cadastradas. Pulando inserção de empresas...');
    }

    // Buscar alunos ativos
    console.log('👥 Buscando alunos ativos...');
    const alunos = (await pool.request().query(`
      SELECT a.id_aluno, a.nome, c.descricao as curso 
      FROM aluno a
      JOIN matricula m ON a.id_aluno = m.id_aluno
      JOIN turma t ON m.id_turma = t.id_turma
      JOIN curso c ON t.id_curso = c.id_curso
      WHERE m.status_matricula = 'ativa'
      ORDER BY NEWID()
    `)).recordset;

    if (alunos.length === 0) {
      console.log('❌ Nenhum aluno ativo encontrado.');
      return;
    }

    // Pegar IDs das empresas
    const empresasIds = (await pool.request().query(`
      SELECT id_empresa FROM empresa_estagio
    `)).recordset.map(e => e.id_empresa);

    // Configuração para geração de estágios
    const totalEstagios = (await pool.request().query("SELECT COUNT(*) as total FROM estagio")).recordset[0].total;
    const maxEstagios = 1000;
    
    if (totalEstagios >= maxEstagios) {
      console.log(`ℹ️  Já existem ${totalEstagios} estágios. Limite de ${maxEstagios} atingido.`);
      return;
    }

    const estagiosParaCriar = Math.min(100, maxEstagios - totalEstagios, alunos.length);
    console.log(`🔄 Criando ${estagiosParaCriar} estágios...`);

    let estagiosCriados = 0;
    let estagiosConcluidos = 0;

    for (let i = 0; i < estagiosParaCriar; i++) {
      const aluno = alunos[i % alunos.length]; // Usar alunos em ciclo se necessário
      const empresaId = empresasIds[Math.floor(Math.random() * empresasIds.length)];
      
      // 30% de chance de ser concluído
      const estaConcluido = Math.random() < 0.3;
      const dataAtual = new Date();
      const dataInicio = getRandomDate(new Date(2024, 0, 1), 12); // Últimos 12 meses
      const dataTermino = estaConcluido ? 
        getRandomDate(dataInicio, 6) : // 1-6 meses após início
        null;
      
      const cargaHorariaTotal = 240 + Math.floor(Math.random() * 241); // 240-480h
      const cargaHorariaCumprida = estaConcluido ? 
        cargaHorariaTotal : 
        Math.floor(cargaHorariaTotal * (0.1 + Math.random() * 0.8)); // 10-90%
      
      const valorBolsa = 600 + Math.floor(Math.random() * 1401); // 600-2000

      // Inserir estágio
      await pool.request()
        .input('id_aluno', sql.Int, aluno.id_aluno)
        .input('id_empresa', sql.Int, empresaId)
        .input('data_inicio', sql.Date, dataInicio)
        .input('data_termino', sql.Date, dataTermino)
        .input('carga_horaria_total', sql.Int, cargaHorariaTotal)
        .input('carga_horaria_cumprida', sql.Int, cargaHorariaCumprida)
        .input('status', sql.VarChar, estaConcluido ? 'concluido' : 'em_andamento')
        .input('valor_bolsa', sql.Decimal(10, 2), valorBolsa)
        .input('observacoes', sql.VarChar, `Estágio ${estaConcluido ? 'concluído' : 'em andamento'}`)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM estagio WHERE id_aluno = @id_aluno)
            INSERT INTO estagio (
              id_aluno, id_empresa, data_inicio, data_termino,
              carga_horaria_total, carga_horaria_cumprida, status,
              valor_bolsa, observacoes
            ) VALUES (
              @id_aluno, @id_empresa, @data_inicio, @data_termino,
              @carga_horaria_total, @carga_horaria_cumprida, @status,
              @valor_bolsa, @observacoes
            )
        `);
      
      estagiosCriados++;
      if (estaConcluido) estagiosConcluidos++;
    }

    console.log(`
🎉 ${estagiosCriados} estágios criados com sucesso!
✅ ${estagiosConcluidos} estágios concluídos
🔄 ${estagiosCriados - estagiosConcluidos} estágios em andamento
📊 Total de estágios no banco: ${totalEstagios + estagiosCriados}`);

  } catch (error) {
    console.error('❌ Erro ao executar o seed:', error.message);
  } finally {
    if (pool) await pool.close();
    process.exit(0);
  }
}

main();
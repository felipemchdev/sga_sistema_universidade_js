// Script de popular 400 alunos e 400 matrículas (50 por turma)
// Uso: npm run seed:alunos

const { connectDB, getPool, sql } = require("../config/db");

async function main() {
  // Import dinâmico por compatibilidade ESM do @faker-js/faker v9+
  const { fakerPT_BR } = await import("@faker-js/faker");

  await connectDB();
  const pool = getPool();

  // Buscar turmas existentes
  const turmasResult = await pool
    .request()
    .query("SELECT id_turma FROM turma ORDER BY id_turma");
  const turmas = turmasResult.recordset.map((t) => t.id_turma);

  if (turmas.length === 0) {
    throw new Error("Nenhuma turma encontrada. Abortando.");
  }

  const totalNovosAlunos = 400;
  const porTurma = Math.floor(totalNovosAlunos / turmas.length);
  const resto = totalNovosAlunos % turmas.length;

  console.log(
    `Populando ${totalNovosAlunos} alunos e matrículas: ${porTurma} por turma (+${resto} distribuídos nos primeiros turmas se houver).`
  );

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    let criados = 0;

    for (let idx = 0; idx < turmas.length; idx++) {
      const idTurma = turmas[idx];
      // Distribuição extra do resto, se existir
      const qtdParaTurma = porTurma + (idx < resto ? 1 : 0);

      for (let i = 0; i < qtdParaTurma; i++) {
        const requestAluno = new sql.Request(transaction);

        const nome = fakerPT_BR.person.fullName();
        const cidade = fakerPT_BR.location.city();
        // UFs válidas conforme CHECK constraint do banco
        // Lista EXATA permitida pelo CHECK constraint em projeto_universidade_web.sql
        const UF_LIST = [
          "SP",
          "RJ",
          "MG",
          "ES",
          "PR",
          "MS",
          "BA",
          "RS",
          "SC",
          "GO",
          "MT",
        ];
        const estado = fakerPT_BR.helpers.arrayElement(UF_LIST);
        const dataNascimento = fakerPT_BR.date.birthdate({
          min: 18,
          max: 40,
          mode: "age",
        });
        const statusAluno = fakerPT_BR.helpers.arrayElement([
          "ativo",
          "inativo",
          "trancado",
        ]);

        const insertAluno = await requestAluno
          .input("nome", sql.VarChar, nome)
          .input("cidade", sql.VarChar, cidade)
          .input("estado", sql.Char(2), estado)
          .input("data_nascimento", sql.Date, dataNascimento)
          .input("status", sql.VarChar, statusAluno).query(`
            INSERT INTO aluno (nome, cidade, estado, data_nascimento, status)
            OUTPUT INSERTED.id_aluno
            VALUES (@nome, @cidade, @estado, @data_nascimento, @status)
          `);

        const idAluno = insertAluno.recordset[0].id_aluno;

        const requestMat = new sql.Request(transaction);
        const statusMatricula = fakerPT_BR.helpers.arrayElement([
          "ativa",
          "trancada",
        ]);
        const observacoes =
          fakerPT_BR.helpers.maybe(
            () => fakerPT_BR.lorem.sentence({ min: 3, max: 10 }),
            { probability: 0.4 }
          ) || null;

        await requestMat
          .input("id_aluno", sql.Int, idAluno)
          .input("id_turma", sql.Int, idTurma)
          .input("status_matricula", sql.VarChar, statusMatricula)
          .input("observacoes", sql.Text, observacoes).query(`
            INSERT INTO matricula (id_aluno, id_turma, status_matricula, observacoes)
            VALUES (@id_aluno, @id_turma, @status_matricula, @observacoes)
          `);

        criados++;

        if (criados % 50 === 0) {
          console.log(
            `Progresso: ${criados}/${totalNovosAlunos} registros criados...`
          );
        }
      }
    }

    await transaction.commit();
    console.log("Concluído com sucesso.");
  } catch (err) {
    await transaction.rollback();
    console.error("Falha ao popular dados, efetuado rollback.", err);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

// Gera pagamentos mensais para todas as matrículas
// Período: ago/2025 a dez/2025 (5 pagamentos por aluno/matrícula)
// Uso: npm run seed:pagamentos

const { connectDB, getPool, sql } = require("../config/db");

async function main() {
  const { fakerPT_BR } = await import("@faker-js/faker");

  await connectDB();
  const pool = getPool();

  // Períodos alvo (YYYY-MM)
  const periodos = ["2025-08", "2025-09", "2025-10", "2025-11", "2025-12"];

  // Buscar todas as matrículas com o valor da mensalidade do curso
  const matriculas = await pool.request().query(`
    SELECT m.id_matricula, c.valor_mensalidade
    FROM matricula m
    JOIN turma t ON m.id_turma = t.id_turma
    JOIN curso c ON t.id_curso = c.id_curso
  `);

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    let inseridos = 0;

    for (const row of matriculas.recordset) {
      const { id_matricula, valor_mensalidade } = row;

      for (const periodo of periodos) {
        // Evitar duplicatas se já existir pagamento para o mesmo período
        const existsRes = await new sql.Request(transaction)
          .input("id_matricula", sql.Int, id_matricula)
          .input("periodo", sql.VarChar, periodo)
          .query(
            "SELECT 1 as ok FROM pagamento WHERE id_matricula = @id_matricula AND periodo_referencia = @periodo"
          );

        if (existsRes.recordset.length > 0) {
          continue;
        }

        // Data dentro do mês de referência
        const [yearStr, monthStr] = periodo.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr); // 1-12
        const day = fakerPT_BR.number.int({ min: 1, max: 28 });
        const dataPagamento = new Date(
          Date.UTC(year, month - 1, day, 12, 0, 0)
        );

        const tipo_pagamento = "mensalidade";
        const status = fakerPT_BR.helpers.arrayElement([
          "pago",
          "pendente",
          "atrasado",
        ]);

        await new sql.Request(transaction)
          .input("id_matricula", sql.Int, id_matricula)
          .input("valor", sql.Decimal(10, 2), valor_mensalidade)
          .input("data_pagamento", sql.DateTime, dataPagamento)
          .input("tipo_pagamento", sql.VarChar, tipo_pagamento)
          .input("periodo_referencia", sql.VarChar, periodo)
          .input("status", sql.VarChar, status).query(`
            INSERT INTO pagamento (
              id_matricula, valor, data_pagamento, tipo_pagamento, periodo_referencia, status
            ) VALUES (
              @id_matricula, @valor, @data_pagamento, @tipo_pagamento, @periodo_referencia, @status
            )
          `);

        inseridos++;
        if (inseridos % 500 === 0) {
          console.log(`Pagamentos inseridos: ${inseridos}`);
        }
      }
    }

    await transaction.commit();
    console.log(`Concluído. Pagamentos inseridos: ${inseridos}.`);
  } catch (err) {
    await transaction.rollback();
    console.error("Erro ao gerar pagamentos. Rollback realizado.", err);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

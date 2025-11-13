const { query } = require("../config/db");

async function listarDepartamentos() {
  const result = await query("SELECT * FROM departamento ORDER BY descricao");
  return result.recordset;
}

async function criarDepartamento({ descricao }) {
  const result = await query(
    "INSERT INTO departamento (descricao) OUTPUT INSERTED.* VALUES (@descricao)",
    { descricao: { type: 'VarChar', value: descricao } }
  );
  return result.recordset[0];
}

async function atualizarDepartamento(id, { descricao }) {
  const result = await query(
    "UPDATE departamento SET descricao = @descricao OUTPUT INSERTED.* WHERE id_departamento = @id",
    [
      { name: 'id', type: 'Int', value: id },
      { name: 'descricao', type: 'VarChar', value: descricao }
    ]
  );
  return result.recordset[0];
}

async function removerDepartamento(id) {
  const result = await query(
    "DELETE FROM departamento WHERE id_departamento = @id",
    { id: { type: 'Int', value: id } }
  );
  return result.rowsAffected[0] > 0;
}

module.exports = {
  listarDepartamentos,
  criarDepartamento,
  atualizarDepartamento,
  removerDepartamento,
};

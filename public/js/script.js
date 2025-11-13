// Configurações globais
const API_BASE_URL = "http://localhost:3000/api";
let currentData = {
  departamentos: [],
  cursos: [],
  turmas: [],
  alunos: [],
  matriculas: [],
  pagamentos: [],
};

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", function () {
  initializeTabs();
  initializeModal();
  loadAllData();
});

// =====================================================
// NAVEGAÇÃO POR TABS
// =====================================================

function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      // Remove active class de todos os botões e conteúdos
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Adiciona active class ao botão clicado e conteúdo correspondente
      button.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });
}

// =====================================================
// MODAL E FORMULÁRIOS
// =====================================================

function initializeModal() {
  const modal = document.getElementById("modal");
  const closeBtn = document.querySelector(".close");

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

function showForm(entityType, data = null) {
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");

  const formHTML = generateFormHTML(entityType, data);
  modalBody.innerHTML = formHTML;

  modal.style.display = "block";

  // Adiciona event listener ao formulário
  const form = document.getElementById("entity-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFormSubmit(entityType, data ? data.id : null);
  });
}

function generateFormHTML(entityType, data) {
  const isEdit = data !== null;
  const title = isEdit
    ? `Editar ${getEntityName(entityType)}`
    : `Novo ${getEntityName(entityType)}`;

  let formHTML = `
        <h2>${title}</h2>
        <form id="entity-form">
    `;

  switch (entityType) {
    case "departamento":
      formHTML += `
                <div class="form-group">
                    <label for="descricao">Descrição:</label>
                    <input type="text" id="descricao" name="descricao" value="${
                      data?.descricao || ""
                    }" required>
                </div>
            `;
      break;

    case "curso":
      formHTML += `
                <div class="form-group">
                    <label for="id_departamento">Departamento:</label>
                    <select id="id_departamento" name="id_departamento" required>
                        <option value="">Selecione um departamento</option>
                        ${currentData.departamentos
                          .map(
                            (dept) =>
                              `<option value="${dept.id_departamento}" ${
                                data?.id_departamento == dept.id_departamento
                                  ? "selected"
                                  : ""
                              }>
                                ${dept.descricao}
                            </option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="descricao">Descrição:</label>
                    <input type="text" id="descricao" name="descricao" value="${
                      data?.descricao || ""
                    }" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="sigla">Sigla:</label>
                        <input type="text" id="sigla" name="sigla" value="${
                          data?.sigla || ""
                        }" maxlength="4" required>
                    </div>
                    <div class="form-group">
                        <label for="valor_mensalidade">Valor da Mensalidade:</label>
                        <input type="number" id="valor_mensalidade" name="valor_mensalidade" step="0.01" value="${
                          data?.valor_mensalidade || ""
                        }" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="duracao_semestres">Duração (semestres):</label>
                    <input type="number" id="duracao_semestres" name="duracao_semestres" value="${
                      data?.duracao_semestres || "8"
                    }" min="1" required>
                </div>
            `;
      break;

    case "turma":
      formHTML += `
                <div class="form-group">
                    <label for="id_curso">Curso:</label>
                    <select id="id_curso" name="id_curso" required>
                        <option value="">Selecione um curso</option>
                        ${currentData.cursos
                          .map(
                            (curso) =>
                              `<option value="${curso.id_curso}" ${
                                data?.id_curso == curso.id_curso
                                  ? "selected"
                                  : ""
                              }>
                                ${curso.descricao}
                            </option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="semestre">Semestre:</label>
                        <input type="number" id="semestre" name="semestre" value="${
                          data?.semestre || ""
                        }" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="periodo">Período:</label>
                        <input type="text" id="periodo" name="periodo" value="${
                          data?.periodo || ""
                        }" placeholder="2024.1" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="turno">Turno:</label>
                        <select id="turno" name="turno" required>
                            <option value="">Selecione o turno</option>
                            <option value="matutino" ${
                              data?.turno === "matutino" ? "selected" : ""
                            }>Matutino</option>
                            <option value="vespertino" ${
                              data?.turno === "vespertino" ? "selected" : ""
                            }>Vespertino</option>
                            <option value="noturno" ${
                              data?.turno === "noturno" ? "selected" : ""
                            }>Noturno</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="limite_alunos">Limite de Alunos:</label>
                        <input type="number" id="limite_alunos" name="limite_alunos" value="${
                          data?.limite_alunos || "50"
                        }" min="1" max="100" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="sala">Sala:</label>
                        <input type="text" id="sala" name="sala" value="${
                          data?.sala || ""
                        }">
                    </div>
                    <div class="form-group">
                        <label for="data_inicio">Data de Início:</label>
                        <input type="date" id="data_inicio" name="data_inicio" value="${
                          data?.data_inicio || ""
                        }">
                    </div>
                </div>
                <div class="form-group">
                    <label for="data_termino">Data de Término:</label>
                    <input type="date" id="data_termino" name="data_termino" value="${
                      data?.data_termino || ""
                    }">
                </div>
            `;
      break;

    case "aluno":
      formHTML += `
                <div class="form-group">
                    <label for="nome">Nome:</label>
                    <input type="text" id="nome" name="nome" value="${
                      data?.nome || ""
                    }" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="cidade">Cidade:</label>
                        <input type="text" id="cidade" name="cidade" value="${
                          data?.cidade || ""
                        }" required>
                    </div>
                    <div class="form-group">
                        <label for="estado">Estado:</label>
                        <select id="estado" name="estado" required>
                            <option value="">Selecione o estado</option>
                            <option value="SP" ${
                              data?.estado === "SP" ? "selected" : ""
                            }>São Paulo</option>
                            <option value="RJ" ${
                              data?.estado === "RJ" ? "selected" : ""
                            }>Rio de Janeiro</option>
                            <option value="MG" ${
                              data?.estado === "MG" ? "selected" : ""
                            }>Minas Gerais</option>
                            <option value="ES" ${
                              data?.estado === "ES" ? "selected" : ""
                            }>Espírito Santo</option>
                            <option value="PR" ${
                              data?.estado === "PR" ? "selected" : ""
                            }>Paraná</option>
                            <option value="SC" ${
                              data?.estado === "SC" ? "selected" : ""
                            }>Santa Catarina</option>
                            <option value="RS" ${
                              data?.estado === "RS" ? "selected" : ""
                            }>Rio Grande do Sul</option>
                            <option value="BA" ${
                              data?.estado === "BA" ? "selected" : ""
                            }>Bahia</option>
                            <option value="GO" ${
                              data?.estado === "GO" ? "selected" : ""
                            }>Goiás</option>
                            <option value="MT" ${
                              data?.estado === "MT" ? "selected" : ""
                            }>Mato Grosso</option>
                            <option value="MS" ${
                              data?.estado === "MS" ? "selected" : ""
                            }>Mato Grosso do Sul</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="data_nascimento">Data de Nascimento:</label>
                        <input type="date" id="data_nascimento" name="data_nascimento" value="${
                          data?.data_nascimento || ""
                        }">
                    </div>
                    <div class="form-group">
                        <label for="status">Status:</label>
                        <select id="status" name="status" required>
                            <option value="ativo" ${
                              data?.status === "ativo" ? "selected" : ""
                            }>Ativo</option>
                            <option value="inativo" ${
                              data?.status === "inativo" ? "selected" : ""
                            }>Inativo</option>
                            <option value="trancado" ${
                              data?.status === "trancado" ? "selected" : ""
                            }>Trancado</option>
                        </select>
                    </div>
                </div>
            `;
      break;

    case "matricula":
      formHTML += `
                <div class="form-group">
                    <label for="id_aluno">Aluno:</label>
                    <select id="id_aluno" name="id_aluno" required>
                        <option value="">Selecione um aluno</option>
                        ${currentData.alunos
                          .map(
                            (aluno) =>
                              `<option value="${aluno.id_aluno}" ${
                                data?.id_aluno == aluno.id_aluno
                                  ? "selected"
                                  : ""
                              }>
                                ${aluno.nome}
                            </option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="id_turma">Turma:</label>
                    <select id="id_turma" name="id_turma" required>
                        <option value="">Selecione uma turma</option>
                        ${currentData.turmas
                          .map((turma) => {
                            const curso = currentData.cursos.find(
                              (c) => c.id_curso === turma.id_curso
                            );
                            return `<option value="${turma.id_turma}" ${
                              data?.id_turma == turma.id_turma ? "selected" : ""
                            }>
                                ${curso?.descricao} - ${turma.periodo} - ${
                              turma.turno
                            }
                            </option>`;
                          })
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="status_matricula">Status da Matrícula:</label>
                    <select id="status_matricula" name="status_matricula" required>
                        <option value="ativa" ${
                          data?.status_matricula === "ativa" ? "selected" : ""
                        }>Ativa</option>
                        <option value="trancada" ${
                          data?.status_matricula === "trancada"
                            ? "selected"
                            : ""
                        }>Trancada</option>
                        <option value="cancelada" ${
                          data?.status_matricula === "cancelada"
                            ? "selected"
                            : ""
                        }>Cancelada</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="observacoes">Observações:</label>
                    <textarea id="observacoes" name="observacoes" rows="3">${
                      data?.observacoes || ""
                    }</textarea>
                </div>
            `;
      break;

    case "pagamento":
      formHTML += `
                <div class="form-group">
                    <label for="id_matricula">Matrícula:</label>
                    <select id="id_matricula" name="id_matricula" required>
                        <option value="">Selecione uma matrícula</option>
                        ${currentData.matriculas
                          .map((matricula) => {
                            const aluno = currentData.alunos.find(
                              (a) => a.id_aluno === matricula.id_aluno
                            );
                            const turma = currentData.turmas.find(
                              (t) => t.id_turma === matricula.id_turma
                            );
                            const curso = currentData.cursos.find(
                              (c) => c.id_curso === turma?.id_curso
                            );
                            return `<option value="${matricula.id_matricula}" ${
                              data?.id_matricula == matricula.id_matricula
                                ? "selected"
                                : ""
                            }>
                                ${aluno?.nome} - ${curso?.descricao} - ${
                              turma?.periodo
                            }
                            </option>`;
                          })
                          .join("")}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="valor">Valor:</label>
                        <input type="number" id="valor" name="valor" step="0.01" value="${
                          data?.valor || ""
                        }" required>
                    </div>
                    <div class="form-group">
                        <label for="tipo_pagamento">Tipo de Pagamento:</label>
                        <select id="tipo_pagamento" name="tipo_pagamento" required>
                            <option value="mensalidade" ${
                              data?.tipo_pagamento === "mensalidade"
                                ? "selected"
                                : ""
                            }>Mensalidade</option>
                            <option value="taxa" ${
                              data?.tipo_pagamento === "taxa" ? "selected" : ""
                            }>Taxa</option>
                            <option value="multa" ${
                              data?.tipo_pagamento === "multa" ? "selected" : ""
                            }>Multa</option>
                            <option value="outros" ${
                              data?.tipo_pagamento === "outros"
                                ? "selected"
                                : ""
                            }>Outros</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="periodo_referencia">Período de Referência:</label>
                        <input type="text" id="periodo_referencia" name="periodo_referencia" value="${
                          data?.periodo_referencia || ""
                        }" placeholder="2024.1" required>
                    </div>
                    <div class="form-group">
                        <label for="status">Status:</label>
                        <select id="status" name="status" required>
                            <option value="pago" ${
                              data?.status === "pago" ? "selected" : ""
                            }>Pago</option>
                            <option value="pendente" ${
                              data?.status === "pendente" ? "selected" : ""
                            }>Pendente</option>
                            <option value="atrasado" ${
                              data?.status === "atrasado" ? "selected" : ""
                            }>Atrasado</option>
                        </select>
                    </div>
                </div>
            `;
      break;
  }

  formHTML += `
        <div class="form-actions">
            <button type="submit" class="btn-primary">${
              isEdit ? "Atualizar" : "Salvar"
            }</button>
            <button type="button" class="btn-secondary" onclick="document.getElementById('modal').style.display='none'">Cancelar</button>
        </div>
        </form>
    `;

  return formHTML;
}

// =====================================================
// CARREGAMENTO DE DADOS
// =====================================================

async function loadAllData() {
  showLoading(true);

  try {
    const promises = [
      loadData("departamentos"),
      loadData("cursos"),
      loadData("turmas"),
      loadData("alunos"),
      loadData("matriculas"),
      loadData("pagamentos"),
    ];

    await Promise.all(promises);
    renderAllTables();
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    showMessage(
      "Erro ao carregar dados. Verifique se o servidor está rodando.",
      "error"
    );
  } finally {
    showLoading(false);
  }
}

async function loadData(entityType) {
  try {
    const response = await fetch(`${API_BASE_URL}/${entityType}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    currentData[entityType] = data;
    return data;
  } catch (error) {
    console.error(`Erro ao carregar ${entityType}:`, error);
    currentData[entityType] = [];
    return [];
  }
}

function renderAllTables() {
  renderTable("departamento");
  renderTable("curso");
  renderTable("turma");
  renderTable("aluno");
  renderTable("matricula");
  renderTable("pagamento");
}

function renderTable(entityType) {
  const tbody = document.getElementById(`tbody-${entityType}`);
  const data = currentData[entityType + "s"] || [];

  tbody.innerHTML = data
    .map((item) => {
      return `<tr>${generateTableRow(entityType, item)}</tr>`;
    })
    .join("");
}

function generateTableRow(entityType, item) {
  switch (entityType) {
    case "departamento":
      return `
                <td>${item.id_departamento}</td>
                <td>${item.descricao}</td>
                <td>
                    <button class="btn-secondary" onclick="editItem('${entityType}', ${JSON.stringify(
        item
      ).replace(/"/g, "&quot;")})">Editar</button>
                    <button class="btn-danger" onclick="deleteItem('${entityType}', ${
        item.id_departamento
      })">Excluir</button>
                </td>
            `;

    case "curso":
      const departamento = currentData.departamentos.find(
        (d) => d.id_departamento === item.id_departamento
      );
      return `
                <td>${item.id_curso}</td>
                <td>${departamento?.descricao || "N/A"}</td>
                <td>${item.descricao}</td>
                <td>${item.sigla}</td>
                <td>R$ ${parseFloat(item.valor_mensalidade).toFixed(2)}</td>
                <td>${item.duracao_semestres} sem</td>
                <td>
                    <button class="btn-secondary" onclick="editItem('${entityType}', ${JSON.stringify(
        item
      ).replace(/"/g, "&quot;")})">Editar</button>
                    <button class="btn-danger" onclick="deleteItem('${entityType}', ${
        item.id_curso
      })">Excluir</button>
                </td>
            `;

    case "turma":
      const curso = currentData.cursos.find(
        (c) => c.id_curso === item.id_curso
      );
      return `
                <td>${item.id_turma}</td>
                <td>${curso?.descricao || "N/A"}</td>
                <td>${item.semestre}º</td>
                <td>${item.periodo}</td>
                <td>${item.turno}</td>
                <td>${item.sala || "N/A"}</td>
                <td>${item.limite_alunos}</td>
                <td>
                    <button class="btn-secondary" onclick="editItem('${entityType}', ${JSON.stringify(
        item
      ).replace(/"/g, "&quot;")})">Editar</button>
                    <button class="btn-danger" onclick="deleteItem('${entityType}', ${
        item.id_turma
      })">Excluir</button>
                </td>
            `;

    case "aluno":
      return `
                <td>${item.id_aluno}</td>
                <td>${item.nome}</td>
                <td>${item.cidade}</td>
                <td>${item.estado}</td>
                <td>${
                  item.data_nascimento
                    ? new Date(item.data_nascimento).toLocaleDateString("pt-BR")
                    : "N/A"
                }</td>
                <td><span class="status-badge status-${item.status}">${
        item.status
      }</span></td>
                <td>
                    <button class="btn-secondary" onclick="editItem('${entityType}', ${JSON.stringify(
        item
      ).replace(/"/g, "&quot;")})">Editar</button>
                    <button class="btn-danger" onclick="deleteItem('${entityType}', ${
        item.id_aluno
      })">Excluir</button>
                </td>
            `;

    case "matricula":
      const aluno = currentData.alunos.find(
        (a) => a.id_aluno === item.id_aluno
      );
      const turma = currentData.turmas.find(
        (t) => t.id_turma === item.id_turma
      );
      const cursoMatricula = currentData.cursos.find(
        (c) => c.id_curso === turma?.id_curso
      );
      return `
                <td>${item.id_matricula}</td>
                <td>${aluno?.nome || "N/A"}</td>
                <td>${cursoMatricula?.descricao || "N/A"} - ${
        turma?.periodo || "N/A"
      }</td>
                <td>${
                  item.data_matricula
                    ? new Date(item.data_matricula).toLocaleDateString("pt-BR")
                    : "N/A"
                }</td>
                <td><span class="status-badge status-${
                  item.status_matricula
                }">${item.status_matricula}</span></td>
                <td>
                    <button class="btn-secondary" onclick="editItem('${entityType}', ${JSON.stringify(
        item
      ).replace(/"/g, "&quot;")})">Editar</button>
                    <button class="btn-danger" onclick="deleteItem('${entityType}', ${
        item.id_matricula
      })">Excluir</button>
                </td>
            `;

    case "pagamento":
      const matricula = currentData.matriculas.find(
        (m) => m.id_matricula === item.id_matricula
      );
      const alunoPagamento = currentData.alunos.find(
        (a) => a.id_aluno === matricula?.id_aluno
      );
      return `
                <td>${item.id_pagamento}</td>
                <td>${alunoPagamento?.nome || "N/A"}</td>
                <td>R$ ${parseFloat(item.valor).toFixed(2)}</td>
                <td>${item.tipo_pagamento}</td>
                <td>${item.periodo_referencia}</td>
                <td><span class="status-badge status-${item.status}">${
        item.status
      }</span></td>
                <td>${
                  item.data_pagamento
                    ? new Date(item.data_pagamento).toLocaleDateString("pt-BR")
                    : "N/A"
                }</td>
                <td>
                    <button class="btn-secondary" onclick="editItem('${entityType}', ${JSON.stringify(
        item
      ).replace(/"/g, "&quot;")})">Editar</button>
                    <button class="btn-danger" onclick="deleteItem('${entityType}', ${
        item.id_pagamento
      })">Excluir</button>
                </td>
            `;

    default:
      return "";
  }
}

// =====================================================
// OPERAÇÕES CRUD
// =====================================================

async function handleFormSubmit(entityType, id = null) {
  const form = document.getElementById("entity-form");
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  showLoading(true);

  try {
    const url = id
      ? `${API_BASE_URL}/${entityType}s/${id}`
      : `${API_BASE_URL}/${entityType}s`;
    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    showMessage(
      `${getEntityName(entityType)} ${
        id ? "atualizado" : "criado"
      } com sucesso!`,
      "success"
    );
    document.getElementById("modal").style.display = "none";

    // Recarrega os dados
    await loadData(entityType + "s");
    renderTable(entityType);
  } catch (error) {
    console.error("Erro ao salvar:", error);
    showMessage("Erro ao salvar dados. Tente novamente.", "error");
  } finally {
    showLoading(false);
  }
}

async function deleteItem(entityType, id) {
  if (
    !confirm(
      `Tem certeza que deseja excluir este ${getEntityName(entityType)}?`
    )
  ) {
    return;
  }

  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/${entityType}s/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    showMessage(
      `${getEntityName(entityType)} excluído com sucesso!`,
      "success"
    );

    // Recarrega os dados
    await loadData(entityType + "s");
    renderTable(entityType);
  } catch (error) {
    console.error("Erro ao excluir:", error);
    showMessage("Erro ao excluir dados. Tente novamente.", "error");
  } finally {
    showLoading(false);
  }
}

function editItem(entityType, data) {
  showForm(entityType, data);
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function getEntityName(entityType) {
  const names = {
    departamento: "Departamento",
    curso: "Curso",
    turma: "Turma",
    aluno: "Aluno",
    matricula: "Matrícula",
    pagamento: "Pagamento",
  };
  return names[entityType] || entityType;
}

function showLoading(show) {
  const loading = document.getElementById("loading");
  if (show) {
    loading.classList.remove("hidden");
  } else {
    loading.classList.add("hidden");
  }
}

function showMessage(message, type = "info") {
  // Implementar sistema de notificações se necessário
  alert(message);
}

function filterTable(entityType) {
  const searchInput = document.getElementById(`search-${entityType}`);
  const searchTerm = searchInput.value.toLowerCase();
  const tbody = document.getElementById(`tbody-${entityType}`);
  const rows = tbody.getElementsByTagName("tr");

  for (let row of rows) {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  }
}

// Função para recarregar dados quando necessário
function refreshData() {
  loadAllData();
}

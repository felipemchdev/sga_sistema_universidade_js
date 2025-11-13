// Variáveis de estado
const state = {
    estagios: [],
    empresas: [],
    alunos: [],
    isLoading: false,
    error: null
};

// Elementos da interface
const tbodyEstagio = document.getElementById('tbody-estagio');
const btnEstagiosAtivos = document.getElementById('btn-estagios-ativos');
const btnEstagiosConcluidos = document.getElementById('btn-estagios-concluidos');
const searchEstagio = document.getElementById('search-estagio');

// Função para carregar dados iniciais
async function carregarDadosIniciais() {
    if (state.isLoading) return;
    
    state.isLoading = true;
    state.error = null;
    
    try {
        mostrarCarregamento(true, 'Carregando dados...');
        
        // Carregar estágios, empresas e alunos em paralelo
        const [estagiosResponse, empresasResponse, alunosResponse] = await Promise.allSettled([
            fetch('/api/estagios').then(handleResponse),
            fetch('/api/estagios/empresas').then(handleResponse),
            fetch('/api/alunos').then(handleResponse)
        ]);
        
        // Processar respostas
        state.estagios = processResponse(estagiosResponse, 'estágios');
        state.empresas = processResponse(empresasResponse, 'empresas');
        state.alunos = processResponse(alunosResponse, 'alunos');
        
        console.log('Empresas carregadas:', state.empresas);
        console.log('Estágios carregados:', state.estagios);
        
        // Verificar se todos os dados foram carregados
        const hasData = state.estagios.length > 0 && state.empresas.length > 0 && state.alunos.length > 0;
        
        if (!hasData) {
            mostrarMensagem(
                'Alguns dados não puderam ser carregados. Verifique sua conexão e tente novamente.', 
                'warning', 
                8000
            );
        }
        
        // Renderizar estágios ativos por padrão
        renderizarEstagios('em_andamento');
        
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        state.error = error.message;
        mostrarMensagem(
            'Erro ao carregar os dados. Verifique o console para mais detalhes.', 
            'error'
        );
    } finally {
        state.isLoading = false;
        mostrarCarregamento(false);
    }
}

// Função auxiliar para processar respostas da API
function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    return response.json();
}

// Função para processar respostas do Promise.allSettled
function processResponse(result, resourceName) {
    if (result.status === 'fulfilled') {
        return Array.isArray(result.value) ? result.value : [];
    } else {
        console.error(`Erro ao carregar ${resourceName}:`, result.reason);
        return [];
    }
}

// Função para renderizar os estágios
function renderizarEstagios(status = 'em_andamento') {
    if (!tbodyEstagio) return;
    
    // Usar state.estagios em vez de estagios
    const estagiosFiltrados = Array.isArray(state.estagios) 
        ? state.estagios.filter(estagio => estagio.status === status)
        : [];
    
    if (estagiosFiltrados.length === 0) {
        tbodyEstagio.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Nenhum estágio ${status === 'em_andamento' ? 'em andamento' : 'concluído'} encontrado
                </td>
            </tr>`;
        return;
    }
    
    tbodyEstagio.innerHTML = estagiosFiltrados.map(estagio => {
        const aluno = Array.isArray(state.alunos) 
            ? state.alunos.find(a => a.id_aluno === estagio.id_aluno) || {}
            : {};
        const empresa = Array.isArray(state.empresas) 
            ? state.empresas.find(e => e.id_empresa === estagio.id_empresa) || {}
            : {};
        const progresso = Math.round((estagio.carga_horaria_cumprida / estagio.carga_horaria_total) * 100);
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i class="fas fa-user-graduate text-blue-600"></i>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${aluno.nome || 'Aluno não encontrado'}</div>
                            <div class="text-sm text-gray-500">${aluno.email || ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium empresa-nome" 
                         data-empresa-id="${estagio.id_empresa}">
                        ${empresa.nome || 'Empresa não encontrada'}
                    </div>
                    <div class="text-sm text-gray-500">${empresa.responsavel || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${formatarData(estagio.data_inicio)} - ${estagio.data_termino ? formatarData(estagio.data_termino) : 'Atual'}</div>
                    <div class="text-sm text-gray-500">${estagio.turno || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${estagio.carga_horaria_cumprida}h / ${estagio.carga_horaria_total}h</div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${progresso}%"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${progresso}% concluído</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${estagio.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                        ${estagio.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                    </span>
                </td>
            </tr>`;
    }).join('');
}

// Função para formatar data
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para adicionar eventos
function adicionarEventos() {
    // Evento para filtrar estágios ativos/concluídos
    if (btnEstagiosAtivos) {
        btnEstagiosAtivos.addEventListener('click', () => {
            btnEstagiosAtivos.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-500');
            btnEstagiosConcluidos.classList.remove('bg-blue-50', 'text-blue-700', 'border-blue-500');
            renderizarEstagios('em_andamento');
        });
    }
    
    if (btnEstagiosConcluidos) {
        btnEstagiosConcluidos.addEventListener('click', () => {
            btnEstagiosConcluidos.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-500');
            btnEstagiosAtivos.classList.remove('bg-blue-50', 'text-blue-700', 'border-blue-500');
            renderizarEstagios('concluido');
        });
    }
    
    // Evento de busca
    if (searchEstagio) {
        searchEstagio.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const linhas = tbodyEstagio.querySelectorAll('tr');
            
            linhas.forEach(linha => {
                const texto = linha.textContent.toLowerCase();
                linha.style.display = texto.includes(termo) ? '' : 'none';
            });
        });
    }
    
    // Evento delegado para os botões de ação
    tbodyEstagio.addEventListener('click', (e) => {
        // Verificar se o clique foi no nome da empresa
        const empresaNome = e.target.closest('.empresa-nome');
        if (empresaNome) {
            e.preventDefault();
            e.stopPropagation();
            const empresaId = empresaNome.getAttribute('data-empresa-id');
            console.log('Clique no nome da empresa - ID:', empresaId);
            if (empresaId) {
                mostrarDetalhesEmpresa(parseInt(empresaId));
            }
            return;
        }
        
        // Verificar se foi em um botão de ação
        const botao = e.target.closest('button[data-action]');
        if (!botao) return;
        
        const acao = botao.getAttribute('data-action');
        const id = parseInt(botao.getAttribute('data-id'));
        
        switch (acao) {
            case 'editar':
                editarEstagio(id);
                break;
            case 'atualizar-carga':
                atualizarCargaHoraria(id);
                break;
            case 'finalizar':
                finalizarEstagio(id);
                break;
            case 'excluir':
                if (confirm('Tem certeza que deseja excluir este estágio?')) {
                    excluirEstagio(id);
                }
                break;
        }
    });
}

// Inicialização
function initEstagios() {
    console.log('Iniciando initEstagios...');
    const tabEstagios = document.getElementById('estagios');
    if (!tabEstagios) {
        console.error('Elemento #estagios não encontrado');
        return;
    }
    
    console.log('Chamando carregarDadosIniciais...');
    carregarDadosIniciais();
    
    console.log('Chamando adicionarEventos...');
    adicionarEventos();
    
    // Configurar eventos dos botões
    console.log('Configurando eventos dos botões...');
    const btnNovoEstagio = document.getElementById('btn-novo-estagio');
    const btnNovaEmpresa = document.getElementById('btn-nova-empresa');
    
    console.log('Botão de novo estágio encontrado?', !!btnNovoEstagio);
    if (btnNovoEstagio) {
        console.log('Adicionando event listener ao botão de novo estágio');
        btnNovoEstagio.addEventListener('click', function(e) {
            console.log('Botão de novo estágio clicado');
            e.preventDefault();
            abrirModalNovoEstagio();
        });
    }
    
    if (btnNovaEmpresa) {
        btnNovaEmpresa.addEventListener('click', abrirModalNovaEmpresa);
    }
}

// Função para fechar o modal
function fecharModal() {
    // Fechar modais dinâmicos e de detalhes da empresa
    const modals = document.querySelectorAll('.modal-dinamico, .modal-empresa-detalhes');
    modals.forEach(modal => {
        // Adicionar animação de saída
        const content = modal.querySelector('div[class*="bg-white"]');
        if (content) {
            content.style.transform = 'translateY(20px)';
            content.style.opacity = '0';
            
            // Remover após a animação
            setTimeout(() => {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
            }, 300);
        } else if (modal.parentNode) {
            document.body.removeChild(modal);
        }
    });
    
    // Fechar modal padrão (se existir)
    const modalPadrao = document.getElementById('modal');
    if (modalPadrao) {
        modalPadrao.classList.add('hidden');
    }
    
    // Remover classe de overflow do body
    document.body.classList.remove('overflow-hidden');
    
    // Remover event listeners de teclado
    document.removeEventListener('keydown', handleEscapeKey);
    
    // Remover qualquer listener de clique fora do modal
    document.removeEventListener('click', fecharModalOnClickOutside);
}

// Função auxiliar para lidar com o clique fora do modal
function fecharModalOnClickOutside(e) {
    // Verificar se o clique foi fora do conteúdo do modal
    const modalContent = document.querySelector('.modal-empresa-detalhes .fixed.inset-0');
    if (modalContent && e.target === modalContent) {
        fecharModal();
    }
}

// Função auxiliar para lidar com a tecla ESC
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        fecharModal();
    }
}

// Função para abrir o modal de novo estágio
function abrirModalNovoEstagio() {
    // Fechar qualquer modal aberto
    fecharModal();
    
    // Verificar se existem empresas e alunos cadastrados
    if (!Array.isArray(state.empresas) || state.empresas.length === 0 || 
        !Array.isArray(state.alunos) || state.alunos.length === 0) {
        mostrarMensagem('É necessário ter pelo menos uma empresa e um aluno cadastrados para criar um estágio.', 'error');
        return;
    }
    
    // Criar o modal dinâmico
    const modal = document.createElement('div');
    modal.className = 'modal-dinamico fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out" id="modal-novo-estagio">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-gray-900">Novo Estágio</h3>
                    <button type="button" class="text-gray-400 hover:text-gray-500 focus:outline-none" id="btn-fechar-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="form-novo-estagio" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label for="aluno_id" class="block text-sm font-medium text-gray-700 mb-1">Aluno *</label>
                            <select id="aluno_id" name="id_aluno" required
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Selecione um aluno</option>
                                ${state.alunos && Array.isArray(state.alunos) ? state.alunos.map(aluno => 
                                    `<option value="${aluno.id_aluno}">${aluno.nome} - ${aluno.ra || ''}</option>`
                                ).join('') : ''}
                            </select>
                        </div>
                        
                        <div class="md:col-span-2">
                            <label for="empresa_id" class="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                            <div class="flex gap-2">
                                <select id="empresa_id" name="id_empresa" required
                                    class="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecione uma empresa</option>
                                    ${state.empresas && Array.isArray(state.empresas) ? state.empresas.map(empresa => 
                                        `<option value="${empresa.id_empresa}">${empresa.nome}</option>`
                                    ).join('') : ''}
                                </select>
                                <button type="button" onclick="abrirModalNovaEmpresa()"
                                    class="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label for="data_inicio" class="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
                            <input type="date" id="data_inicio" name="data_inicio" required
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label for="data_termino" class="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
                            <input type="date" id="data_termino" name="data_termino"
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label for="carga_horaria_total" class="block text-sm font-medium text-gray-700 mb-1">Carga Horária Total (horas) *</label>
                            <input type="number" id="carga_horaria_total" name="carga_horaria_total" required min="1" value="240"
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label for="valor_bolsa" class="block text-sm font-medium text-gray-700 mb-1">Valor da Bolsa (R$) *</label>
                            <input type="number" id="valor_bolsa" name="valor_bolsa" required min="0" step="0.01" value="600.00"
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div class="flex items-center">
                            <input type="checkbox" id="status" name="status" value="concluido"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <label for="status" class="ml-2 block text-sm text-gray-700">
                                Estágio concluído
                            </label>
                        </div>
                        
                        <div class="md:col-span-2">
                            <label for="observacoes" class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <textarea id="observacoes" name="observacoes" rows="3"
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button 
                            type="button" 
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onclick="fecharModal()"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <i class="fas fa-save mr-2"></i> Salvar Estágio
                        </button>
                    </div>
                </form>
            </div>
        </div>`;
    
    // Adicionar o modal ao documento
    document.body.appendChild(modal);
    
    // Adicionar evento de clique no botão de fechar
    const closeButton = modal.querySelector('#btn-fechar-modal');
    if (closeButton) {
        closeButton.addEventListener('click', fecharModal);
    }
    
    // Adicionar evento de clique fora do modal para fechar
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });
    
    // Adicionar evento de tecla ESC para fechar
    document.addEventListener('keydown', handleEscapeKey);
    
    // Adicionar evento de submit ao formulário
    const form = modal.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarNovoEstagio(modal);
        });
    }
    
    // Inicializar os selects com Select2 se disponível
    if (typeof $.fn.select2 !== 'undefined') {
        $('#aluno_id, #empresa_id').select2({
            dropdownParent: modal,
            width: '100%'
        });
    }
    
    // Focar no primeiro campo
    setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Função para salvar um novo estágio
async function salvarNovoEstagio(modalElement) {
    const form = document.getElementById('form-novo-estagio');
    if (!form) return;
    
    try {
        // Validar campos obrigatórios
        const camposObrigatorios = ['aluno_id', 'empresa_id', 'data_inicio', 'carga_horaria_total'];
        const camposFaltando = camposObrigatorios.filter(campo => !form[campo]?.value.trim());
        
        if (camposFaltando.length > 0) {
            const camposFaltandoFormatados = camposFaltando
                .map(campo => {
                    const labels = {
                        'aluno_id': 'Aluno',
                        'empresa_id': 'Empresa',
                        'data_inicio': 'Data de Início',
                        'carga_horaria_total': 'Carga Horária Total'
                    };
                    return labels[campo] || campo;
                })
                .join(', ');
                
            mostrarMensagem(`Preencha os campos obrigatórios: ${camposFaltandoFormatados}`, 'error');
            return;
        }
        
        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());
        
        // Converter strings vazias para null
        Object.keys(dados).forEach(key => {
            if (dados[key] === '') dados[key] = null;
        });
        
        // Converter strings numéricas para números
        if (dados.empresa_id) dados.empresa_id = parseInt(dados.empresa_id);
        if (dados.aluno_id) dados.aluno_id = parseInt(dados.aluno_id);
        if (dados.carga_horaria_total) dados.carga_horaria_total = parseInt(dados.carga_horaria_total);
        if (dados.carga_horaria_cumprida) {
            dados.carga_horaria_cumprida = parseInt(dados.carga_horaria_cumprida);
        } else {
            dados.carga_horaria_cumprida = 0; // Valor padrão
        }
        if (dados.valor_bolsa) dados.valor_bolsa = parseFloat(dados.valor_bolsa);
        
        // Definir status
        dados.status = document.getElementById('status').checked ? 'concluido' : 'em_andamento';
        
        // Mostrar loading
        mostrarCarregamento(true, 'Salvando estágio...');
        
        // Enviar para a API
        const response = await fetch('/api/estagios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao salvar estágio');
        }
        
        const novoEstagio = await response.json();
        
        // Recarregar todos os dados para garantir consistência
        await carregarDadosIniciais();
        
        // Renderizar estágios em andamento por padrão
        renderizarEstagios('em_andamento');
        
        // Atualizar a navegação para refletir a mudança
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            if (btn.dataset.status === 'em_andamento') {
                btn.classList.add('filtro-ativo');
            } else {
                btn.classList.remove('filtro-ativo');
            }
        });
        
        // Mostrar mensagem de sucesso
        mostrarMensagem('Estágio cadastrado com sucesso!', 'success');
        
        // Fechar o modal
        fecharModal();
        
    } catch (error) {
        console.error('Erro ao salvar estágio:', error);
        mostrarMensagem(error.message || 'Erro ao salvar estágio. Tente novamente.', 'error');
    } finally {
        mostrarCarregamento(false);
    }
}

// Função para abrir o modal de nova empresa
function abrirModalNovaEmpresa() {
    // Fechar qualquer modal aberto
    fecharModal();
    
    // Criar o modal dinâmico
    const modal = document.createElement('div');
    modal.className = 'modal-dinamico fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out" id="modal-nova-empresa">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-gray-900">Nova Empresa</h3>
                    <button type="button" class="text-gray-400 hover:text-gray-500 focus:outline-none" id="btn-fechar-modal-empresa">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="form-nova-empresa" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="md:col-span-2">
                            <label for="nome_empresa" class="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
                            <input type="text" id="nome_empresa" name="nome" required
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label for="cnpj" class="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
                            <input type="text" id="cnpj" name="cnpj" required
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="00.000.000/0000-00">
                        </div>
                        
                        <div>
                            <label for="telefone" class="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                            <input type="text" id="telefone" name="telefone" required
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="(00) 00000-0000">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input type="email" id="email" name="email"
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label for="endereco" class="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                            <input type="text" id="endereco" name="endereco" required
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label for="responsavel" class="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
                            <input type="text" id="responsavel" name="responsavel" required
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label for="cargo_responsavel" class="block text-sm font-medium text-gray-700 mb-1">Cargo do Responsável</label>
                            <input type="text" id="cargo_responsavel" name="cargo_responsavel"
                                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button 
                            type="button" 
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onclick="fecharModal()"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <i class="fas fa-save mr-2"></i> Salvar Empresa
                        </button>
                    </div>
                </form>
            </div>
        </div>`;
    
    // Adicionar o modal ao documento
    document.body.appendChild(modal);
    
    // Adicionar evento de clique no botão de fechar
    const closeButton = modal.querySelector('#btn-fechar-modal-empresa');
    if (closeButton) {
        closeButton.addEventListener('click', fecharModal);
    }
    
    // Adicionar evento de clique fora do modal para fechar
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });
    
    // Adicionar evento de tecla ESC para fechar
    document.addEventListener('keydown', handleEscapeKey);
    
    // Adicionar máscaras
    const cnpjInput = modal.querySelector('#cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 14) value = value.substring(0, 14);
            
            // Formatar CNPJ: 00.000.000/0000-00
            if (value.length > 12) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
            } else if (value.length > 8) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
            } else if (value.length > 5) {
                value = value.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
            }
            
            e.target.value = value;
        });
    }
    
    // Adicionar máscara de telefone
    const telefoneInput = modal.querySelector('#telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            // Formatar telefone: (00) 00000-0000 ou (00) 0000-0000
            if (value.length > 10) {
                value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
            } else if (value.length > 5) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else if (value.length > 0) {
                value = value.replace(/^(\d*)/, '($1');
            }
            
            e.target.value = value;
        });
    }
    
    // Adicionar evento de submit ao formulário
    const form = modal.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarNovaEmpresa(modal);
        });
    }
    
    // Focar no primeiro campo
    setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Função para editar um estágio
function editarEstagio(id) {
    try {
        if (!Array.isArray(state.estagios)) {
            mostrarMensagem('Erro ao carregar estágios. Tente novamente.', 'error');
            return;
        }
        
        const estagio = state.estagios.find(e => e.id_estagio === id);
        if (!estagio) {
            mostrarMensagem('Estágio não encontrado.', 'error');
            return;
        }

        abrirModalNovoEstagio(estagio);
    } catch (error) {
        console.error('Erro ao editar estágio:', error);
        mostrarMensagem('Erro ao editar estágio. Tente novamente.', 'error');
    }
}

// Função para atualizar a carga horária de um estágio
async function atualizarCargaHoraria(id) {
    try {
        if (!Array.isArray(state.estagios)) {
            mostrarMensagem('Erro ao carregar estágios. Tente novamente.', 'error');
            return;
        }
        
        const estagio = state.estagios.find(e => e.id_estagio === id);
        
        if (isNaN(carga) || carga < 0) {
            mostrarMensagem('Por favor, informe um valor numérico válido.', 'error');
            return;
        }
        
        // Garantir que o carregamento está limpo antes de mostrar
        mostrarCarregamento(false);
        mostrarCarregamento(true, 'Atualizando carga horária...');
        
        console.log('Enviando atualização para o servidor...');
        
        // Primeiro, buscar o estágio atual para obter o status
        const responseGet = await fetch(`/api/estagios/${id}`);
        if (!responseGet.ok) {
            throw new Error('Erro ao obter dados do estágio');
        }
        const estagioAtual = await responseGet.json();
        
        // Preparar os dados para atualização
        const dadosAtualizacao = {
            ...estagioAtual,  // Manter todos os campos existentes
            carga_horaria_cumprida: carga
        };
        
        // Enviar a atualização
        const response = await fetch(`/api/estagios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dadosAtualizacao)
        });
        
        // Tentar obter a resposta como JSON, mas não falhar se não for possível
        let responseData = {};
        try {
            responseData = await response.json();
        } catch (e) {
            console.warn('Não foi possível decodificar a resposta como JSON', e);
        }
        
        if (!response.ok) {
            console.error('Erro na resposta da API:', response.status, responseData);
            throw new Error(responseData.message || `Erro ao atualizar carga horária: ${response.statusText}`);
        }
        
        console.log('Resposta da API:', responseData);
        
        // Recarregar todos os dados para garantir consistência
        await carregarDadosIniciais();
        
        // Obter o status atual ativo
        const statusAtual = document.querySelector('.filtro-ativo')?.dataset.status || 'em_andamento';
        
        // Renderizar os estágios com o status atual
        renderizarEstagios(statusAtual);
        
        mostrarMensagem('Carga horária atualizada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao atualizar carga horária:', error);
        mostrarMensagem(error.message || 'Erro ao atualizar carga horária. Tente novamente.', 'error');
    } finally {
        // Garantir que o carregamento seja removido corretamente
        setTimeout(() => mostrarCarregamento(false), 500);
    }
}

// Função para finalizar um estágio
async function finalizarEstagio(id) {
    if (!confirm('Deseja realmente marcar este estágio como concluído?')) {
        return;
    }

    try {
        mostrarCarregamento(true, 'Finalizando estágio...');
        
        const response = await fetch(`/api/estagios/${id}/finalizar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'concluido' })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao finalizar estágio');
        }

        // Recarregar todos os dados para garantir consistência
        await carregarDadosIniciais();
        
        // Renderizar estágios concluídos após finalizar
        renderizarEstagios('concluido');
        
        // Atualizar a navegação para refletir a mudança
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            if (btn.dataset.status === 'concluido') {
                btn.classList.add('filtro-ativo');
            } else {
                btn.classList.remove('filtro-ativo');
            }
        });
        
        mostrarMensagem('Estágio finalizado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao finalizar estágio:', error);
        mostrarMensagem(error.message || 'Erro ao finalizar estágio. Tente novamente.', 'error');
    } finally {
        mostrarCarregamento(false);
    }
}

// Função para excluir um estágio
async function excluirEstagio(id) {
    if (!confirm('Tem certeza que deseja excluir este estágio? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        mostrarCarregamento(true, 'Excluindo estágio...');
        
        const response = await fetch(`/api/estagios/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir estágio');
        }

        // Recarregar todos os dados para garantir consistência
        await carregarDadosIniciais();
        
        // Obter o status atual ativo
        const statusAtual = document.querySelector('.filtro-ativo')?.dataset.status || 'em_andamento';
        
        // Renderizar os estágios com o status atual
        renderizarEstagios(statusAtual);
        
        mostrarMensagem('Estágio excluído com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao excluir estágio:', error);
        mostrarMensagem('Erro ao excluir estágio. Tente novamente.', 'error');
    } finally {
        mostrarCarregamento(false);
    }
}

// Função para salvar uma nova empresa
async function salvarNovaEmpresa(modalElement) {
    const form = document.getElementById('form-nova-empresa');
    if (!form) return;
    
    try {
        // Validar campos obrigatórios
        const camposObrigatorios = ['nome', 'cnpj', 'telefone', 'endereco', 'responsavel'];
        const camposFaltando = camposObrigatorios.filter(campo => !form[campo]?.value.trim());
        
        if (camposFaltando.length > 0) {
            const camposFaltandoFormatados = camposFaltando
                .map(campo => {
                    const labels = {
                        'nome': 'Nome da Empresa',
                        'cnpj': 'CNPJ',
                        'telefone': 'Telefone',
                        'endereco': 'Endereço',
                        'responsavel': 'Responsável'
                    };
                    return labels[campo] || campo;
                })
                .join(', ');
                
            mostrarMensagem(`Preencha os campos obrigatórios: ${camposFaltandoFormatados}`, 'error');
            return;
        }
        
        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());
        
        // Remover caracteres não numéricos do CNPJ e telefone
        if (dados.cnpj) dados.cnpj = dados.cnpj.replace(/\D/g, '');
        if (dados.telefone) dados.telefone = dados.telefone.replace(/\D/g, '');
        
        // Converter strings vazias para null
        Object.keys(dados).forEach(key => {
            if (dados[key] === '') dados[key] = null;
        });
        
        // Mostrar loading
        mostrarCarregamento(true, 'Salvando empresa...');
        
        // Enviar para a API
        const response = await fetch('/api/empresas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao salvar empresa');
        }
        
        const novaEmpresa = await response.json();
        
        // Adicionar a nova empresa à lista local
        empresas.push(novaEmpresa);
        
        // Atualizar o select de empresas no formulário de estágio
        const empresaSelect = document.getElementById('empresa_id');
        if (empresaSelect) {
            const option = document.createElement('option');
            option.value = novaEmpresa.id_empresa;
            option.textContent = novaEmpresa.nome;
            empresaSelect.appendChild(option);
            
            // Selecionar a empresa recém-cadastrada
            empresaSelect.value = novaEmpresa.id_empresa;
            
            // Atualizar o Select2 se estiver sendo usado
            if (typeof $.fn.select2 !== 'undefined') {
                $(empresaSelect).trigger('change');
            }
        }
        
        // Mostrar mensagem de sucesso
        mostrarMensagem('Empresa cadastrada com sucesso!', 'success');
        
        // Fechar o modal
        fecharModal();
        
    } catch (error) {
        console.error('Erro ao salvar empresa:', error);
        mostrarMensagem(error.message || 'Erro ao salvar empresa. Tente novamente.', 'error');
    } finally {
        mostrarCarregamento(false);
    }
}

// Função para exibir mensagens para o usuário
function mostrarMensagem(mensagem, tipo = 'info', tempo = 5000) {
    // Verificar se o container de mensagens existe, se não, criar
    let container = document.getElementById('mensagens-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mensagens-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2 w-80';
        document.body.appendChild(container);
    }

    // Criar elemento da mensagem
    const mensagemElement = document.createElement('div');
    const cores = {
        success: 'bg-green-100 border-green-500 text-green-700',
        error: 'bg-red-100 border-red-500 text-red-700',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
        info: 'bg-blue-100 border-blue-500 text-blue-700'
    };

    mensagemElement.className = `border-l-4 p-4 rounded shadow-lg ${cores[tipo] || cores['info']} relative`;
    mensagemElement.innerHTML = `
        <p>${mensagem}</p>
        <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Adicionar evento para fechar a mensagem
    const fecharBtn = mensagemElement.querySelector('button');
    fecharBtn.addEventListener('click', () => {
        mensagemElement.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(mensagemElement);
            if (container.children.length === 0) {
                document.body.removeChild(container);
            }
        }, 300);
    });

    // Adicionar a mensagem ao container
    container.appendChild(mensagemElement);

    // Remover a mensagem após o tempo definido
    if (tempo > 0) {
        setTimeout(() => {
            if (mensagemElement.parentNode === container) {
                container.removeChild(mensagemElement);
                if (container.children.length === 0) {
                    document.body.removeChild(container);
                }
            }
        }, tempo);
    }
}

// Função para mostrar mensagens de carregamento
function mostrarCarregamento(mostrar, mensagem = 'Carregando...') {
    // Garantir que o DOM esteja carregado
    if (document.readyState !== 'loading') {
        _mostrarCarregamento(mostrar, mensagem);
    } else {
        document.addEventListener('DOMContentLoaded', () => _mostrarCarregamento(mostrar, mensagem));
    }
}

// Função auxiliar para mostrar/esconder o carregamento
function _mostrarCarregamento(mostrar, mensagem) {
    // Limpar qualquer timeout existente
    if (window.loadingTimeout) {
        clearTimeout(window.loadingTimeout);
        window.loadingTimeout = null;
    }

    let loading = document.getElementById('loading');
    
    if (mostrar) {
        // Se já existe um loading, apenas atualiza a mensagem
        if (loading && loading.parentNode) {
            const messageElement = document.getElementById('loading-message');
            if (messageElement) {
                messageElement.textContent = mensagem;
            }
        } else {
            // Remove o loading anterior se existir (pode ter sido removido incorretamente)
            if (loading && loading.parentNode) {
                loading.parentNode.removeChild(loading);
            }
            
            // Cria novo elemento de loading
            loading = document.createElement('div');
            loading.id = 'loading';
            loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loading.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                    <div class="flex items-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                        <div>
                            <p class="text-gray-800 font-medium" id="loading-message">${mensagem}</p>
                            <p class="text-sm text-gray-500">Aguarde um momento...</p>
                        </div>
                    </div>
                </div>`;
            
            // Garante que o body está pronto
            if (document.body) {
                document.body.appendChild(loading);
            } else {
                // Se o body não estiver pronto, tenta novamente em breve
                window.loadingTimeout = setTimeout(() => _mostrarCarregamento(true, mensagem), 100);
                return;
            }
        }
        
        // Desabilitar interação com o conteúdo atrás do loading
        document.body.style.pointerEvents = 'none';
        document.body.style.overflow = 'hidden';
        
    } else if (loading && loading.parentNode) {
        // Usar uma transição suave para esconder
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.3s ease';
        
        // Remover o elemento após a transição
        const removeElement = () => {
            if (loading && document.body.contains(loading)) {
                document.body.removeChild(loading);
            }
            
            // Reabilitar interação com o conteúdo
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
        };
        
        // Aguardar a transição terminar
        window.loadingTimeout = setTimeout(removeElement, 300);
    }
}

// Inicializar quando o DOM estiver pronto
function init() {
    // Verificar se estamos na página de estágios
    const tabEstagios = document.getElementById('estagios');
    if (!tabEstagios) return;
    
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar a aba de estágios
    initEstagios();
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Botão de novo estágio
    const btnNovoEstagio = document.getElementById('btn-novo-estagio');
    if (btnNovoEstagio) {
        console.log('Botão de novo estágio encontrado');
        btnNovoEstagio.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão de novo estágio clicado');
            abrirModalNovoEstagio();
        });
    } else {
        console.error('Botão de novo estágio não encontrado');
    }
    
    // Botão de nova empresa
    const btnNovaEmpresa = document.getElementById('btn-nova-empresa');
    if (btnNovaEmpresa) {
        btnNovaEmpresa.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão de nova empresa clicado');
            abrirModalNovaEmpresa();
        });
    }
    
    // Clique fora do modal para fechar
    document.addEventListener('click', (e) => {
        const modal = document.querySelector('.modal-dinamico');
        if (modal && e.target === modal) {
            fecharModal();
        }
    });
    
    // Tecla ESC para fechar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
    
    // Recarregar dados em caso de erro
    const recarregarBtn = document.getElementById('btn-recarregar');
    if (recarregarBtn) {
        recarregarBtn.addEventListener('click', carregarDadosIniciais);
    }
}

// Inicializar quando o DOM estiver pronto
function domReady() {
    console.log('DOM completamente carregado, inicializando...');
    try {
        init();
        console.log('Inicialização concluída com sucesso');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        mostrarMensagem(
            'Erro ao inicializar a aplicação. Por favor, recarregue a página.',
            'error'
        );
    }
}

function mostrarDetalhesEmpresa(idEmpresa) {
    try {
        console.log('=== mostrarDetalhesEmpresa chamada ===');
        console.log('ID da empresa recebido:', idEmpresa, 'Tipo:', typeof idEmpresa);
        
        // Verificar se o ID é válido
        const id = parseInt(idEmpresa, 10);
        if (isNaN(id)) {
            console.error('ID da empresa inválido:', idEmpresa);
            mostrarMensagem('ID da empresa inválido.', 'error');
            return;
        }
        
        console.log('Buscando empresa com ID:', id);
        console.log('Lista de empresas:', state.empresas);
        
        // Usar o ID convertido para número na busca
        const empresa = state.empresas.find(e => e.id_empresa === id);
        console.log('Empresa encontrada:', empresa);
        
        if (!empresa) {
            console.error(`Empresa com ID ${id} não encontrada`);
            mostrarMensagem('Empresa não encontrada.', 'error');
            return;
        }
        
        // Formatar o CNPJ se existir
        const formatarCNPJ = (cnpj) => {
            if (!cnpj) return 'Não informado';
            return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        };
        
        // Formatar o telefone se existir
        const formatarTelefone = (telefone) => {
            if (!telefone) return 'Não informado';
            const tel = telefone.replace(/\D/g, '');
            if (tel.length === 11) {
                return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (tel.length === 10) {
                return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
            return telefone;
        };
        
        // Criar o conteúdo do modal
        const modalContent = `
            <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onclick="fecharModal()"></div>
                    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    
                    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <i class="fas fa-building text-blue-600"></i>
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        ${empresa.nome || 'Detalhes da Empresa'}
                                    </h3>
                                    <div class="mt-4 space-y-2">
                                        <div class="border-b border-gray-100 pb-2">
                                            <p class="text-sm text-gray-500">CNPJ:</p>
                                            <p class="text-sm font-medium text-gray-900">${formatarCNPJ(empresa.cnpj)}</p>
                                        </div>
                                        <div class="border-b border-gray-100 pb-2">
                                            <p class="text-sm text-gray-500">Endereço:</p>
                                            <p class="text-sm font-medium text-gray-900">${empresa.endereco || 'Não informado'}</p>
                                        </div>
                                        <div class="border-b border-gray-100 pb-2">
                                            <p class="text-sm text-gray-500">Bairro:</p>
                                            <p class="text-sm font-medium text-gray-900">${empresa.bairro || 'Não informado'}</p>
                                        </div>
                                        <div class="border-b border-gray-100 pb-2">
                                            <p class="text-sm text-gray-500">Cidade/UF:</p>
                                            <p class="text-sm font-medium text-gray-900">
                                                ${empresa.cidade || 'Não informada'}/${empresa.uf || '--'}
                                                ${empresa.cep ? `- CEP: ${empresa.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}` : ''}
                                            </p>
                                        </div>
                                        <div class="border-b border-gray-100 pb-2">
                                            <p class="text-sm text-gray-500">Telefone:</p>
                                            <p class="text-sm font-medium text-gray-900">${formatarTelefone(empresa.telefone)}</p>
                                        </div>
                                        <div class="border-b border-gray-100 pb-2">
                                            <p class="text-sm text-gray-500">E-mail:</p>
                                            <p class="text-sm font-medium text-gray-900">${empresa.email || 'Não informado'}</p>
                                        </div>
                                        <div>
                                            <p class="text-sm text-gray-500">Responsável:</p>
                                            <p class="text-sm font-medium text-gray-900">${empresa.responsavel || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button type="button" onclick="fecharModal()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
            
            // Remover qualquer modal existente
            const modalExistente = document.querySelector('.modal-empresa-detalhes');
            if (modalExistente) {
                document.body.removeChild(modalExistente);
            }
            
            // Criar e exibir o modal
            const modal = document.createElement('div');
            modal.className = 'modal-empresa-detalhes';
            modal.innerHTML = modalContent;
            
            // Adicionar evento para fechar ao pressionar ESC
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    fecharModal();
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);
            document.body.appendChild(modal);
            
            // Fechar ao clicar fora do conteúdo
            const overlay = modal.querySelector('.fixed.inset-0');
            if (overlay) {
                overlay.addEventListener('click', fecharModal);
            }
            
            // Adicionar classe de overflow ao body para evitar rolagem
            document.body.classList.add('overflow-hidden');
            
            // Retornar true para indicar sucesso
            return true;
        
    } catch (error) {
        console.error('Erro ao exibir detalhes da empresa:', error);
        mostrarMensagem('Erro ao carregar os detalhes da empresa.', 'error');
    }
}

// Adicionar logs para verificar se as funções estão sendo definidas
console.log('Exportando funções globais...');
console.log('abrirModalNovoEstagio:', typeof abrirModalNovoEstagio);
console.log('abrirModalNovaEmpresa:', typeof abrirModalNovaEmpresa);
console.log('fecharModal:', typeof fecharModal);
console.log('mostrarDetalhesEmpresa:', typeof mostrarDetalhesEmpresa);

// Exportar funções globais
window.abrirModalNovoEstagio = abrirModalNovoEstagio;
window.abrirModalNovaEmpresa = abrirModalNovaEmpresa;
window.fecharModal = fecharModal;
window.salvarNovoEstagio = salvarNovoEstagio;
window.salvarNovaEmpresa = salvarNovaEmpresa;
window.mostrarDetalhesEmpresa = mostrarDetalhesEmpresa;

// Adicionar função para teste direto pelo console
console.log('Para testar, use: abrirModalNovoEstagio() no console');

// Verificar novamente após a exportação
console.log('Funções após exportação:');
console.log('window.mostrarDetalhesEmpresa:', typeof window.mostrarDetalhesEmpresa);

// Adicionar evento DOMContentLoaded para garantir que o código seja executado quando o DOM estiver pronto
console.log('Verificando estado do DOM...');
if (document.readyState === 'loading') {
    console.log('DOM ainda não carregado, adicionando event listener...');
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM completamente carregado, executando domReady...');
        domReady();
    });
} else {
    console.log('DOM já carregado, executando domReady imediatamente...');
    domReady();
}

// Configuração do menu lateral
document.addEventListener('DOMContentLoaded', function() {
    // Toggle do menu lateral
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            document.querySelector('.main-content').classList.toggle('expanded');
        });
    }

    // Carregar dados do dashboard apenas se estiver na página do dashboard
    if (document.getElementById('alunosChart') && document.getElementById('fluxoCaixaChart')) {
        loadDashboardData();
        
        // Atualizar dados a cada 5 minutos
        setInterval(loadDashboardData, 5 * 60 * 1000);
    }
});

// Função para formatar valores monetários
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para carregar os dados do dashboard
async function loadDashboardData() {
    try {
        // Mostrar loading
        document.getElementById('loading').classList.remove('hidden');
        
        // Fazer requisição para as estatísticas do dashboard
        const response = await fetch('/api/dashboard/estatisticas');
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao carregar dados do dashboard');
        }
        
        // Atualizar cards de resumo
        updateSummaryCards(data);
        
        // Criar gráficos
        createAlunosChart(data.statusAlunos);
        createFluxoCaixaChart(data.fluxoCaixa.historico);
        
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        alert('Erro ao carregar o dashboard. Por favor, tente novamente.');
    } finally {
        // Esconder loading
        document.getElementById('loading').classList.add('hidden');
    }
}

// Atualizar cards de resumo
function updateSummaryCards(data) {
    // Total de alunos
    document.getElementById('total-alunos').textContent = data.totalAlunos || 0;
    
    // Fluxo de caixa (último mês)
    document.getElementById('fluxo-caixa').textContent = formatCurrency(data.fluxoCaixa.ultimoMes || 0);
    
    // Alunos trancados e inativos
    document.getElementById('alunos-trancados').textContent = data.statusAlunos.trancados || 0;
    document.getElementById('alunos-inativos').textContent = data.statusAlunos.inativos || 0;
    
    // Atualizar título da página com o total de alunos ativos
    document.title = `Dashboard (${data.statusAlunos.ativos || 0} ativos) - SGA`;
}

// Criar gráfico de distribuição de alunos
function createAlunosChart(statusData) {
    const ctx = document.getElementById('alunosChart').getContext('2d');
    
    // Verificar se já existe um gráfico e destruí-lo corretamente
    if (window.alunosChart && typeof window.alunosChart.destroy === 'function') {
        window.alunosChart.destroy();
        window.alunosChart = null;
    }
    
    // Inicializar o gráfico
    window.alunosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ativos', 'Trancados', 'Inativos'],
            datasets: [{
                data: [statusData.ativos || 0, statusData.trancados || 0, statusData.inativos || 0],
                backgroundColor: [
                    '#4e73df',
                    '#f6c23e',
                    '#e74a3b'
                ],
                hoverBackgroundColor: [
                    '#2e59d9',
                    '#dda20a',
                    '#be2617'
                ],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        },
    });
}

// Criar gráfico de fluxo de caixa
function createFluxoCaixaChart(historico) {
    // Verificar se já existe um gráfico e destruí-lo corretamente
    if (window.fluxoCaixaChart && typeof window.fluxoCaixaChart.destroy === 'function') {
        window.fluxoCaixaChart.destroy();
        window.fluxoCaixaChart = null;
    }
    
    // Extrair dados do histórico
    const labels = [];
    const valores = [];
    
    historico.forEach(item => {
        const [ano, mes] = item.mes.split('-');
        const data = new Date(ano, mes - 1);
        labels.push(data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));
        valores.push(parseFloat(item.total));
    });
    
    const ctx = document.getElementById('fluxoCaixaChart').getContext('2d');
    window.fluxoCaixaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor (R$)',
                data: valores,
                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                borderColor: 'rgba(78, 115, 223, 1)',
                pointRadius: 3,
                pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointBorderColor: 'rgba(78, 115, 223, 1)',
                pointHoverRadius: 3,
                pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                pointHitRadius: 10,
                pointBorderWidth: 2,
                borderWidth: 2
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.raw.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                        }
                    }
                }
            }
        }
    });
}

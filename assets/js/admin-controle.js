// =================================================================================
// SCRIPT DA PÁGINA DE CONTROLE DE PRESENTES COMPRADOS
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO DOM ---
    const restrictedContent = document.getElementById('restricted-content');
    const tableBody = document.querySelector('#purchased-gifts-table tbody');
    const exportCsvBtn = document.getElementById('export-csv-btn');

    // --- FUNÇÕES DE AUTENTICAÇÃO E RENDERIZAÇÃO ---

    /**
     * Pede a senha e exibe o conteúdo se estiver correta.
     */
    function autenticar() {
        const senhaInserida = prompt("Digite a senha para acessar a área administrativa:");
        if (senhaInserida === CONFIG.SENHA_ADMIN) {
            restrictedContent.style.display = 'block';
            renderizarTabela();
        } else {
            alert("Senha incorreta. Acesso negado.");
            document.getElementById('main-content').innerHTML = '<h1>Acesso Negado</h1><p>Você não tem permissão para ver esta página.</p>';
        }
    }

    /**
     * Renderiza a tabela com os presentes comprados.
     */
    function renderizarTabela() {
        const presentes = getPresentes();
        const presentesComprados = presentes.filter(p => p.status === 'comprado');
        tableBody.innerHTML = ''; // Limpa a tabela

        if (presentesComprados.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum presente foi marcado como comprado ainda.</td></tr>';
            return;
        }

        presentesComprados.forEach(presente => {
            const dataCompra = presente.dataCompra ? new Date(presente.dataCompra).toLocaleDateString('pt-BR') : 'N/A';
            const informadoPara = presente.informadoPara ? presente.informadoPara.charAt(0).toUpperCase() + presente.informadoPara.slice(1) : 'N/A';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${presente.nome}</td>
                <td><span class="status-comprado">Comprado</span></td>
                <td>${informadoPara}</td>
                <td>${dataCompra}</td>
                <td>
                    <button class="btn btn-danger" data-id="${presente.id}">❌ Desmarcar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        adicionarEventListenersDeDesmarcar();
    }
    
    // --- LÓGICA DE EVENTOS ---
    
    /**
     * Adiciona eventos de clique aos botões de desmarcar.
     */
    function adicionarEventListenersDeDesmarcar() {
        const botoesDesmarcar = document.querySelectorAll('.btn-danger');
        botoesDesmarcar.forEach(botao => {
            botao.addEventListener('click', (e) => {
                const presenteId = parseInt(e.target.dataset.id, 10);
                desmarcarPresente(presenteId);
            });
        });
    }

    /**
     * Reverte o status de um presente para "disponível".
     * @param {number} id O ID do presente a ser desmarcado.
     */
    function desmarcarPresente(id) {
        if (!confirm("Tem certeza que deseja desmarcar este presente como comprado? Ele voltará a ficar disponível na lista.")) {
            return;
        }

        let presentes = getPresentes();
        const index = presentes.findIndex(p => p.id === id);

        if (index !== -1) {
            presentes[index].status = 'disponivel';
            presentes[index].informadoPara = null;
            presentes[index].dataCompra = null;
            savePresentes(presentes);
            renderizarTabela();
        }
    }

    /**
     * Exporta os dados da tabela para um arquivo CSV.
     */
    function exportarParaCSV() {
        const presentes = getPresentes().filter(p => p.status === 'comprado');
        if (presentes.length === 0) {
            alert("Não há presentes comprados para exportar.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Nome do Presente,Status,Informado Para,Data da Compra\r\n"; // Cabeçalho

        presentes.forEach(p => {
            const dataCompra = p.dataCompra ? new Date(p.dataCompra).toLocaleDateString('pt-BR') : 'N/A';
            const informadoPara = p.informadoPara || 'N/A';
            csvContent += `"${p.nome}","Comprado","${informadoPara}","${dataCompra}"\r\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_presentes_comprados.csv");
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
    }


    // --- INICIALIZAÇÃO ---
    exportCsvBtn.addEventListener('click', exportarParaCSV);
    autenticar();
});

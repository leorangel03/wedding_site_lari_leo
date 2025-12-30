// =================================================================================
// SCRIPT DA PÁGINA DE ADMINISTRAÇÃO DE PRESENTES
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO DOM ---
    const restrictedContent = document.getElementById('restricted-content');
    const addGiftForm = document.getElementById('add-gift-form');
    const adminGiftListContainer = document.getElementById('admin-gift-list');

    // --- FUNÇÕES DE AUTENTICAÇÃO E RENDERIZAÇÃO ---

    /**
     * Pede a senha e exibe o conteúdo se estiver correta.
     */
    function autenticar() {
        const senhaInserida = prompt("Digite a senha para acessar a área administrativa:");
        if (senhaInserida === CONFIG.SENHA_ADMIN) {
            restrictedContent.style.display = 'block';
            renderizarListaAdmin();
        } else {
            alert("Senha incorreta. Acesso negado.");
            document.getElementById('main-content').innerHTML = '<h1>Acesso Negado</h1><p>Você não tem permissão para ver esta página.</p>';
        }
    }

    /**
     * Renderiza a lista de presentes na área de administração.
     */
    function renderizarListaAdmin() {
        const presentes = getPresentes();
        adminGiftListContainer.innerHTML = ''; // Limpa a lista

        if (presentes.length === 0) {
            adminGiftListContainer.innerHTML = '<p>Nenhum presente cadastrado.</p>';
            return;
        }

        presentes.forEach(presente => {
            const item = document.createElement('div');
            item.className = 'gift-item';
            item.innerHTML = `
                <img src="${presente.imagem}" alt="${presente.nome}">
                <div class="gift-info">
                    <h4>${presente.nome}</h4>
                    <p>${presente.descricao}</p>
                </div>
                <button class="btn btn-danger" data-id="${presente.id}">🗑️ Remover</button>
            `;
            adminGiftListContainer.appendChild(item);
        });

        adicionarEventListenersDeRemocao();
    }

    // --- LÓGICA DE EVENTOS ---

    /**
     * Adiciona eventos de clique aos botões de remover.
     */
    function adicionarEventListenersDeRemocao() {
        const botoesRemover = document.querySelectorAll('.btn-danger');
        botoesRemover.forEach(botao => {
            botao.addEventListener('click', (e) => {
                const presenteId = parseInt(e.target.dataset.id);
                removerPresente(presenteId);
            });
        });
    }

    /**
     * Manipula a submissão do formulário para adicionar um novo presente.
     * @param {Event} e O evento de submissão.
     */
    function handleAddGift(e) {
        e.preventDefault();

        const nome = document.getElementById('gift-name').value;
        const descricao = document.getElementById('gift-description').value;
        const imagem = document.getElementById('gift-image').value;

        const presentes = getPresentes();
        const novoId = presentes.length > 0 ? Math.max(...presentes.map(p => p.id)) + 1 : 1;

        const novoPresente = {
            id: novoId,
            nome,
            descricao,
            imagem,
            status: "disponivel",
            informadoPara: null,
            dataCompra: null
        };

        const novosPresentes = [...presentes, novoPresente];
        savePresentes(novosPresentes);

        // Limpa o formulário e renderiza a lista atualizada
        addGiftForm.reset();
        renderizarListaAdmin();
    }

    /**
     * Remove um presente da lista.
     * @param {number} id O ID do presente a ser removido.
     */
    function removerPresente(id) {
        if (!confirm("Tem certeza que deseja remover este presente?")) {
            return;
        }

        let presentes = getPresentes();
        const novosPresentes = presentes.filter(p => p.id !== id);
        
        savePresentes(novosPresentes);
        renderizarListaAdmin();
    }

    // --- INICIALIZAÇÃO ---
    addGiftForm.addEventListener('submit', handleAddGift);
    autenticar();
});

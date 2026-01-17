document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO DOM ---
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginBtn = document.getElementById('btn-login');
    const passwordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');

    const tableBody = document.getElementById('admin-gift-list');
    const filterStatus = document.getElementById('filter-status');
    const sortOrder = document.getElementById('sort-order');

    const modal = document.getElementById('modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const openAddModalBtn = document.getElementById('btn-open-add-modal');
    const giftForm = document.getElementById('gift-form');
    const modalTitle = document.getElementById('modal-title');

    // --- AUTENTICAÇÃO ---
    loginBtn.addEventListener('click', () => {
        const pwd = passwordInput.value;
        if (pwd === CONFIG.SENHA_ADMIN) {
            loginScreen.style.display = 'none';
            adminDashboard.style.display = 'block';
            renderTable();
        } else {
            loginError.style.display = 'block';
        }
    });

    // --- RENDERIZAÇÃO ---
    
    let listaPresentesCache = [];

    // Inicia listener do Firebase assim que carrega (mas só exibe se logado)
    escutarPresentes((presentes) => {
        listaPresentesCache = presentes;
        if (adminDashboard.style.display === 'block') {
            renderTable();
        }
    });

    function renderTable() {
        let presentes = [...listaPresentesCache]; // Cópia para não alterar cache
        
        // Filtrar
        const statusFilter = filterStatus.value;
        if (statusFilter !== 'all') {
            presentes = presentes.filter(p => p.status === statusFilter);
        }

        // Ordenar
        const sort = sortOrder.value;
        presentes.sort((a, b) => {
            if (sort === 'name-asc') return a.nome.localeCompare(b.nome);
            if (sort === 'status') return a.status.localeCompare(b.status);
            // Default ID/Creation
            return a.id - b.id;
        });

        tableBody.innerHTML = '';

        presentes.forEach(p => {
            const tr = document.createElement('tr');
            const isComprado = p.status === 'comprado';
            
            tr.innerHTML = `
                <td><img src="${p.imagem}" alt="img"></td>
                <td>
                    <strong>${p.nome}</strong>
                </td>
                <td style="max-width: 200px; font-size: 0.9rem;">${p.descricao.substring(0, 50)}...</td>
                <td>
                    <span class="status-badge ${p.status}">${p.status.toUpperCase()}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm ${isComprado ? 'btn-info' : 'btn-warning'}" 
                                onclick="toggleStatus(${p.id})">
                            ${isComprado ? 'Marcar Disponível' : 'Marcar Comprado'}
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editGift(${p.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteGift(${p.id})">Excluir</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- AÇÕES GLOBAIS (chamadas pelo HTML string) ---
    window.toggleStatus = (id) => {
        const p = listaPresentesCache.find(item => item.id === id);
        if (p) {
            const novoStatus = p.status === 'disponivel' ? 'comprado' : 'disponivel';
            const novoP = {
                ...p,
                status: novoStatus,
                dataCompra: novoStatus === 'comprado' ? Date.now() : null
            };
            
            salvarPresente(novoP)
                .then(() => console.log("Status atualizado!"))
                .catch(err => alert("Erro ao atualizar: " + err));
        }
    };

    window.deleteGift = (id) => {
        if (!confirm('Tem certeza que deseja excluir este presente?')) return;
        
        removerPresente(id)
            .then(() => console.log("Presente removido"))
            .catch(err => alert("Erro ao remover: " + err));
    };

    window.editGift = (id) => {
        const p = listaPresentesCache.find(item => item.id === id);
        if (p) {
            document.getElementById('gift-id').value = p.id;
            document.getElementById('gift-name').value = p.nome;
            document.getElementById('gift-desc').value = p.descricao;
            document.getElementById('gift-img').value = p.imagem;
            document.getElementById('gift-status').value = p.status;
            
            modalTitle.innerText = 'Editar Presente';
            modal.style.display = 'block';
        }
    };

    // --- FORMULARIO (ADD/EDIT) ---
    openAddModalBtn.addEventListener('click', () => {
        giftForm.reset();
        document.getElementById('gift-id').value = '';
        document.getElementById('gift-status').value = 'disponivel';
        modalTitle.innerText = 'Novo Presente';
        modal.style.display = 'block';
    });

    giftForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idVal = document.getElementById('gift-id').value;
        const nome = document.getElementById('gift-name').value;
        const desc = document.getElementById('gift-desc').value;
        const img = document.getElementById('gift-img').value;
        const status = document.getElementById('gift-status').value;

        // Se for edição usa ID existente, se novo gera ID
        let giftId = idVal ? parseInt(idVal) : null;

        // Para gerar ID novo corretamente, precisamos garantir que é único.
        // O método mais seguro no firebase é usar push(), mas para manter IDs numéricos
        // vamos pegar o maior ID atual + 1.
        
        const salvar = async (idFinal) => {
            const isEditing = !!idVal;
            let existing = null;

            if (isEditing) {
                const presentes = await buscarTodosPresentesOnce();
                existing = presentes.find(p => p.id == idVal);
            }

            const giftData = {
                id: idFinal,
                nome,
                descricao: desc,
                imagem: img,
                status,
                informadoPara: isEditing && existing ? existing.informadoPara : null,
                dataCompra: isEditing && existing ? existing.dataCompra : null
            };

            if (isEditing && existing) {
                if (status === 'comprado' && status !== existing.status) {
                    giftData.dataCompra = Date.now();
                } else if (status === 'disponivel' && status !== existing.status) {
                    giftData.dataCompra = null;
                }
            } else if (status === 'comprado') {
                giftData.dataCompra = Date.now();
            }

            salvarPresente(giftData)
                .then(() => {
                    modal.style.display = 'none';
                    giftForm.reset();
                })
                .catch(err => alert("Erro ao salvar: " + err));
        };

        if (giftId) {
            salvar(giftId);
        } else {
            // Gera novo ID baseado no maior existente
            const maxId = listaPresentesCache.reduce((max, p) => p.id > max ? p.id : max, 0);
            salvar(maxId + 1);
        }
    });

    // --- EVENT LISTENERS UI ---
    filterStatus.addEventListener('change', renderTable);
    sortOrder.addEventListener('change', renderTable);
    
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

});

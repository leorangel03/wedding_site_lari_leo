document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DO DOM ---
    const giftListPreview = document.getElementById('gift-list-preview');
    const giftListContainer = document.getElementById('gift-list-container');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = modal ? modal.querySelector('.close-btn') : null;
    const hamburgerButton = document.getElementById('hamburger-button');
    const navLinks = document.getElementById('nav-links');
    const searchInput = document.getElementById('search-input');
    const sortAzBtn = document.getElementById('sort-az');

    // --- MENU HAMBURGER ---
    if (hamburgerButton && navLinks) {
        hamburgerButton.addEventListener('click', () => {
            toggleMenu();
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('is-active')) {
                    toggleMenu();
                }
            });
        });
    }

    function toggleMenu() {
        hamburgerButton.classList.toggle('is-active');
        navLinks.classList.toggle('is-active');
        document.body.classList.toggle('menu-active');
    }
    
    // --- RENDERIZAÇÃO DE PRESENTES ---

    let listaPresentesCache = [];
    const viewState = {
        searchTerm: '',
        sort: 'default' // 'default', 'az'
    };

    function inicializarLista() {
        const containers = [giftListPreview, giftListContainer].filter(c => c);
        containers.forEach(c => c.innerHTML = '<p>Carregando presentes...</p>');

        escutarPresentes((presentes) => {
            listaPresentesCache = presentes;
            applyFiltersAndSorting();
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                viewState.searchTerm = e.target.value;
                applyFiltersAndSorting();
            });
        }

        if (sortAzBtn) {
            sortAzBtn.addEventListener('click', () => {
                viewState.sort = viewState.sort === 'az' ? 'default' : 'az';
                sortAzBtn.textContent = viewState.sort === 'az' ? 'Remover Ordem' : 'Ordenar de A-Z';
                applyFiltersAndSorting();
            });
        }
    }

    function applyFiltersAndSorting() {
        let items = [...listaPresentesCache];

        // 1. Filtrar
        if (viewState.searchTerm) {
            const lowerCaseSearch = viewState.searchTerm.toLowerCase();
            items = items.filter(p => p.nome.toLowerCase().includes(lowerCaseSearch));
        }

        // 2. Ordenar
        if (viewState.sort === 'az') {
            items.sort((a, b) => a.nome.localeCompare(b.nome));
        }

        renderizar(items);
    }

    function renderizar(presentes) {
        let container = null;
        let itemsToRender = [];

        if (giftListPreview) {
            container = giftListPreview;
            // A visualização prévia não deve ser afetada pelos filtros, mas sim pelo cache original
            const disponiveis = listaPresentesCache.filter(p => p.status !== 'comprado');
            const comprados = listaPresentesCache.filter(p => p.status === 'comprado');
            itemsToRender = [...disponiveis, ...comprados].slice(0, 3);
        } else if (giftListContainer) {
            container = giftListContainer;
            itemsToRender = presentes; // Usa a lista já processada
        } else {
            return; 
        }

        container.innerHTML = '';

        if (!itemsToRender || itemsToRender.length === 0) {
            container.innerHTML = viewState.searchTerm 
                ? '<p>Nenhum presente encontrado para sua busca.</p>'
                : '<p>Nossa lista de presentes está sendo preparada!</p>';
            return;
        }

        itemsToRender.forEach(presente => {
            const isComprado = presente.status === 'comprado';
            const card = document.createElement('div');
            card.className = 'gift-card';
            if (isComprado) card.classList.add('comprado');

            card.innerHTML = `
                ${isComprado ? '<span class="badge">Comprado</span>' : ''}
                <img src="${presente.imagem}" alt="${presente.nome}" loading="lazy">
                <div class="gift-card-content">
                    <h3>${presente.nome}</h3>
                    <p>${presente.descricao}</p>
                    <button class="btn btn-primary" data-id="${presente.id}" ${isComprado ? 'disabled' : ''}>
                        ${isComprado ? 'Já Presenteado' : 'Presentear'}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        adicionarEventListenersAosBotoes();
    }

    function adicionarEventListenersAosBotoes() {
        const botoes = document.querySelectorAll('.gift-card .btn-primary:not([disabled])');
        botoes.forEach(botao => {
            botao.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const presente = listaPresentesCache.find(p => p.id == id);
                if(presente) abrirModalDeConfirmacao(presente);
            });
        });
    }

    // --- MODAL & WHATSAPP ---

    function showModal(html) {
        if(!modal || !modalBody) return;
        modalBody.innerHTML = html;
        modal.style.display = 'block';
    }

    function closeModal() {
        if(!modal) return;
        modal.style.display = 'none';
        modalBody.innerHTML = '';
    }

    function abrirModalDeConfirmacao(presente) {
        const html = `
            <h3>Presentear: ${presente.nome}</h3>
            <p>Ficamos muito felizes com seu carinho! Para combinar a entrega, avise um de nós pelo WhatsApp.</p>
            <div class="contact-cards" style="margin-top: 1rem;">
                <button class="btn" onclick="buscarPresenteNaWeb('${presente.nome}')">
                    Buscar presente na web 🌐
                </button>
                <button class="btn btn-whatsapp" onclick="informarCompra('${presente.id}', 'noiva')">
                    Avisar a Noiva 👰
                </button>
                <button class="btn btn-whatsapp" onclick="informarCompra('${presente.id}', 'noivo')">
                    Avisar o Noivo 🤵
                </button>
            </div>
            <p style="font-size: 0.8rem; margin-top: 1.5rem; color: #666;">
                *Ao clicar, você será redirecionado para o WhatsApp. O item continuará como disponível no site até que atualizemos manualmente.
            </p>
        `;
        showModal(html);
    }

    // Função global acessível pelo onclick do HTML string
    window.buscarPresenteNaWeb = (nomeDoPresente) => {
        const query = encodeURIComponent(nomeDoPresente);
        window.open(`https://www.google.com/search?q=${query}&tbm=shop`, '_blank');
    };

    // Função global acessível pelo onclick do HTML string
    window.informarCompra = (id, quem) => {
        const presente = listaPresentesCache.find(p => p.id == id);
        if (!presente) return;

        const num = quem === 'noiva' ? CONFIG.WHATSAPP_NOIVA : CONFIG.WHATSAPP_NOIVO;
        const msg = `Olá! Gostaria de presentear vocês com: *${presente.nome}*. Como podemos combinar? 🎉`;
        
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
        closeModal();
    };

    // --- SLIDER (Apenas na Home) ---
    function configurarSlider() {
        const slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return;
        
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        let current = 0;

        function show(idx) {
            slides.forEach((s, i) => s.classList.toggle('active', i === idx));
        }

        function next() { current = (current + 1) % slides.length; show(current); }
        function prev() { current = (current - 1 + slides.length) % slides.length; show(current); }

        if(nextBtn) nextBtn.addEventListener('click', next);
        if(prevBtn) prevBtn.addEventListener('click', prev);

        setInterval(next, 5000);
    }

    // --- COPY PIX ---
    function configurarPix() {
        document.querySelectorAll('.btn-copy-pix').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.targetId;
                const key = document.getElementById(id)?.innerText;
                if(key) {
                    navigator.clipboard.writeText(key).then(() => {
                        const original = e.target.innerText;
                        e.target.innerText = 'Copiado!';
                        setTimeout(() => e.target.innerText = original, 2000);
                    });
                }
            });
        });
    }

    // --- VARIAVEIS GLOBAIS ---
    function configurarLinks() {
        const rsvp = document.getElementById('rsvp-link');
        if(rsvp) rsvp.href = CONFIG.LINK_GOOGLE_FORMS;
        
        const wNoiva = document.getElementById('whatsapp-noiva');
        if(wNoiva) wNoiva.href = `https://wa.me/${CONFIG.WHATSAPP_NOIVA}`;

        const wNoivo = document.getElementById('whatsapp-noivo');
        if(wNoivo) wNoivo.href = `https://wa.me/${CONFIG.WHATSAPP_NOIVO}`;

        const pixNoiva = document.getElementById('pix-noiva-key');
        if(pixNoiva) pixNoiva.innerText = CONFIG.CHAVE_PIX_NOIVA;

        const pixNoivo = document.getElementById('pix-noivo-key');
        if(pixNoivo) pixNoivo.innerText = CONFIG.CHAVE_PIX_NOIVO;
    }

    // --- INIT ---
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    configurarLinks();
    configurarPix();
    configurarSlider();
    inicializarLista();
});
// =================================================================================
// LÓGICA DE NEGÓCIO - FIREBASE (SUBSTITUI LOCALSTORAGE)
// =================================================================================

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(CONFIG.FIREBASE);
}
const db = firebase.database();
const dbRef = db.ref('presentes');

/**
 * Retorna uma lista de presentes de exemplo para inicialização.
 */
function getListaDePresentesInicial() {
    return [
        {
            id: 1,
            nome: "Conjunto de Panelas Premium",
            descricao: "Um conjunto completo com panelas antiaderentes para a nossa nova cozinha.",
            imagem: "https://images.unsplash.com/photo-1583776536923-38e51576b9b3?q=80&w=500&auto=format&fit=crop",
            status: "disponivel",
            informadoPara: null,
            dataCompra: null
        },
        {
            id: 2,
            nome: "Vale-Jantar Romântico",
            descricao: "Um jantar especial em um restaurante à nossa escolha para celebrarmos.",
            imagem: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500&auto=format&fit=crop",
            status: "disponivel",
            informadoPara: null,
            dataCompra: null
        },
        {
            id: 3,
            nome: "Air Fryer",
            descricao: "Para refeições mais rápidas e saudáveis no dia a dia.",
            imagem: "https://images.unsplash.com/photo-1542042161-23-153955379660?q=80&w=500&auto=format&fit=crop",
            status: "comprado",
            informadoPara: "noiva",
            dataCompra: new Date().getTime()
        },
        {
            id: 4,
            nome: "Kit de Ferramentas",
            descricao: "Um kit básico para os pequenos reparos e projetos em casa.",
            imagem: "https://images.unsplash.com/photo-1557038311-53fb93cf2c99?q=80&w=500&auto=format&fit=crop",
            status: "disponivel",
            informadoPara: null,
            dataCompra: null
        },
        {
            id: 5,
            nome: "Cota para a Lua de Mel",
            descricao: "Ajude-nos a ter uma experiência inesquecível em nossa viagem dos sonhos!",
            imagem: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=500&auto=format&fit=crop",
            status: "disponivel",
            informadoPara: null,
            dataCompra: null
        },
         {
            id: 6,
            nome: "Aspirador de Pó Robô",
            descricao: "Para manter a casa limpa sem esforço e nos dar mais tempo juntos.",
            imagem: "https://images.unsplash.com/photo-1620824053283-4429f6f69f54?q=80&w=500&auto=format&fit=crop",
            status: "disponivel",
            informadoPara: null,
            dataCompra: null
        }
    ];
}

/**
 * Escuta por alterações na lista de presentes em tempo real.
 * @param {Function} callback Função chamada sempre que os dados mudam, recebendo a lista (array).
 */
function escutarPresentes(callback) {
    dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        
        // Se for a primeira vez (banco vazio), popula com os iniciais
        if (!data) {
            console.log("Banco vazio. Inicializando...");
            const iniciais = getListaDePresentesInicial();
            // Salva um por um ou em lote
            iniciais.forEach(p => salvarPresente(p));
            callback(iniciais);
        } else {
            // Converte Objeto {id1: {}, id2: {}} para Array [{}, {}]
            // Nota: Firebase keys podem ser strings aleatorias, mas aqui estamos usando IDs manuais.
            // Vamos garantir que devolvemos um array para o front.
            const lista = Object.values(data);
            
            // Ordena por ID para manter consistência visual (opcional)
            lista.sort((a, b) => a.id - b.id);
            
            callback(lista);
        }
    });
}

/**
 * Salva (Cria ou Atualiza) um presente no Firebase.
 * Usa o ID do presente como chave do nó para facilitar updates.
 */
function salvarPresente(presente) {
    // Se não tiver ID, cria um (apenas precaução, o admin já gera)
    if (!presente.id) presente.id = Date.now();
    
    // .set() substitui tudo naquele caminho (update completo do item)
    return dbRef.child(presente.id).set(presente)
        .catch(err => console.error("Erro ao salvar:", err));
}

/**
 * Remove um presente do Firebase.
 */
function removerPresente(id) {
    return dbRef.child(id).remove()
        .catch(err => console.error("Erro ao remover:", err));
}

// Para manter compatibilidade com o Admin que gera ID baseado no length
// Vamos precisar de uma função auxiliar para pegar o snapshot uma vez só (Promise)
function buscarTodosPresentesOnce() {
    return dbRef.once('value').then(snapshot => {
        const data = snapshot.val();
        return data ? Object.values(data) : [];
    });
}
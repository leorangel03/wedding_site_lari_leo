// =================================================================================
// ARQUIVO DE CONFIGURAÇÃO CENTRAL
// =================================================================================
// Altere os valores abaixo para personalizar o site.
// Mantenha o formato dos dados (texto entre aspas, números, etc.).
// =================================================================================

const CONFIG = {
    // --- INFORMAÇÕES DOS NOIVOS ---
    WHATSAPP_NOIVA: "5511986115404", // Número de WhatsApp da noiva (somente números, com código do país e DDD)
    CHAVE_PIX_NOIVA: "11986115404", // Chave PIX da noiva

    WHATSAPP_NOIVO: "5511944803248", // Número de WhatsApp do noivo (somente números, com código do país e DDD)
    CHAVE_PIX_NOIVO: "leorangel0403@gmail.com", // Chave PIX do noivo

    // --- CONFIRMAÇÃO DE PRESENÇA (RSVP) ---
    LINK_GOOGLE_FORMS: "https://docs.google.com/forms/d/e/1FAIpQLScdubyL_EEDYGu2Jrey_Y9P2dY_G2z_fM-mrYVj2p2eplx0sQ/viewform", // Link completo do seu formulário Google Forms

    // --- SENHA DA ÁREA ADMINISTRATIVA ---
    // IMPORTANTE: Esta é uma senha simples para dificultar o acesso.
    // Não é uma proteção de alta segurança.
    SENHA_ADMIN: "lalalele",

    // --- NOME DO LOCALSTORAGE ---
    // Altere se precisar ter versões diferentes da lista de presentes no mesmo navegador.
    LOCALSTORAGE_KEY: "listaPresentesLL",

    // --- FIREBASE CONFIG ---
    FIREBASE: {
        apiKey: "AIzaSyBtG3vFcwOUbe02KOkY9OGIEYTKG8yKMWA",
        authDomain: "lari-leo.firebaseapp.com",
        databaseURL: "https://lari-leo-default-rtdb.firebaseio.com",
        projectId: "lari-leo",
        storageBucket: "lari-leo.firebasestorage.app",
        messagingSenderId: "354128568054",
        appId: "1:354128568054:web:299a59257092910cd816d7"
    }
};

// Impede que o objeto CONFIG seja modificado em outras partes do código.
Object.freeze(CONFIG);

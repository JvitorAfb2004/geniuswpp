// Importar as dependências
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializar o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Inicializar o aplicativo Express
const app = express();
const port = 3000;

// Middleware para analisar o corpo das requisições em formato JSON
app.use(express.json());

// Gerar e exibir o QR Code para autenticação
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code recebido. Escaneie o código QR.');
});

// Confirmar quando o cliente estiver pronto
client.on('ready', () => {
    console.log('Cliente do WhatsApp está pronto!');
});

// Manipular erros
client.on('auth_failure', () => {
    console.error('Falha na autenticação. Verifique o QR Code.');
});

client.on('disconnected', () => {
    console.log('Cliente desconectado.');
});

// Rota POST para receber mensagens e encaminhá-las
app.post('/forward', async (req, res) => {
    const { message, contact } = req.body;

    if (!message || !contact) {
        return res.status(400).json({ error: 'Mensagem e contato são necessários.' });
    }

    try {
        // Encontrar o chat pelo número do contato
        const chat = await client.getChatById(contact);
        if (!chat) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }

        // Encaminhar a mensagem
        await chat.sendMessage(message);
        res.status(200).json({ success: 'Mensagem encaminhada com sucesso.' });
    } catch (error) {
        console.error('Erro ao encaminhar a mensagem:', error);
        res.status(500).json({ error: 'Erro ao encaminhar a mensagem.' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`);
});

// Inicializar o cliente do WhatsApp
client.initialize();

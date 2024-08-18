const { Client } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3000;

// Configuração do cliente WhatsApp
const client = new Client();

client.on('qr', (qr) => {
    // Gere e escaneie este código com seu telefone
    qrcode.generate(qr, { small: true });
    console.log('QR RECEBIDO', qr);
});

client.on('ready', () => {
    console.log('Cliente está pronto!');
});

client.on('message', msg => {
    if (msg.body === '!ping') {
        msg.reply('pong');
    }
});

// Função para enviar mensagens
async function sendMessageToWhatsApp(numero, mensagem) {
    try {
        await client.sendMessage(numero, mensagem);
        console.log(`Mensagem enviada para ${numero} com sucesso.`);
    } catch (error) {
        console.error(`Erro ao enviar mensagem para ${numero}:`, error);
    }
}

// Configuração do servidor Express
app.use(bodyParser.json());

app.post('/enviarmsg', (req, res) => {
    const { numero, mensagem } = req.body;

    if (!numero || !mensagem) {
        return res.status(400).send('Número e mensagem são necessários.');
    }

    sendMessageToWhatsApp('+5574999835227', 'mensagem')
        .then(() => res.status(200).send('Mensagem enviada com sucesso.'))
        .catch(() => res.status(500).send('Erro ao enviar mensagem.'));
});

// Inicializar o servidor Express
app.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`);
});

// Inicialize o cliente WhatsApp
client.initialize();

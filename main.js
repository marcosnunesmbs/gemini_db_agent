import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();
import runAgent from './geminiAgent.js';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply("Envie uma pergunta sobre o banco de dados."));

bot.command('id', (ctx) => {
    return ctx.reply(`Seu ID do Telegram é: ${ctx.message.from.id}`);
});

bot.on('text', async (ctx) => {
    console.log(`Mensagem recebida: ${ctx.message.text}`);
    console.log(`ID do usuário: ${ctx.message.from.id}`);
    //verifica se o bot está ativo
    //verfiica que quem mandou a mensagem é um usuario e não um bot
    if (ctx.message.from.is_bot) {
        return;
    }
    //verifica se quem manodu a mensagem sou eu - id do usuario telegram
    if (ctx.message.from.id != process.env.TELEGRAM_AUTHORIZED_USER) {
        return ctx.reply("Você não está autorizado a usar este bot.");
    }
    const pergunta = ctx.message.text;
    console.log(`Pergunta recebida: ${pergunta}`);
    try {
        const resposta = await runAgent(pergunta);
        ctx.reply(resposta);
    } catch (err) {
        console.error(err);
        ctx.reply("Erro ao processar sua pergunta.");
    }
});

// Para teste direto via linha de comando
if (process.argv[2] === "test") {
    const testQuestion = "Quantas vendas foram feitas?";
    console.log(`Testando com a pergunta: ${testQuestion}`);
    runAgent(testQuestion)
        .then(response => {
            console.log("Resposta final:");
            console.log(response);
            process.exit(0);
        })
        .catch(error => {
            console.error("Erro durante o teste:", error);
            process.exit(1);
        });
} else {
    // Inicia o bot do Telegram
    bot.launch()
        .then(() => console.log('Bot iniciado com sucesso!'))
        .catch(err => console.error('Erro ao iniciar o bot:', err));
}
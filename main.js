import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();
import runAgent from './geminiAgent.js';

const history = [];

function addToHistory(role, text) {
    const message = { role, parts: [{ text: text }] };
    history.push(message);
}
function getHistory() {
    return history;
}
function clearHistory() {
    history.length = 0;
    return history;
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply("Envie uma pergunta sobre o banco de dados."));

bot.command('id', (ctx) => {
    return ctx.reply(`Seu ID do Telegram é: ${ctx.message.from.id}`);
});

bot.command('clear', (ctx) => {
    clearHistory();
    return ctx.reply("Histórico limpo.");
});

bot.command('history', (ctx) => {
    if (history.length === 0) {
        return ctx.reply("Histórico vazio.");
    }
    const historyText = history.map((msg, index) => `${index + 1}. ${msg.role}: ${msg.parts[0].text}`).join('\n');
    return ctx.reply(`Histórico:\n${historyText}`);
});

bot.on('text', async (ctx) => {
    //verfiica que quem mandou a mensagem é um usuario e não um bot
    if (ctx.message.from.is_bot) {
        return;
    }
    //verifica se quem manodu a mensagem sou eu - id do usuario telegram
    if (ctx.message.from.id != process.env.TELEGRAM_AUTHORIZED_USER) {
        return ctx.reply("Você não está autorizado a usar este bot.");
    }
    const pergunta = ctx.message.text;



    try {
        // Adiciona a pergunta ao histórico
        addToHistory("user", pergunta);

        // Chama a função runAgent para processar a pergunta
        const resposta = await runAgent(pergunta, getHistory());

        // Adiciona a resposta ao histórico
        addToHistory("model", resposta);
        ctx.reply(resposta);
    } catch (err) {
        console.error(err);
        await ctx.deleteMessage(statusMessage.message_id);
        ctx.reply("Erro ao processar sua pergunta.");
    }
});

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
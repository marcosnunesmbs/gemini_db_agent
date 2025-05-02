import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import * as fs from 'fs/promises';
import generateSql from './tools/generateSql.js';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runAgent(pergunta, history = [], ctx = null) {
    // Cria uma cópia do histórico sem incluir a última pergunta do usuário
    // já que ela será enviada diretamente como mensagem
    let chatHistory = [];

    let statusMessage = null;

    if (history && history.length > 0) {
        // Se houver histórico e pelo menos 2 mensagens, pegamos tudo exceto a última (que é a pergunta atual)
        if (history.length > 1) {
            chatHistory = history.slice(0, -1);
        }
    }

    const chat = await genAI.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        thinkingConfig: {
            thinkingBudget: 512,
        },
        history: chatHistory,
        config: {
            systemInstruction: `
            Você é um assistente de gentente de uma loja que faz consulta aos dados da mesma através das ferramentas disponíveis.
            O usuário não precisa saber o nome da tabela, apenas o que ele quer saber.
            Em caso de pergunta genérica sobre uma tabela, você deve gerar uma SQL com todas as colunas da tabela em questão.
            Ex: Me liste todos os produtos = SELECT * FROM produtos;
            
            Caso a pergunta não se adeque a ferramenta, você deve responder com uma mensagem informando que não conseguiu entender a pergunta e como o usuáriode deve fazer a pergunta.`,
            tools: [{
                functionDeclarations: [generateSql],
            }],
        },
    });

    const response = await chat.sendMessage({
        message: pergunta,
    });

    if (response.functionCalls && response.functionCalls.length > 0) {

        if (ctx) {
            statusMessage = await ctx.reply('🔄 Consultando...');
        }

        const functionCall = response.functionCalls[0];
        const functionName = functionCall.name;

        let functionArgs;
        try {
            functionArgs = functionCall.args || {};
        } catch (error) {
            console.error("Erro ao processar argumentos da função:", error);
            functionArgs = {};
        }

        if (functionName === 'generate_sql') {

            const schemaFilePath = path.resolve(__dirname, './database_schema.txt');
            const schema = await fs.readFile(schemaFilePath, 'utf-8');
            const instructions = `
            Você deve receber uma pergunta/comando do usuário a ser traduzida em uma consulta SQL 
            sobre a tabela ${process.env.DB_NAME} que pode retornar o que o usuário precisa e quer saber.
            caso não seja informado um campo, pesquise nome e id.
            considere o histórico da conversa para entender o que o usuário quer, e não retorne nada além do JSON com o comando SQL.
            Schema do banco de dados: ${schema}
            Historico da conversa para contexto: ${JSON.stringify(chatHistory.slice(-4))}
            `;
            const sqlQuestion = `baseado no comando/pergunta: ${pergunta} Reponsa em JSON com um comando SQL `;

            const modelQuery = await chat.sendMessage({
                model: 'gemini-2.0-flash',
                message: sqlQuestion,
                config: {
                    systemInstruction: instructions,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                'query': {
                                    type: Type.STRING,
                                    description: 'Query SQL gerada',
                                    nullable: false,
                                },
                            },
                            required: ['query'],
                        },
                    },
                }
            });

            const sql = JSON.parse(modelQuery.text);

            let queryResult = null;

            try {
                const result = await query(sql[0].query);
                queryResult = `Resultado da consulta: ${JSON.stringify(result)}`;
            } catch (error) {
                console.error("Erro ao executar a consulta SQL:", error);
                return "Erro ao executar a consulta SQL.";
            }

            if (queryResult) {
                const finalResponse = await chat.sendMessage({
                    message: `Reponendo a pergunta: ${pergunta}, retorne uma resposta em linguagem natural o resultado
                    da query que foi a seguinte:
                    ${queryResult}
                    
                    retonre para responder de mandeira criativa com emojis (moderadamente) e para o telegram, use quebra de linha com \n`,
                });
                if (statusMessage) {
                    await ctx.deleteMessage(statusMessage.message_id);
                }
                return finalResponse.text;

            }
        }
    }

    return response.text;
}


export default runAgent;
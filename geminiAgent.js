import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import * as fs from 'fs/promises';
import generateSql from './tools/generateSql.js';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const history = [];

function addToHistory(role, text) {
    const message = { role, parts: [{ text }] };
    history.push(message);
    return history;
}
function getHistory() {
    return history;
}
function clearHistory() {
    history.length = 0;
    return history;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runAgent(pergunta) {

    const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: pergunta,
        config: {
            tools: [{
                functionDeclarations: [generateSql],
            }],
        },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        const functionName = functionCall.name;

        let functionArgs;
        try {
            functionArgs = functionCall.args || {};
            console.log(`Chamando a função: ${functionName} com os argumentos: ${JSON.stringify(functionArgs)}`);
        } catch (error) {
            console.error("Erro ao processar argumentos da função:", error);
            functionArgs = {};
        }

        if (functionName === 'generate_sql') {

            const schemaFilePath = path.resolve(__dirname, './database_schema.txt');
            const schema = await fs.readFile(schemaFilePath, 'utf-8');
            const sqlQuestion = `baseado na pergunta: ${pergunta} e schema: ${schema} Reponsa em JSON com um comando SQL sobre a tabela ${process.env.DB_NAME}.`;

            const modelQuery = await genAI.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: sqlQuestion,
                config: {
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

            console.log(`SQL gerado: ${sql[0].query}`);

            let queryResult = null;

            try {
                const result = await query(sql[0].query);
                console.log("Resultado da consulta:", result);
                queryResult = `Resultado da consulta: ${JSON.stringify(result)}`;
            } catch (error) {
                console.error("Erro ao executar a consulta SQL:", error);
                return "Erro ao executar a consulta SQL.";
            }

            if (queryResult) {
                const finalResponse = await genAI.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: `Reponendo a pergunta: ${pergunta}, retorne uma resposta em linguagem natural o resultado
                    da query que foi a seguinte:
                    ${queryResult}`,
                });

                return finalResponse.text;

            }
        }
    }

    return response.text;
}

export default runAgent;
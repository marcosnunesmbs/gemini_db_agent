import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const schemaFilePath = path.resolve(__dirname, './database_schema.txt');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: "generate_sql",
    description: `Recebe uma pergunta sobre a loja (ou suas colunas) e Gera SQL da tabela loja com base na pergunta ou comando do usuário.
    Considere comando ou pergunta como sendo a mesma coisa (pergunta).
    Schema a ser considerado:
    ${schemaFilePath} `,
    parameters: {
        type: "object",
        properties: {
            pergunta: { type: "string" },
        },
        required: ["pergunta"],
    },
};
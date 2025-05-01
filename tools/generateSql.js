import fs from 'fs/promises';
import path from 'path';

export default {
    name: "generate_sql",
    description: "Gera SQL da tabela loja com base na pergunta",
    parameters: {
        type: "object",
        properties: {
            pergunta: { type: "string" },
        },
        required: ["pergunta"],
    },
};
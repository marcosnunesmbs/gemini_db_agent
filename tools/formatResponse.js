export default {
    name: "format_response",
    description: "Formata resultado da consulta",
    parameters: {
      type: "object",
      properties: {
        pergunta: { type: "string" },
        resultado: { type: "string" },
      },
      required: ["pergunta", "resultado"],
    },
    async run({ pergunta, resultado }) {
      return `Para a pergunta: '${pergunta}', o resultado foi: ${resultado}`;
    }
  };

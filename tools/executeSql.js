import { query } from '../db.js';

export default {
  name: "execute_sql",
  description: "Executa SQL no banco",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string" },
    },
    required: ["query"],
  },
  async run({ query: sql }) {
    const result = await query(sql);
    return JSON.stringify(result);
  }
};
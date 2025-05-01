# Gemini DB Agent

Um bot de Telegram integrado com o Google Gemini AI que permite realizar consultas em bancos de dados MySQL através de linguagem natural.

## Recursos

- Integração com a API do Google Gemini 2.0 Flash
- Consultas em linguagem natural para banco de dados MySQL
- Conversa com histórico preservado
- Respostas formatadas e criativas

## Requisitos

- Node.js v14+
- MySQL/MariaDB
- Conta no Google AI Studio (para obter chave da API do Gemini)
- Bot do Telegram registrado

## Configuração

### 1. Criação do Bot no Telegram

1. Abra o Telegram e busque por "@BotFather"
2. Inicie uma conversa com o BotFather e use o comando `/newbot`
3. Siga as instruções para dar um nome e um username ao seu bot
4. Ao finalizar, você receberá um token no formato `123456789:ABCDEFGhijklmnopQRSTUvwxyz`
5. Guarde este token para uso posterior

### 2. Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env`:
   ```
   cp .env.example .env
   ```
4. Edite o arquivo `.env` com suas configurações:
   - `TELEGRAM_TOKEN`: O token do seu bot do Telegram
   - `GEMINI_API_KEY`: Chave da API do Google Gemini (obtenha em [https://ai.google.dev/](https://ai.google.dev/))
   - `DB_HOST`: Host do seu banco de dados MySQL (geralmente "localhost")
   - `DB_USER`: Usuário do banco de dados
   - `DB_PASS`: Senha do banco de dados
   - `DB_NAME`: Nome do banco de dados
   - `TELEGRAM_AUTHORIZED_USER`: Seu ID de usuário do Telegram (use o comando `/id` no bot para obter)

### 3. Configuração do Banco de Dados

1. Crie um banco de dados MySQL
2. Execute o script SQL contido em `database_schema.txt` para criar as tabelas necessárias

## Uso

1. Inicie o bot:
   ```
   node main.js
   ```
2. Abra o Telegram e procure pelo seu bot pelo username que você definiu
3. Inicie uma conversa com o bot usando o comando `/start`

### Comandos Disponíveis

- `/start` - Inicia o bot
- `/id` - Mostra seu ID de usuário do Telegram (útil para configuração)
- `/clear` - Limpa o histórico da conversa
- `/history` - Mostra o histórico da conversa atual

### Exemplos de Consultas

- "Quantos produtos temos em estoque?"
- "Qual o cliente que mais comprou no último mês?"
- "Mostre-me os produtos com valor acima de R$ 100"
- "Qual foi o total de vendas da semana passada?"

## Como Funciona

1. O usuário envia uma pergunta em linguagem natural via Telegram
2. O bot utiliza a API do Google Gemini para converter a pergunta em uma consulta SQL
3. A consulta é executada no banco de dados MySQL
4. O resultado é formatado e retornado ao usuário de forma criativa e amigável

## Segurança

- O bot só responde ao ID de usuário Telegram especificado no arquivo .env
- As credenciais do banco de dados são armazenadas localmente no arquivo .env
- Não compartilhe suas chaves de API ou tokens

## Solução de Problemas

Se o bot não responder:
1. Verifique se o serviço está rodando
2. Confirme que seu ID de usuário está corretamente configurado no `.env`
3. Verifique se o token do Telegram está correto
4. Verifique a conexão com o banco de dados
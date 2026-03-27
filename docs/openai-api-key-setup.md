# OpenAI API Key Setup

This project now reads environment variables from a local `.env` file in the repo root.

## 1. Copy the example file

```bash
cp .env.example .env
```

## 2. Edit `.env`

Set your local PostgreSQL connection and OpenAI API key:

```env
DATABASE_URL="postgresql://YOUR_MAC_USERNAME@localhost:5432/crystal_prompter"
OPENAI_API_KEY="your_openai_api_key_here"
OPENAI_MODEL="gpt-5-mini"
```

Replace:

- `YOUR_MAC_USERNAME` with the result of `whoami`
- `your_openai_api_key_here` with your real OpenAI API key
- `OPENAI_MODEL` optional. `gpt-5-mini` is a practical default for chatbot development.

## 3. Start the server

```bash
python3 server.py
```

## 4. Verify

```bash
curl "http://127.0.0.1:8000/api/health"
```

Expected field:

```json
"openaiConfigured": true
```

You should also see:

```json
"openaiModel": "gpt-5-mini"
```

## Official OpenAI reference

- Quickstart: https://platform.openai.com/docs/quickstart
- API keys: https://platform.openai.com/api-keys
- Responses API: https://platform.openai.com/docs/api-reference/responses

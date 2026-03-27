# Backend API

The local Python server now supports PostgreSQL-backed read endpoints in addition to the existing TTS routes.

Run:

```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/crystal_prompter" \
python3 server.py
```

Server URL:

`http://127.0.0.1:8000`

## Endpoints

### Health

`GET /api/health`

Returns:

- server health
- rhubarb availability
- database connectivity
- row counts for core tables when available

### Products

`GET /api/products`

Optional query params:

- `limit`

### Product Detail

`GET /api/products/:slug`

Returns:

- product info
- family info
- latest matching price row
- structured specs
- FAQs

### Product FAQs

`GET /api/products/:slug/faqs`

Behavior:

- uses `product_faqs` first if present
- falls back to `knowledge_qa_items` for broader imported workbook data

### Prices

`GET /api/prices`

Optional query params:

- `limit`
- `product_slug`

### Knowledge Search

`GET /api/knowledge/search?q=cue%2024`

Optional query params:

- `product_slug`
- `limit`

### AI Chat

`POST /api/chat`

Request body:

```json
{
  "message": "What is the price of Cue 24?",
  "product_slug": "cue24"
}
```

Returns:

- `answer`
- `model`
- `productSlug`
- matched `knowledgeItems`
- matched `priceItems`

## Example Commands

```bash
curl "http://127.0.0.1:8000/api/health"
```

```bash
curl "http://127.0.0.1:8000/api/products"
```

```bash
curl "http://127.0.0.1:8000/api/products/clone16"
```

```bash
curl "http://127.0.0.1:8000/api/products/cue24/faqs"
```

```bash
curl "http://127.0.0.1:8000/api/prices?product_slug=cue24"
```

```bash
curl "http://127.0.0.1:8000/api/knowledge/search?q=price"
```

```bash
curl -X POST "http://127.0.0.1:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the price of Cue 24?","product_slug":"cue24"}'
```

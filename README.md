# 🌍 African Voices — Heritage Archive

A digital heritage platform preserving African oral histories, cultural stories, folklore, and community narratives.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | ASP.NET Core 8 Web API |
| Database | PostgreSQL 16 + Entity Framework Core 8 |
| AI | Azure AI Speech Service |
| Container | Docker + Docker Compose |

---

## Project Structure

```
Africa voices/
├── AfricanVoices.API/          ← ASP.NET Core 8 backend
│   ├── Controllers/            ← StoriesController, DashboardController
│   ├── Services/               ← StoryService, SpeechService, FileStorageService
│   │   └── Interfaces/
│   ├── Repositories/           ← StoryRepository (EF Core)
│   │   └── Interfaces/
│   ├── Models/                 ← Story, TranscriptionStatus
│   ├── DTOs/                   ← Request/response DTOs + mappings
│   ├── Data/                   ← AfricanVoicesDbContext
│   ├── Migrations/             ← EF Core migrations
│   ├── Middleware/             ← Global error handling
│   ├── Validators/             ← FluentValidation rules
│   ├── Configuration/          ← Typed settings classes
│   └── uploads/                ← Audio file storage (git-ignored)
│
├── african-voices-frontend/    ← React frontend
│   └── src/
│       ├── api/                ← Axios API client
│       ├── components/         ← Navbar, StoryCard, Pagination, etc.
│       └── pages/              ← Dashboard, StoryLibrary, UploadStory, StoryDetails
│
├── docker-compose.yml
└── .env.example
```

---

## Quick Start (Local Development)

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org)
- [PostgreSQL 16](https://www.postgresql.org/download/)
- [Azure AI Speech Service key](https://portal.azure.com) *(optional for upload-only testing)*

### 1 — Clone & configure

```bash
git clone <repo-url>
cd "Africa voices"

# Copy env template
cp .env.example .env
# Edit .env and fill in AZURE_SPEECH_KEY + AZURE_SPEECH_REGION
```

### 2 — Start PostgreSQL

Ensure PostgreSQL is running locally:

```bash
# macOS with Homebrew
brew services start postgresql@16

# Or use Docker just for the database
docker run -d \
  --name africanvoices-db \
  -e POSTGRES_DB=africanvoicesdb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=ChangeMe123 \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3 — Run the backend

```bash
cd AfricanVoices.API

# Restore packages
dotnet restore

# Run migrations (creates the database + tables automatically on first start)
dotnet run

# API available at: http://localhost:5000
# Swagger UI:       http://localhost:5000/swagger
```

> EF Core migrations run automatically on startup via `db.Database.Migrate()` in `Program.cs`.
> To run migrations manually: `dotnet ef database update`

### 4 — Run the frontend

```bash
cd african-voices-frontend
npm install
npm run dev

# App available at: http://localhost:5173
```

---

## Docker (Full Stack)

```bash
# Copy and fill in secrets
cp .env.example .env

# Build and start all services
docker compose up --build

# App:  http://localhost:3000
# API:  http://localhost:5000
# DB:   localhost:5432
```

Stop everything:
```bash
docker compose down
# To also remove volumes (database data): docker compose down -v
```

---

## API Reference

Base URL: `http://localhost:5000/api`  
Swagger: `http://localhost:5000/swagger`

### Stories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stories` | List all stories (paginated) |
| GET | `/stories/{id}` | Get story by ID |
| POST | `/stories` | Upload new story (multipart/form-data) |
| PUT | `/stories/{id}` | Update story metadata |
| DELETE | `/stories/{id}` | Delete story + audio file |
| GET | `/stories/search` | Search + filter stories |
| POST | `/stories/{id}/transcribe` | Generate Azure AI transcript |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | Platform statistics |

### Upload example (cURL)

```bash
curl -X POST http://localhost:5000/api/stories \
  -F "title=The Legend of Sundiata" \
  -F "language=English" \
  -F "region=West Africa" \
  -F "category=History" \
  -F "audioFile=@/path/to/story.mp3"
```

### Search example

```bash
curl "http://localhost:5000/api/stories/search?query=harvest&language=Swahili&category=Folklore&page=1&pageSize=12"
```

---

## Azure AI Speech Configuration

1. Create a [Speech resource in Azure Portal](https://portal.azure.com)
2. Copy your **Key 1** and **Region**
3. Add to `AfricanVoices.API/appsettings.Development.json`:

```json
{
  "AzureSpeech": {
    "SubscriptionKey": "your-key-here",
    "Region": "eastus"
  }
}
```

Supported language auto-mapping:
- English → `en-US`
- Swahili → `sw-KE`
- Zulu → `zu-ZA`
- Xhosa → `xh-ZA`
- Afrikaans → `af-ZA`
- Amharic → `am-ET`
- Hausa → `ha-NG`
- Yoruba → `yo-NG`
- + more (see `SpeechService.cs`)

---

## Database Schema

```sql
CREATE TABLE "Stories" (
    "Id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Title"               VARCHAR(300)  NOT NULL,
    "Description"         VARCHAR(2000),
    "Language"            VARCHAR(100)  NOT NULL,
    "Region"              VARCHAR(200)  NOT NULL,
    "Category"            VARCHAR(100)  NOT NULL,
    "AudioFilePath"       VARCHAR(500)  NOT NULL,
    "Transcript"          TEXT,
    "Summary"             VARCHAR(1000),
    "ContributorName"     VARCHAR(200),
    "ContributorEmail"    VARCHAR(200),
    "Tags"                VARCHAR(500),
    "DurationSeconds"     INTEGER,
    "TranscriptionStatus" VARCHAR(50)   NOT NULL,
    "CreatedDate"         TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedDate"         TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## EF Core Migration Commands

```bash
cd AfricanVoices.API

# Add a new migration
dotnet ef migrations add <MigrationName>

# Apply pending migrations
dotnet ef database update

# Roll back last migration
dotnet ef database update <PreviousMigrationName>

# Generate SQL script (for production review)
dotnet ef script
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | See appsettings.json |
| `AzureSpeech__SubscriptionKey` | Azure Speech API key | *(empty)* |
| `AzureSpeech__Region` | Azure region | `eastus` |
| `Cors__AllowedOrigins__0` | Allowed CORS origin | `http://localhost:5173` |
| `ASPNETCORE_ENVIRONMENT` | Runtime environment | `Development` |

---

## Weekend Build Roadmap

### Day 1 (Saturday)
- [ ] Set up PostgreSQL locally
- [ ] Install .NET 8 SDK
- [ ] `dotnet run` the API — verify Swagger at `/swagger`
- [ ] Test upload endpoint with cURL or Swagger UI
- [ ] `npm run dev` the frontend
- [ ] Upload your first story through the UI

### Day 2 (Sunday)
- [ ] Add your Azure Speech key
- [ ] Test transcription on an uploaded story
- [ ] Explore search & filters in the library
- [ ] Deploy with `docker compose up --build`
- [ ] Demo end-to-end: upload → transcribe → search → play

---

## Future Enhancements

- JWT authentication + user accounts
- AI-generated story summaries (Azure OpenAI)
- Cloud file storage (Azure Blob Storage)
- Full-text search with PostgreSQL `tsvector`
- Story collections / playlists
- Community comments
- Mobile app (React Native)

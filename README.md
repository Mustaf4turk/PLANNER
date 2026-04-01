# PLANNER

Proje yönetim uygulaması — Kanban board, Gantt chart, takvim görünümü, ekip yönetimi ve davet sistemi.

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Veritabanı:** SQLite (Prisma ORM)
- **Kimlik Doğrulama:** JWT

---

## Gereksinimler

| Araç | Minimum Sürüm |
|------|---------------|
| Node.js | v18+ (önerilen: v20 LTS) |
| npm | v9+ (Node.js ile birlikte gelir) |
| Git | v2+ |

---

## 1. Node.js Kurulumu

> Node.js zaten kuruluysa bu adımı atla. Kontrol etmek için terminalde `node -v` yaz.

### macOS

**Yöntem A — Siteden (kolay):**
1. https://nodejs.org adresine git
2. **LTS** sürümünü indir (yeşil buton, `.pkg` dosyası)
3. İndirilen `.pkg` dosyasına çift tıkla, kurulumu tamamla
4. Terminali kapat, yenisini aç

**Yöntem B — Homebrew ile:**
```bash
brew install node@20
```

### Windows

**Yöntem A — Siteden (kolay):**
1. https://nodejs.org adresine git
2. **LTS** sürümünü indir (`.msi` dosyası)
3. İndirilen dosyayı çalıştır, "Next" diyerek kurulumu tamamla
4. Terminali (CMD veya PowerShell) kapat, yenisini aç

**Yöntem B — winget ile:**
```bash
winget install OpenJS.NodeJS.LTS
```

### Linux (Ubuntu/Debian)
(Burada şunu belirtiyim burdaki linkle uğraşamıyorsanız eğer daha basit Node.js sitesine girin (https://nodejs.org/en) Sol altta latest olan versiyonu var v24 direkt onu indirin. Orada hangi işletim sistemiyse onu seçin mac için .pkg li olani indirin macos 64 bit .pkg olan var çift tık yapıp kurun sonrasında node -v falan sürümü kontrol edin ve uygulamayı çalıştırabilirsiniz.)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Kurulum Kontrolü

```bash
node -v    # v20.x.x gibi bir çıktı vermeli
npm -v     # 10.x.x gibi bir çıktı vermeli
```

---

## 2. Projeyi Klonla

```bash
git clone https://github.com/Mustaf4turk/PLANNER.git
cd PLANNER
```

---

## 3. İlk Kurulum (bir kere)

```bash
npm install
npm run setup
```

Bu komut sırasıyla:
- Backend bağımlılıklarını kurar
- Prisma client oluşturur
- SQLite veritabanını oluşturur
- Frontend bağımlılıklarını kurar

---

## 4. Çalıştır

```bash
npm run dev
```

Bu tek komut backend ve frontend'i aynı anda başlatır:

| Servis | Adres |
|--------|-------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |

Durdurmak için: `Ctrl + C`

---

## Diğer Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Backend + Frontend birlikte başlat |
| `npm run dev:backend` | Sadece backend başlat |
| `npm run dev:frontend` | Sadece frontend başlat |
| `npm run setup` | İlk kurulum (DB oluşturma dahil) |
| `npm run install:all` | Sadece bağımlılıkları kur |

---

## Proje Yapısı

```
PLANNER/
├── backend/          # Express API sunucusu
│   ├── prisma/       # Veritabanı şeması
│   └── src/
│       ├── routes/   # API rotaları (auth, projects, tasks, members)
│       ├── middleware/# JWT doğrulama
│       └── index.ts  # Sunucu giriş noktası
├── frontend/         # Next.js uygulaması
│   └── src/
│       ├── app/      # Sayfalar (dashboard, projects, timeline, calendar, team)
│       └── lib/      # API client, auth context, tipler
└── package.json      # Root — tek komutla çalıştırma
```

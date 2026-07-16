# Start Here — AccessLens Akhilan Checkpoint

## 1. Open the folder

1. Unzip the project.
2. Open VS Code.
3. Select **File → Open Folder**.
4. Choose the `accesslens-akhilan-only` folder.
5. Open **Terminal → New Terminal**.

## 2. Install dependencies

```bash
npm run install:all
```

## 3. Connect MongoDB Atlas

Copy the environment example.

### macOS or Linux

```bash
cp server/.env.example server/.env
```

### Windows PowerShell

```powershell
Copy-Item server/.env.example server/.env
```

Open `server/.env` and replace `MONGO_URI` with your MongoDB Atlas connection string. Replace `SESSION_SECRET` with a long random value.

## 4. Seed Akhilan's collection

```bash
npm run seed -- --reset
```

This creates:

- 1,005 place documents
- 4 demo users
- 0 accessibility reports

Demo login:

```text
Email: akhilan@accesslens.demo
Password: Access123!
```

## 5. Run the website

Keep two terminals open.

### Terminal 1 — Express backend

```bash
npm --prefix server run dev
```

### Terminal 2 — React frontend

```bash
npm --prefix client run dev
```

Open `http://localhost:5173`.

## 6. Test Akhilan's feature

1. Open **Place Directory**.
2. Search and use every filter.
3. Sign in with the demo account.
4. Add a new place.
5. Turn on **Only places I created**.
6. Open your new place and edit it.
7. Delete only a listing owned by your account.
8. Open **Accessibility Reports** and confirm it is only a placeholder for Santhosh.

## 7. Check before pushing

```bash
npm run check
```

## 8. Deploy to Render

1. Push the project to GitHub.
2. Create a Render Blueprint using `render.yaml`.
3. Add `MONGO_URI` in Render.
4. Deploy.
5. Seed the same Atlas database from your local terminal.

Do not upload or commit `server/.env`.

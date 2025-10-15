# Quick Start Guide

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm run start
```

## Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2: GitHub + Vercel Dashboard
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repo
5. Deploy (auto-detects Next.js)

## Customize Configuration

Edit `lib/config.ts`:

```typescript
export const SAMPLING = {
  samples: 12,          // More = accurate, slower
  intervalMs: 400,      // Lower = faster, may hit rate limits
  retrySamples: 16,     // Retry samples for zero-depth
  concurrency: 1        // Parallel requests (1 recommended)
};
```

### Add/Remove Depth Bands

```typescript
export const DEPTH_BANDS = [
  { key: '0.08', pct: 0.08 },
  { key: '0.10', pct: 0.10 },
  // ... add more here
  { key: 'full', pct: null }  // Full depth (always last)
];
```

## Project Structure

```
app/page.tsx              → Main page
components/               → React components
  Controls.tsx            → Refresh + format toggle
  SummaryBar.tsx          → Summary stats
  DepthTable/             → Table components
lib/                      → Core logic
  config.ts               → ⚙️ Configuration (edit here!)
  sampling.ts             → Median sampling logic
  api.ts                  → dYdX API calls
  depth.ts                → Depth calculations
  pool.ts                 → Concurrency control
```

## Common Tasks

### Change Sampling Method
Edit `lib/sampling.ts` → `sampleTicker()` function

### Adjust Concurrency
Edit `lib/config.ts` → `SAMPLING.concurrency`

### Modify Grouping Rules
Edit `lib/grouping.ts` → `assignGroups()` function

### Change Theme
Edit `app/layout.tsx` → `GlobalStyle` and `theme`

## Troubleshooting

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Type Errors
Check `lib/types.ts` for type definitions

### API Rate Limits
- Reduce `SAMPLING.concurrency` in `lib/config.ts`
- Increase `SAMPLING.intervalMs`

## Performance Tips

- **Faster load**: Decrease `samples` (less accurate)
- **More accurate**: Increase `samples` (slower)
- **Smooth scrolling**: Virtualization already enabled (react-window)
- **Reduce API load**: Lower `concurrency`

## Need Help?

- Check `README.md` for full documentation
- Check `MIGRATION.md` for what changed from HTML
- Review `lib/config.ts` for all tunable parameters

Happy coding! 🚀


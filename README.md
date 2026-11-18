# Nethra Prabhu portfolio

Two pages, one site:

- `/` — general version (AI, data, enterprise software)
- `/healthtech` — healthtech and medical device version

## Files

```
index.html                  general page
healthtech/index.html       healthtech page
Nethra_Prabhu_Resume.pdf    linked from both pages' Résumé buttons
vercel.json                 static site settings (no build step), clean URLs
```

## Deploying

Push to `main` and Vercel deploys automatically. `vercel.json` sets the framework to none, so there is no build step.

The previous Next.js site is saved on the `old-portfolio` branch.

## Check after deploying

- `your-url.vercel.app` shows the general page
- `your-url.vercel.app/healthtech` shows the healthtech page
- Résumé buttons open the PDF on both pages

## Rolling back

Vercel → Deployments → pick an older deployment → Promote to Production.
The old code also stays on the `old-portfolio` branch.

## Updating the résumé

Replace `Nethra_Prabhu_Resume.pdf` with a file of the same name and push.

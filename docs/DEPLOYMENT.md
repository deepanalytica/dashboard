# Despliegue GitHub Pages + Cloudflare Pages

La rama de trabajo prevista es `master` del repositorio demostrativo `deepanalytica/dashboard`. Ajusta el YAML si lo trasladas a un repositorio con rama principal `main`.

## 1. GitHub Pages (sin secretos)

1. GitHub → repositorio → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. GitHub → **Settings → Secrets and variables → Actions → Variables → New repository variable**. Crea `BIL_GITHUB_PAGES_ENABLED` con valor `true`.
3. Ejecuta **Actions → BIL / Validar y publicar → Run workflow** (o realiza un nuevo push en `master`).
4. Comprueba la URL **real** en el resultado del job `github-pages`. La URL probable bajo este repositorio es `https://deepanalytica.github.io/dashboard/`, **pero no se considera publicada hasta que el job lo confirme**.

La configuración `environment: github-pages` y permisos `pages:write` / `id-token:write` ya están en el workflow.

## 2. Cloudflare Pages (Direct Upload desde GitHub Actions)

Evita usar la integración Git automática y Direct Upload simultáneamente en el mismo proyecto para no duplicar despliegues.

1. Cloudflare → Workers & Pages → crea proyecto Pages llamado `bil-studio` mediante **Direct Upload** (o con Wrangler: `npx wrangler@4 pages project create bil-studio --production-branch master`).
2. Crea un API Token de Cloudflare con permisos mínimos de **Cloudflare Pages: Edit** en la cuenta seleccionada. No lo coloques en archivos ni en el chat.
3. GitHub → Settings → Secrets and variables → Actions → Secrets. Añade `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
4. GitHub → Actions → Variables. Añade `BIL_CLOUDFLARE_ENABLED=true`.
5. Ejecuta el workflow. El job publica `dist/` con `wrangler@4 pages deploy dist --project-name bil-studio --branch master`.
6. Inspecciona en Cloudflare Pages la URL desplegada. No asumas que `bil-studio.pages.dev` está asignado hasta comprobarlo.

Si prefieres la **integración Git nativa de Cloudflare**: conecta el repositorio directamente, configura `Build command: npm run build` y `Build output directory: dist`, y **deja `BIL_CLOUDFLARE_ENABLED` desactivada**.

## 3. Dominio, seguridad y gobierno

- Prioriza Cloudflare para dominio definitivo, caché y políticas de seguridad; deja GitHub Pages como espejo o entorno demostrativo.
- No configures dominio final ni DNS hasta confirmar la titularidad y la ruta de producción.
- Protección de rama: requerir PR, revisores, CI, y restringir merges directos (configuración manual de GitHub).
- El workflow CI valida documentos y compilación. No sustituye revisión de derechos sobre materiales, privacidad ni verificación de afirmaciones.
- Para datos privados/multiusuario, añade servidor autenticado con base de datos y control por organización (no incluido en MVP).

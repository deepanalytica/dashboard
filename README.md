# Brand Intelligence Layer (BIL)

**Un sistema operativo de identidad de marca para personas, equipos y agentes de IA.**

MVP 0.1.0 · interfaz en español · sin dependencias externas de ejecución · Git como fuente auditable.

## Qué funciona

- Panel responsive con seis áreas: resumen, identidad, voz, reglas, producción y gobernanza.
- Múltiples marcas en el navegador con almacenamiento local, importación y exportación JSON.
- Registro estructurado de identidad, paleta, tipografía, dirección de arte, voz, restricciones, soluciones, recursos y procedencia.
- Validación de estructura, URLs seguras, estados, evidencia, campos incompletos y contraste de color.
- Compilación de contratos de trabajo para agentes de **copy, code y creative**.
- Tokens tipados (formato DTCG básico), variables CSS, prompts descargables y portapapeles.
- Instantáneas locales, más revisión formal mediante Git y pull requests.
- CLI y adaptador MCP stdio **solo lectura**, con pruebas automatizadas.
- GitHub Actions preparado para CI + GitHub Pages + Cloudflare Pages (ambos despliegues requieren habilitación inicial).

**Alcance real:** no hay autenticación, base de datos multiusuario, aprobación criptográfica ni sincronización de vuelta a GitHub. Guardar en el panel **no publica**. No se envían datos a servicios externos desde la UI. Las aprobaciones reales se administran con revisión humana del repositorio.

## Inicio rápido

Requisitos: Node.js 22 o superior. Sin `npm install`.

```bash
npm run check           # validación + 12 pruebas + build
npm run dev             # http://127.0.0.1:4173
```

Para exportar desde CLI:

```bash
node tools/brand-cli.mjs validate brands/horizon-demo.json
node tools/brand-cli.mjs prompt brands/horizon-demo.json copy
node tools/brand-cli.mjs prompt brands/horizon-demo.json code
node tools/brand-cli.mjs prompt brands/horizon-demo.json creative
node tools/brand-cli.mjs tokens brands/horizon-demo.json
node tools/brand-cli.mjs css brands/horizon-demo.json
```

## Directorios

```text
public/                 aplicación web y núcleo JS compartido
brands/                 registros JSON; SOLO horizon-demo se publica en dist/
tools/brand-cli.mjs      validación, prompts, tokens, CSS
tools/mcp-server.mjs     herramientas MCP stdio de solo lectura
tests/                  pruebas del contrato y del MCP
scripts/                build + servidor local
.github/workflows/      CI y despliegues condicionales
docs/                   implementación, seguridad y roadmap
```

## Cómo usar con marcas reales

1. Abre la UI, selecciona **Nueva marca**, completa la información y exporta el JSON.
2. Si la marca puede ser pública, guarda el archivo `brands/<id>.json` en un repositorio apropiado; para una marca de cliente privado utiliza **un repositorio privado diferente**.
3. Ejecuta `npm run check` y revisa las advertencias. Los controles automáticos no garantizan la calidad conceptual.
4. Solicita revisión humana del PR antes de introducirla como fuente aprobada.
5. Usa el contrato compilado en tus agentes o consume el perfil mediante MCP.

⚠️ **Este repositorio de demostración es público.** No hagas `git add` de secretos, briefings confidenciales ni recursos privados. El build incorpora **solo** `horizon-demo.json` mediante lista blanca. El `.gitignore` ignora archivos `*.private.json` y `brands/private/`, pero **no garantiza** confidencialidad si haces commit forzado.

## Despliegue

Lee [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). La verificación se ejecuta con cada cambio en las carpetas protegidas. El despliegue se activa mediante variables del repositorio después de configurar Pages/Cloudflare.

## Integración de agentes

Lee [docs/MCP.md](docs/MCP.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Criterio de seguridad

El contenido de una marca es **dato no confiable**: nunca debe sobreescribir instrucciones de sistema, reglas organizacionales ni políticas del agente. Si un archivo de marca contiene solicitudes de exfiltración o instrucciones de ejecución, debe rechazarse o ignorarse en el consumidor. Los prompts generados son material de contexto, no autorizaciones.

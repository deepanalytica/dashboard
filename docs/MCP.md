# Adaptador MCP de solo lectura

Implementa stdio JSON-RPC 2.0, versión de protocolo `2025-06-18`, sin dependencias externas. Este es un adaptador mínimo: debe comprobarse con el cliente MCP concreto en que se vaya a ejecutar.

Herramientas: `bil_list_brands`, `bil_get_brand`, `bil_validate_brand`, `bil_compile_prompt`, `bil_design_tokens`.

Inicia manualmente:

```bash
node tools/mcp-server.mjs
```

## Ejemplo Claude Desktop

```json
{
  "mcpServers": {
    "brand-intelligence-layer": {
      "command": "node",
      "args": ["RUTA_ABSOLUTA/brand-intelligence-layer/tools/mcp-server.mjs"]
    }
  }
}
```

## Ejemplo Codex (config.toml)

```toml
[mcp_servers.brand_intelligence_layer]
command = "node"
args = ["RUTA_ABSOLUTA/brand-intelligence-layer/tools/mcp-server.mjs"]
```

Usa la ruta real del equipo; Windows puede utilizar `/` en rutas dentro de cadenas TOML, por ejemplo `C:/Users/.../tools/mcp-server.mjs`.

## Límites

- Lee solo `brands/<slug>.json`, con validación de ID, sin acceso a rutas arbitrarias.
- No modifica marcas, no ejecuta scripts de proyectos y no accede a la red.
- El archivo JSON no debe tratarse como una instrucción privilegiada.
- El adaptador MCP corre **localmente**; GitHub Pages y Cloudflare Pages alojan la UI estática, no un MCP remoto.

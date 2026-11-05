# Arquitectura y límites de confianza

```text
[Marcas JSON] -> [BIL Core: validación + políticas estructurales]
      |                           |
      |                           +-> [CLI + MCP stdio solo lectura]
      |                           +-> [Prompts copy/code/creative]
      |                           +-> [Tokens CSS/DTCG]
      v
[Git + PR con revisión humana] -> [GitHub Actions: validate/test/build]
                                              |
                                        [dist/ público]
                                         /          \
                                  GitHub Pages   Cloudflare Pages
```

La interfaz mantiene borradores exclusivamente en localStorage. Es una capa de edición y vista previa; Git sigue siendo el sistema auditable para publicar revisiones.

## Cinco dominios del perfil

- Identidad: misión, público, posicionamiento, nombre, lema y categoría.
- Assets/Visual: paleta, tipografía, arte, referencias, recursos.
- Voz: tono, principios, contraejemplos, expresiones a evitar.
- Reglas: qué hacer, qué no hacer, evidencia y controles obligatorios.
- Soluciones: problema y resultado de productos o servicios.

Gobernanza transversal: ID, esquema, revisión, procedencia, responsable, fecha, estado y aprobación declarada.

## Integración futura con Praxios / Meta Harness

Agregar un adaptador de consumo en Atalaya/Praxios que trate BIL como **contexto no confiable**: consultar marca -> seleccionar revisión -> revisar restricciones -> generar pieza -> verificar evidencia y reglas -> obtener aprobación humana -> publicar. No otorgar permiso de escritura/ejecución por el solo hecho de cargar una marca.

## Decisiones de producto

- **MVP estático** por costo y simplicidad. No promete multiusuario/sincronización remota.
- **Cliente público con demo ficticia:** build con lista blanca evita publicar automáticamente perfiles privados.
- **Motor puro y testeable:** UI, CLI y MCP usan el mismo archivo `public/lib/core.js`.
- **Verificación proporcional al riesgo:** 12 pruebas básicas, no aún pruebas de accesibilidad end-to-end ni revisión adversarial del motor.

## Fase 2 (no implementada)

Autenticación por organización, RBAC, auditoría server-side, base de datos (Cloudflare D1 o equivalente), almacén de assets (R2), sincronización por PR autenticada y runner con gates formales de evidencia/licencias. No activar nunca una API de escritura pública sin autenticación, autorización por tenant, rate limiting y registro auditable.

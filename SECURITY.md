# Seguridad del MVP

- Datos de ejemplo ficticios en `brands/horizon-demo.json`; todos los demás archivos de marcas son potencialmente sensibles.
- Nunca subir credenciales de GitHub, Cloudflare, API de IA, claves privadas ni datos de clientes.
- La edición del navegador se guarda en localStorage, que no tiene cifrado ni control de acceso. No ingresar datos confidenciales en equipos compartidos.
- El sitio público NO permite escritura al repositorio y no tiene API autenticada.
- URLs de assets aceptadas: HTTPS o rutas locales relativas explícitas. No se incorporan scripts remotos.
- Los prompts son salidas de contenido y no pueden crear autorización sobre sistemas externos.
- CI valida estructura; no garantiza calidad, licencias, verdad fáctica, cumplimiento de marca o aprobación real.
- Evita replicar documentos de clientes en Git público: usa un registro privado aislado cuando sea necesario.

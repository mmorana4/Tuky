# Seguridad - Frontend Tuky

## Estado de vulnerabilidades (npm audit)

### Corregido

- **fast-xml-parser** (crítica): DoS por expansión de entidades en DOCTYPE y bypass de codificación. Se forzó la versión segura mediante `overrides` en `package.json` (`>=5.3.6`). Ver [GHSA-jmr7-xgp7-cmfj](https://github.com/advisories/GHSA-jmr7-xgp7-cmfj) y [GHSA-m7jm-9gc2-mpf2](https://github.com/advisories/GHSA-m7jm-9gc2-mpf2).

### Vulnerabilidades conocidas (altas, sin fix sin breaking changes)

Las restantes (~45 altas) están en dependencias profundas del ecosistema React Native 0.72, Metro, Jest y ESLint (por ejemplo: `ip`, `minimatch`, `glob`, `rimraf`). Afectan sobre todo a herramientas de build, test y CLI, no al código que se ejecuta en la app en producción.

- **`npm audit fix`** no las corrige sin cambiar versiones de esas dependencias.
- **`npm audit fix --force`** puede instalar versiones incompatibles (p. ej. otra versión de React Native) y romper el proyecto.

### Recomendaciones

1. **Desarrollo local**: El estado actual es aceptable para seguir desarrollando; las alertas afectan principalmente al entorno de desarrollo.
2. **Reducir vulnerabilidades a medio plazo**: Planear una actualización de React Native (p. ej. a 0.76+) cuando haya tiempo para probar la app a fondo.
3. **Revisar el informe**: Ejecutar `npm audit` para ver el detalle y `npm audit fix` de vez en cuando por si aparecen correcciones sin breaking changes.

### Comandos útiles

```bash
npm audit          # Ver informe actual
npm audit fix      # Aplicar correcciones que no requieran breaking changes
```

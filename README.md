# Portal de inducción al SIGC — Universidad del Norte

Portal de aprendizaje para la inducción y el onboarding de colaboradores al Sistema Integrado de Gestión de Calidad (SIGC/SIACA).

- Registro y acceso de usuario antes de entrar al portal.
- Un curso completo, `IND-SIGC-2026`, con 5 módulos y 14 lecciones: política, compromisos, objetivos, arquitectura institucional y rol en la mejora continua.
- Comprobación de dos preguntas por lección, evaluación final de 12 preguntas y constancia imprimible.
- Todo el portal es un solo archivo, `index.html`, sin dependencias ni proceso de compilación.

---

## 1. Publicarlo en GitHub Pages

### Opción A — desde el navegador, sin usar la consola

1. Entra a github.com con la cuenta institucional y crea un repositorio nuevo, por ejemplo `portal-sigc-uninorte`. Márcalo como **Public** (GitHub Pages en repositorios privados requiere plan de pago).
2. En el repositorio vacío, usa **Add file → Upload files** y sube `index.html` y `README.md`. Confirma con **Commit changes**.
3. Ve a **Settings → Pages**.
4. En *Build and deployment*, en **Source** elige `Deploy from a branch`; en **Branch** elige `main` y la carpeta `/ (root)`. Guarda.
5. Espera entre uno y dos minutos. La misma pantalla mostrará la dirección publicada, con la forma `https://<usuario>.github.io/portal-sigc-uninorte/`.

### Opción B — desde la consola

```bash
cd portal-sigc
git init
git add index.html README.md
git commit -m "Portal de inducción al SIGC, versión 1.0"
git branch -M main
git remote add origin https://github.com/<usuario>/portal-sigc-uninorte.git
git push -u origin main
```

Luego activa Pages en **Settings → Pages** con los mismos parámetros del paso 4.

### Actualizaciones posteriores

Cada vez que subas un cambio a la rama `main`, GitHub Pages vuelve a publicar el sitio en menos de un minuto. Si no ves el cambio, recarga forzando caché (Ctrl+Shift+R).

### Dominio propio

Si más adelante quieren publicarlo bajo un dominio de la Universidad, en **Settings → Pages → Custom domain** se registra el dominio y la Dirección de Tecnología Informática crea el registro CNAME correspondiente.

---

## 2. Editar el contenido del curso

Todo el material vive en la constante `CURSO`, dentro de `index.html`. No hay que tocar la lógica de la aplicación para actualizar una lección.

```javascript
{
  id: "l04", codigo: "IND-SIGC-L04",
  titulo: "La política de calidad",
  objetivo: "Lo que la persona podrá hacer al terminar la lección.",
  html: `<p>Contenido en HTML...</p>`,
  preguntas: [
    { q: "Enunciado",
      ops: ["Opción A", "Opción B", "Opción C", "Opción D"],
      r: 1,                       // índice de la respuesta correcta, empezando en 0
      exp: "Explicación que se muestra al comprobar." }
  ]
}
```

Reglas útiles:

- Para agregar una lección, copia un bloque completo y cámbiale el `id` y el `codigo`. El índice lateral, el conteo de avance y la barra superior se recalculan solos.
- Para agregar un módulo, copia un bloque `{ id: "m6", titulo, resumen, lecciones: [...] }`.
- El número mínimo de respuestas correctas de la evaluación final se cambia en `EXAMEN.minimo`.
- Dentro de `html:` no uses el carácter de acento grave ni la secuencia `${`, porque cerrarían el literal de plantilla.

### Textos pendientes de oficializar

Los bloques con borde punteado dorado y la marca `[Pendiente]` contienen **textos de referencia que deben reemplazarse por la versión oficial aprobada**. Están en las lecciones L02, L03, L04, L05, L07, L09, L11 y L14, e incluyen la política de calidad, los compromisos, los objetivos vigentes, el mapa de procesos y la denominación de comités y herramientas. Se dejaron marcados en lugar de inventar contenido normativo.

---

## 3. Identidad visual

La paleta está definida al inicio del archivo, en el bloque `:root`:

```css
--azul-900:#00234B;   /* azul profundo, barra superior y fondo del acceso */
--azul-800:#003C71;   /* azul institucional, botones y títulos */
--azul-600:#0B6FB4;   /* azul medio, enlaces y acentos de proceso */
--cian:#23A9D8;       /* cian, marcadores y barra de avance */
--dorado:#F0B323;     /* acento de logro y bloques pendientes */
--papel:#F6F7F9;      /* fondo de lectura */
```

Estos valores reproducen la familia azul institucional de Uninorte, pero **conviene confirmarlos contra el manual de identidad vigente** y ajustarlos aquí: al cambiarlos en `:root` se actualiza todo el portal.

El símbolo circular que aparece en la barra, el acceso y la constancia es un marcador de posición (`<symbol id="sello">`). Debe reemplazarse por el logotipo oficial de la Universidad, respetando las reglas de uso de marca.

Tipografías: Libre Franklin para interfaz y titulares, Source Serif 4 para el cuerpo de las lecciones, cargadas desde Google Fonts. Si la Universidad exige alojar las fuentes localmente, se descargan y se reemplaza el `<link>` por un `@font-face`.

---

## 4. Alcance y limitaciones de esta versión

Esto es importante antes de presentarlo como sistema institucional:

- **La autenticación es del lado del cliente.** No hay servidor: las cuentas y el avance se guardan en el almacenamiento local del navegador de cada persona. Cualquiera con conocimientos básicos puede ver o modificar esos datos.
- **La contraseña se guarda cifrada con SHA-256**, pero eso no lo convierte en un mecanismo de autenticación seguro. En la pantalla de acceso se advierte explícitamente que no debe usarse la contraseña institucional.
- **El avance no se sincroniza entre equipos.** Quien estudie desde otro computador o navegador tendrá que registrarse de nuevo.
- **No hay reporte centralizado.** Cada persona puede descargar su avance en JSON desde *Mi perfil*, pero la DCPA no ve automáticamente quién completó la inducción.
- La constancia acredita la inducción, pero no reemplaza el registro de formación de la Dirección de Gestión y Desarrollo Humano.

### Camino recomendado para la versión institucional

1. **Autenticación real con Microsoft Entra ID (Azure AD).** Como la Universidad ya opera con Microsoft 365, el inicio de sesión institucional elimina el registro manual, garantiza la identidad y permite saber exactamente quién completó la inducción.
2. **Persistencia en servidor.** Una base de datos mínima para avance y resultados, con reporte de cobertura por dependencia. Alternativas de bajo costo: Supabase o Microsoft Lists/Dataverse.
3. **Integración con la plataforma de aprendizaje existente**, si la Universidad ya cuenta con LMS institucional, para que la constancia alimente la hoja de vida de formación.

Mientras tanto, esta versión sirve perfectamente como piloto: permite validar el contenido con las divisiones, medir cuánto tiempo toma la inducción y ajustar las lecciones antes de invertir en desarrollo.

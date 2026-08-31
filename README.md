# Portal de aprendizaje SIGC — Universidad del Norte

Portal de inducción y onboarding al Sistema Integrado de Gestión de Calidad (SIGC/SIACA), liderado por la **Oficina de Calidad Institucional**, adscrita a la **Dirección de Planeación y Estudios Institucionales**.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Portal de aprendices: registro, acceso, catálogo de cursos, lecciones, evaluación y constancia. |
| `admin.html` | Panel de administración: cursos, diseño del portal, personas inscritas, respaldo y cuenta. |
| `datos.js` | Capa compartida: almacenamiento, tema visual y contenido semilla del curso de inducción. |

Los tres archivos van juntos en la raíz del repositorio. No hay dependencias ni proceso de compilación.

---

## 1. Acceso de administrador

```
Dirección:   <tu-sitio>/admin.html
Usuario:     admin@uninorte.edu.co
Contraseña:  SIGC-Admin-2026
```

Estas credenciales se crean automáticamente la primera vez que se abre `admin.html` en un equipo. **Cámbialas en la sección Cuenta apenas entres**: mientras sigan siendo las iniciales, el panel muestra un aviso. La contraseña se guarda cifrada con SHA-256 en el navegador.

Ten presente que la verificación ocurre del lado del cliente: este acceso protege frente al uso casual, no frente a alguien con conocimientos técnicos. La página lleva `noindex` para que no la muestren los buscadores, pero el archivo es público si el repositorio lo es. Antes de operarlo como sistema institucional, el ingreso debe delegarse a Microsoft Entra ID.

### Qué puede hacer el administrador

- **Cursos.** Crear, editar, duplicar, publicar/despublicar y eliminar cursos. Dentro de cada curso: módulos y lecciones con reordenamiento, editor de contenido HTML con vista previa, y editor de preguntas con opciones, respuesta correcta y explicación. Cada curso tiene su propia evaluación final con el mínimo de aciertos configurable.
- **Diseño del portal.** Los diez colores de la paleta con selector y código hexadecimal, tipografía de interfaz y de lectura (catálogo de Google Fonts), tamaños base y de lectura, redondeo de bordes, y los textos de marca: entidad, dependencia responsable, nombre del portal, texto de portada y nota al pie. La vista previa se actualiza mientras editas y los cambios se aplican al guardar. Hay un botón para restablecer los valores originales.
- **Personas inscritas.** Listado de cuentas registradas con dependencia, cargo y avance por curso, exportable a CSV y con opción de eliminar cuentas.
- **Copia de seguridad.** Exportar e importar todos los cursos y el diseño en un archivo JSON.

Un curso solo aparece en el portal de aprendices cuando está **publicado**; los borradores se ven únicamente en el panel.

---

## 2. Publicarlo en GitHub Pages

### Desde el navegador

1. Crea un repositorio, por ejemplo `portal-sigc-uninorte`, en **Public** (Pages en repositorios privados requiere plan de pago).
2. **Add file → Upload files**: sube `index.html`, `admin.html`, `datos.js` y `README.md`. Confirma con **Commit changes**.
3. **Settings → Pages**. En *Source* elige `Deploy from a branch`, rama `main`, carpeta `/ (root)`. Guarda.
4. En uno o dos minutos queda publicado en `https://<usuario>.github.io/portal-sigc-uninorte/`. El panel queda en `.../admin.html`.

### Desde la consola

```bash
cd portal-sigc
git init
git add .
git commit -m "Portal de aprendizaje SIGC, version 1.1"
git branch -M main
git remote add origin https://github.com/<usuario>/portal-sigc-uninorte.git
git push -u origin main
```

Luego activa Pages con los mismos parámetros del paso 3.

---

## 3. Cómo se guarda el contenido

Los cursos que crees en el panel se guardan en el navegador donde los creaste. Para que todos los aprendices vean un curso nuevo sin importar el equipo, hay que llevarlo al repositorio:

1. En **Copia de seguridad → Descargar respaldo** obtienes un JSON con todos los cursos y el diseño.
2. Abre `datos.js` y reemplaza el objeto `CURSO_SEMILLA` por el contenido del curso correspondiente del respaldo, o agrega los cursos que quieras dejar como semilla.
3. Sube el cambio a GitHub.

Los aprendices que ya tengan cursos guardados en su navegador conservan los suyos: la semilla solo se aplica cuando el navegador todavía no tiene nada. Para forzar la recarga en un equipo, se borra el almacenamiento del sitio.

Esta es la limitación de fondo de una aplicación sin servidor, y la razón principal para pasar a la arquitectura descrita al final.

---

## 4. El curso incluido

`IND-SIGC-2026`, con 5 módulos, 14 lecciones y evaluación final de 12 preguntas (9 para aprobar):

1. **El SIGC en la Universidad del Norte** — qué es y por qué existe, marco normativo, alcance SIGC y SIACA.
2. **Política de calidad y compromisos** — la política, los compromisos y su traducción al puesto de trabajo.
3. **Objetivos de calidad y su medición** — de la política a los objetivos, indicadores y revisión por la dirección.
4. **Arquitectura institucional del SIGC** — mapa de procesos, jerarquía documental y codificación, roles y herramientas.
5. **Tu rol en la mejora continua** — ciclo PHVA, acciones bien formuladas, creación y actualización de documentos.

### Textos pendientes de oficializar

Los bloques con borde punteado dorado y la marca `[Pendiente]` son **textos de referencia que deben reemplazarse por la versión oficial aprobada**. Están en las lecciones L02, L03, L04, L05, L07, L09, L11 y L14: política de calidad, compromisos, objetivos vigentes, mapa de procesos y denominación de comités y herramientas. Se dejaron marcados en lugar de inventar contenido normativo.

---

## 5. Identidad visual

La paleta se administra desde el panel, pero los valores por defecto están en `datos.js`, en `TEMA_BASE`:

```javascript
azul900: "#00234B"   // barra superior y fondo del acceso
azul800: "#003C71"   // azul institucional: botones y títulos
azul600: "#0B6FB4"   // enlaces y acentos
cian:    "#23A9D8"   // barra de avance y marcadores
dorado:  "#F0B323"   // logros y bloques pendientes
```

Reproducen la familia azul institucional de Uninorte, pero **conviene confirmarlos contra el manual de identidad vigente**. El símbolo circular de la barra, el acceso y la constancia es un marcador de posición (`<symbol id="sello">` en `index.html`): debe reemplazarse por el logotipo oficial.

---

## 6. Limitaciones y camino a la versión institucional

- La autenticación de aprendices y de administrador es del lado del cliente; no hay servidor.
- Cuentas, avance, cursos y diseño viven en el navegador de cada equipo y no se sincronizan.
- La constancia acredita la formación pero no reemplaza el registro de la Dirección de Gestión y Desarrollo Humano.

Camino recomendado, en orden:

1. **Autenticación con Microsoft Entra ID.** La Universidad ya opera con Microsoft 365: elimina el registro manual, garantiza la identidad y permite saber quién completó la inducción.
2. **Persistencia en servidor** para cursos, avance y resultados, con reporte de cobertura por dependencia (Supabase, Microsoft Lists o Dataverse son opciones de bajo costo).
3. **Integración con el LMS institucional**, si existe, para que la constancia alimente la hoja de vida de formación.

Mientras tanto, esta versión sirve como piloto completo: permite validar el contenido con las divisiones, medir cuánto toma la inducción y ajustar el diseño antes de invertir en desarrollo.

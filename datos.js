/* =====================================================================
   PORTAL SIGC — Universidad del Norte
   Oficina de Calidad Institucional
   Dirección de Planeación y Estudios Institucionales
   ---------------------------------------------------------------------
   datos.js — capa compartida entre el portal de aprendices (index.html)
   y el panel de administración (admin.html):
     · acceso al almacenamiento del navegador
     · tema visual (colores, tipografía, textos de marca)
     · contenido semilla del curso de inducción
   ===================================================================== */

/* ------------------- Almacenamiento tolerante a fallos ------------------- */
const almacen = (() => {
  const memoria = new Map();
  let disponible = false;
  try {
    window.localStorage.setItem("__sigc__", "1");
    window.localStorage.removeItem("__sigc__");
    disponible = true;
  } catch (e) { disponible = false; }
  return {
    persistente: disponible,
    leer(c) { try { return disponible ? localStorage.getItem(c) : (memoria.get(c) ?? null); } catch (e) { return memoria.get(c) ?? null; } },
    escribir(c, v) { try { disponible ? localStorage.setItem(c, v) : memoria.set(c, v); } catch (e) { memoria.set(c, v); } },
    borrar(c) { try { disponible ? localStorage.removeItem(c) : memoria.delete(c); } catch (e) { memoria.delete(c); } }
  };
})();

const K = {
  usuarios: "sigc.usuarios.v1",
  sesion:   "sigc.sesion.v1",
  avance:   "sigc.avance.v2.",
  cursos:   "sigc.cursos.v1",
  tema:     "sigc.tema.v1",
  admin:    "sigc.admin.v1",
  sesionAdmin: "sigc.sesionadmin.v1"
};

const leerJSON = (c, pd) => { try { const v = almacen.leer(c); return v ? JSON.parse(v) : pd; } catch (e) { return pd; } };
const guardarJSON = (c, v) => almacen.escribir(c, JSON.stringify(v));
const esc = s => String(s ?? "").replace(/[&<>"']/g, x => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[x]));
const idNuevo = p => p + "-" + Math.random().toString(36).slice(2, 8);

async function cifrar(texto) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("sigc:" + texto));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    let h = 0;
    for (let i = 0; i < texto.length; i++) { h = ((h << 5) - h) + texto.charCodeAt(i); h |= 0; }
    return "f" + Math.abs(h).toString(16);
  }
}

/* ----------------------------- Tema visual ----------------------------- */
const FUENTES_INTERFAZ = ["Libre Franklin", "Inter", "Work Sans", "IBM Plex Sans", "Source Sans 3", "Lato", "Open Sans", "Roboto"];
const FUENTES_LECTURA  = ["Source Serif 4", "Lora", "Merriweather", "Libre Baskerville", "IBM Plex Serif", "PT Serif", "Inter", "Work Sans"];

const TEMA_BASE = {
  entidad: "Universidad del Norte",
  dependencia: "Oficina de Calidad Institucional · Dirección de Planeación y Estudios Institucionales",
  nombrePortal: "Portal de inducción al SIGC",
  lema: "Un recorrido por la política de calidad, los compromisos institucionales, los objetivos y la arquitectura del Sistema Integrado de Gestión de Calidad. Al terminar sabrás dónde está tu trabajo dentro del sistema y qué se espera de ti.",
  notaPie: "Dirigido a colaboradores académicos y administrativos. La constancia se genera al aprobar la evaluación final.",
  colores: {
    azul900: "#00234B",
    azul800: "#003C71",
    azul600: "#0B6FB4",
    cian:    "#23A9D8",
    dorado:  "#F0B323",
    papel:   "#F6F7F9",
    tinta:   "#16202B",
    linea:   "#DCE3EA",
    exito:   "#1B7F5A",
    alerta:  "#B3421B"
  },
  tipografia: {
    interfaz: "Libre Franklin",
    lectura: "Source Serif 4",
    tamanoBase: 16,
    tamanoLectura: 17.5
  },
  radio: 3
};

function cargarTema() {
  const t = leerJSON(K.tema, null);
  if (!t) return JSON.parse(JSON.stringify(TEMA_BASE));
  return {
    ...TEMA_BASE, ...t,
    colores: { ...TEMA_BASE.colores, ...(t.colores || {}) },
    tipografia: { ...TEMA_BASE.tipografia, ...(t.tipografia || {}) }
  };
}
const guardarTema = t => guardarJSON(K.tema, t);

function urlFuentes(interfaz, lectura) {
  const familias = [...new Set([interfaz, lectura])].map(f => {
    const n = f.replace(/ /g, "+");
    return f === "Source Serif 4" ? "family=Source+Serif+4:opsz,wght@8..60,400;8..60,600" : "family=" + n + ":wght@400;500;600;700";
  });
  return "https://fonts.googleapis.com/css2?" + familias.join("&") + "&display=swap";
}

/* Aplica el tema al documento: variables CSS y carga de tipografías. */
function aplicarTema(t, doc) {
  doc = doc || document;
  const r = doc.documentElement.style;
  const c = t.colores;
  r.setProperty("--azul-900", c.azul900);
  r.setProperty("--azul-800", c.azul800);
  r.setProperty("--azul-600", c.azul600);
  r.setProperty("--cian", c.cian);
  r.setProperty("--dorado", c.dorado);
  r.setProperty("--papel", c.papel);
  r.setProperty("--tinta", c.tinta);
  r.setProperty("--linea", c.linea);
  r.setProperty("--exito", c.exito);
  r.setProperty("--alerta", c.alerta);
  r.setProperty("--sans", '"' + t.tipografia.interfaz + '",system-ui,sans-serif');
  r.setProperty("--serif", '"' + t.tipografia.lectura + '",Georgia,serif');
  r.setProperty("--base", t.tipografia.tamanoBase + "px");
  r.setProperty("--lectura", t.tipografia.tamanoLectura + "px");
  r.setProperty("--radio", t.radio + "px");

  let enlace = doc.getElementById("fuentes-tema");
  if (!enlace) {
    enlace = doc.createElement("link");
    enlace.id = "fuentes-tema";
    enlace.rel = "stylesheet";
    doc.head.appendChild(enlace);
  }
  const url = urlFuentes(t.tipografia.interfaz, t.tipografia.lectura);
  if (enlace.href !== url) enlace.href = url;
}

/* ------------------------------- Cursos ------------------------------- */
function cargarCursos() {
  const guardados = leerJSON(K.cursos, null);
  if (guardados && Array.isArray(guardados) && guardados.length) return guardados;
  const semilla = [JSON.parse(JSON.stringify(CURSO_SEMILLA))];
  guardarJSON(K.cursos, semilla);
  return semilla;
}
const guardarCursos = cursos => guardarJSON(K.cursos, cursos);
const contarLecciones = curso => (curso.modulos || []).reduce((n, m) => n + (m.lecciones || []).length, 0);
const leccionesDe = curso => (curso.modulos || []).flatMap(m => (m.lecciones || []).map(l => ({ ...l, modulo: m })));

/* =====================================================================
   PORTAL DE INDUCCIÓN AL SIGC — Universidad del Norte
   ---------------------------------------------------------------------
   CONTENIDO DEL CURSO
   Todo el material editable vive en la constante CURSO. Para actualizar
   una lección basta con cambiar su texto aquí; no hay que tocar la
   lógica de la aplicación.

   Los bloques marcados con la clase "pendiente" contienen textos de
   referencia que deben reemplazarse por la versión oficial aprobada,
   siguiendo la convención institucional de dejar [Pendiente] antes que
   inventar contenido normativo.
   ===================================================================== */

const CURSO_SEMILLA = {
  titulo: "Inducción al Sistema Integrado de Gestión de Calidad",
  codigo: "IND-SIGC-2026",
  version: "1.0",
  modulos: [

  /* ================= MÓDULO 1 ================= */
  {
    id: "m1",
    titulo: "El SIGC en la Universidad del Norte",
    resumen: "Qué es el sistema, por qué existe y sobre qué marco normativo se apoya.",
    lecciones: [
      {
        id: "l01", codigo: "IND-SIGC-L01",
        titulo: "Qué es el SIGC y por qué existe",
        objetivo: "Reconocer el SIGC como el sistema con el que la Universidad planea, ejecuta, verifica y mejora su trabajo, y distinguirlo de la idea de un archivo de documentos.",
        html: `
<p>El <strong>Sistema Integrado de Gestión de Calidad (SIGC)</strong> es el conjunto articulado de políticas, procesos, procedimientos, responsables, recursos y mecanismos de evaluación con los que la Universidad del Norte asegura que lo que promete es lo que efectivamente entrega: formación, investigación, extensión y los servicios que las sostienen.</p>

<p>No es un requisito externo que se atiende cada cierto tiempo. Es la forma en que la institución responde tres preguntas de manera permanente:</p>
<ul>
  <li><strong>Qué hacemos y cómo lo hacemos.</strong> Los procesos y documentos describen la manera acordada de trabajar, para que el resultado no dependa de quién esté en el cargo.</li>
  <li><strong>Cómo sabemos que funciona.</strong> Indicadores, autoevaluación, auditorías y la voz de estudiantes, docentes, egresados y empleadores dan evidencia del desempeño.</li>
  <li><strong>Qué hacemos cuando no funciona.</strong> Las acciones de mejora convierten un hallazgo en un cambio real y verificable.</li>
</ul>

<h3>Para qué le sirve a la institución</h3>
<ul>
  <li>Sostener la <strong>acreditación institucional y la de los programas</strong> con evidencia construida durante el día a día, no en vísperas de una visita.</li>
  <li>Dar <strong>trazabilidad</strong>: quién decidió qué, cuándo y con qué soporte.</li>
  <li>Reducir el <strong>reproceso</strong> y la dependencia del conocimiento no documentado.</li>
  <li>Articular unidades académicas y administrativas alrededor de un mismo lenguaje.</li>
</ul>

<h3>Tres malentendidos frecuentes</h3>
<table>
  <thead><tr><th style="width:44%">Lo que se suele pensar</th><th>Lo que realmente ocurre</th></tr></thead>
  <tbody>
    <tr><td>El SIGC es un repositorio de formatos.</td><td>Los documentos son la memoria del sistema, no el sistema. Sin uso, no hay calidad.</td></tr>
    <tr><td>La calidad es responsabilidad de la Oficina de Calidad Institucional.</td><td>La Oficina de Calidad Institucional administra y acompaña el sistema; la calidad la ejecuta cada dependencia en su proceso.</td></tr>
    <tr><td>Aplica solo a lo académico.</td><td>Es integrado: alcanza también los procesos administrativos y de apoyo que hacen posible lo académico.</td></tr>
  </tbody>
</table>

<div class="destacado">
  <h4>La idea que conviene llevarse</h4>
  <p>El SIGC existe para que la calidad sea una consecuencia de cómo trabajamos todos los días, y no un esfuerzo excepcional cada vez que se acerca una evaluación externa.</p>
</div>`,
        preguntas: [
          { q: "¿Cuál de estas afirmaciones describe mejor el SIGC?",
            ops: ["El repositorio institucional donde se archivan los formatos de calidad.",
                  "El sistema articulado de políticas, procesos, responsables y mecanismos de evaluación con que la Universidad planea, ejecuta, verifica y mejora su trabajo.",
                  "El conjunto de auditorías que se realizan antes de una visita de acreditación.",
                  "El área encargada de responder los requerimientos del Ministerio de Educación."],
            r: 1,
            exp: "El SIGC es el sistema completo de gestión. Los documentos, las auditorías y el trabajo de la Oficina de Calidad Institucional son componentes suyos, no su definición." },
          { q: "Un coordinador afirma: la calidad es tarea de la Dirección de Calidad. ¿Cómo se corrige esa idea?",
            ops: ["Es correcta: la Oficina de Calidad Institucional responde por el desempeño de todos los procesos.",
                  "Es correcta solo para los procesos académicos.",
                  "La Oficina de Calidad Institucional administra y acompaña el sistema, pero cada dependencia responde por la calidad de su propio proceso.",
                  "Depende de si la dependencia está incluida en el alcance de la acreditación."],
            r: 2,
            exp: "La responsabilidad es distribuida: el sistema se administra centralmente y se ejecuta en cada unidad." }
        ]
      },

      {
        id: "l02", codigo: "IND-SIGC-L02",
        titulo: "El marco normativo que lo sustenta",
        objetivo: "Ubicar las principales normas y referentes que dan origen a las exigencias del sistema, y entender por qué la Universidad va más allá del mínimo legal.",
        html: `
<p>El SIGC no nace de una preferencia administrativa: responde a un marco normativo nacional y a referentes internacionales que la Universidad adopta de forma voluntaria.</p>

<h3>Marco nacional</h3>
<table>
  <thead><tr><th style="width:34%">Referente</th><th>Qué aporta al sistema</th></tr></thead>
  <tbody>
    <tr><td>Constitución Política, artículo 69</td><td>Reconoce la autonomía universitaria: la Universidad se autorregula, y por eso necesita su propio sistema de aseguramiento.</td></tr>
    <tr><td>Ley 30 de 1992</td><td>Organiza el servicio público de la educación superior y crea el sistema de acreditación.</td></tr>
    <tr><td>Ley 1188 de 2008</td><td>Establece el registro calificado como condición para ofrecer programas.</td></tr>
    <tr><td>Decreto 1330 de 2019</td><td>Define las condiciones de calidad institucionales y de programa, y exige un sistema interno de aseguramiento de la calidad.</td></tr>
    <tr><td>Acuerdo 02 de 2020 del CESU</td><td>Actualiza el modelo de acreditación en alta calidad por factores y características.</td></tr>
  </tbody>
</table>

<h3>Referentes de gestión</h3>
<p>Para los procesos administrativos y de apoyo, la Universidad toma como referencia el enfoque de la norma <strong>ISO 9001</strong>: gestión por procesos, pensamiento basado en riesgos, enfoque al usuario y mejora continua. Adoptar el enfoque no equivale necesariamente a certificarse; significa usar una gramática común y probada para ordenar el trabajo.</p>

<div class="destacado">
  <h4>Cumplir no es lo mismo que asegurar</h4>
  <p>La norma marca el piso: lo que hay que demostrar ante el Ministerio o el CNA. El SIGC apunta a algo más exigente: que el resultado sea consistente incluso cuando nadie está evaluando.</p>
</div>

<div class="pendiente">
  <p><b>Pendiente de verificación.</b> Antes de publicar esta lección, la Oficina de Calidad Institucional debe confirmar la vigencia de las normas citadas y agregar los acuerdos internos del Consejo Directivo y del Consejo Académico que soportan el SIGC en Uninorte, con su número y fecha. Las referencias internas se dejan como <b>[Pendiente]</b> hasta su verificación.</p>
</div>`,
        preguntas: [
          { q: "¿Qué norma introduce la exigencia de contar con un sistema interno de aseguramiento de la calidad?",
            ops: ["La Ley 30 de 1992.", "El Decreto 1330 de 2019.", "El Acuerdo 02 de 2020 del CESU.", "La Ley 1188 de 2008."],
            r: 1,
            exp: "El Decreto 1330 de 2019 define las condiciones de calidad y sitúa el sistema interno de aseguramiento como una de ellas." },
          { q: "¿Por qué la Universidad adopta el enfoque de ISO 9001 en sus procesos administrativos?",
            ops: ["Porque el Ministerio de Educación lo exige para el registro calificado.",
                  "Porque reemplaza al modelo de acreditación del CNA.",
                  "Porque aporta un marco probado de gestión por procesos, riesgos y mejora continua que ordena el trabajo de apoyo.",
                  "Porque es requisito para la contratación de personal administrativo."],
            r: 2,
            exp: "Es una adopción voluntaria de un enfoque de gestión; no sustituye ni es exigida por el marco de acreditación." }
        ]
      },

      {
        id: "l03", codigo: "IND-SIGC-L03",
        titulo: "Alcance del sistema: SIGC y SIACA",
        objetivo: "Distinguir el alcance general del SIGC del componente académico (SIACA) y reconocer en cuál de los dos se inscribe el trabajo propio.",
        html: `
<p>El sistema tiene un alcance institucional, pero opera con dos énfasis complementarios que conviene no confundir.</p>

<h3>SIGC: el sistema integrado</h3>
<p>Cubre la totalidad de los procesos de la Universidad —estratégicos, misionales, de apoyo y de evaluación—, incluidas las dependencias administrativas cuyo trabajo no es visible para el estudiante pero condiciona su experiencia: admisiones, financiera, tecnología, planta física, gestión humana, biblioteca.</p>

<h3>SIACA: el componente académico</h3>
<p>El <strong>Sistema Interno de Aseguramiento de la Calidad Académica</strong> concentra lo relacionado con programas y funciones sustantivas: creación y modificación de programas, autoevaluación, planes de mejoramiento, renovación de registro calificado y acreditación, seguimiento curricular y evaluación de resultados de aprendizaje.</p>

<div class="destacado">
  <h4>Cómo se relacionan</h4>
  <p>El SIACA es el componente académico dentro del SIGC, no un sistema paralelo. Comparten política, mapa de procesos, control documental y mecanismos de mejora; se diferencian en el objeto que gestionan.</p>
</div>

<h4>Dónde está tu trabajo</h4>
<ul>
  <li>Si coordinas un programa, participas en autoevaluación o preparas un documento maestro, tu trabajo está en el <strong>SIACA</strong>.</li>
  <li>Si gestionas contratación, compras, matrícula, soporte o infraestructura, tu proceso está en el <strong>SIGC</strong> y alimenta al SIACA con evidencia.</li>
  <li>En ambos casos aplican las mismas reglas de documentación, indicadores y acciones de mejora.</li>
</ul>

<div class="pendiente">
  <p><b>Pendiente de ajuste.</b> La descripción del alcance debe alinearse con la definición formal vigente del SIACA en Uninorte y con el acto administrativo que lo adopta: <b>[Pendiente]</b>.</p>
</div>`,
        preguntas: [
          { q: "¿Cuál es la relación correcta entre el SIGC y el SIACA?",
            ops: ["Son dos sistemas independientes con políticas y documentos propios.",
                  "El SIACA es el componente académico dentro del SIGC y comparte con él política, procesos y control documental.",
                  "El SIGC aplica a programas y el SIACA a las dependencias administrativas.",
                  "El SIACA reemplazó al SIGC a partir del Decreto 1330 de 2019."],
            r: 1,
            exp: "Es una relación de contenido: mismo sistema, énfasis académico." },
          { q: "Una analista de la Dirección Financiera pregunta si el sistema le aplica. ¿Qué corresponde responderle?",
            ops: ["No, el sistema cubre solo programas académicos.",
                  "Solo durante los procesos de acreditación institucional.",
                  "Sí: su proceso es de apoyo dentro del SIGC y aplica las mismas reglas de documentación, indicadores y mejora.",
                  "Solo si su dependencia decide certificarse en ISO 9001."],
            r: 2,
            exp: "El alcance es institucional; los procesos de apoyo están plenamente incluidos." }
        ]
      }
    ]
  },

  /* ================= MÓDULO 2 ================= */
  {
    id: "m2",
    titulo: "Política de calidad y compromisos",
    resumen: "La declaración que orienta el sistema, los compromisos que se derivan de ella y su traducción al puesto de trabajo.",
    lecciones: [
      {
        id: "l04", codigo: "IND-SIGC-L04",
        titulo: "La política de calidad",
        objetivo: "Leer la política de calidad identificando sus cuatro partes y explicar qué obliga a hacer, no solo qué declara.",
        html: `
<p>La <strong>política de calidad</strong> es la declaración aprobada por la alta dirección que fija el compromiso de la Universidad con la calidad y da el marco para definir los objetivos. Es el documento del que cuelga todo lo demás: si una decisión del sistema no puede rastrearse hasta la política, algo está desalineado.</p>

<h3>Cómo se lee una política de calidad</h3>
<p>Toda política bien formulada contiene cuatro elementos. Identificarlos ayuda a usarla como herramienta y no como cartel:</p>
<ol>
  <li><strong>Propósito y alcance:</strong> qué hace la institución y sobre qué procesos se compromete.</li>
  <li><strong>Compromisos:</strong> las obligaciones que asume, incluida la de cumplir requisitos legales y los de sus grupos de interés.</li>
  <li><strong>Marco para los objetivos:</strong> la conexión explícita con los objetivos de calidad medibles.</li>
  <li><strong>Mejora continua:</strong> la declaración de que el desempeño se revisa y se eleva de forma sistemática.</li>
</ol>

<div class="pendiente">
  <p><b>Texto de referencia — reemplazar por la versión oficial.</b> El párrafo siguiente ilustra la estructura esperada. La Oficina de Calidad Institucional debe sustituirlo por la política de calidad aprobada, con su código, versión y fecha de aprobación: <b>[Pendiente]</b>.</p>
  <p>La Universidad del Norte se compromete a formar personas íntegras y competentes, generar conocimiento pertinente e interactuar con su entorno, mediante procesos académicos y administrativos que cumplen los requisitos legales y las expectativas de sus grupos de interés, cuentan con talento humano competente y recursos suficientes, y se evalúan y mejoran de forma continua a partir de evidencia.</p>
</div>

<h3>Qué obliga a hacer</h3>
<ul>
  <li><strong>Comunicarla y entenderla.</strong> No basta con publicarla: cada colaborador debe poder explicar qué significa en su trabajo.</li>
  <li><strong>Desplegarla en objetivos medibles.</strong> Una política sin indicadores asociados es una intención.</li>
  <li><strong>Revisarla.</strong> Se somete a revisión periódica por la alta dirección para confirmar que sigue siendo pertinente.</li>
</ul>

<div class="destacado">
  <p>Una prueba sencilla: si al leer la política no puedes nombrar al menos una cosa que harás distinto mañana, la política todavía no está desplegada en tu proceso.</p>
</div>`,
        preguntas: [
          { q: "¿Cuál de estos elementos NO forma parte de una política de calidad bien formulada?",
            ops: ["El compromiso de cumplir requisitos legales y de los grupos de interés.",
                  "El marco de referencia para establecer los objetivos de calidad.",
                  "El listado detallado de indicadores con sus metas y fórmulas de cálculo.",
                  "El compromiso con la mejora continua del sistema."],
            r: 2,
            exp: "Los indicadores y sus metas viven en los objetivos y sus fichas técnicas. La política da el marco, no el detalle de medición." },
          { q: "¿Qué implica que la política deba ser comunicada?",
            ops: ["Que se publique en la intranet y en carteleras.",
                  "Que cada colaborador pueda explicar qué significa en su propio trabajo.",
                  "Que se lea en la inducción de personal nuevo.",
                  "Que se envíe por correo cada vez que cambia de versión."],
            r: 1,
            exp: "La comunicación se verifica por comprensión y aplicación, no por difusión." }
        ]
      },

      {
        id: "l05", codigo: "IND-SIGC-L05",
        titulo: "Los compromisos institucionales",
        objetivo: "Identificar los compromisos que se desprenden de la política y reconocer la evidencia con la que cada uno se demuestra.",
        html: `
<p>Los compromisos son la parte operativa de la política: lo que la Universidad se obliga a sostener. Cada uno debe poder demostrarse con evidencia verificable.</p>

<table>
  <thead><tr><th style="width:30%">Compromiso</th><th>Qué significa en la práctica</th><th style="width:26%">Evidencia típica</th></tr></thead>
  <tbody>
    <tr><td>Excelencia académica</td><td>Programas pertinentes, currículos actualizados y resultados de aprendizaje evaluados.</td><td>Actas de comité curricular, informes de autoevaluación.</td></tr>
    <tr><td>Cumplimiento normativo</td><td>Operar dentro del marco legal y de los reglamentos internos vigentes.</td><td>Matriz de requisitos legales, registros calificados vigentes.</td></tr>
    <tr><td>Enfoque en los grupos de interés</td><td>Escuchar y responder a estudiantes, docentes, egresados, empleadores y aliados.</td><td>Encuestas de satisfacción, PQRS, informes de egresados.</td></tr>
    <tr><td>Competencia del talento humano</td><td>Seleccionar, formar y evaluar al personal según el perfil del cargo.</td><td>Planes de formación, evaluaciones de desempeño.</td></tr>
    <tr><td>Gestión del riesgo</td><td>Identificar lo que puede impedir el resultado y actuar antes de que ocurra.</td><td>Matrices de riesgo con controles y seguimiento.</td></tr>
    <tr><td>Mejora continua</td><td>Convertir hallazgos en acciones con responsable, fecha y verificación.</td><td>Planes de mejoramiento y acciones cerradas con evidencia.</td></tr>
  </tbody>
</table>

<h3>El criterio que los une</h3>
<p>Un compromiso sin evidencia es una declaración. Por eso, cada vez que el sistema afirma que algo se cumple, debe existir un registro que lo sostenga: un acta, un indicador medido, una acción cerrada, un documento aprobado y vigente.</p>

<div class="pendiente">
  <p><b>Pendiente de armonización.</b> Ajustar la tabla a los compromisos exactos declarados en la política vigente y al Plan de Desarrollo Institucional: <b>[Pendiente]</b>.</p>
</div>`,
        preguntas: [
          { q: "¿Qué distingue un compromiso institucional de una declaración de intenciones?",
            ops: ["Que aparece redactado en la política de calidad.",
                  "Que puede demostrarse con evidencia verificable y trazable.",
                  "Que fue aprobado por el Consejo Directivo.",
                  "Que se comunica en las jornadas de inducción."],
            r: 1,
            exp: "La evidencia es lo que convierte un compromiso en verificable." },
          { q: "Para demostrar el compromiso con la gestión del riesgo, la evidencia más pertinente sería:",
            ops: ["El informe de satisfacción de estudiantes.",
                  "El plan de formación del personal.",
                  "La matriz de riesgos con sus controles y el seguimiento a su efectividad.",
                  "El acta del comité curricular."],
            r: 2,
            exp: "Cada compromiso tiene su evidencia natural; la del riesgo es la matriz con controles y seguimiento." }
        ]
      },

      {
        id: "l06", codigo: "IND-SIGC-L06",
        titulo: "La política en tu puesto de trabajo",
        objetivo: "Traducir la política y los compromisos a tres conductas concretas del propio cargo.",
        html: `
<p>La pregunta útil no es si conoces la política, sino qué haces distinto por ella. Estos ejemplos muestran la traducción para perfiles frecuentes en la Universidad.</p>

<h4>Si eres docente o coordinas un curso</h4>
<ul>
  <li>Mantienes el programa del curso alineado con el plan de estudios vigente y con los resultados de aprendizaje declarados.</li>
  <li>Conservas la evidencia de evaluación que sustenta las decisiones curriculares.</li>
  <li>Reportas al comité curricular lo que la experiencia del aula muestra que debe ajustarse.</li>
</ul>

<h4>Si trabajas en una dependencia administrativa</h4>
<ul>
  <li>Ejecutas tu proceso conforme al procedimiento vigente y usas los formatos aprobados, no versiones locales.</li>
  <li>Registras la evidencia en el momento, no al cierre del semestre.</li>
  <li>Cuando el procedimiento no refleja la realidad, solicitas su actualización en vez de trabajar por fuera de él.</li>
</ul>

<h4>Si lideras un equipo o un proceso</h4>
<ul>
  <li>Conoces los indicadores de tu proceso y su comportamiento reciente.</li>
  <li>Aseguras que las acciones de mejora a tu cargo tengan responsable, fecha y evidencia de cierre.</li>
  <li>Incorporas la inducción al SIGC en el ingreso de cada persona nueva a tu equipo.</li>
</ul>

<div class="destacado">
  <h4>Tres conductas mínimas, aplicables a cualquier cargo</h4>
  <ol style="margin-bottom:0">
    <li>Usar siempre la versión vigente del documento, consultada en el repositorio oficial.</li>
    <li>Dejar evidencia de lo que se hace, en el formato y el momento previstos.</li>
    <li>Reportar lo que no funciona por el canal del sistema, en lugar de resolverlo de manera informal y no trazable.</li>
  </ol>
</div>`,
        preguntas: [
          { q: "Un colaborador detecta que el procedimiento vigente ya no corresponde a cómo se ejecuta realmente el proceso. ¿Qué conducta es coherente con la política?",
            ops: ["Seguir trabajando como en la práctica y esperar la próxima auditoría.",
                  "Redactar una versión propia del formato para su dependencia.",
                  "Solicitar la actualización del procedimiento por el canal establecido.",
                  "Documentar el cambio en un correo interno y continuar."],
            r: 2,
            exp: "El sistema prevé la actualización documental; trabajar por fuera del documento vigente rompe la trazabilidad." },
          { q: "¿Cuál de estas prácticas contradice el compromiso de dejar evidencia?",
            ops: ["Registrar la información en el formato aprobado al momento de ejecutar la actividad.",
                  "Reconstruir los registros al final del semestre a partir de la memoria del equipo.",
                  "Archivar las actas firmadas en el repositorio del proceso.",
                  "Usar la versión vigente del formato descargada del repositorio oficial."],
            r: 1,
            exp: "La evidencia reconstruida a posteriori pierde valor probatorio y suele generar hallazgos en auditoría." }
        ]
      }
    ]
  },
  /* ================= MÓDULO 3 ================= */
  {
    id: "m3",
    titulo: "Objetivos de calidad y su medición",
    resumen: "Cómo la política se convierte en objetivos medibles y cómo se hace seguimiento a su cumplimiento.",
    lecciones: [
      {
        id: "l07", codigo: "IND-SIGC-L07",
        titulo: "De la política a los objetivos de calidad",
        objetivo: "Reconocer qué hace que un objetivo de calidad sea válido y cómo se articula con el Plan de Desarrollo Institucional.",
        html: `
<p>Los <strong>objetivos de calidad</strong> son el puente entre la declaración de la política y el trabajo cotidiano. Traducen un compromiso general en un resultado que se puede medir, con un plazo y un responsable.</p>

<h3>Qué hace válido a un objetivo</h3>
<ul>
  <li><strong>Es coherente con la política.</strong> Cada objetivo debe poder rastrearse hasta uno de los compromisos declarados.</li>
  <li><strong>Es medible.</strong> Existe al menos un indicador con fórmula y fuente de datos definida.</li>
  <li><strong>Tiene meta y plazo.</strong> Un objetivo sin meta no permite saber si se cumplió.</li>
  <li><strong>Tiene responsable.</strong> Un proceso o un cargo, no un colectivo difuso.</li>
  <li><strong>Se despliega.</strong> Cada división o dependencia sabe qué le corresponde aportar.</li>
</ul>

<h3>Articulación con el Plan de Desarrollo Institucional</h3>
<p>Los objetivos de calidad no compiten con el PDI: lo sirven. El PDI fija hacia dónde va la Universidad en el horizonte de planeación; los objetivos de calidad aseguran que los procesos que sostienen ese rumbo se desempeñen como deben. En la práctica, muchos indicadores son compartidos y se reportan una sola vez.</p>

<table>
  <thead><tr><th style="width:32%">Compromiso de la política</th><th style="width:38%">Objetivo de calidad</th><th>Indicador asociado</th></tr></thead>
  <tbody>
    <tr><td>Excelencia académica</td><td>Mantener vigente la acreditación de los programas acreditables.</td><td>Programas acreditados sobre programas acreditables.</td></tr>
    <tr><td>Enfoque en los grupos de interés</td><td>Elevar la satisfacción de los estudiantes con los servicios de apoyo.</td><td>Índice de satisfacción por servicio.</td></tr>
    <tr><td>Mejora continua</td><td>Cerrar oportunamente las acciones derivadas de autoevaluación y auditoría.</td><td>Acciones cerradas en la fecha comprometida.</td></tr>
  </tbody>
</table>

<div class="pendiente">
  <p><b>Ejemplos ilustrativos.</b> Reemplazar por los objetivos de calidad vigentes aprobados y su correspondencia con el PDI: <b>[Pendiente]</b>.</p>
</div>`,
        preguntas: [
          { q: "Se propone como objetivo de calidad: fortalecer la cultura de calidad en la comunidad universitaria. ¿Cuál es su principal debilidad?",
            ops: ["No está alineado con la política de calidad.",
                  "No es medible ni tiene meta, por lo que no permite verificar cumplimiento.",
                  "Corresponde al PDI y no al SIGC.",
                  "No menciona la norma que lo sustenta."],
            r: 1,
            exp: "Es una intención bien orientada pero sin indicador, meta ni plazo; no permite evaluar cumplimiento." },
          { q: "¿Cuál es la relación entre los objetivos de calidad y el Plan de Desarrollo Institucional?",
            ops: ["Son sistemas de medición independientes que se reportan por separado.",
                  "El PDI reemplaza a los objetivos de calidad durante su vigencia.",
                  "Los objetivos de calidad aseguran el desempeño de los procesos que sostienen las metas del PDI, y suelen compartir indicadores.",
                  "Los objetivos de calidad aplican solo a procesos administrativos y el PDI solo a los académicos."],
            r: 2,
            exp: "Son complementarios y en buena parte comparten indicadores para evitar doble reporte." }
        ]
      },

      {
        id: "l08", codigo: "IND-SIGC-L08",
        titulo: "Indicadores, metas y revisión por la dirección",
        objetivo: "Leer la ficha técnica de un indicador y entender el ciclo de reporte y revisión del desempeño.",
        html: `
<p>Un indicador sin ficha técnica se presta a interpretaciones distintas cada vez que se calcula. Por eso todo indicador del sistema se define antes de medirse.</p>

<h3>La ficha técnica de un indicador</h3>
<table>
  <thead><tr><th style="width:30%">Campo</th><th>Para qué sirve</th></tr></thead>
  <tbody>
    <tr><td>Nombre</td><td>Identifica qué se mide, en términos del resultado y no de la actividad.</td></tr>
    <tr><td>Fórmula</td><td>Define numerador y denominador sin ambigüedad.</td></tr>
    <tr><td>Unidad y frecuencia</td><td>Establece cada cuánto se calcula: mensual, semestral, anual.</td></tr>
    <tr><td>Fuente de datos</td><td>Señala el sistema o registro del que se extrae la cifra.</td></tr>
    <tr><td>Meta</td><td>El valor esperado en el periodo.</td></tr>
    <tr><td>Responsable</td><td>Quién lo calcula y quién responde por el resultado.</td></tr>
    <tr><td>Interpretación</td><td>Qué significa que suba o baje, para evitar lecturas erróneas.</td></tr>
  </tbody>
</table>

<h3>Del dato a la decisión</h3>
<p>Medir no es el objetivo. El ciclo se completa cuando el resultado provoca una decisión:</p>
<ol>
  <li>Se calcula el indicador con la frecuencia definida.</li>
  <li>Se compara con la meta y con el comportamiento histórico.</li>
  <li>Si hay desviación, se analiza la causa; no se corrige el número, se corrige el proceso.</li>
  <li>Se formula una acción de mejora cuando la causa es atribuible y evitable.</li>
  <li>Los resultados se presentan en la <strong>revisión por la dirección</strong>, donde se deciden ajustes de recursos, metas o alcance.</li>
</ol>

<div class="destacado">
  <h4>Señal de alerta</h4>
  <p>Cuando un indicador lleva varios periodos cumpliendo la meta con holgura, lo que suele estar desactualizado es la meta, no el desempeño. Revisar metas también es mejora continua.</p>
</div>`,
        preguntas: [
          { q: "Dos dependencias reportan cifras distintas para el mismo indicador. ¿Cuál es la causa más probable?",
            ops: ["Una de las dos cometió un error de digitación.",
                  "La ficha técnica no define con precisión la fórmula y la fuente de datos.",
                  "El indicador se está midiendo con demasiada frecuencia.",
                  "La meta establecida es inalcanzable."],
            r: 1,
            exp: "La ficha técnica existe justamente para que el cálculo no dependa de quién lo haga." },
          { q: "Un indicador supera ampliamente su meta durante cinco periodos consecutivos. La lectura más adecuada es:",
            ops: ["El proceso es excelente y no requiere atención.",
                  "Debe eliminarse el indicador porque ya no aporta información.",
                  "Conviene revisar si la meta sigue siendo exigente y pertinente.",
                  "Debe reportarse como no conformidad por exceso de cumplimiento."],
            r: 2,
            exp: "Una meta que nunca se pone a prueba deja de informar sobre el desempeño." }
        ]
      }
    ]
  },

  /* ================= MÓDULO 4 ================= */
  {
    id: "m4",
    titulo: "Arquitectura institucional del SIGC",
    resumen: "El mapa de procesos, la jerarquía documental con su codificación y los roles que gobiernan el sistema.",
    lecciones: [
      {
        id: "l09", codigo: "IND-SIGC-L09",
        titulo: "El mapa de procesos",
        objetivo: "Ubicar el propio proceso en una de las cuatro tipologías del mapa y explicar cómo se relaciona con los demás.",
        html: `
<p>El <strong>mapa de procesos</strong> es la representación de cómo la Universidad convierte las necesidades de sus grupos de interés en resultados. Organiza el trabajo en cuatro tipologías y muestra que ningún proceso opera aislado.</p>

<figure>
<svg viewBox="0 0 720 400" role="img" aria-label="Mapa de procesos con cuatro tipologías: estratégicos, misionales, de apoyo y de evaluación y mejora" style="width:100%;height:auto;border:1px solid #DCE3EA;background:#fff">
  <text x="14" y="30" font-family="Libre Franklin,sans-serif" font-size="12" fill="#5B6B7C">Necesidades y</text>
  <text x="14" y="46" font-family="Libre Franklin,sans-serif" font-size="12" fill="#5B6B7C">expectativas</text>
  <path d="M14 60 L14 340" stroke="#DCE3EA" stroke-width="2"/>
  <text x="640" y="30" font-family="Libre Franklin,sans-serif" font-size="12" fill="#5B6B7C">Grupos de</text>
  <text x="640" y="46" font-family="Libre Franklin,sans-serif" font-size="12" fill="#5B6B7C">interés satisfechos</text>
  <path d="M706 60 L706 340" stroke="#DCE3EA" stroke-width="2"/>

  <rect x="40" y="60" width="650" height="70" fill="#00234B"/>
  <text x="60" y="88" font-family="Libre Franklin,sans-serif" font-size="14" font-weight="600" fill="#fff">Procesos estratégicos</text>
  <text x="60" y="110" font-family="Libre Franklin,sans-serif" font-size="12.5" fill="#9FBBD1">Direccionamiento institucional · Planeación · Gestión de la calidad · Comunicaciones</text>

  <rect x="40" y="145" width="650" height="90" fill="#0B6FB4"/>
  <text x="60" y="173" font-family="Libre Franklin,sans-serif" font-size="14" font-weight="600" fill="#fff">Procesos misionales</text>
  <text x="60" y="195" font-family="Libre Franklin,sans-serif" font-size="12.5" fill="#D6ECF8">Docencia y gestión curricular · Investigación · Extensión y proyección social</text>
  <text x="60" y="215" font-family="Libre Franklin,sans-serif" font-size="12.5" fill="#D6ECF8">Gestión del estudiante, del ingreso al egreso</text>

  <rect x="40" y="250" width="650" height="70" fill="#E7EEF5" stroke="#C8D6E2"/>
  <text x="60" y="278" font-family="Libre Franklin,sans-serif" font-size="14" font-weight="600" fill="#00234B">Procesos de apoyo</text>
  <text x="60" y="300" font-family="Libre Franklin,sans-serif" font-size="12.5" fill="#41586C">Gestión humana · Financiera · Tecnología · Bibliotecas · Infraestructura · Compras · Jurídica</text>

  <rect x="40" y="335" width="650" height="48" fill="#fff" stroke="#F0B323" stroke-width="2"/>
  <text x="60" y="358" font-family="Libre Franklin,sans-serif" font-size="14" font-weight="600" fill="#8A6200">Procesos de evaluación y mejora</text>
  <text x="60" y="375" font-family="Libre Franklin,sans-serif" font-size="12.5" fill="#8A6200">Autoevaluación · Auditorías internas · Gestión de acciones de mejora</text>
</svg>
<figcaption>Estructura de referencia del mapa de procesos. La denominación exacta de cada proceso debe tomarse del mapa oficial vigente.</figcaption>
</figure>

<h3>Qué hace cada tipología</h3>
<ul>
  <li><strong>Estratégicos:</strong> definen el rumbo y las reglas. Deciden qué se hace y con qué prioridades.</li>
  <li><strong>Misionales:</strong> entregan el valor por el que existe la Universidad. Son los que el estudiante o el aliado percibe directamente.</li>
  <li><strong>De apoyo:</strong> proveen recursos, información y condiciones. Su falla se convierte siempre en una falla misional.</li>
  <li><strong>De evaluación y mejora:</strong> miran al sistema desde afuera y devuelven hallazgos. Cierran el ciclo.</li>
</ul>

<div class="destacado">
  <p>La tipología no indica jerarquía ni importancia. Un proceso de apoyo mal ejecutado degrada el resultado misional con la misma severidad que un error en el aula.</p>
</div>

<div class="pendiente">
  <p><b>Pendiente.</b> Sustituir el diagrama por el mapa de procesos oficial vigente de Uninorte, con los nombres y códigos exactos de cada proceso: <b>[Pendiente]</b>.</p>
</div>`,
        preguntas: [
          { q: "La gestión de la infraestructura tecnológica corresponde a un proceso:",
            ops: ["Estratégico, porque define el rumbo institucional.",
                  "Misional, porque los estudiantes usan las plataformas.",
                  "De apoyo, porque provee condiciones y recursos a los demás procesos.",
                  "De evaluación y mejora, porque monitorea el desempeño de los sistemas."],
            r: 2,
            exp: "Provee condiciones para que otros procesos operen: es de apoyo, aunque su falla afecte directamente lo misional." },
          { q: "¿Cuál es la función de los procesos de evaluación y mejora dentro del mapa?",
            ops: ["Ejecutar las funciones sustantivas de la Universidad.",
                  "Aprobar los documentos del sistema.",
                  "Producir hallazgos sobre el desempeño del sistema y alimentar las acciones de mejora.",
                  "Asignar los recursos financieros a los demás procesos."],
            r: 2,
            exp: "Su papel es cerrar el ciclo: observar el sistema y devolverle información para que se corrija." }
        ]
      },

      {
        id: "l10", codigo: "IND-SIGC-L10",
        titulo: "Jerarquía documental y codificación",
        objetivo: "Interpretar un código documental del SIGC y saber qué tipo de documento consultar según la necesidad.",
        html: `
<p>Los documentos del sistema se organizan en niveles. Cada nivel responde una pregunta distinta, y confundirlos es la causa más común de documentos que nadie usa.</p>

<figure>
<svg viewBox="0 0 640 330" role="img" aria-label="Pirámide documental del SIGC: política, manual y caracterizaciones, procedimientos, instructivos, formatos y registros" style="width:100%;height:auto;border:1px solid #DCE3EA;background:#fff">
  <polygon points="320,20 400,80 240,80" fill="#00234B"/>
  <text x="320" y="62" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="12" font-weight="600" fill="#fff">Política</text>

  <polygon points="238,85 402,85 442,145 198,145" fill="#00417A"/>
  <text x="320" y="112" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="12.5" font-weight="600" fill="#fff">Manual y caracterizaciones</text>
  <text x="320" y="131" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="11.5" fill="#9FBBD1">Qué es el sistema y qué hace cada proceso</text>

  <polygon points="196,150 444,150 484,210 156,210" fill="#0B6FB4"/>
  <text x="320" y="177" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="12.5" font-weight="600" fill="#fff">Procedimientos</text>
  <text x="320" y="196" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="11.5" fill="#D6ECF8">Quién hace qué, en qué orden y con qué evidencia</text>

  <polygon points="154,215 486,215 516,265 124,265" fill="#69B3DE"/>
  <text x="320" y="240" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="12.5" font-weight="600" fill="#08375F">Instructivos y guías</text>
  <text x="320" y="257" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="11.5" fill="#08375F">Cómo se ejecuta una actividad en detalle</text>

  <rect x="122" y="270" width="396" height="46" fill="#E7EEF5" stroke="#C8D6E2"/>
  <text x="320" y="291" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="12.5" font-weight="600" fill="#00234B">Formatos y registros</text>
  <text x="320" y="308" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="11.5" fill="#41586C">La evidencia de que la actividad ocurrió</text>
</svg>
<figcaption>A mayor altura, mayor estabilidad: la política cambia rara vez; los registros se generan todos los días.</figcaption>
</figure>

<h3>Cómo se lee un código</h3>
<p>Los documentos se identifican con una estructura de tres partes, por ejemplo <strong>FOES-PR-007</strong>:</p>
<table>
  <thead><tr><th style="width:22%">Parte</th><th style="width:18%">Ejemplo</th><th>Significado</th></tr></thead>
  <tbody>
    <tr><td>Prefijo del proceso</td><td>FOES</td><td>Identifica el proceso al que pertenece el documento.</td></tr>
    <tr><td>Tipo de documento</td><td>PR</td><td>PR procedimiento · IN instructivo · FT formato · MA manual · CP caracterización · GU guía.</td></tr>
    <tr><td>Consecutivo</td><td>007</td><td>Número asignado por el control documental, no elegido por el autor.</td></tr>
  </tbody>
</table>

<p>Los prefijos en uso incluyen <strong>FOES, PLIN, GDOC, GCCS, SEME</strong> y <strong>ADMI</strong>, entre otros. Cuando aún no se ha asignado un código, la convención institucional es escribir <strong>[Pendiente]</strong> en el documento: nunca inventar un consecutivo, porque un número duplicado rompe la trazabilidad del control documental.</p>

<h3>Versión, vigencia y control</h3>
<ul>
  <li>Un documento solo es válido en su <strong>versión vigente publicada</strong> en el repositorio oficial.</li>
  <li>Las copias descargadas o impresas se consideran <strong>no controladas</strong>: sirven para consultar, no para decidir.</li>
  <li>Cada cambio genera una nueva versión con fecha y descripción de la modificación.</li>
</ul>

<div class="destacado">
  <h4>Regla práctica</h4>
  <p>Si necesitas saber quién aprueba algo y en qué orden, busca un procedimiento. Si necesitas saber cómo se diligencia un campo específico, busca un instructivo. Si necesitas dejar constancia, usa el formato.</p>
</div>`,
        preguntas: [
          { q: "En el código GCCS-PR-012, la sigla PR indica:",
            ops: ["El proceso al que pertenece el documento.",
                  "Que se trata de un procedimiento.",
                  "El número de versión del documento.",
                  "Que el documento está pendiente de aprobación."],
            r: 1,
            exp: "El prefijo identifica el proceso, la sigla del centro identifica el tipo de documento y el número final es el consecutivo." },
          { q: "Estás elaborando un procedimiento nuevo y aún no tienes el consecutivo asignado. ¿Qué corresponde hacer?",
            ops: ["Asignar el siguiente número disponible según los documentos que conoces.",
                  "Escribir [Pendiente] y solicitar la asignación al control documental.",
                  "Usar un código provisional con las iniciales del autor.",
                  "Publicar el documento sin código hasta que alguien lo note."],
            r: 1,
            exp: "La convención institucional evita consecutivos duplicados: se deja [Pendiente] hasta la asignación formal." }
        ]
      },

      {
        id: "l11", codigo: "IND-SIGC-L11",
        titulo: "Roles, comités y herramientas del sistema",
        objetivo: "Identificar quién responde por qué dentro del SIGC y en qué herramienta se registra cada cosa.",
        html: `
<p>El sistema funciona porque las responsabilidades están repartidas y son explícitas. Estas son las figuras que conviene reconocer desde el primer día.</p>

<table>
  <thead><tr><th style="width:32%">Rol</th><th>De qué responde</th></tr></thead>
  <tbody>
    <tr><td>Alta dirección</td><td>Aprueba la política y los objetivos, asigna recursos y lidera la revisión por la dirección.</td></tr>
    <tr><td>Oficina de Calidad Institucional, adscrita a la Dirección de Planeación y Estudios Institucionales</td><td>Lidera y administra el SIGC: control documental, metodología, acompañamiento a los procesos, consolidación de acciones y preparación de los procesos de acreditación.</td></tr>
    <tr><td>Dirección de Planeación y Estudios Institucionales</td><td>Articula el sistema con la planeación institucional y los estudios que soportan la toma de decisiones.</td></tr>
    <tr><td>Líder de proceso</td><td>Responde por el desempeño de su proceso, sus indicadores, sus riesgos y sus acciones de mejora.</td></tr>
    <tr><td>Responsable de documento</td><td>Mantiene actualizado el contenido de los documentos de su proceso y solicita sus cambios.</td></tr>
    <tr><td>Comités (curricular, de división, de programa, directivos)</td><td>Deciden en su ámbito y dejan constancia en actas, que son evidencia del sistema.</td></tr>
    <tr><td>Auditor interno</td><td>Verifica de forma independiente y reporta hallazgos; no ejecuta ni corrige el proceso auditado.</td></tr>
    <tr><td>Colaborador</td><td>Ejecuta conforme al documento vigente, deja evidencia y reporta lo que no funciona.</td></tr>
  </tbody>
</table>

<h3>Dónde vive cada cosa</h3>
<ul>
  <li><strong>ISOLUCION:</strong> herramienta donde se gestionan las acciones de mejora, correctivas y preventivas, con su seguimiento, fechas y evidencias de cierre.</li>
  <li><strong>Repositorio documental institucional:</strong> única fuente válida de los documentos vigentes del sistema.</li>
  <li><strong>Actas de comité:</strong> soporte de las decisiones académicas y administrativas que el sistema exige demostrar.</li>
</ul>

<div class="destacado">
  <h4>Una confusión que conviene evitar</h4>
  <p>El auditor no es quien resuelve el hallazgo. Su función termina cuando lo reporta con evidencia; la corrección corresponde siempre al líder del proceso auditado.</p>
</div>

<div class="pendiente">
  <p><b>Pendiente.</b> Confirmar la denominación vigente de los comités institucionales, los roles formales del SIGC y las herramientas oficiales en uso, con sus enlaces de acceso: <b>[Pendiente]</b>.</p>
</div>`,
        preguntas: [
          { q: "Un auditor interno detecta un incumplimiento en el proceso de admisiones. ¿Qué le corresponde hacer?",
            ops: ["Corregir directamente el procedimiento afectado.",
                  "Reportar el hallazgo con su evidencia; la acción correctiva corresponde al líder del proceso.",
                  "Suspender la ejecución del proceso hasta que se resuelva.",
                  "Escalar el caso a la alta dirección sin registrarlo."],
            r: 1,
            exp: "La independencia de la auditoría se pierde si el auditor participa en la corrección de lo que audita." },
          { q: "¿Cuál es la fuente válida para consultar un procedimiento antes de ejecutarlo?",
            ops: ["La copia en PDF guardada en la carpeta compartida del equipo.",
                  "La versión impresa que reposa en la oficina del líder.",
                  "El repositorio documental institucional, donde está la versión vigente.",
                  "El correo en el que se socializó la última actualización."],
            r: 2,
            exp: "Las copias descargadas o impresas son documentos no controlados y pueden estar desactualizadas." }
        ]
      }
    ]
  },

  /* ================= MÓDULO 5 ================= */
  {
    id: "m5",
    titulo: "Tu rol en la mejora continua",
    resumen: "El ciclo PHVA, la formulación correcta de acciones y el camino para crear o actualizar un documento.",
    lecciones: [
      {
        id: "l12", codigo: "IND-SIGC-L12",
        titulo: "El ciclo PHVA aplicado",
        objetivo: "Reconocer las cuatro fases del ciclo y detectar en cuál suele romperse el trabajo cotidiano.",
        html: `
<p>El ciclo <strong>PHVA</strong> —planear, hacer, verificar, actuar— es la lógica que estructura todo el sistema: desde la planeación institucional hasta la acción de mejora más pequeña.</p>

<figure>
<svg viewBox="0 0 560 300" role="img" aria-label="Ciclo PHVA con sus cuatro fases" style="width:100%;height:auto;border:1px solid #DCE3EA;background:#fff">
  <circle cx="280" cy="150" r="112" fill="none" stroke="#DCE3EA" stroke-width="26"/>
  <path d="M280 38 A112 112 0 0 1 392 150" fill="none" stroke="#00234B" stroke-width="26"/>
  <path d="M392 150 A112 112 0 0 1 280 262" fill="none" stroke="#0B6FB4" stroke-width="26"/>
  <path d="M280 262 A112 112 0 0 1 168 150" fill="none" stroke="#69B3DE" stroke-width="26"/>
  <path d="M168 150 A112 112 0 0 1 280 38" fill="none" stroke="#F0B323" stroke-width="26"/>

  <text x="352" y="80" font-family="Libre Franklin,sans-serif" font-size="13" font-weight="600" fill="#00234B">Planear</text>
  <text x="352" y="230" font-family="Libre Franklin,sans-serif" font-size="13" font-weight="600" fill="#0B6FB4">Hacer</text>
  <text x="128" y="230" font-family="Libre Franklin,sans-serif" font-size="13" font-weight="600" fill="#31789E">Verificar</text>
  <text x="128" y="80" font-family="Libre Franklin,sans-serif" font-size="13" font-weight="600" fill="#8A6200">Actuar</text>

  <text x="280" y="132" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="13" font-weight="600" fill="#16202B">Mejora</text>
  <text x="280" y="152" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="13" font-weight="600" fill="#16202B">continua</text>
  <text x="280" y="176" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-size="11.5" fill="#5B6B7C">del proceso</text>
</svg>
<figcaption>Cada acción de mejora del sistema debe poder describirse en estas cuatro fases.</figcaption>
</figure>

<table>
  <thead><tr><th style="width:16%">Fase</th><th style="width:42%">Qué se hace</th><th>Evidencia esperada</th></tr></thead>
  <tbody>
    <tr><td>Planear</td><td>Definir el problema, analizar sus causas y formular el plan de actividades con responsables y fechas.</td><td>Análisis de causas y plan de acción.</td></tr>
    <tr><td>Hacer</td><td>Ejecutar las actividades planeadas.</td><td>Registros de ejecución y seguimientos.</td></tr>
    <tr><td>Verificar</td><td>Comprobar si el problema desapareció, con datos y no con percepciones.</td><td>Indicador medido después de la acción.</td></tr>
    <tr><td>Actuar</td><td>Estandarizar lo que funcionó o reformular si no funcionó.</td><td>Documento actualizado, cierre con evidencia.</td></tr>
  </tbody>
</table>

<div class="destacado">
  <h4>Dónde se rompe casi siempre</h4>
  <p>En la verificación. Muchas acciones se declaran cerradas cuando se ejecutaron las actividades, sin comprobar si el problema efectivamente desapareció. Ejecutar no es lo mismo que resolver.</p>
</div>`,
        preguntas: [
          { q: "Una acción de mejora ejecutó todas sus actividades en las fechas previstas. ¿Basta para cerrarla?",
            ops: ["Sí, la ejecución completa es el criterio de cierre.",
                  "Sí, siempre que el responsable lo autorice.",
                  "No: falta verificar con datos que el problema que la originó desapareció.",
                  "No: falta que la auditoría interna la revise."],
            r: 2,
            exp: "El cierre exige evidencia de eficacia, es decir, la fase de verificación del ciclo." },
          { q: "En qué fase del PHVA se ubica el análisis de causas de un problema:",
            ops: ["Planear.", "Hacer.", "Verificar.", "Actuar."],
            r: 0,
            exp: "El análisis de causas antecede a la formulación del plan de actividades, dentro de la fase de planeación." }
        ]
      },

      {
        id: "l13", codigo: "IND-SIGC-L13",
        titulo: "Acciones de mejora bien formuladas",
        objetivo: "Formular actividades y seguimientos que resistan una revisión de calidad, evitando los errores más frecuentes.",
        html: `
<p>Buena parte de los hallazgos que se repiten no vienen de procesos mal ejecutados, sino de acciones mal formuladas. Estos son los criterios con que se revisan las acciones del periodo.</p>

<h3>Criterios de una acción bien formulada</h3>
<ol>
  <li><strong>Coherencia con el problema y sus causas.</strong> Cada actividad debe atacar una causa identificada. Si una actividad no se conecta con ninguna causa, sobra o el análisis quedó incompleto.</li>
  <li><strong>Redacción en infinitivo.</strong> Las actividades se redactan como acción concreta: actualizar, socializar, ajustar, verificar. Se evita el enunciado de intenciones o los sustantivos sueltos.</li>
  <li><strong>Cobertura del ciclo PHVA.</strong> El plan debe incluir actividades de ejecución y también de verificación de la eficacia.</li>
  <li><strong>Fechas de compromiso realistas y vigentes.</strong> Una fecha vencida sin reprogramación formal es un incumplimiento visible.</li>
  <li><strong>Seguimientos con contenido.</strong> El seguimiento describe qué se hizo y con qué evidencia; no repite el enunciado de la actividad.</li>
  <li><strong>Evidencia verificable.</strong> Se referencia el documento, acta o registro que respalda lo reportado.</li>
  <li><strong>Cierre oportuno.</strong> Se cierra cuando hay evidencia de eficacia, no cuando se agota el plazo.</li>
</ol>

<h3>Antes y después</h3>
<table>
  <thead><tr><th style="width:50%">Formulación débil</th><th>Formulación adecuada</th></tr></thead>
  <tbody>
    <tr><td>Mejorar la comunicación con los estudiantes.</td><td>Actualizar el instructivo de atención al estudiante e incorporar el canal de respuesta en 48 horas, socializándolo con el equipo de atención.</td></tr>
    <tr><td>Seguimiento: se viene trabajando en la actividad.</td><td>Seguimiento: se realizó la socialización el 14 de marzo con 22 asistentes; evidencia en el acta [Pendiente] y lista de asistencia.</td></tr>
    <tr><td>Capacitación al personal.</td><td>Capacitar al equipo de admisiones en el procedimiento ADMI-PR-[Pendiente] y verificar su aplicación mediante revisión de diez expedientes.</td></tr>
  </tbody>
</table>

<div class="destacado">
  <h4>La prueba de la lectura ajena</h4>
  <p>Si alguien que no participó en la acción no puede entender qué se hizo y dónde está la evidencia leyendo solo el seguimiento, el seguimiento está incompleto.</p>
</div>`,
        preguntas: [
          { q: "¿Cuál de estos seguimientos cumple el criterio de contenido verificable?",
            ops: ["Se continúa avanzando en la actividad según lo programado.",
                  "La actividad se encuentra en un 60 por ciento de ejecución.",
                  "Se socializó el procedimiento el 14 de marzo con 22 asistentes; evidencia en acta y lista de asistencia.",
                  "Se solicitó apoyo al área responsable para poder avanzar."],
            r: 2,
            exp: "Describe qué se hizo, cuándo, con qué alcance y dónde está la evidencia." },
          { q: "La actividad Mejorar la comunicación con los estudiantes es débil principalmente porque:",
            ops: ["No está redactada en infinitivo.",
                  "No especifica una acción concreta ni una evidencia verificable.",
                  "No menciona la norma que la sustenta.",
                  "No indica el presupuesto requerido."],
            r: 1,
            exp: "Aunque usa un infinitivo, enuncia un propósito general sin acción concreta ni entregable verificable." }
        ]
      },

      {
        id: "l14", codigo: "IND-SIGC-L14",
        titulo: "Cómo se crea o actualiza un documento",
        objetivo: "Seguir la ruta institucional para formalizar un procedimiento nuevo o una modificación, sin saltarse el control documental.",
        html: `
<p>Cuando el trabajo real y el documento vigente dejan de coincidir, hay dos caminos: trabajar por fuera del sistema, o actualizar el documento. El segundo es el único trazable.</p>

<h3>La ruta, paso a paso</h3>
<ol>
  <li><strong>Identificar la necesidad.</strong> Un cambio normativo, un rediseño del proceso, un hallazgo de auditoría o una actividad que en la práctica ya se ejecuta distinto.</li>
  <li><strong>Solicitar al control documental.</strong> Se informa a la Oficina de Calidad Institucional para verificar si el documento existe, si corresponde crear uno nuevo o modificar el vigente, y para asignar el código.</li>
  <li><strong>Redactar en el formato institucional.</strong> Los procedimientos usan la estructura de seis columnas: número, actividad, descripción de las actividades, responsable, documentos que se deben utilizar y evidencias que se deben generar.</li>
  <li><strong>Revisar con los responsables.</strong> Quienes ejecutan el proceso validan que lo escrito sea ejecutable; quienes aprueban revisan competencias y controles.</li>
  <li><strong>Aprobar y codificar.</strong> El documento recibe versión, fecha de vigencia y código definitivo.</li>
  <li><strong>Publicar y socializar.</strong> Se carga en el repositorio oficial y se comunica a quienes deben aplicarlo. Un documento aprobado y no socializado no cambia la práctica.</li>
  <li><strong>Revisar periódicamente.</strong> Cada documento tiene una revisión programada, aunque no haya cambios.</li>
</ol>

<h3>Errores frecuentes</h3>
<ul>
  <li>Describir el proceso ideal en lugar del proceso real: genera un documento que nadie sigue.</li>
  <li>Redactar responsables como nombres propios en vez de cargos: el documento caduca con la primera rotación.</li>
  <li>Omitir la columna de evidencias: sin ella, el procedimiento no es auditable.</li>
  <li>Inventar el consecutivo del código en lugar de dejar <strong>[Pendiente]</strong>.</li>
</ul>

<div class="destacado">
  <h4>Con esto cierras la inducción</h4>
  <p>Ya sabes qué es el SIGC, sobre qué se apoya, qué declara la política, cómo se mide, cómo está organizado y qué se espera de ti. Lo que queda es la evaluación final, que da lugar a tu constancia.</p>
</div>

<div class="pendiente">
  <p><b>Pendiente.</b> Enlazar el formato oficial de solicitud de creación o modificación documental y el correo o formulario de contacto del control documental de la Oficina de Calidad Institucional: <b>[Pendiente]</b>.</p>
</div>`,
        preguntas: [
          { q: "¿Por qué los responsables de un procedimiento se escriben como cargos y no como nombres de personas?",
            ops: ["Por política de protección de datos personales.",
                  "Para que el documento siga siendo válido cuando cambien las personas del cargo.",
                  "Porque el formato institucional no permite nombres propios.",
                  "Para reducir la extensión del documento."],
            r: 1,
            exp: "El documento describe el proceso, que sobrevive a la rotación de personas." },
          { q: "Un documento fue aprobado y publicado, pero el equipo sigue trabajando como antes. ¿Qué paso de la ruta falló?",
            ops: ["La identificación de la necesidad.",
                  "La asignación del código.",
                  "La socialización con quienes deben aplicarlo.",
                  "La revisión periódica programada."],
            r: 2,
            exp: "Publicar no es socializar: sin comunicación efectiva, el documento no cambia la práctica." }
        ]
      }
    ]
  }
  ]
};

/* Evaluación final: banco de preguntas transversales */
const EXAMEN = {
  codigo: "IND-SIGC-EV",
  minimo: 9,
  preguntas: [
    { q: "El SIGC se define mejor como:",
      ops: ["El conjunto de documentos y formatos aprobados.",
            "El sistema articulado con que la Universidad planea, ejecuta, verifica y mejora su trabajo.",
            "El programa de auditorías internas.",
            "La dependencia responsable de la acreditación."], r: 1,
      exp: "Es el sistema completo de gestión, no uno de sus componentes." },
    { q: "El Decreto 1330 de 2019 aporta al sistema principalmente:",
      ops: ["El modelo de acreditación por factores.",
            "Las condiciones de calidad y la exigencia de un sistema interno de aseguramiento.",
            "La creación del Consejo Nacional de Acreditación.",
            "Los lineamientos de la evaluación docente."], r: 1,
      exp: "Define condiciones de calidad institucionales y de programa, incluido el sistema interno de aseguramiento." },
    { q: "El SIACA es:",
      ops: ["Un sistema independiente del SIGC.",
            "El componente académico dentro del SIGC.",
            "La herramienta de gestión de acciones de mejora.",
            "El repositorio documental institucional."], r: 1,
      exp: "Comparte política, procesos y control documental con el SIGC." },
    { q: "Un objetivo de calidad válido debe, ante todo:",
      ops: ["Estar redactado en infinitivo.",
            "Ser medible, con meta, plazo y responsable.",
            "Haber sido propuesto por la Oficina de Calidad Institucional.",
            "Coincidir literalmente con un factor de acreditación."], r: 1,
      exp: "Sin medición ni meta no es posible verificar cumplimiento." },
    { q: "La ficha técnica de un indicador existe para:",
      ops: ["Justificar la meta ante la alta dirección.",
            "Evitar que el resultado dependa de quién haga el cálculo.",
            "Reemplazar el reporte al Plan de Desarrollo Institucional.",
            "Documentar las acciones de mejora asociadas."], r: 1,
      exp: "Define fórmula, fuente y frecuencia para que la medición sea reproducible." },
    { q: "La gestión documental y la gestión humana son procesos:",
      ops: ["Estratégicos.", "Misionales.", "De apoyo.", "De evaluación y mejora."], r: 2,
      exp: "Proveen condiciones y recursos para que operen los demás procesos." },
    { q: "En el código FOES-PR-007, el número 007 corresponde a:",
      ops: ["La versión vigente del documento.",
            "El consecutivo asignado por el control documental.",
            "El año de aprobación.",
            "El número del proceso en el mapa."], r: 1,
      exp: "Es el consecutivo, y lo asigna el control documental, no el autor." },
    { q: "Cuando no se ha asignado el código de un documento, la convención institucional indica:",
      ops: ["Usar el siguiente número disponible.",
            "Escribir [Pendiente] hasta la asignación formal.",
            "Dejar el campo vacío.",
            "Usar las iniciales del responsable."], r: 1,
      exp: "Inventar consecutivos genera duplicados y rompe la trazabilidad." },
    { q: "La fase del PHVA donde más se incumple en la práctica es:",
      ops: ["Planear.", "Hacer.", "Verificar.", "Actuar."], r: 2,
      exp: "Se ejecutan las actividades pero no se comprueba con datos que el problema desapareció." },
    { q: "Un seguimiento adecuado a una acción de mejora debe:",
      ops: ["Indicar el porcentaje de avance estimado.",
            "Repetir el enunciado de la actividad planeada.",
            "Describir qué se hizo, cuándo y dónde está la evidencia.",
            "Señalar quién es el responsable del incumplimiento."], r: 2,
      exp: "El seguimiento debe ser comprensible y verificable por alguien externo a la acción." },
    { q: "Una copia impresa de un procedimiento se considera:",
      ops: ["Documento controlado si tiene el sello del proceso.",
            "Documento no controlado: sirve para consultar, no para decidir.",
            "Válida durante seis meses desde su impresión.",
            "Equivalente a la versión del repositorio."], r: 1,
      exp: "Solo la versión publicada en el repositorio oficial es la vigente." },
    { q: "Frente a un hallazgo de auditoría, la corrección corresponde a:",
      ops: ["El auditor interno que lo detectó.",
            "La Oficina de Calidad Institucional.",
            "El líder del proceso auditado.",
            "El comité directivo."], r: 2,
      exp: "La independencia de la auditoría exige que quien audita no corrija lo auditado." }
  ]
};

/* Metadatos del curso semilla */
CURSO_SEMILLA.id = "curso-sigc";
CURSO_SEMILLA.publicado = true;
CURSO_SEMILLA.duracion = "90 minutos";
CURSO_SEMILLA.descripcion = "Inducción obligatoria para colaboradores académicos y administrativos: qué es el SIGC, qué declara la política de calidad, cómo se mide, cómo está organizado el sistema y qué se espera de cada persona.";
CURSO_SEMILLA.examen = EXAMEN;

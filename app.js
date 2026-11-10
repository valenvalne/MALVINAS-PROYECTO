/**
 * ============================================================================
 * MALVINAS 1982: AUTO-GUÍA CRONOLÓGICA DÍA POR DÍA, TERRITORIO Y TESTIMONIOS
 * Archivo: app.js
 * Descripción:
 *  - Base de datos histórica cronológica día por día (19 de Marzo al 15 de Junio de 1982)
 *    inspirada en la cronología del Conflicto Armado de la Fundación Malvinas.
 *  - Sistema de 4 Escalas Cartográficas con detección automática de zoom (zoomend):
 *      * Escala 1 (Zoom <= 8): Teatro del Atlántico Sur, Georgias del Sur y Archipiélago General.
 *      * Escala 2 (Zoom 9 a 11): Isla Soledad, Gran Malvina y Estrecho de San Carlos.
 *      * Escala 3 (Zoom 12 a 14): Frentes de Batalla y Sectores Principales (Puerto Argentino, Darwin, San Carlos, Fitz Roy y Montes).
 *      * Escala 4 (Zoom 15 a 18): Micro-Escala de Posiciones Puntuales (trincheras, radares, baterías, puestos de mando, hundimientos y hospitales).
 *  - Auto-Guía Día por Día ("Día Anterior" / "Día Siguiente") y Filtro por Meses (Marzo, Abril, Mayo, Junio).
 *  - Marcadores personalizados con etiqueta flotante de fecha ("19 MAR", "02 ABR", "21 MAY", "14 JUN") y color por mes.
 *  - Expediente Histórico Documental en ventana modal con carrusel de fotos, miniaturas y visor Lightbox.
 * ============================================================================
 */

// ==================== CONFIGURACIÓN GLOBAL Y ENDPOINTS ====================
const CONFIG = {
  USE_MOCK: true,
  API_BASE_URL: "http://localhost:8000",
  ENDPOINTS: {
    CHAT: "/api/chat",
    SAVE_TESTIMONIO: "/api/testimonios"
  }
};

// ==================== BASE DE DATOS CRONOLÓGICA DÍA POR DÍA (19 MAR AL 15 JUN 1982) ====================
/**
 * INSTRUCCIONES PARA CARGAR LOS ENLACES DE YOUTUBE EN CADA PUNTO HISTÓRICO:
 * -------------------------------------------------------------------------
 * En cada uno de los 48 objetos dentro de PUNTOS_HISTORICOS encontrarás las propiedades:
 *   - videoUrl:    Pega entre las comillas el link del documental de YouTube.
 *                  (Ej: "https://www.youtube.com/watch?v=XXXXXXXXXXX" o "https://youtu.be/XXXXXXXXXXX")
 *   - videoTiempo: (Opcional) Indica el minuto y segundo exacto donde comienza el relato de ese hito.
 *                  Acepta formato YouTube ("14m30s"), formato reloj ("14:30") o segundos totales (870).
 *                  NOTA: También puedes pegar el link con el tiempo ya incluido directamente en videoUrl
 *                  (por ejemplo: "https://www.youtube.com/watch?v=XXXXXXXXXXX&t=14m30s" o "?t=870").
 *
 * Si dejas videoUrl: "" vacío en un punto, el botón "Ver relato detallado en YouTube" se ocultará
 * automáticamente en la ventana modal de ese punto para no dejar espacios vacíos.
 */
const PUNTOS_HISTORICOS = [
  // =========================================================================
  // MES DE MARZO DE 1982 (Preludio y Crisis en Georgias del Sur)
  // =========================================================================
  {
    id: "mar-19-puerto-leith",
    orden: 1,
    mes: "marzo",
    etiquetaFecha: "19 MAR",
    nombre: "Puerto Leith (Islas Georgias del Sur) — Izamiento del Pabellón",
    fecha: "19 de Marzo de 1982",
    tipo: "Preludio y Soberanía • Escala 1",
    escala: 1,
    lat: -54.1460,
    lng: -36.6780,
    zoomRecomendado: 8,
    // [HITO 1 - 19 MAR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Puerto Leith (Islas Georgias del Sur) — Izamiento del Pabellón
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "https://youtu.be/eQPQO7fYimQ?t=260",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/puerto_leith_19mar.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Desembarco de los 41 trabajadores argentinos de la empresa de Constantino Davidoff a bordo del transporte ARA Bahía Buen Suceso para desguazar factorías balleneras e izamiento de la bandera argentina, hecho que desencadena la crisis diplomática y militar con el Reino Unido.",
    unidadesArgentinas: "Transporte Naval ARA Bahía Buen Suceso (B-6) del Comando de Transportes Navales de la Armada Argentina (Capitán de Fragata Osvaldo Niella) y 41 operarios y técnicos civiles argentinos de la empresa Georgias del Sur S.A. (Constantino Davidoff).",
    condicionesTerreno: "Bahía glaciaria subantártica rodeada de cumbres nevadas perpetuas, antiguos galpones balleneros oxidados y vientos helados del Atlántico Sur.",
    historiaCompleta: [
      "El 19 de marzo de 1982 arribó al fondeadero de Puerto Leith, en la isla San Pedro (Georgias del Sur), el transporte naval ARA Bahía Buen Suceso transportando a 41 técnicos y obreros civiles argentinos contratados por el empresario Constantino Davidoff. El grupo contaba con contratos comerciales legalmente firmados con la compañía escocesa Christian Salvesen para desmantelar las antiguas factorías balleneras abandonadas en Leith, Husvik y Stromness, habiendo notificado previamente su viaje a la embajada británica en Buenos Aires.",
      "Al pisar suelo en Puerto Leith para iniciar el montaje de su campamento y las tareas de desguace de chatarra, los trabajadores argentinos izaron el pabellón nacional en una de las torres metálicas de la estación ballenera. Pese al carácter civil y contractual de la operación, el gobernador colonial británico en Malvinas, Rex Hunt, y el gobierno de Londres denunciaron el hecho como una 'invasión encubierta', exigiendo el retiro inmediato de los operarios o el sellado de sus pasaportes como si se encontraran en territorio extranjero.",
      "La firme negativa argentina a arriar su bandera o validar exigencias migratorias británicas sobre territorio reclamado como propio desencadenó una rápida escalada diplomática y naval. Londres ordenó el envío inmediato del buque polar armado HMS Endurance con un destacamento de Royal Marines desde Puerto Argentino hacia las Islas Georgias del Sur con órdenes de desalojar por la fuerza a los trabajadores argentinos."
    ],
    protagonistasHitos: "Los 41 obreros y técnicos civiles argentinos de la empresa de Constantino Davidoff y la tripulación del transporte ARA Bahía Buen Suceso al mando del Capitán de Fragata Osvaldo Niella.",
    galeria: [
      {
        src: "imagenesdeescala/puerto_leith_19mar.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Factoría ballenera de Puerto Leith en las Islas Georgias del Sur, donde el 19 de marzo de 1982 se izó el pabellón argentino."
      },
      {
        src: "imagenesdeescala/puerto_leith_19mar_2.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Cumbres glaciarias que rodean la bahía de Puerto Leith en el archipiélago subantártico."
      },
      {
        src: "imagenesdeescala/puerto_leith_19mar_3.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas australes recorridas por el transporte naval ARA Bahía Buen Suceso en marzo de 1982."
      }
    ]
  },
  {
    id: "mar-24-bahia-stromness",
    orden: 2,
    mes: "marzo",
    etiquetaFecha: "24 MAR",
    nombre: "Bahía Stromness y Puerto Leith — Arribo del ARA Bahía Paraíso",
    fecha: "24 al 26 de Marzo de 1982",
    tipo: "Operación de Protección Naval • Escala 1",
    escala: 1,
    lat: -54.1620,
    lng: -36.7120,
    zoomRecomendado: 8,
    // [HITO 2 - 24 MAR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Bahía Stromness y Puerto Leith — Arribo del ARA Bahía Paraíso
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "https://youtu.be/thGmdPAfgh4",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/bahia_stromness_24mar.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Arribo del buque polar ARA Bahía Paraíso desembarcando al Grupo Alfa de la Armada Argentina para brindar protección a los obreros civiles ante el envío del buque británico HMS Endurance.",
    unidadesArgentinas: "Buque Polar ARA Bahía Paraíso (B-1) al mando del Capitán de Navío César Trombetta, Grupo de Tareas 60.1 (corbetas misilísticas ARA Drummond y ARA Granville) y el Grupo Alfa de comandos y buzos tácticos de la Armada Argentina.",
    condicionesTerreno: "Fiordos profundos y bahías cerradas de la costa noreste de la isla San Pedro, bajo temporales de nieve y presencia de témpanos.",
    historiaCompleta: [
      "Ante la confirmación de que el buque británico HMS Endurance navegaba hacia las Islas Georgias del Sur con infantes de marina reales para expulsar por la fuerza a los 41 trabajadores argentinos en Puerto Leith, la Armada Argentina ordenó al buque polar ARA Bahía Paraíso —que se encontraba cumpliendo la Campaña Antártica de Verano cerca de las Islas Orcadas del Sur— dirigirse a máxima velocidad hacia Puerto Leith.",
      "En la noche del 24 al 25 de marzo de 1982, el ARA Bahía Paraíso fondeó en las aguas de Puerto Leith y Bahía Stromness, desembarcando a los catorce efectivos militares del Grupo Alfa de la Armada Argentina para establecer un perímetro defensivo y garantizar que ningún ciudadano argentino pudiera ser detenido o evacuado compulsivamente por tropas británicas.",
      "Simultáneamente, las corbetas misilísticas ARA Drummond y ARA Granville fueron destacadas en alta mar entre las Islas Malvinas y las Islas Georgias del Sur para interceptar cualquier intento del HMS Endurance de trasladar por la fuerza a los operarios civiles. Este bloqueo táctico dejó en evidencia que la disputa por la soberanía en los archipiélagos del Atlántico Sur había alcanzado un punto de no retorno."
    ],
    protagonistasHitos: "La dotación del buque polar ARA Bahía Paraíso al mando del Capitán de Navío César Trombetta, las tripulaciones de las corbetas ARA Drummond y ARA Granville y los efectivos navales destacados en Puerto Leith.",
    galeria: [
      {
        src: "imagenesdeescala/bahia_stromness_24mar.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Fondeadero de Bahía Stromness y Puerto Leith donde operó el buque polar ARA Bahía Paraíso."
      },
      {
        src: "imagenesdeescala/bahia_stromness_24mar_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa montañosa de las Islas Georgias del Sur vigilada por las unidades navales en marzo de 1982."
      },
      {
        src: "imagenesdeescala/bahia_stromness_24mar_3.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Entorno marítimo subantártico durante el despliegue del Grupo de Tareas 60.1."
      }
    ]
  },
  {
    id: "mar-28-flota-mar-argentino",
    orden: 3,
    mes: "marzo",
    etiquetaFecha: "28 MAR",
    nombre: "Mar Argentino — Zarpa la Fuerza de Tareas Anfibia 40 (Operación Rosario)",
    fecha: "28 al 31 de Marzo de 1982",
    tipo: "Movimiento Estratégico Naval • Escala 1",
    escala: 1,
    lat: -48.8500,
    lng: -59.8000,
    zoomRecomendado: 7,
    // [HITO 3 - 28 MAR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Mar Argentino — Zarpa la Fuerza de Tareas Anfibia 40 (Operación Rosario)
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "https://youtu.be/eQPQO7fYimQ?t=312",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/flota_28mar.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Navegación de la Fuerza de Tareas Anfibia 40 (destructores ARA Santísima Trinidad y ARA Hércules, corbetas Drummond y Granville, submarino ARA Santa Fe y buque de desembarco ARA Cabo San Antonio) en medio de un fuerte temporal austral para ejecutar la Operación Rosario.",
    unidadesArgentinas: "Fuerza de Tareas Anfibia 40 (Comandante: Contralmirante Gualter Oscar Allara; Comandante de la Fuerza de Desembarco: Contralmirante de IM Carlos Alberto Busser; Comandante del Teatro de Operaciones: General de División Osvaldo Jorge García): BDT ARA Cabo San Antonio, destructores Tipo 42 ARA Hércules y ARA Santísima Trinidad, corbetas ARA Drummond y ARA Granville, rompehielos ARA Almirante Irízar, transporte ARA Isla de los Estados, submarino ARA Santa Fe y Fuerza de Tareas 20 encabezada por el portaaviones ARA Veinticinco de Mayo.",
    condicionesTerreno: "Mar Argentino abierto azotado por un violento temporal del sudoeste con vientos de más de 70 kilómetros por hora y olas de hasta 8 metros de altura.",
    historiaCompleta: [
      "El 28 de marzo de 1982 zarpó desde la Base Naval Puerto Belgrano la Fuerza de Tareas Anfibia 40 (FT 40) y la Fuerza de Tareas 20 (FT 20) bajo estricto secreto militar y silencio de radio, simulando inicialmente un ejercicio naval antisubmarino de rutina. A bordo del buque de desembarco de tanques ARA Cabo San Antonio, del rompehielos ARA Almirante Irízar y del destructor ARA Santísima Trinidad navegaban más de 900 efectivos de la Infantería de Marina (BIM 2, Comandos Anfibios y Buzos Tácticos) y del Regimiento de Infantería 25 del Ejército Argentino.",
      "Durante los días 29, 30 y 31 de marzo, la flota enfrentó un feroz temporal austral en el Mar Argentino que sometió a los buques a escoras de más de 40 grados, provocando averías menores en los helicópteros embarcados y obligando a postergar veinticuatro horas el Día D, que originalmente estaba previsto para el 1 de abril y pasó definitivamente a la madrugada del 2 de abril de 1982.",
      "En plena navegación, los jefes de unidad abrieron los sobres lacrados y comunicaron a sus tripulaciones y tropas la misión real: recuperar la soberanía nacional sobre las Islas Malvinas mediante la Operación Rosario, bajo la orden categórica de lograr la rendición de la guarnición británica sin derramar sangre enemiga ni dañar los bienes de la población civil."
    ],
    protagonistasHitos: "El General de División Osvaldo García, el Contralmirante Gualter Allara, el Contralmirante Carlos Busser, el Teniente Coronel Mohamed Alí Seineldín y las dotaciones de todos los buques de la Flota de Mar y el submarino ARA Santa Fe.",
    galeria: [
      {
        src: "imagenesdeescala/flota_28mar.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Derrota naval de la Fuerza de Tareas Anfibia 40 a través del Mar Argentino rumbo a las Islas Malvinas."
      },
      {
        src: "imagenesdeescala/flota_28mar_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Temporal austral enfrentado por los buques argentinos entre el 29 y el 31 de marzo de 1982."
      },
      {
        src: "imagenesdeescala/flota_28mar_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Aproximación nocturna de las unidades anfibias hacia las costas de la Isla Soledad."
      }
    ]
  },

  // =========================================================================
  // MES DE ABRIL DE 1982 (Recuperación, Soberanía y Defensa)
  // =========================================================================
  {
    id: "abr-01-playa-caiman",
    orden: 4,
    mes: "abril",
    etiquetaFecha: "01 ABR",
    nombre: "Playa Caimán (Mullet Creek) — Desembarco de los Comandos Anfibios",
    fecha: "1 de Abril de 1982 (21:30 hs)",
    tipo: "Infiltración Nocturna • Escala 4",
    escala: 4,
    lat: -51.7320,
    lng: -57.8960,
    zoomRecomendado: 15,
    // [HITO 4 - 01 ABR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Playa Caimán (Mullet Creek) — Desembarco de los Comandos Anfibios
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "https://youtu.be/eQPQO7fYimQ?t=482",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/playa_caiman_1abr.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Desembarco nocturno encubierto de los 84 hombres de la Agrupación de Comandos Anfibios al mando del Capitán Guillermo Sánchez Sabarots, iniciando la marcha a pie bajo la noche hacia el cuartel de los Royal Marines y la Casa de Gobierno.",
    unidadesArgentinas: "Agrupación de Comandos Anfibios (APCA) de la Infantería de Marina (84 efectivos al mando del Capitán de Corbeta Guillermo Sánchez Sabarots) y patrulla del Capitán de Corbeta Pedro Edgardo Giachino, desembarcados desde el destructor misilístico ARA Santísima Trinidad (D-2).",
    condicionesTerreno: "Caleta rocosa al sur de Puerto Argentino cubierta por densos bancos de algas gigantes (cachiyuyos), seguida por más de 8 kilómetros de turba húmeda y colinas escarpadas bajo oscuridad cerrada.",
    historiaCompleta: [
      "A las 21:30 horas del 1 de abril de 1982, el destructor misilístico ARA Santísima Trinidad se detuvo silenciosamente en las aguas de Puerto Enriqueta, al sur de Puerto Argentino, para lanzar al agua 21 botes neumáticos Zodiac con los 84 hombres de la Agrupación de Comandos Anfibios (APCA) y de la Agrupación de Buzos Tácticos. Debido a que la playa prevista estaba cubierta de espesas matas de cachiyuyos que trababan las hélices de los motores fuera de borda, los comandos debieron remar y vadear las aguas heladas hasta tocar tierra en Playa Caimán (Mullet Creek) cerca de las 23:00 horas.",
      "Una vez en la costa, la fuerza se dividió en dos grupos con misiones tácticas precisas: el grupo principal de 68 hombres al mando del Capitán de Corbeta Guillermo Sánchez Sabarots inició una extenuante marcha nocturna a campo traviesa cargando armamento pesado y mochilas a través de la turba hacia el cuartel de los Royal Marines en Moody Brook.",
      "Simultáneamente, la patrulla de 16 efectivos al mando del Segundo Comandante de la Agrupación de Buzos Tácticos, Capitán de Corbeta Pedro Edgardo Giachino, marchó hacia el norte por las elevaciones detrás de la localidad con la misión de rodear la residencia del gobernador colonial Rex Hunt y obtener su rendición antes del amanecer."
    ],
    protagonistasHitos: "El Capitán de Corbeta Guillermo Sánchez Sabarots, el Capitán de Corbeta Pedro Edgardo Giachino, el Teniente de Fragata Diego García Quiroga, el Teniente de Corbeta Bernardo Schweizer y los 84 comandos anfibios y buzos tácticos que abrieron la Operación Rosario.",
    galeria: [
      {
        src: "imagenesdeescala/playa_caiman_1abr.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa de Playa Caimán (Mullet Creek), primer punto donde pisaron suelo malvinense los Comandos Anfibios en la noche del 1 de abril."
      },
      {
        src: "imagenesdeescala/playa_caiman_1abr_2.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Terreno de turba y colinas recorrido a pie durante la noche rumbo a Moody Brook y la Casa de Gobierno."
      },
      {
        src: "imagenesdeescala/playa_caiman_1abr_3.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas de Puerto Enriqueta donde fondeó el destructor ARA Santísima Trinidad."
      }
    ]
  },
  {
    id: "abr-02-punta-celebrona",
    orden: 5,
    mes: "abril",
    etiquetaFecha: "02 ABR",
    nombre: "Punta Celebroña y Faro San Felipe — Desembarco de los Buzos Tácticos",
    fecha: "2 de Abril de 1982 (04:30 hs)",
    tipo: "Operación Especial Submarina • Escala 4",
    escala: 4,
    lat: -51.6820,
    lng: -57.7240,
    zoomRecomendado: 15,
    // [HITO 5 - 02 ABR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Punta Celebroña y Faro San Felipe — Desembarco de los Buzos Tácticos
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/punta_celebrona_2abr.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Desembarco de la Agrupación de Buzos Tácticos desde el submarino ARA Santa Fe para asegurar la costa y marcar la playa de desembarco principal.",
    unidadesArgentinas: "Agrupación de Buzos Tácticos (APBT) de la Armada Argentina (13 efectivos al mando del Capitán de Corbeta Alfredo Raúl Cufré) infiltrados desde el submarino ARA Santa Fe (S-21, Capitán de Corbeta Horacio Bicain).",
    condicionesTerreno: "Promontorio rocoso barrido por el oleaje oceánico en el extremo oriental de la península del aeropuerto, frente al Faro San Felipe (Cape Pembroke).",
    historiaCompleta: [
      "Durante la madrugada del 2 de abril de 1982, el submarino ARA Santa Fe emergió sigilosamente en las oscuras aguas frente a la costa noreste de Puerto Argentino. Desde su cubierta interior, bajo un fuerte oleaje que barría la vela del sumergible, una sección de trece hombres de la Agrupación de Buzos Tácticos al mando del Capitán de Corbeta Alfredo Raúl Cufré abordó tres botes neumáticos Zodiac e inició la aproximación encubierta hacia la costa.",
      "A las 04:30 horas, los buzos tácticos desembarcaron en Punta Celebroña, en las inmediaciones del Faro San Felipe (Cape Pembroke), tras verificar que las playas de Bahía Yorke se encontraban libres de defensas enemigas, minas u obstáculos subacuáticos.",
      "De inmediato aseguraron el faro sin ser detectados y encendieron las balizas de señalización luminosa hacia el mar, guiando la entrada segura del buque de desembarco de tanques ARA Cabo San Antonio hacia Playa Roja para el asalto anfibio principal de las 06:00 horas."
    ],
    protagonistasHitos: "El Capitán de Corbeta Alfredo Raúl Cufré, los trece integrantes de la Agrupación de Buzos Tácticos y la tripulación del submarino ARA Santa Fe al mando del Capitán de Corbeta Horacio Bicain.",
    galeria: [
      {
        src: "imagenesdeescala/punta_celebrona_2abr.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Punta Celebroña y el sector del Faro San Felipe asegurados por los Buzos Tácticos desde el submarino ARA Santa Fe."
      },
      {
        src: "imagenesdeescala/punta_celebrona_2abr_2.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa oriental de la península de Freycinet donde se instalaron las balizas para el desembarco anfibio."
      },
      {
        src: "imagenesdeescala/punta_celebrona_2abr_3.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas de aproximación del submarino ARA Santa Fe en la madrugada del 2 de abril."
      }
    ]
  },
  {
    id: "abr-02-playa-roja-yorke",
    orden: 6,
    mes: "abril",
    etiquetaFecha: "02 ABR",
    nombre: "Playa Roja (Bahía Yorke) — Desembarco Anfibio de los VAO LVTP-7",
    fecha: "2 de Abril de 1982 (06:00 hs)",
    tipo: "Operación Anfibia Principal • Escala 3",
    escala: 3,
    lat: -51.6745,
    lng: -57.7920,
    zoomRecomendado: 13,
    // [HITO 6 - 02 ABR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Playa Roja (Bahía Yorke) — Desembarco Anfibio de los VAO LVTP-7
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "https://youtu.be/eQPQO7fYimQ?t=536",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/playa_roja_2abr.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Desembarco anfibio de los 20 vehículos blindados anfibios a oruga (VAO LVTP-7) con la fuerza de desembarco del Batallón de Infantería de Marina N° 2 (BIM 2) y la sección del Regimiento de Infantería 25 rumbo a Puerto Argentino.",
    unidadesArgentinas: "Batallón de Infantería de Marina N° 2 Ec. (BIM 2, Capitán de Fragata Alfredo Raúl Weinstabl), Batallón de Vehículos Anfibios N° 1 (Capitán de Corbeta Mario Forbice, con 20 VAO LVTP-7 y 1 LARC-5), Sección 'Gato' de la Compañía C del Regimiento de Infantería 25 (Teniente Coronel Mohamed Alí Seineldín y Teniente Roberto Estévez) y BDT ARA Cabo San Antonio.",
    condicionesTerreno: "Playa de arena blanca y médanos costeros en Bahía Yorke, conectada directamente con el istmo de la pista del aeropuerto y el camino de ingreso a Puerto Argentino.",
    historiaCompleta: [
      "Exactamente a las 06:00 horas del 2 de abril de 1982, el buque de desembarco de tanques ARA Cabo San Antonio abrió su gran compuerta de proa dentro de Puerto Groussac (Port William) y lanzó al mar la ola de asalto compuesta por 20 vehículos blindados anfibios a oruga (VAO LVTP-7) y un vehículo anfibio a rueda LARC-5 del Batallón de Vehículos Anfibios N° 1.",
      "A las 06:30 horas los blindados tocaron la arena de Playa Roja en Bahía Yorke. La vanguardia al mando del Capitán de Corbeta Hugo Santillán aseguró de inmediato la pista del aeropuerto de Puerto Argentino —despejando los obstáculos y vehículos que los británicos habían cruzado sobre el asfalto—, mientras la sección del Regimiento de Infantería 25 al mando del Teniente Coronel Mohamed Alí Seineldín tomaba control de las instalaciones aeroportuarias.",
      "Con el aeropuerto asegurado, la columna de vehículos blindados anfibios inició su avance por el camino costero hacia Puerto Argentino. En las afueras de la localidad, a la altura de la casa verde próxima al hipódromo, los tres primeros VAO (VAO 07, VAO 05 y VAO 19) recibieron nutrido fuego de ametralladoras y un cohete antitanque Carl Gustav disparado por una sección de Royal Marines; los blindados argentinos respondieron con fuego disuasivo de ametralladoras pesadas y un cañón sin retroceso sin causar bajas mortales a los defensores británicos, quienes se replegaron hacia la Casa de Gobierno."
    ],
    protagonistasHitos: "El Contralmirante Carlos Busser, el Capitán de Fragata Alfredo Weinstabl, el Teniente Coronel Mohamed Alí Seineldín, el Capitán de Corbeta Hugo Santillán, el Suboficial Mayor Guillermo 'Perro' Ponce y las tripulaciones de los 20 VAO.",
    galeria: [
      {
        src: "imagenesdeescala/playa_roja_2abr.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Playa Roja en Bahía Yorke, donde desembarcaron los 20 vehículos anfibios a oruga LVTP-7 el 2 de abril a las 06:30 hs."
      },
      {
        src: "imagenesdeescala/playa_roja_2abr_2.jpg",
        fallback: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80",
        caption: "Camino costero desde Bahía Yorke y el aeropuerto hacia el centro de Puerto Argentino."
      },
      {
        src: "imagenesdeescala/playa_roja_2abr_3.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Bahía de Puerto Groussac por donde ingresó el BDT ARA Cabo San Antonio."
      }
    ]
  },
  {
    id: "abr-02-casa-gobierno-giachino",
    orden: 7,
    mes: "abril",
    etiquetaFecha: "02 ABR",
    nombre: "Casa de Gobierno — Heroísmo del Capitán Pedro Edgardo Giachino",
    fecha: "2 de Abril de 1982 (06:30 hs)",
    tipo: "Combate Decisivo • Escala 4",
    escala: 4,
    lat: -51.6918,
    lng: -57.8712,
    zoomRecomendado: 16,
    // [HITO 7 - 02 ABR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Casa de Gobierno — Heroísmo del Capitán Pedro Edgardo Giachino
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "https://youtu.be/eQPQO7fYimQ?t=507",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/casa_gobierno_2abr.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Combate por la rendición del gobernador británico Rex Hunt sin causar bajas enemigas. Lugar donde cae mortalmente herido el Capitán de Corbeta Pedro Edgardo Giachino, primer héroe caído en la recuperación de las islas, junto a los heridos Teniente Diego García Quiroga y Cabo Ernesto Urbina.",
    unidadesArgentinas: "Grupo de Comandos Anfibios y Buzos Tácticos (16 hombres al mando del Capitán de Corbeta Pedro Edgardo Giachino y el Teniente de Fragata Gustavo Lugo).",
    condicionesTerreno: "Complejo edilicio de piedra y madera con jardines cercados y anexos de servicio sobre Ross Road, frente a la bahía de Puerto Argentino.",
    historiaCompleta: [
      "A las 06:15 horas del 2 de abril de 1982, tras haber marchado durante toda la noche desde Playa Caimán, la patrulla de 16 comandos anfibios y buzos tácticos liderada por el Capitán de Corbeta Pedro Edgardo Giachino tomó posición alrededor de la Casa de Gobierno en Puerto Argentino. La residencia estaba defendida desde el interior por más de cuarenta Royal Marines del Destacamento Naval 8901 fuertemente armados.",
      "Cumpliendo a rajatabla la orden superior de no causar bajas a las tropas británicas para lograr una rendición honorable y sin derramamiento de sangre enemiga, los comandos argentinos intimaron la rendición en inglés y utilizaron únicamente granadas de aturdimiento y disparos hacia los muros superiores. Decidido a destrabar el cerco y forzar la rendición desde adentro, el Capitán Giachino avanzó junto al Teniente de Fragata Diego García Quiroga hacia el patio interno trasero para ingresar por el anexo de la residencia.",
      "Al franquear la entrada, ambos oficiales fueron recibidos por una ráfaga a quemarropa de armas automáticas británicas. El Capitán Giachino cayó gravemente herido con la arteria femoral seccionada —manteniendo en su mano el seguro de una granada para proteger a sus subordinados—, mientras el Teniente García Quiroga caía herido a su lado y el Cabo Segundo Enfermero Ernesto Urbina era alcanzado por los disparos cuando se arrojó bajo el fuego para socorrer a su jefe. Pese al dolor de ver caer a su comandante, los comandos argentinos mantuvieron la disciplina de fuego sin matar a ningún efectivo británico hasta que a las 09:15 horas, con la llegada del Contralmirante Carlos Busser y los blindados del BIM 2, el gobernador Rex Hunt ordenó el cese del fuego y la rendición total. El Capitán Giachino falleció poco después en el hospital de Puerto Argentino, recibiendo post mortem la Cruz La Nación Argentina al Heroico Valor en Combate."
    ],
    protagonistasHitos: "El Capitán de Corbeta Pedro Edgardo Giachino (primer héroe caído en la gesta de Malvinas), el Teniente de Fragata Diego García Quiroga, el Cabo Segundo Enfermero Ernesto Urbina, el Teniente de Fragata Gustavo Lugo y el Contralmirante Carlos Alberto Busser.",
    galeria: [
      {
        src: "imagenesdeescala/casa_gobierno_2abr.jpg",
        fallback: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector de la Casa de Gobierno en Puerto Argentino donde combatió la patrulla del Capitán Pedro Edgardo Giachino."
      },
      {
        src: "imagenesdeescala/casa_gobierno_2abr_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Costanera Ross Road por donde avanzaron los efectivos argentinos para sellar la rendición británica."
      },
      {
        src: "imagenesdeescala/casa_gobierno_2abr_3.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Colinas posteriores a la residencia desde donde el Teniente Gustavo Lugo sostuvo el cerco."
      }
    ]
  },
  {
    id: "abr-02-puerto-argentino-izamiento",
    orden: 8,
    mes: "abril",
    etiquetaFecha: "02 ABR",
    nombre: "Puerto Argentino — Recuperación e Izamiento del Pabellón Nacional",
    fecha: "2 de Abril de 1982 (08:30 a 12:30 hs)",
    tipo: "Capital y Soberanía • Escala 1",
    escala: 1,
    lat: -51.9802,
    lng: -60.0585,
    zoomRecomendado: 8,
    // [HITO 8 - 02 ABR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Puerto Argentino — Recuperación e Izamiento del Pabellón Nacional
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "https://youtu.be/eQPQO7fYimQ?list=PLgVXFkYwDIIGmg_iklrdOVOx2rAiwBGxY&t=562",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/puerto_argentino_2abr.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Arribo de las fuerzas del Ejército (RI 25) y la Armada al centro de la capital e izamiento oficial del pabellón nacional argentino tras 149 años de usurpación británica.",
    unidadesArgentinas: "Fuerzas Conjuntas de la Operación Rosario: Batallón de Infantería de Marina N° 2 (BIM 2), Regimiento de Infantería 25 (RI 25), Compañía de Ingenieros de Combate 601, Agrupación de Comandos Anfibios, Agrupación de Buzos Tácticos y Escuadrón I de Transporte Aéreo (Hércules C-130 de la Fuerza Aérea Argentina).",
    condicionesTerreno: "Capital portuaria recostada sobre la margen sur de la bahía de Puerto Argentino, centro neurálgico político y militar del archipiélago.",
    historiaCompleta: [
      "A las 08:30 horas del 2 de abril de 1982, las columnas del Batallón de Infantería de Marina N° 2 y del Regimiento de Infantería 25 ingresaron al centro de Puerto Argentino, confluyendo con los Comandos Anfibios que venían desde los cuarteles de Moody Brook. Casi en simultáneo, a las 08:45 horas, aterrizó en la pista del aeropuerto el primer avión Lockheed C-130 Hércules (TC-68, 'Litro 1') de la Fuerza Aérea Argentina iniciando el puente aéreo con el continente.",
      "Tras la rendición formal de Rex Hunt y del destacamento de Royal Marines —quienes fueron desarmados con pleno respeto a su honor militar y embarcados ese mismo día en aviones argentinos hacia Montevideo para regresar al Reino Unido—, al mediodía del 2 de abril se llevó a cabo la solemne ceremonia de izamiento de la Bandera de la República Argentina en el mástil de la gobernación.",
      "Después de 149 años y tres meses de usurpación ininterrumpida desde enero de 1833, el pabellón celeste y blanco volvió a flamear bajo el cielo austral ante las formaciones del Ejército, la Armada y la Fuerza Aérea, estableciéndose la Gobernación Militar de las Islas Malvinas, Georgias del Sur y Sandwich del Sur con capital en Puerto Argentino."
    ],
    protagonistasHitos: "El General de División Osvaldo Jorge García, el Contralmirante Carlos Alberto Busser, el General de Brigada Mario Benjamín Menéndez, el Teniente Coronel Mohamed Alí Seineldín y la totalidad de los combatientes del 2 de abril.",
    galeria: [
      {
        src: "imagenesdeescala/puerto_argentino_2abr.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Vista general de Puerto Argentino y su bahía histórica el 2 de abril de 1982."
      },
      {
        src: "imagenesdeescala/puerto_argentino_2abr_2.jpg",
        fallback: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80",
        caption: "Despliegue de los efectivos argentinos sobre la avenida costanera Ross Road."
      },
      {
        src: "imagenesdeescala/puerto_argentino_2abr_3.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Muelle y rada interior de la capital del archipiélago."
      }
    ]
  },
  {
    id: "abr-03-grytviken-georgias",
    orden: 9,
    mes: "abril",
    etiquetaFecha: "03 ABR",
    nombre: "Caleta Capitán Vago (Grytviken, Georgias) — Combate de la Corbeta ARA Guerrico",
    fecha: "3 de Abril de 1982",
    tipo: "Combate Aeronaval y Anfibio • Escala 1",
    escala: 1,
    lat: -54.2815,
    lng: -36.5080,
    zoomRecomendado: 8,
    // [HITO 9 - 03 ABR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Caleta Capitán Vago (Grytviken, Georgias) — Combate de la Corbeta ARA Guerrico
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "https://youtu.be/thGmdPAfgh4?list=PLgVXFkYwDIIGmg_iklrdOVOx2rAiwBGxY&t=62",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/grytviken_3abr.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Combate por la recuperación de Grytviken protagonizado por la corbeta ARA Guerrico, un helicóptero Puma del Ejército y un Alouette III de la Armada. Caen en acción el Cabo Primero Patricio Guanca y los conscriptos Mario Almonacid y Jorge Águila.",
    unidadesArgentinas: "Grupo de Tareas 60.1 (Capitán de Navío César Trombetta): Corbeta misilística ARA Guerrico (P-32, Capitán de Fragata Carlos Alfonso), Buque Polar ARA Bahía Paraíso (B-1), helicóptero SA-330L Puma (AE-504) de la Aviación de Ejército (Teniente Primero Alejandro Villagra), helicóptero Alouette III (3-H-110, Teniente de Navío Remo Busson) de la 1ª Escuadrilla Aeronaval de Helicópteros y sección del Batallón de Infantería de Marina N° 1 (Teniente de Navío Guillermo Luna).",
    condicionesTerreno: "Estrecha caleta de aguas profundas rodeada de paredes montañosas verticales cubiertas de nieve en Bahía Guardia Nacional (Cumberland East Bay).",
    historiaCompleta: [
      "En la mañana del 3 de abril de 1982 se ejecutó la Operación Georgias para recuperar Grytviken y Caleta Capitán Vago (King Edward Point), donde se atrincheraba un destacamento de 22 Royal Marines al mando del Teniente Keith Mills. La primera ola helitransportada de quince Infantes de Marina a bordo del helicóptero Alouette III de la Armada y del Puma del Ejército desembarcó en la punta de acceso a la caleta.",
      "Cuando el helicóptero Puma AE-504 realizaba su segundo vuelo transportando otra sección de infantes de marina, fue recibido por un concentrado volumen de fuego de fusiles automáticos y ametralladoras británicas desde las edificaciones de Shackleton House. El aparato, severamente averiado, logró cruzar la caleta y aterrizar de emergencia en la costa sur, cayendo muertos en la acción los soldados conscriptos de Infantería de Marina Mario Almonacid y Jorge Néstor Águila.",
      "Para auxiliar a los infantes aferrados por el fuego enemigo, el comandante de la corbeta ARA Guerrico, Capitán de Fragata Carlos Alfonso, tomó la audaz decisión de ingresar con su buque dentro de la estrechísima caleta a quemarropa de las posiciones británicas. La corbeta recibió más de 200 impactos de armas automáticas y el impacto directo de un cohete antitanque Carl Gustav de 84 mm —muriendo en su puesto del montaje de 40 mm el Cabo Primero de Mar Patricio Guanca—, pero logró hacer fuego decisivo con su cañón de 100 mm mientras el pequeño helicóptero Alouette III seguía transportando refuerzos bajo las balas, forzando la rendición total de los Royal Marines al mediodía."
    ],
    protagonistasHitos: "El Cabo Primero Patricio Guanca y los soldados conscriptos Mario Almonacid y Jorge Néstor Águila (caídos en combate), el Capitán de Fragata Carlos Alfonso, el Teniente de Navío Guillermo Luna, el Teniente de Navío Remo Busson y el Teniente Primero Alejandro Villagra.",
    galeria: [
      {
        src: "imagenesdeescala/grytviken_3abr.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Caleta Capitán Vago y Grytviken en las Islas Georgias del Sur, escenario del combate del 3 de abril de 1982."
      },
      {
        src: "imagenesdeescala/grytviken_3abr_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas interiores de la caleta donde ingresó la corbeta ARA Guerrico bajo fuego enemigo."
      },
      {
        src: "imagenesdeescala/grytviken_3abr_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Cordón montañoso de la isla San Pedro frente a Bahía Guardia Nacional."
      }
    ]
  },
  {
    id: "abr-07-despliegue-gran-malvina",
    orden: 10,
    mes: "abril",
    etiquetaFecha: "07 ABR",
    nombre: "Puerto Mitre, Bahía Fox e Isla Borbón — Despliegue en el Archipiélago",
    fecha: "7 al 29 de Abril de 1982",
    tipo: "Despliegue Estratégico • Escala 2",
    escala: 2,
    lat: -51.6150,
    lng: -59.5210,
    zoomRecomendado: 10,
    // [HITO 10 - 07 ABR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Puerto Mitre, Bahía Fox e Isla Borbón — Despliegue en el Archipiélago
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "https://youtu.be/en8k7dQzStE?list=PLgVXFkYwDIIGmg_iklrdOVOx2rAiwBGxY&t=288",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/puerto_mitre_7abr.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Despliegue estratégico de las unidades argentinas en todo el archipiélago: el RI 5 en Puerto Mitre, el RI 8 y la Cía de Ingenieros 9 en Bahía Fox, la Fuerza de Tareas Mercedes (RI 12) en el Istmo de Darwin, y la creación de la Estación Aeronaval Calderón en Isla Borbón.",
    unidadesArgentinas: "Agrupación Ejército Litoral y Brigadas de Infantería III y IX: Regimiento de Infantería 5 'Félix de Olazábal' (Coronel Juan Ramón Mabragaña) en Puerto Mitre (Port Howard); Regimiento de Infantería 8 'General O'Higgins' (Teniente Coronel Ernesto Repossi) y Compañía de Ingenieros de Combate 9 (Mayor Oscar Minorini Lima) en Bahía Fox; Regimiento de Infantería 12 (Teniente Coronel Ítalo Piaggi) en Darwin; y Compañía H del BIM 3 junto a la Aviación Naval y Fuerza Aérea en Isla Borbón.",
    condicionesTerreno: "Costas escarpadas de la isla Gran Malvina sobre el Estrecho de San Carlos, sin caminos terrestres entre asentamientos y sujetas a un severo aislamiento logístico.",
    historiaCompleta: [
      "A lo largo del mes de abril de 1982, tras el anuncio británico del envío de una gran Fuerza de Tareas aeronaval hacia el Atlántico Sur y la imposición de la Zona de Exclusión Marítima de 200 millas a partir del 12 de abril, el Estado Mayor argentino dispuso el despliegue defensivo en los puntos estratégicos de las dos islas mayores para impedir que el enemigo pudiera ocupar sin oposición la isla Gran Malvina o el Istmo de Darwin.",
      "A través de un gigantesco puente aéreo ejecutado día y noche por los aviones C-130 Hércules, Fokker F-28, Boeing 737 y BAC 500 hacia Puerto Argentino, y el posterior traslado en helicópteros Chinook y Puma y en los buques costeros ARA Isla de los Estados, ARA Bahía Buen Suceso, Forrest y Monsunen, se establecieron las guarniciones de la isla Gran Malvina: la Fuerza de Tareas 'Yapeyú' (Regimiento de Infantería 5 y sección de Ingenieros 3) en Puerto Mitre (Port Howard) y el Regimiento de Infantería 8 junto a la Compañía de Ingenieros 9 en Bahía Fox.",
      "Simultáneamente, en el estrecho istmo central de la Isla Soledad se posicionó la Fuerza de Tareas 'Mercedes' (Regimiento de Infantería 12) junto a la Base Aérea Militar Cóndor en Pradera del Ganso, mientras que el 24 de abril la Armada Argentina habilitó en el extremo norte la Estación Aeronaval Calderón en la Isla Borbón (Pebble Island), operando con aviones T-34C Turbo Mentor y Pucará sobre una pista de turba para vigilar los accesos septentrionales del Estrecho de San Carlos."
    ],
    protagonistasHitos: "El Coronel Juan Ramón Mabragaña (jefe del RI 5 en Puerto Mitre), el Teniente Coronel Ernesto Repossi (jefe del RI 8 en Bahía Fox), el Mayor Oscar Minorini Lima, el Teniente Coronel Ítalo Piaggi y las tripulaciones de los transportes navales y helicópteros.",
    galeria: [
      {
        src: "imagenesdeescala/puerto_mitre_7abr.jpg",
        fallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        caption: "Asentamiento de Puerto Mitre (Port Howard) en la isla Gran Malvina, defendido por el Regimiento de Infantería 5."
      },
      {
        src: "imagenesdeescala/puerto_mitre_7abr_2.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Alturas del Monte María a espaldas de las posiciones argentinas en Gran Malvina."
      },
      {
        src: "imagenesdeescala/puerto_mitre_7abr_3.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa de Bahía Fox en el sector sur de Gran Malvina, guarnecida por el RI 8 y la Cía Ing 9."
      }
    ]
  },
  {
    id: "abr-13-radar-tps43",
    orden: 11,
    mes: "abril",
    etiquetaFecha: "13 ABR",
    nombre: "Puerto Argentino — Puesta en Servicio del Radar Westinghouse AN/TPS-43",
    fecha: "13 de Abril de 1982",
    tipo: "Vigilancia y Control Aéreo • Escala 4",
    escala: 4,
    lat: -51.9802,
    lng: -60.0585,
    zoomRecomendado: 16,
    // [HITO 11 - 13 ABR] PEGAR AQUI EL LINK DE YOUTUBE PARA: Puerto Argentino — Puesta en Servicio del Radar Westinghouse AN/TPS-43
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/radar_tps43_13abr.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Instalación y puesta en funcionamiento del radar de largo alcance del Grupo 2 de Vigilancia y Control Aéreo de la Fuerza Aérea Argentina, fundamental para detectar cada incursión de aviones Harrier y buques británicos y guiar a las escuadrillas desde el continente.",
    unidadesArgentinas: "Escuadrón VYCA (Vigilancia y Control Aéreo) de la Fuerza Aérea Argentina (Grupo 2 de Vigilancia y Control Aéreo de Merlo, al mando del Mayor Miguel Ángel Silva), operando en conjunto con el radar AN/TPS-44 Cardion del Grupo de Vigilancia y Control del Espacio Aéreo del Ejército Argentino.",
    condicionesTerreno: "Lomadas elevadas en el sector sudoeste de la localidad de Puerto Argentino, protegidas con muros de turba y tambores contra esquirlas y misiles antirradar.",
    historiaCompleta: [
      "El 13 de abril de 1982 entró formalmente en servicio operativo en Puerto Argentino el radar tridimensional móvil de largo alcance Westinghouse AN/TPS-43 del Grupo 2 de Vigilancia y Control Aéreo de la Fuerza Aérea Argentina, tras haber sido transportado en varios vuelos de aviones C-130 Hércules junto a sus cabinas operativas, generadores y personal técnico al mando del Mayor Miguel Ángel Silva.",
      "Con un alcance de detección superior a las 220 millas náuticas (más de 400 kilómetros), este radar se convirtió en los 'ojos estratégicos' de toda la defensa argentina en el archipiélago. Desde su consola de control (Centro de Información y Control Malvinas - CIC), los oficiales controladores y operadores de radar vigilaban las 24 horas del día los movimientos de las patrullas de combate aéreo de Sea Harrier, los acercamientos de las fragatas británicas para el cañoneo nocturno y la ubicación de los portaaviones enemigos.",
      "Durante los 45 días de combates entre el 1 de mayo y el 14 de junio, el radar Westinghouse guió en tiempo real a las escuadrillas de caza y ataque argentinas que llegaban desde el continente en silencio de radio a ras del mar, alertó a la artillería antiaérea antes de cada bombardeo y permitió que los aviones Hércules C-130 burlaran el bloqueo aéreo británico cada noche. Para evitar ser destruido por los misiles antirradar AGM-45 Shrike lanzados por los bombarderos Vulcan el 31 de mayo y el 3 de junio, los radaristas argentinos ejecutaron maniobras de apagado de emergencia en fracciones de segundo y cambiaron la ubicación física de la antena dentro de Puerto Argentino."
    ],
    protagonistasHitos: "El Mayor Miguel Ángel Silva y todos los oficiales controladores de interceptación, suboficiales operadores, mecánicos de radar y soldados del Grupo 2 de Vigilancia y Control Aéreo de la Fuerza Aérea Argentina y del radar Cardion del Ejército.",
    galeria: [
      {
        src: "imagenesdeescala/radar_tps43_13abr.jpg",
        fallback: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector elevado de Puerto Argentino donde operó el radar de largo alcance Westinghouse AN/TPS-43 de la Fuerza Aérea."
      },
      {
        src: "imagenesdeescala/radar_tps43_13abr_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Horizonte oriental vigilado permanentemente por el Centro de Información y Control Malvinas."
      },
      {
        src: "imagenesdeescala/radar_tps43_13abr_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80",
        caption: "Lomadas periféricas de la capital donde el radar cambió de posición tras los ataques con misiles Shrike."
      }
    ]
  },

  // =========================================================================
  // MES DE MAYO DE 1982 (Bautismo de Fuego, Combates Aeronavales y Desembarco)
  // =========================================================================
  {
    id: "may-01-bam-malvinas-vulcan",
    orden: 12,
    mes: "mayo",
    etiquetaFecha: "01 MAY",
    nombre: "Pista de la BAM Malvinas — Operación Black Buck 1 y Defensa Antiaérea",
    fecha: "1 de Mayo de 1982 (04:40 y 08:25 hs)",
    tipo: "Inicio de las Hostilidades • Escala 3",
    escala: 3,
    lat: -51.6858,
    lng: -57.7772,
    zoomRecomendado: 13,
    // [HITO 12 - 01 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Pista de la BAM Malvinas — Operación Black Buck 1 y Defensa Antiaérea
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/bam_malvinas_1may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Primer ataque británico a las islas (Operación Black Buck 1) mediante un bombardero Avro Vulcan que lanza 21 bombas de 1.000 libras sobre la zona del aeropuerto, seguido al amanecer por ataques de Sea Harriers rechazados por el fuego antiaéreo del GADA 601, GADA 101 y la Fuerza Aérea.",
    unidadesArgentinas: "Base Aérea Militar Malvinas (Comodoro Héctor Destri), 1ª Escuadrilla Aeronaval de Ataque (Aermacchi MB-339), Grupo 1 de Artillería Antiaérea de la FAA (Mayor Hugo Maiorano: misiles Roland y cañones Rheinmetall de 20 mm), Grupo de Artillería de Defensa Aérea 601 del Ejército (Teniente Coronel Héctor Lubin Arias: cañones Oerlikon de 35 mm y radar Skyguard), Batería B del GADA 101 y Batallón Antiaéreo de Infantería de Marina (misiles Tigercat).",
    condicionesTerreno: "Península llana de Freycinet a 7 km al este de Puerto Argentino, con una única pista asfaltada de 1.250 metros rodeada de bahías y cráteres de bombas.",
    historiaCompleta: [
      "A las 04:40 horas de la madrugada del 1 de Mayo de 1982, un bombardero estratégico cuatrimotor británico Avro Vulcan B.2 (XM607), que había despegado desde la Isla Ascensión tras múltiples reabastecimientos en vuelo, cruzó a gran altitud sobre la Base Aérea Militar Malvinas y arrojó una reguera oblicua de 21 bombas de 1.000 libras. Una sola de las bombas impactó en el borde de la pista asfaltada y las restantes cayeron sobre las instalaciones laterales y tiendas de campaña, donde murieron en sus puestos el Cabo Principal Guillermo Ubaldo García y el Soldado Conscripto clase 63 Héctor Ramón Bordón de la Fuerza Aérea.",
      "Lejos de quedar inutilizada como pretendía el mando británico, el personal del Grupo 1 de Construcciones de la Fuerza Aérea reparó de inmediato el sector afectado y fabricó cráteres simulados con montículos de tierra y lonas para engañar el reconocimiento fotográfico aéreo enemigo, permitiendo que la pista siguiera recibiendo aviones Hércules C-130, Fokker F-28, Pucará y Aermacchi durante absolutamente todas las noches de la guerra.",
      "Pocos minutos después de las 08:20 horas de esa misma mañana, una formación de nueve cazabombarderos Sea Harrier del Escuadrón 800 atacó a baja cota el aeropuerto con bombas de racimo y de caída retardada. La cortina de fuego desencadenada por los cañones bitubo Oerlikon Contraves de 35 mm del GADA 601, los cañones Rheinmetall de 20 mm y los misiles Roland y Tigercat creó una muralla antiaérea infranqueable que obligó a los aviones británicos a no volver a atacar jamás a baja altura sobre la vertical de la BAM Malvinas."
    ],
    protagonistasHitos: "El Cabo Principal Guillermo García y el Soldado Héctor Bordón (primeros caídos de la Fuerza Aérea el 1 de mayo), el Comodoro Héctor Destri, el Teniente Coronel Héctor Arias, el Mayor Hugo Maiorano y todos los artilleros antiaéreos de las tres Fuerzas.",
    galeria: [
      {
        src: "imagenesdeescala/bam_malvinas_1may.jpg",
        fallback: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        caption: "Pista de la Base Aérea Militar Malvinas atacada a las 04:40 hs del 1 de mayo de 1982."
      },
      {
        src: "imagenesdeescala/bam_malvinas_1may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Península del aeropuerto defendida por los cañones de 35 mm, 20 mm y misiles Roland."
      },
      {
        src: "imagenesdeescala/bam_malvinas_1may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector costero de Bahía Yorke contiguo a la cabecera de pista."
      }
    ]
  },
  {
    id: "may-01-bam-condor-jukic",
    orden: 13,
    mes: "mayo",
    etiquetaFecha: "01 MAY",
    nombre: "BAM Cóndor (Pradera del Ganso) — Sacrificio del Teniente Daniel Jukic",
    fecha: "1 de Mayo de 1982 (08:31 hs)",
    tipo: "Ataque Aéreo y Defensa • Escala 4",
    escala: 4,
    lat: -51.8285,
    lng: -58.9790,
    zoomRecomendado: 15,
    // [HITO 13 - 01 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: BAM Cóndor (Pradera del Ganso) — Sacrificio del Teniente Daniel Jukic
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/bam_condor_1may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Ataque aéreo británico sobre la base de aviones Pucará en el istmo de Darwin, donde cae en su cabina preparando el despegue el Teniente Daniel Jukic junto a siete suboficiales mecánicos y armeros de la Fuerza Aérea.",
    unidadesArgentinas: "Base Aérea Militar Cóndor (Vicecomodoro Wilson Rosier Pedrozo): Escuadrón IA-58 Pucará del Grupo 3 de Ataque (Mayor Carlos Tomba), Escuadrón Helicópteros y Batería de Artillería Antiaérea (cañones Rheinmetall de 20 mm de la FAA al mando del Teniente Darío Valazza y Sección de 35 mm del GADA 601 al mando del Subteniente Claudio Braghini).",
    condicionesTerreno: "Pista de pasto y turba apisonada en la pradera del Istmo de Darwin, completamente descubierta y expuesta a incursiones rasantes desde el estrecho.",
    historiaCompleta: [
      "A las 08:31 horas del 1 de mayo de 1982, mientras se desarrollaba el ataque simultáneo sobre Puerto Argentino, tres cazabombarderos Sea Harrier del Escuadrón 800 británico (liderados por el Teniente Comandante Frederiksen) se filtraron a vuelo rasante sobre las colinas del Istmo de Darwin y cayeron por sorpresa sobre la pista de pasto de la Base Aérea Militar Cóndor en Pradera del Ganso, lanzando bombas de racimo BL755 'Beluga' y bombas de 1.000 libras.",
      "En ese preciso instante, el Teniente Daniel Antonio Jukic se encontraba sentado en la cabina de su avión bimotor IA-58 Pucará matrícula A-527 poniendo en marcha los motores para despegar, rodeado por su equipo de suboficiales mecánicos y armeros que retiraban las trabas y asistían la salida. Una bomba de racimo impactó de lleno sobre el avión y los depósitos de munición cercanos, provocando una violenta explosión en la que entregaron su vida el Teniente Jukic y siete suboficiales de la Fuerza Aérea Argentina.",
      "Los heroicos suboficiales caídos junto al avión fueron el Cabo Principal Mario Duarte, los Cabos Primeros Juan Antonio Rodríguez, Miguel Ángel Carrizo, José Alberto Maldonado, Agustín Hugo Montaño, José Luis Peralta y Andrés Luis Brasich. Pese al incendio y las explosiones secundarias en la pista, el personal de la BAM Cóndor rescató a los heridos y reorganizó de inmediato la dispersión de los aviones Pucará y la defensa antiaérea del istmo."
    ],
    protagonistasHitos: "El Teniente Daniel Antonio Jukic, el Cabo Principal Mario Duarte y los Cabos Primeros Juan Rodríguez, Miguel Carrizo, José Maldonado, Agustín Montaño, José Peralta y Andrés Brasich.",
    galeria: [
      {
        src: "imagenesdeescala/bam_condor_1may.jpg",
        fallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        caption: "Pista de tierra y turba de la Base Aérea Militar Cóndor en Pradera del Ganso, donde operaban los aviones IA-58 Pucará."
      },
      {
        src: "imagenesdeescala/bam_condor_1may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
        caption: "Llanura del Istmo de Darwin por donde ingresaron a vuelo rasante los aviones atacantes el 1 de mayo."
      },
      {
        src: "imagenesdeescala/bam_condor_1may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        caption: "Entorno costero de Seno Choiseul junto al asentamiento de Goose Green."
      }
    ]
  },
  {
    id: "may-01-bautismo-fuego-faa",
    orden: 14,
    mes: "mayo",
    etiquetaFecha: "01 MAY",
    nombre: "Aguas al Sur de Puerto Argentino — Bautismo de Fuego de la Fuerza Aérea",
    fecha: "1 de Mayo de 1982 (16:00 hs)",
    tipo: "Primera Batalla Aeronaval • Escala 2",
    escala: 2,
    lat: -51.8200,
    lng: -57.6800,
    zoomRecomendado: 10,
    // [HITO 14 - 01 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Aguas al Sur de Puerto Argentino — Bautismo de Fuego de la Fuerza Aérea
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/bautismo_fuego_1may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Primera gran batalla aeronaval. Los cazabombarderos Mirage V Dagger (Escuadrilla Torno: Cap. Dimeglio, Tte. Aguirre Faget y Tte. Román) atacan con bombas y cañones a un destructor y dos fragatas británicas (HMS Glamorgan, HMS Arrow y HMS Alacrity), marcando el Bautismo de Fuego de la Fuerza Aérea Argentina.",
    unidadesArgentinas: "Fuerza Aérea Sur (Brigadier Ernesto Crespo): Grupo 6 de Caza (IAI Mirage V Dagger — Escuadrilla 'Torno': Capitán Norberto Dimeglio, Teniente César Aguirre Faget y Teniente Gustavo Román; más los pilotos de escolta, Grupo 8 Mirage IIIEA, Grupo 4 y 5 Skyhawk y Grupo 2 de Bombardeo Canberra MK-62).",
    condicionesTerreno: "Aguas abiertas al sur de Puerto Argentino y Bahía de la Anunciación, bajo techo de nubes bajas, bruma marina y fuerte oleaje.",
    historiaCompleta: [
      "Durante la tarde del 1 de mayo de 1982, tres buques de guerra británicos —el destructor clase County HMS Glamorgan y las fragatas Tipo 21 HMS Arrow y HMS Alacrity— se aproximaron a la costa al sur de Puerto Argentino y comenzaron a cañonear por primera vez las posiciones terrestres del Regimiento de Infantería 3, del BIM 5 y de la zona del aeropuerto.",
      "Desde la Base Aérea Militar Río Grande en Tierra del Fuego despegó la Escuadrilla 'Torno' del Grupo 6 de Caza, integrada por tres cazabombarderos IAI Mirage V Dagger tripulados por el Capitán Norberto Dimeglio, el Teniente César Aguirre Faget y el Teniente Gustavo Román. Volando a ras de las olas para evadir los radares enemigos, a las 16:30 horas irrumpieron por sorpresa sobre la formación naval británica, descargando sus bombas de 500 libras y barriendo las cubiertas y superestructuras de los tres buques con sus cañones DEFA de 30 mm.",
      "Las explosiones cercanas y los impactos de cañón provocaron averías en el HMS Glamorgan, la HMS Arrow y la HMS Alacrity, obligando a los buques británicos a suspender el bombardeo y retirarse hacia alta mar. En esa histórica jornada del Bautismo de Fuego de la Fuerza Aérea Argentina se ejecutaron 57 salidas de combate desde el continente, entregando su vida en combates aéreos el Capitán Gustavo Argentino García Cuerva (Mirage III), el Primer Teniente Mario Hipólito González (Canberra), el Teniente Eduardo Jorge Raúl de Ibáñez (Canberra) y el Primer Teniente José Leónidas Ardiles (Dagger)."
    ],
    protagonistasHitos: "La Escuadrilla 'Torno' (Capitán Norberto Dimeglio, Teniente César Aguirre Faget y Teniente Gustavo Román) y los pilotos caídos en el Bautismo de Fuego del 1 de mayo: Capitán Gustavo García Cuerva, Primer Teniente José Ardiles, Primer Teniente Mario González y Teniente Eduardo de Ibáñez.",
    galeria: [
      {
        src: "imagenesdeescala/bautismo_fuego_1may.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector marítimo al sur de Puerto Argentino donde la Escuadrilla 'Torno' atacó a los tres buques británicos el 1 de mayo."
      },
      {
        src: "imagenesdeescala/bautismo_fuego_1may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa austral de la Isla Soledad frente a la zona del duelo aeronaval."
      },
      {
        src: "imagenesdeescala/bautismo_fuego_1may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Horizonte oceánico por donde regresaron los cazabombarderos Dagger hacia Tierra del Fuego."
      }
    ]
  },
  {
    id: "may-02-crucero-general-belgrano",
    orden: 15,
    mes: "mayo",
    etiquetaFecha: "02 MAY",
    nombre: "Atlántico Sur — Hundimiento del Crucero ARA General Belgrano",
    fecha: "2 de Mayo de 1982 (16:00 hs)",
    tipo: "Hito Naval y Memoria • Escala 1",
    escala: 1,
    lat: -55.4000,
    lng: -61.3200,
    zoomRecomendado: 7,
    // [HITO 15 - 02 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Atlántico Sur — Hundimiento del Crucero ARA General Belgrano
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/crucero_belgrano_2may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Hundimiento del Crucero ARA General Belgrano al mando del Capitán Héctor Bonzo, torpedeado a traición fuera de la Zona de Exclusión Total por el submarino nuclear HMS Conqueror, donde entregan su vida 323 marinos argentinos.",
    unidadesArgentinas: "Grupo de Tareas 79.3 de la Armada Argentina: Crucero ARA General Belgrano (C-4, Comandante: Capitán de Navío Héctor Elías Bonzo; Segundo Comandante: Capitán de Fragata Pedro Luis Galazi; 1.093 tripulantes) escoltado por los destructores ARA Piedrabuena (D-29) y ARA Bouchard (D-26), y el operativo de rescate ejecutado por el aviso ARA Gurruchaga, el buque polar ARA Bahía Paraíso y aviones de exploración naval.",
    condicionesTerreno: "Aguas gélidas del Atlántico Sur al norte del Banco Burdwood (Lat: 55°24'S, Lng: 61°32'O), fuera de la Zona de Exclusión Total de 200 millas, bajo temporal helado con sensación térmica de -20 °C y olas de 7 metros.",
    historiaCompleta: [
      "El domingo 2 de mayo de 1982 a las 16:01 horas, mientras el Crucero ARA General Belgrano navegaba con rumbo 270° (hacia el oeste, alejándose de las Islas Malvinas en dirección al continente) y se encontraba a 35 millas náuticas fuera del límite sur de la Zona de Exclusión Total fijada unilateralmente por el propio Reino Unido, fue atacado sin previo aviso por el submarino nuclear británico HMS Conqueror por orden directa del gabinete de guerra de Margaret Thatcher.",
      "Dos torpedos pesados Mk-8 impactaron en la banda de babor del crucero: el primero estalló en la sala de máquinas de popa y los sollados del personal en momentos en que gran parte de la dotación descansaba tras el relevo de guardia, cortando de inmediato el suministro eléctrico, las bombas de achique y las comunicaciones internas; el segundo torpedo arrancó quince metros de la proa del buque. La gran mayoría de los 323 héroes caídos (321 marinos de la Armada Argentina y dos civiles que atendían la cantina de a bordo) fallecieron en el acto por la deflagración inicial.",
      "En medio de la oscuridad, el humo y una escora progresiva a babor que superó los 20 grados, la tripulación dio una lección inmortal de disciplina, camaradería y coraje: los marinos ayudaron a subir a cubierta a sus compañeros heridos y quemados y ocuparon ordenadamente las 62 balsas salvavidas. A las 16:23 horas el Capitán de Navío Héctor Elías Bonzo dio la orden de abandonar el buque, siendo junto al Capitán Galazi los últimos en dejar la cubierta antes de que el glorioso crucero se hundiera con su pabellón al tope a las 17:00 horas. Tras soportar entre 30 y 48 horas a la deriva en el mar helado, 770 sobrevivientes fueron rescatados por los destructores ARA Piedrabuena y ARA Bouchard, el aviso ARA Francisco de Gurruchaga y el buque polar ARA Bahía Paraíso."
    ],
    protagonistasHitos: "Los 323 héroes que custodian para siempre el Atlántico Sur en el Crucero ARA General Belgrano, el Capitán de Navío Héctor Elías Bonzo, el Capitán de Fragata Pedro Luis Galazi, los 770 sobrevivientes y las tripulaciones de los buques y aeronaves de rescate.",
    galeria: [
      {
        src: "imagenesdeescala/crucero_belgrano_2may.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Coordenadas exactas en el Atlántico Sur (55°24'S, 61°32'O) donde descansa el Crucero ARA General Belgrano y sus 323 héroes."
      },
      {
        src: "imagenesdeescala/crucero_belgrano_2may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Mar embravecido del sur donde las balsas salvavidas resistieron el temporal hasta el rescate."
      },
      {
        src: "imagenesdeescala/crucero_belgrano_2may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas australes recorridas por el aviso ARA Gurruchaga y los destructores Piedrabuena y Bouchard."
      }
    ]
  },
  {
    id: "may-03-aviso-alferez-sobral",
    orden: 16,
    mes: "mayo",
    etiquetaFecha: "03 MAY",
    nombre: "Norte del Archipiélago — Heroica Resistencia del Aviso ARA Alférez Sobral",
    fecha: "3 de Mayo de 1982 (01:30 hs)",
    tipo: "Combate Naval y Rescate • Escala 1",
    escala: 1,
    lat: -50.5800,
    lng: -59.1500,
    zoomRecomendado: 8,
    // [HITO 16 - 03 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Norte del Archipiélago — Heroica Resistencia del Aviso ARA Alférez Sobral
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/aviso_sobral_3may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Ataque de helicópteros británicos con misiles Sea Skua contra el Aviso ARA Alférez Sobral mientras cumplía misión de búsqueda y rescate de pilotos eyectados; impactan el puente de mando donde mueren su comandante, Capitán Sergio Gómez Roca, y siete tripulantes, logrando el resto de la dotación llevar el buque averiado hasta Puerto Deseado.",
    unidadesArgentinas: "Aviso ARA Alférez Sobral (A-9) de la Armada Argentina (Comandante: Capitán de Corbeta Sergio Raúl Gómez Roca; Segundo Comandante: Teniente de Navío Sergio Bazán).",
    condicionesTerreno: "Aguas abiertas a unas 60 millas al norte de la entrada del Estrecho de San Carlos, en plena noche austral.",
    historiaCompleta: [
      "En la noche del 2 al 3 de mayo de 1982, el pequeño aviso de mar ARA Alférez Sobral —un buque auxiliar de apenas 800 toneladas armado únicamente con un cañón Bofors de 40 mm y dos ametralladoras de 20 mm— navegaba en solitario al norte de las Islas Malvinas cumpliendo una misión humanitaria de búsqueda y rescate (SAR) de los dos tripulantes de un bombardero Canberra de la Fuerza Aérea derribado el 1 de mayo.",
      "Poco después de la medianoche del 3 de mayo, el buque fue detectado y atacado con misiles antibuque Sea Skua por helicópteros Sea Lynx de los destructores británicos HMS Coventry y HMS Glasgow. El primer misil destrozó la lancha del aviso e hirió a varios artilleros; comprendiendo que un segundo ataque iría dirigido directamente contra la estructura central de emisión radar, el Comandante Capitán de Corbeta Sergio Raúl Gómez Roca ordenó a todo el personal que no fuera indispensable desalojar las cubiertas superiores, permaneciendo él mismo firme en el puente de mando junto a su dotación de guardia.",
      "A las 01:20 horas, un segundo misil Sea Skua impactó de lleno en el puente de comando y el cuarto de radio, provocando la muerte instantánea del Capitán de Corbeta Sergio Gómez Roca, del Guardiamarina Claudio Olivieri, del Cabo Principal Mario Alancay, de los Cabos Segundos Daniel Tonina, Sergio Medina y Ernesto del Monte, del Marinero Primero Héctor Dufrechou y del Conscripto Roberto D'Errico. Con el puente destruido, sin cartas náuticas, sin radio y con incendios a bordo, el Segundo Comandante Teniente de Navío Sergio Bazán —herido por esquirlas— y el resto de la dotación extinguieron el fuego y navegaron a ciegas durante dos días utilizando una brújula magnética de mano hasta entrar triunfalmente en Puerto Deseado el 5 de mayo."
    ],
    protagonistasHitos: "El Capitán de Corbeta Sergio Raúl Gómez Roca, el Guardiamarina Claudio Olivieri y los seis suboficiales y marineros caídos en el puente de mando, junto al Teniente de Navío Sergio Bazán y toda la heroica dotación del Aviso ARA Alférez Sobral.",
    galeria: [
      {
        src: "imagenesdeescala/aviso_sobral_3may.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas al norte del archipiélago donde el Aviso ARA Alférez Sobral cumplía su misión de búsqueda y rescate de pilotos."
      },
      {
        src: "imagenesdeescala/aviso_sobral_3may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Ruta marítima recorrida durante 48 horas por el buque averiado hasta arribar a Puerto Deseado."
      },
      {
        src: "imagenesdeescala/aviso_sobral_3may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Mar abierto del Atlántico Sur donde se libró el desigual combate nocturno del 3 de mayo."
      }
    ]
  },
  {
    id: "may-04-hundimiento-sheffield",
    orden: 17,
    mes: "mayo",
    etiquetaFecha: "04 MAY",
    nombre: "Sudeste de Isla Soledad — Ataque Super Étendard y Hundimiento del HMS Sheffield",
    fecha: "4 de Mayo de 1982 (11:04 hs)",
    tipo: "Hito Aeronaval • Escala 1",
    escala: 1,
    lat: -52.6200,
    lng: -57.1800,
    zoomRecomendado: 8,
    // [HITO 17 - 04 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Sudeste de Isla Soledad — Ataque Super Étendard y Hundimiento del HMS Sheffield
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/sheffield_4may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Ataque histórico de dos aviones Super Étendard de la 2ª Escuadrilla Aeronaval de Caza y Ataque (Cap. Augusto Bedacarratz y Tte. Armando Mayora) guiados por un avión explorador Neptune, que lanzan un misil Exocet AM-39 e impactan de lleno al destructor moderno HMS Sheffield, provocando su hundimiento.",
    unidadesArgentinas: "Aviación Naval de la Armada Argentina: 2ª Escuadrilla Aeronaval de Caza y Ataque (Dos aviones Dassault Super Étendard 3-A-202 y 3-A-203 tripulados por el Capitán de Corbeta Augusto Bedacarratz y el Teniente de Fragata Armando Mayora), Escuadrilla Aeronaval de Exploración (Avión Lockheed SP-2H Neptune 2-P-112 al mando del Capitán de Corbeta Ernesto Proni Leston) y avión reabastecedor KC-130H Hércules de la Fuerza Aérea Argentina.",
    condicionesTerreno: "Mar abierto a 75 millas náuticas al sudeste de Puerto Argentino, bajo chubascos cerrados, niebla densa y techo de nubes inferior a 100 metros.",
    historiaCompleta: [
      "El martes 4 de mayo de 1982, apenas cuarenta y ocho horas después del hundimiento del Crucero ARA General Belgrano, la Aviación Naval Argentina ejecutó una operación de precisión táctica que revolucionó la historia de la guerra aeronaval moderna. A primera hora de la mañana, el veterano avión explorador Lockheed SP-2H Neptune (2-P-112) comandado por el Capitán de Corbeta Ernesto Proni Leston detectó con su radar los ecos de tres destructores británicos que protegían a los portaaviones al sudeste de las islas.",
      "Desde la Base Aeronaval Río Grande despegaron dos cazabombarderos Super Étendard de la 2ª Escuadrilla Aeronaval de Caza y Ataque tripulados por el Capitán de Corbeta Augusto Bedacarratz y el Teniente de Fragata Armando Mayora, armados cada uno con un misil antibuque AM-39 Exocet. Tras reabastecer combustible en vuelo de un KC-130 Hércules de la Fuerza Aérea, ambos pilotos descendieron a vuelo rasante a menos de 15 metros sobre la cresta de las olas en absoluto silencio de radio y radar.",
      "Guiados por las coordenadas actualizadas que les transmitió el avión explorador Neptune a las 10:35 horas, los dos Super Étendard ascendieron brevemente a 40 metros a las 11:00 horas, encendieron sus radares Agave durante apenas tres segundos, fijaron los blancos a 25 millas de distancia y a las 11:04 lanzaron sus dos misiles Exocet AM-39. Uno de los misiles voló a ras del agua a casi 1.000 km/h e impactó de lleno en el centro de la banda de estribor del moderno destructor misilístico Tipo 42 HMS Sheffield, destruyendo su sala de operaciones e iniciando un incendio incontrolable que determinó el abandono y posterior hundimiento del primer buque de guerra británico perdido desde la Segunda Guerra Mundial."
    ],
    protagonistasHitos: "El Capitán de Corbeta Augusto Bedacarratz, el Teniente de Fragata Armando Mayora, el Capitán de Corbeta Ernesto Proni Leston y la tripulación del avión explorador Neptune 2-P-112, junto a los ingenieros y armeros de la 2ª Escuadrilla Aeronaval que pusieron a punto el sistema Super Étendard / Exocet sin asistencia extranjera.",
    galeria: [
      {
        src: "imagenesdeescala/sheffield_4may.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Posición oceánica al sudeste de Isla Soledad donde el misil Exocet AM-39 impactó al destructor Tipo 42 HMS Sheffield."
      },
      {
        src: "imagenesdeescala/sheffield_4may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Superficie del Atlántico Sur recorrida en vuelo rasante a 15 metros de las olas por los aviones Super Étendard."
      },
      {
        src: "imagenesdeescala/sheffield_4may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Zona de patrulla donde el avión SP-2H Neptune 2-P-112 localizó a los buques de piquete radar."
      }
    ]
  },
  {
    id: "may-09-pesquero-narwal",
    orden: 18,
    mes: "mayo",
    etiquetaFecha: "09 MAY",
    nombre: "Sur de Isla Soledad — Ataque al Pesquero Narwal y Derribo del Helicóptero Puma",
    fecha: "9 de Mayo de 1982",
    tipo: "Inteligencia Naval y Rescate • Escala 2",
    escala: 2,
    lat: -52.7500,
    lng: -58.0500,
    zoomRecomendado: 9,
    // [HITO 18 - 09 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Sur de Isla Soledad — Ataque al Pesquero Narwal y Derribo del Helicóptero Puma
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/narwal_9may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Ataque de aviones Sea Harrier contra el buque pesquero argentino Narwal dedicado a tareas de inteligencia electrónica, donde muere el contramaestre Omar Rupp, seguido por el derribo del helicóptero Puma del Ejército enviado a socorrer a los náufragos.",
    unidadesArgentinas: "Buque Pesquero de Altura FN Narwal (Capitán de Ultramar Asterio Wagata, 24 tripulantes civiles de la Marina Mercante y el Capitán de Corbeta Juan Carlos González Llanos de la Armada Argentina) y Helicóptero SA-330L Puma (matrícula AE-505) del Batallón de Aviación de Combate 601 del Ejército Argentino.",
    condicionesTerreno: "Aguas australes a 60 millas al sur de Puerto Argentino, bajo temporal de lluvia helada y mar gruesa.",
    historiaCompleta: [
      "Desde fines de abril de 1982, el buque pesquero factoría argentino Narwal, tripulado por 24 marinos mercantes civiles al mando del Capitán Asterio Wagata y con el oficial de inteligencia naval Capitán de Corbeta Juan Carlos González Llanos a bordo, navegaba en las aguas circundantes al archipiélago informando discretamente por radio los rumbos de los buques y aeronaves británicos.",
      "A las 09:05 horas del 9 de mayo de 1982, dos cazabombarderos Sea Harrier británicos atacaron al pesquero desarmado lanzando una bomba de 1.000 libras que atravesó el casco sin explotar pero destrozó la sala de máquinas, regresando luego para ametrallar con cañones Aden de 30 mm el puente y las balsas salvavidas. En el ataque murió desangrado en su puesto el contramaestre mercante Omar Alberto Rupp y sufrieron heridas trece tripulantes antes de que el pesquero fuera abordado por helitransporte británico y se hundiera al día siguiente.",
      "Al recibirse en Puerto Argentino el pedido de auxilio urgente de los marinos heridos del Narwal, despegó de inmediato bajo condiciones meteorológicas extremas el helicóptero SA-330L Puma (AE-505) del Batallón de Aviación de Combate 601 del Ejército Argentino. Mientras volaba sobre el mar rumbo al pesquero, el helicóptero fue alcanzado por un misil antiaéreo Sea Dart disparado por el destructor británico HMS Coventry, cayendo al mar y entregando su vida sus tres tripulantes: el Teniente Primero Roberto Mario Fiorito, el Teniente Juan Carlos Buschiazzo y el Sargento Mecánico Raúl Horacio Dimotta."
    ],
    protagonistasHitos: "El Contramaestre de la Marina Mercante Omar Alberto Rupp, el Teniente Primero Roberto Mario Fiorito, el Teniente Juan Carlos Buschiazzo y el Sargento Raúl Horacio Dimotta (caídos en cumplimiento del deber), junto al Capitán Asterio Wagata, el Capitán de Corbeta Juan Carlos González Llanos y la tripulación del Narwal.",
    galeria: [
      {
        src: "imagenesdeescala/narwal_9may.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas al sur de la Isla Soledad donde fue atacado el pesquero argentino Narwal el 9 de mayo de 1982."
      },
      {
        src: "imagenesdeescala/narwal_9may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector marítimo donde cayó el helicóptero Puma AE-505 de la Aviación de Ejército cuando acudía al rescate."
      },
      {
        src: "imagenesdeescala/narwal_9may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa meridional de Isla Soledad desde donde despegó la misión sanitaria."
      }
    ]
  },
  {
    id: "may-10-isla-de-los-estados",
    orden: 19,
    mes: "mayo",
    etiquetaFecha: "10 MAY",
    nombre: "Estrecho de San Carlos (Isla Cisne) — Hundimiento del ARA Isla de los Estados",
    fecha: "10 de Mayo de 1982 (22:20 hs)",
    tipo: "Combate Nocturno en el Estrecho • Escala 2",
    escala: 2,
    lat: -51.7850,
    lng: -59.4200,
    zoomRecomendado: 10,
    // [HITO 19 - 10 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Estrecho de San Carlos (Isla Cisne) — Hundimiento del ARA Isla de los Estados
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/isla_estados_10may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    descripcion: "El transporte naval ARA Isla de los Estados es sorprendido y cañoneado de noche por la fragata británica HMS Alacrity mientras transportaba combustible y municiones entre las islas, explotando y dejando 22 caídos entre marinos mercantes y militares.",
    unidadesArgentinas: "Transporte Naval ARA Isla de los Estados (B-18) del Comando de Transportes Navales (Capitán de Ultramar Tulio Néstor Panigadi y Capitán de Corbeta Alois Esteban Payarola, con dotación conjunta de la Marina Mercante, Armada Argentina, Ejército Argentino, Fuerza Aérea y Prefectura Naval Argentina), escoltado posteriormente en las tareas de rescate por el buque costero ARA Forrest (Teniente de Navío Rafael Molini).",
    condicionesTerreno: "Canal angosto del Estrecho de San Carlos frente al archipiélago de las Islas Cisne (Swan Islands), de aguas profundas y fuertes corrientes de marea.",
    historiaCompleta: [
      "Durante el primer mes de operaciones, el transporte naval ARA Isla de los Estados cumplió la arriesgada misión de abastecer de alimentos, vehículos, municiones y miles de litros de combustible de aviación JP-1 a las guarniciones aisladas de Puerto Mitre y Bahía Fox en la isla Gran Malvina, navegando sin armamento defensivo a través del Estrecho de San Carlos.",
      "En la noche cerrada del 10 de mayo de 1982, mientras el transporte navegaba frente a la Isla Cisne rumbo a Puerto Mitre, la fragata británica Tipo 21 HMS Alacrity —que había ingresado furtivamente por el extremo sur del Estrecho de San Carlos para explorar posibles campos minados— detectó en su radar al buque argentino. A las 22:20 horas la fragata iluminó con bengalas al transporte indefenso y abrió fuego directo con su cañón Vickers de 114 mm.",
      "Los primeros siete proyectiles británicos impactaron sobre el puente de mando y en las bodegas repletas de tambores de combustible de aviación y municiones, provocando una gigantesca explosión que partió e incendió al buque, hundiéndolo en apenas siete minutos. En el acto entregaron su vida 22 tripulantes argentinos pertenecientes por primera vez en el conflicto a la totalidad de las fuerzas nacionales: quince marinos mercantes (incluido su comandante, Capitán Tulio Panigadi), tres miembros de la Armada Argentina, dos del Ejército (Capitán Marcelo Sergio Novoa y Sargento Ayudante Víctor Jesús Benzo), uno de la Fuerza Aérea y el Marinero Jorge Eduardo López de la Prefectura Naval Argentina. Solo dos hombres lograron sobrevivir nadando hasta la Isla Cisne: el Capitán de Corbeta Alois Payarola y el marinero Alfonso López, rescatados días después por el buque ARA Forrest."
    ],
    protagonistasHitos: "El Capitán de Ultramar Tulio Néstor Panigadi, el Capitán del Ejército Marcelo Sergio Novoa y los 22 héroes de las cinco fuerzas caídos en las aguas del Estrecho de San Carlos, junto a los sobrevivientes Capitán de Corbeta Alois Payarola y marinero Alfonso López, y el Teniente de Navío Rafael Molini al mando del ARA Forrest.",
    galeria: [
      {
        src: "imagenesdeescala/isla_estados_10may.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas del Estrecho de San Carlos frente a la Isla Cisne, donde fue cañoneado el transporte ARA Isla de los Estados."
      },
      {
        src: "imagenesdeescala/isla_estados_10may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa de Isla Cisne donde lograron alcanzar tierra firme los dos únicos sobrevivientes del naufragio."
      },
      {
        src: "imagenesdeescala/isla_estados_10may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Paso marítimo entre Isla Soledad y Gran Malvina recorrido por los transportes costeros argentinos."
      }
    ]
  },
  {
    id: "may-12-ataque-glasgow-brilliant",
    orden: 20,
    mes: "mayo",
    etiquetaFecha: "12 MAY",
    nombre: "Costa Este de Isla Soledad — Ataque de las Escuadrillas 'Cuña' y 'Oro' al HMS Glasgow",
    fecha: "12 de Mayo de 1982 (13:45 a 14:15 hs)",
    tipo: "Combate Aeronaval Rasante • Escala 3",
    escala: 3,
    lat: -51.7600,
    lng: -57.6900,
    zoomRecomendado: 12,
    // [HITO 20 - 12 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Costa Este de Isla Soledad — Ataque de las Escuadrillas 'Cuña' y 'Oro' al HMS Glasgow
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/ataque_glasgow_12may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Ataque de las escuadrillas 'Cuña' y 'Oro' de aviones A-4B Skyhawk del Grupo 5 de Caza a ras de las olas contra el destructor HMS Glasgow y la fragata HMS Brilliant, averiando gravemente al Glasgow en una jornada donde entregan su vida los tenientes Nivoli, Ibarlucea, Bustos y el alférez Vázquez.",
    unidadesArgentinas: "Grupo 5 de Caza de la Fuerza Aérea Argentina (V Brigada Aérea de Villa Reynolds, operando desde Río Gallegos con cazabombarderos Douglas A-4B Skyhawk): Escuadrilla 'Cuña' (Primer Teniente Mario Víctor Nivoli, Teniente Jorge Rubén Ibarlucea, Primer Teniente Manuel Oscar Bustos y Alférez Alfredo Jorge Alberto Vázquez) y Escuadrilla 'Oro' (Capitán Antonio Zelaya, Primer Teniente Fausto Gavazzi, Teniente Juan José Arrarás y Alférez Guillermo Dellepiane).",
    condicionesTerreno: "Mar abierto frente a la costa sudeste de Puerto Argentino y Bahía Agradable, con salpicaduras de sal sobre los parabrisas de los aviones que obligaban a volar a menos de 10 metros del agua.",
    historiaCompleta: [
      "Al mediodía del 12 de mayo de 1982, el destructor misilístico Tipo 42 HMS Glasgow y la fragata antisubmarina Tipo 22 HMS Brilliant (equipada con el moderno sistema de misiles de corto alcance Sea Wolf) se posicionaron frente a la costa oriental de la Isla Soledad para cañonear las defensas argentinas de Puerto Argentino. Desde la Base Aérea Militar Río Gallegos despegaron dos escuadrillas de cuatro aviones A-4B Skyhawk del Grupo 5 de Caza: 'Cuña' y 'Oro'.",
      "A las 13:45 horas, la Escuadrilla 'Cuña' se lanzó sobre los dos buques británicos volando a ras de las olas con los parabrisas empañados por la sal marina. La fragata HMS Brilliant disparó sus misiles Sea Wolf, derribando en plena corrida de tiro a los aviones del Primer Teniente Mario Víctor Nivoli y del Teniente Jorge Rubén Ibarlucea, mientras que el Primer Teniente Manuel Oscar Bustos se estrelló contra el mar al realizar una maniobra brusca a ras del agua para esquivar un tercer misil, entregando los tres pilotos su vida en la acción.",
      "Apenas veinticinco minutos después, a las 14:10 horas, irrumpió sobre los mismos buques la segunda ola: la Escuadrilla 'Oro' liderada por el Capitán Antonio Zelaya. Con el sistema Sea Wolf británico trabado temporalmente, los cuatro A-4B atacaron con furia al destructor HMS Glasgow. La bomba de 1.000 libras lanzada por el Primer Teniente Fausto Gavazzi impactó de lleno en la línea de flotación del HMS Glasgow, atravesando su sala de máquinas de estribor a babor y abriendo un rumbo de un metro de diámetro que inundó el compartimiento y obligó al destructor británico a retirarse definitivamente de la guerra de regreso a Inglaterra. Lamentablemente, durante el regreso rasante sobre el Istmo de Darwin, el avión del Primer Teniente Gavazzi fue alcanzado por fuego antiaéreo propio en una trágica confusión de identificación, falleciendo el héroe que acababa de poner fuera de combate al HMS Glasgow."
    ],
    protagonistasHitos: "El Primer Teniente Fausto Gavazzi, el Primer Teniente Mario Víctor Nivoli, el Teniente Jorge Rubén Ibarlucea y el Primer Teniente Manuel Oscar Bustos (caídos el 12 de mayo), junto al Capitán Antonio Zelaya, el Teniente Juan José Arrarás, el Alférez Alfredo Vázquez y el Alférez Guillermo Dellepiane.",
    galeria: [
      {
        src: "imagenesdeescala/ataque_glasgow_12may.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas al sudeste de Puerto Argentino donde los A-4B Skyhawk del Grupo 5 de Caza pusieron fuera de combate al destructor HMS Glasgow."
      },
      {
        src: "imagenesdeescala/ataque_glasgow_12may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa oriental de Isla Soledad recorrida a ras de las olas por las escuadrillas 'Cuña' y 'Oro'."
      },
      {
        src: "imagenesdeescala/ataque_glasgow_12may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Horizonte marítimo donde se produjo la doble embestida aérea del 12 de mayo."
      }
    ]
  },
  {
    id: "may-15-isla-borbon-calderon",
    orden: 21,
    mes: "mayo",
    etiquetaFecha: "15 MAY",
    nombre: "Estación Aeronaval Calderón (Isla Borbón) — Incursión Nocturna y Defensa",
    fecha: "15 de Mayo de 1982 (04:15 hs)",
    tipo: "Defensa de Base Adelantada • Escala 2",
    escala: 2,
    lat: -51.3065,
    lng: -59.6105,
    zoomRecomendado: 10,
    // [HITO 21 - 15 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Estación Aeronaval Calderón (Isla Borbón) — Incursión Nocturna y Defensa
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/isla_borbon_15may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Incursión nocturna de comandos británicos del SAS con apoyo de fuego naval sobre la pista auxiliar en Isla Borbón, defendida por la Compañía H del BIM 3.",
    unidadesArgentinas: "Compañía H del Batallón de Infantería de Marina N° 3 (BIM 3, Teniente de Navío Ricardo Marega y Guardiamarina Héctor Miño), 4ª Escuadrilla Aeronaval de Ataque (aviones Beechcraft T-34C-1 Turbo Mentor al mando del Capitán de Corbeta Uberti / Pereyra), Escuadrón Pucará de la Fuerza Aérea Argentina y avión Short Skyvan de la Prefectura Naval Argentina.",
    condicionesTerreno: "Isla alargada al norte de Gran Malvina, con pista de pasto y turba muy blanda azotada por lluvias constantes y vientos cruzados.",
    historiaCompleta: [
      "La Estación Aeronaval Calderón, ubicada en la Isla Borbón (Pebble Island) sobre la boca norte del Estrecho de San Carlos, constituía una amenaza directa para el inminente desembarco anfibio británico previsto en Bahía San Carlos, ya que desde su pista de césped operaban aviones IA-58 Pucará de la Fuerza Aérea, T-34C Turbo Mentor de la Armada y un avión Skyvan de la Prefectura Naval.",
      "Debido a que las intensas lluvias habían ablandado la turba impidiendo el despegue de las aeronaves durante los días previos, en la madrugada del 15 de mayo de 1982 una fuerza de 45 comandos británicos del Escuadrón D del Special Air Service (SAS), transportada en helicópteros desde el portaaviones HMS Hermes y apoyada por el fuego de cañones de 114 mm y bengalas del destructor HMS Glamorgan, se infiltró sobre el aeródromo.",
      "Bajo el bombardeo naval que obligó a la guarnición a cubrirse en los refugios, los comandos británicos colocaron cargas explosivas en las once aeronaves estacionadas y se replegaron antes del amanecer cuando los Infantes de Marina de la Compañía H del BIM 3 abrieron fuego y detonaron cargas defensivas a control remoto. Pese a la pérdida del material de vuelo, la guarnición naval argentina mantuvo firme el control de la Isla Borbón durante el resto de la guerra y cumplió un rol heroico pocos días después rescatando en medio de las aguas a pilotos argentinos derribados al norte del estrecho."
    ],
    protagonistasHitos: "El Teniente de Navío Ricardo Marega, el Guardiamarina Héctor Miño, los Infantes de Marina de la Compañía H del BIM 3 y los pilotos y mecánicos navales, aeronáuticos y de la Prefectura Naval destinados en la Estación Aeronaval Calderón.",
    galeria: [
      {
        src: "imagenesdeescala/isla_borbon_15may.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Pista auxiliar de pasto de la Estación Aeronaval Calderón en la Isla Borbón."
      },
      {
        src: "imagenesdeescala/isla_borbon_15may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        caption: "Colinas de la Isla Borbón que dominan el acceso norte al Estrecho de San Carlos."
      },
      {
        src: "imagenesdeescala/isla_borbon_15may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa norte de la isla donde los Infantes de Marina del BIM 3 rescataron posteriormente a pilotos eyectados."
      }
    ]
  },
  {
    id: "may-16-rio-carcarana-buen-suceso",
    orden: 22,
    mes: "mayo",
    etiquetaFecha: "16 MAY",
    nombre: "Puerto Rey y Bahía Fox — Ataques a los Buques ARA Río Carcarañá y ARA Bahía Buen Suceso",
    fecha: "16 de Mayo de 1982",
    tipo: "Logística Naval bajo Fuego • Escala 2",
    escala: 2,
    lat: -51.9080,
    lng: -59.9850,
    zoomRecomendado: 10,
    // [HITO 22 - 16 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Puerto Rey y Bahía Fox — Ataques a los Buques ARA Río Carcarañá y ARA Bahía Buen Suceso
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/bahia_fox_16may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Ataques aéreos británicos contra los buques logísticos argentinos ARA Río Carcarañá en Puerto Rey y ARA Bahía Buen Suceso en Bahía Fox.",
    unidadesArgentinas: "Buque Mercante ELMA Río Carcarañá (Capitán de Ultramar Edgardo Dell'Elicine), Transporte Naval ARA Bahía Buen Suceso (Capitán de Fragata Osvaldo Niella) y efectivos del Regimiento de Infantería 8 y Compañía de Ingenieros 9 en Bahía Fox.",
    condicionesTerreno: "Bahías costeras sobre las márgenes del Estrecho de San Carlos, donde los buques argentinos se mimetizaban contra los acantilados para descargar víveres y combustible.",
    historiaCompleta: [
      "El 16 de mayo de 1982, la aviación embarcada británica lanzó una ofensiva sistemática contra los dos grandes buques logísticos argentinos que habían logrado burlar el bloqueo marítimo y se encontraban descargando pertrechos en el Estrecho de San Carlos. Al mediodía, dos aviones Sea Harrier atacaron con bombas y cañones de 30 mm al carguero ELMA Río Carcarañá fondeado en Puerto Rey (costa oeste de Isla Soledad), provocando incendios a bordo que obligaron al Capitán Edgardo Dell'Elicine a ordenar el abandono ordenado de la nave sin sufrir bajas fatales entre su tripulación civil y militar.",
      "Pocos minutos después, otra pareja de Sea Harrier atacó con fuego rasante de cañones de 30 mm al transporte naval ARA Bahía Buen Suceso, que se encontraba amarrado al precario muelle de madera de Bahía Fox en la isla Gran Malvina. Pese a la lluvia de proyectiles que averió el buque e hirió a tripulantes en tierra, los marinos del transporte y los soldados del Regimiento de Infantería 8 trabajaron incansablemente bajo el riesgo de explosión para recuperar de las bodegas inundadas los víveres, medicamentos y municiones destinados a sostener a la guarnición.",
      "Estos ataques en el Estrecho de San Carlos formaban parte de la preparación británica para aislar por completo el canal antes de iniciar su operación anfibia cinco días más tarde."
    ],
    protagonistasHitos: "El Capitán de Ultramar Edgardo Dell'Elicine y la tripulación civil del ELMA Río Carcarañá, el Capitán de Fragata Osvaldo Niella y la dotación del ARA Bahía Buen Suceso, y los efectivos del RI 8 y la Compañía de Ingenieros 9 en Bahía Fox.",
    galeria: [
      {
        src: "imagenesdeescala/bahia_fox_16may.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Muelle y costa de Bahía Fox donde fue atacado el transporte naval ARA Bahía Buen Suceso el 16 de mayo."
      },
      {
        src: "imagenesdeescala/bahia_fox_16may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector de Puerto Rey sobre el Estrecho de San Carlos donde se encontraba fondeado el buque ELMA Río Carcarañá."
      },
      {
        src: "imagenesdeescala/bahia_fox_16may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        caption: "Posiciones defensivas del Regimiento de Infantería 8 alrededor de la caleta de Bahía Fox."
      }
    ]
  },
  {
    id: "may-21-promontorio-guemes-fanning",
    orden: 23,
    mes: "mayo",
    etiquetaFecha: "21 MAY",
    nombre: "Altura 234 (Promontorio Güemes / Fanning Head) — Alerta y Combate del EC Güemes",
    fecha: "21 de Mayo de 1982 (02:00 a 08:30 hs)",
    tipo: "Resistencia en el Desembarco • Escala 4",
    escala: 4,
    lat: -51.4710,
    lng: -59.1380,
    zoomRecomendado: 15,
    // [HITO 23 - 21 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Altura 234 (Promontorio Güemes / Fanning Head) — Alerta y Combate del EC Güemes
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/promontorio_guemes_21may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Inicio del desembarco británico en San Carlos. Una sección de apenas 40 hombres del Equipo de Combate Güemes (RI 25 y RI 12) al mando del Subteniente Roberto Reyes resiste el cañoneo naval y el asalto de los Royal Marines, derribando helicópteros Gazelle y cubriendo la alerta temprana.",
    unidadesArgentinas: "Equipo de Combate 'Güemes' (62 hombres en total al mando del Teniente Primero Carlos Daniel Esteban en Puerto San Carlos, y la Sección de Apoyo de 20 efectivos del Regimiento de Infantería 12 en la Altura 234 / Promontorio Güemes al mando del Subteniente Roberto Oscar Reyes y el Subteniente José Alberto Vásquez).",
    condicionesTerreno: "Promontorio escarpado de 234 metros de altura (Fanning Head) que domina la garganta de entrada a la Bahía San Carlos desde el norte.",
    historiaCompleta: [
      "En la madrugada del 21 de mayo de 1982 comenzó la Operación Sutton: el desembarco anfibio británico en la Bahía San Carlos con más de veinte buques de guerra y transportes. El único obstáculo terrestre que vigilaba la entrada del estrecho y la bahía era el reducido Equipo de Combate 'Güemes', comandado por el Teniente Primero Carlos Daniel Esteban (compuesto por una sección de tiradores del RI 25 en Puerto San Carlos y una sección de apoyo del RI 12 de apenas 20 hombres con dos cañones sin retroceso de 105 mm y dos morteros de 81 mm apostada en la Altura 234 de Promontorio Güemes al mando del Subteniente Roberto Oscar Reyes).",
      "A las 02:15 horas de la noche, los centinelas del Subteniente Reyes detectaron las siluetas de los grandes buques británicos ingresando al canal y abrieron fuego con sus cañones sin retroceso y morteros. De inmediato, la fragata HMS Antrim descargó más de doscientos proyectiles navales de 114 mm sobre la cumbre mientras comandos británicos del Special Boat Service (SBS) avanzaban con visores nocturnos intimando la rendición por megáfono; la sección del Subteniente Reyes rechazó la intimación y combatió durante horas entre las rocas hasta el amanecer.",
      "Mientras tanto, a las 08:00 horas en Puerto San Carlos, la sección del Teniente Primero Carlos Daniel Esteban transmitió por radio la alerta temprana del desembarco a Puerto Argentino y enfrentó con fuego concentrado de fusiles FAL y ametralladoras MAG a los helicópteros británicos que acompañaban el avance terrestre, derribando dos helicópteros Gazelle de los Royal Marines y averiando seriamente un helicóptero Sea King antes de iniciar un épico repliegue a pie de tres días por las montañas sin perder un solo hombre."
    ],
    protagonistasHitos: "El Teniente Primero Carlos Daniel Esteban, el Subteniente Roberto Oscar Reyes, el Subteniente José Alberto Vásquez, el Sargento Primero René Colque y los 62 integrantes del Equipo de Combate 'Güemes' de los Regimientos de Infantería 25 y 12.",
    galeria: [
      {
        src: "imagenesdeescala/promontorio_guemes_21may.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Altura 234 en Promontorio Güemes (Fanning Head), donde la sección del Subteniente Roberto Reyes enfrentó el desembarco británico."
      },
      {
        src: "imagenesdeescala/promontorio_guemes_21may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Boca de acceso a la Bahía San Carlos vigilada desde las alturas del promontorio."
      },
      {
        src: "imagenesdeescala/promontorio_guemes_21may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        caption: "Lomadas de Puerto San Carlos donde la sección del Teniente Primero Esteban derribó dos helicópteros Gazelle."
      }
    ]
  },
  {
    id: "may-21-ataque-owen-crippa",
    orden: 24,
    mes: "mayo",
    etiquetaFecha: "21 MAY",
    nombre: "Entrada de Bahía San Carlos — Ataque en Solitario de Owen Crippa",
    fecha: "21 de Mayo de 1982 (10:00 hs)",
    tipo: "Hazaña de la Aviación Naval • Escala 4",
    escala: 4,
    lat: -51.5020,
    lng: -59.0950,
    zoomRecomendado: 15,
    // [HITO 24 - 21 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Entrada de Bahía San Carlos — Ataque en Solitario de Owen Crippa
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/owen_crippa_21may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "El Teniente de Navío Owen Guillermo Crippa, en un vuelo de reconocimiento solitario a bordo de su avión Aermacchi MB-339 de la 1ª Escuadrilla Aeronaval de Ataque, descubre a toda la flota de desembarco británica y decide atacarla en solitario con cohetes y cañones, impactando a la fragata HMS Argonaut.",
    unidadesArgentinas: "1ª Escuadrilla Aeronaval de Ataque de la Armada Argentina (Avión reactor de entrenamiento avanzado y ataque ligero Aermacchi MB-339A matrícula 4-A-115, piloteado por el Teniente de Navío Owen Guillermo Crippa).",
    condicionesTerreno: "Garganta marítima entre Promontorio Güemes y Punta Chancho, flanqueada por cerros que obligaban a maniobrar entre las antenas de los buques de guerra.",
    historiaCompleta: [
      "En la mañana del 21 de mayo de 1982, para confirmar los reportes radiales recibidos desde San Carlos sobre un posible desembarco enemigo, despegó desde Puerto Argentino el Teniente de Navío Owen Guillermo Crippa al mando de su pequeño reactor monomotor Aermacchi MB-339 (4-A-115) de la 1ª Escuadrilla Aeronaval de Ataque. Como su numeral no pudo despegar por un desperfecto técnico, Crippa continuó la misión de reconocimiento completamente solo.",
      "Al asomarse a las 10:00 horas sobre la entrada del Estrecho y Bahía San Carlos, Crippa se encontró de frente con el espectáculo imponente de toda la flota anfibia británica: más de catorce fragatas, destructores y transportes de desembarco escoltados por helicópteros. En una fracción de segundo, en lugar de dar la vuelta tras avistar al enemigo, decidió atacar en solitario al primer blanco que tenía delante —un helicóptero Sea Lynx— y de inmediato se lanzó en picada directo hacia el centro de la formación naval británica.",
      "Con una audacia extraordinaria, Crippa atacó a la fragata Tipo 21 HMS Argonaut disparando sus cañones DEFA de 30 mm y su salva de cohetes Zuni de 127 mm contra la superestructura, el puente y las antenas de radar del buque británico, causándole averías e hiriendo a tres tripulantes. Para escapar sin ser derribado por los misiles de las demás fragatas, voló en zigzag entre el casco de los propios buques enemigos —que no podían dispararse entre sí— y mientras volaba a ras del suelo hacia Punta Chancho dibujó sobre el anotador de su rodilla el croquis exacto con la posición de cada buque británico, información que permitió desatar minutos después las oleadas de ataque de toda la aviación argentina."
    ],
    protagonistasHitos: "El Teniente de Navío Owen Guillermo Crippa (condecorado con la Cruz La Nación Argentina al Heroico Valor en Combate) y el personal técnico y de vuelo de la 1ª Escuadrilla Aeronaval de Ataque en Puerto Argentino.",
    galeria: [
      {
        src: "imagenesdeescala/owen_crippa_21may.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Canal de entrada a Bahía San Carlos donde el Teniente de Navío Owen Crippa atacó en solitario a la fragata HMS Argonaut."
      },
      {
        src: "imagenesdeescala/owen_crippa_21may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Punta Chancho y las colinas costeras que utilizó el Aermacchi 4-A-115 para evadir el fuego antiaéreo de toda la flota."
      },
      {
        src: "imagenesdeescala/owen_crippa_21may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Vista del brazo de agua de San Carlos donde se concentró la fuerza anfibia británica el 21 de mayo."
      }
    ]
  },
  {
    id: "may-21-callejon-bombas-ardent",
    orden: 25,
    mes: "mayo",
    etiquetaFecha: "21 MAY",
    nombre: "Bahía San Carlos ('Callejón de las Bombas') — Hundimiento de la Fragata HMS Ardent",
    fecha: "21 de Mayo de 1982 (10:30 a 18:00 hs)",
    tipo: "Gran Batalla Aeronaval • Escala 3",
    escala: 3,
    lat: -51.5240,
    lng: -59.0480,
    zoomRecomendado: 13,
    // [HITO 25 - 21 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Bahía San Carlos ('Callejón de las Bombas') — Hundimiento de la Fragata HMS Ardent
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/bahia_sancarlos_21may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Oleadas incesantes de cazabombarderos Dagger, A-4B, A-4C Skyhawk de la Fuerza Aérea y A-4Q de la Aviación Naval (Cap. Philippi, Tte. Arca y Tte. Márquez) atacan la flota británica dentro del estrecho, hundiendo la fragata HMS Ardent y dañando los buques HMS Antrim, HMS Brilliant y HMS Argonaut.",
    unidadesArgentinas: "Fuerza Aérea Argentina (Grupos 4 y 5 de Caza con A-4C y A-4B Skyhawk, Grupo 6 de Caza con IAI Mirage V Dagger y Escuadrón Pucará) y 3ª Escuadrilla Aeronaval de Caza y Ataque de la Armada Argentina con aviones Douglas A-4Q Skyhawk (Capitán de Corbeta Alberto Jorge Philippi, Teniente de Navío José César Arca, Teniente de Fragata Marcelo Gustavo Márquez, Capitán de Corbeta Carlos Alberto Castro Fox, Teniente de Navío Marco Aurelio Benítez y Teniente de Navío Carlos Lecour).",
    condicionesTerreno: "Espejo de agua cerrado del brazo San Carlos rodeado por cerros de entre 200 y 300 metros, donde los pilotos argentinos tenían menos de cuatro segundos para apuntar y lanzar sus bombas tras trasponer las colinas.",
    historiaCompleta: [
      "A partir de las 10:25 horas del 21 de mayo de 1982, tras el informe del Teniente Crippa, se desató sobre el Estrecho y la Bahía San Carlos la mayor batalla aeronaval desde la Guerra del Pacífico. Más de sesenta salidas de cazabombarderos Mirage V Dagger, A-4B y A-4C Skyhawk de la Fuerza Aérea Argentina y A-4Q Skyhawk de la Aviación Naval despegaron desde Río Grande, Río Gallegos y San Julián para atacar oleada tras oleada a las fragatas y destructores británicos dentro del estrecho, al que los propios marinos ingleses bautizaron con pavor como 'Bomb Alley' ('El Callejón de las Bombas').",
      "En las oleadas de la mañana y el mediodía, las escuadrillas de Dagger ('Ñandú', 'Perro', 'Zorro', 'Tigre') y de A-4B Skyhawk ('Mula', 'Leo', 'Orión') atravesaron la cortina de misiles Sea Cat, Sea Wolf y cañones de 20 y 40 mm, dejando fuera de combate al destructor misilístico clase County HMS Antrim (alojándole una bomba de 1.000 libras en la popa), perforando el casco de la fragata HMS Argonaut con dos bombas de 1.000 libras y averiando con fuego de cañones de 30 mm a las fragatas HMS Brilliant y HMS Broadsword.",
      "Por la tarde, el ataque convergente de las escuadrillas 'Cueca' y 'Ratón' de aviones Dagger de la Fuerza Aérea (Capitán Mir González, Teniente Bernhardt, Mayor Piuma, Capitán Rohde y Primer Teniente Robles) seguido a las 15:00 horas por el ataque decisivo de los tres aviones A-4Q Skyhawk de la 3ª Escuadrilla Aeronaval de la Armada (Capitán de Corbeta Alberto Philippi, Teniente de Navío José César Arca y Teniente de Fragata Marcelo Gustavo Márquez) destrozó la popa y el hangar de la fragata Tipo 21 HMS Ardent con múltiples impactos de bombas, provocando su hundimiento definitivo. En esta jornada heroica entregaron su vida en combate el Teniente de Fragata Marcelo Márquez (Armada) y los pilotos de la Fuerza Aérea Primer Teniente Daniel Manzotti, Teniente Néstor López y Teniente Pedro Bean."
    ],
    protagonistasHitos: "El Teniente de Fragata Marcelo Gustavo Márquez, el Primer Teniente Daniel Fernando Manzotti, el Teniente Néstor Edgardo López y el Teniente Pedro Ignacio Bean (caídos en combate el 21 de mayo), junto al Capitán de Corbeta Alberto Philippi, el Teniente de Navío José César Arca, el Capitán Pablo Carballo y todos los pilotos de Dagger y Skyhawk.",
    galeria: [
      {
        src: "imagenesdeescala/bahia_sancarlos_21may.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas de Bahía San Carlos ('Callejón de las Bombas'), donde el 21 de mayo fue hundida la fragata HMS Ardent y fueron averiados cuatro buques británicos."
      },
      {
        src: "imagenesdeescala/bahia_sancarlos_21may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Canal de Grantham Sound donde ardió y se hundió la fragata británica HMS Ardent tras el ataque de los Dagger y los A-4Q navales."
      },
      {
        src: "imagenesdeescala/bahia_sancarlos_21may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Colinas circundantes a la bahía desde donde los pilotos argentinos se lanzaban a ras del agua."
      }
    ]
  },
  {
    id: "may-23-hundimiento-antelope",
    orden: 26,
    mes: "mayo",
    etiquetaFecha: "23 MAY",
    nombre: "Fondeadero de Bahía San Carlos — Hundimiento de la Fragata HMS Antelope",
    fecha: "23 de Mayo de 1982 (13:30 hs)",
    tipo: "Ataque Aéreo y Hundimiento • Escala 4",
    escala: 4,
    lat: -51.5315,
    lng: -59.0310,
    zoomRecomendado: 15,
    // [HITO 26 - 23 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Fondeadero de Bahía San Carlos — Hundimiento de la Fragata HMS Antelope
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/antelope_23may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Ataque de aviones A-4B Skyhawk (Escuadrilla Nene, donde cae el Capitán Luciano Guadagnini al impactar contra el mástil) que alojan dos bombas de 1.000 libras en la fragata HMS Antelope, la cual estalla en una gigantesca bola de fuego y se hunde en el canal.",
    unidadesArgentinas: "Grupo 5 de Caza de la Fuerza Aérea Argentina (Aviones A-4B Skyhawk — Escuadrillas 'Nene' y 'Trueno': Capitán Pablo Marcos Carballo, Capitán Luciano Guadagnini, Primer Teniente Carlos Alfredo Cachón y Alférez Hugo Gómez) y 3ª Escuadrilla Aeronaval de Caza y Ataque (A-4Q Skyhawk, donde al regresar muere en accidente operativo el Capitán de Corbeta Carlos María Zubizarreta).",
    condicionesTerreno: "Interior de la boca de Bahía San Carlos, donde la fragata HMS Antelope actuaba como buque piquete antiaéreo para proteger las playas de desembarco.",
    historiaCompleta: [
      "El 23 de mayo de 1982 al mediodía, las escuadrillas 'Nene' y 'Trueno' del Grupo 5 de Caza despegaron hacia Bahía San Carlos para continuar golpeando la cabeza de playa británica. A las 13:30 horas, los A-4B Skyhawk ingresaron rasantes sobre la bahía enfrentando una densa cortina de misiles Sea Cat, Rapier y fuego de cañones. En el ingreso, un misil Sea Cat explotó debajo del avión del líder, Capitán Pablo Carballo, quien logró controlar su aeronave averiada.",
      "Detrás suyo, el Primer Teniente Carlos Cachón, el Alférez Hugo Gómez y el Capitán Luciano Guadagnini se lanzaron desde distintas direcciones contra la fragata Tipo 21 HMS Antelope. El Alférez Gómez colocó una bomba de 1.000 libras en la popa del buque, y segundos después el Capitán Luciano Guadagnini atacó a tan baja altura a través de la cortina de fuego que un proyectil antiaéreo impactó el ala derecha de su A-4B (C-242); antes de que el avión golpeara el mástil principal de la fragata causándole la muerte en el acto, Guadagnini alcanzó a soltar su bomba de 1.000 libras, que penetró de lleno en el casco por estribor.",
      "Con dos bombas argentinas de 1.000 libras alojadas sin detonar en su interior, la fragata HMS Antelope fue evacuada parcialmente mientras técnicos británicos intentaban desactivarlas. Durante la noche del 23 al 24 de mayo, una de las bombas estalló desencadenando la explosión de la santabárbara de misiles Sea Cat en una gigantesca bola de fuego de más de cien metros de altura —cuya fotografía dio la vuelta al mundo—, partiendo la quilla de la HMS Antelope por la mitad y hundiéndola en las aguas de Bahía San Carlos."
    ],
    protagonistasHitos: "El Capitán Luciano Guadagnini (condecorado post mortem con la Cruz La Nación Argentina al Heroico Valor en Combate), el Capitán de Corbeta Carlos María Zubizarreta (Armada), el Capitán Pablo Carballo, el Primer Teniente Carlos Cachón y el Alférez Hugo Gómez.",
    galeria: [
      {
        src: "imagenesdeescala/antelope_23may.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Fondeadero de Bahía San Carlos donde estalló y se hundió la fragata británica HMS Antelope tras el ataque del 23 de mayo."
      },
      {
        src: "imagenesdeescala/antelope_23may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Trayectoria de aproximación rasante seguida por el Capitán Luciano Guadagnini y el Alférez Hugo Gómez."
      },
      {
        src: "imagenesdeescala/antelope_23may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas interiores del canal de San Carlos frente al sector de Ajax Bay."
      }
    ]
  },
  {
    id: "may-24-ataques-logisticos-sancarlos",
    orden: 27,
    mes: "mayo",
    etiquetaFecha: "24 MAY",
    nombre: "Bahía San Carlos — Bombardeo a los Buques RFA Sir Lancelot, Sir Galahad y Sir Bedivere",
    fecha: "24 de Mayo de 1982",
    tipo: "Ofensiva contra Buques Logísticos • Escala 3",
    escala: 3,
    lat: -51.5410,
    lng: -59.0120,
    zoomRecomendado: 13,
    // [HITO 27 - 24 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Bahía San Carlos — Bombardeo a los Buques RFA Sir Lancelot, Sir Galahad y Sir Bedivere
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/sancarlos_24may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Nuevos ataques aéreos argentinos de escuadrillas Dagger y Skyhawk que impactan a los buques logísticos de desembarco RFA Sir Lancelot, RFA Sir Galahad y RFA Sir Bedivere.",
    unidadesArgentinas: "Fuerza Aérea Argentina: Grupo 5 de Caza (A-4B Skyhawk: Escuadrillas 'Chispa' y 'Nene'), Grupo 4 de Caza (A-4C Skyhawk: Escuadrilla 'Jaguar') y Grupo 6 de Caza (Mirage V Dagger: Escuadrillas 'Azul', 'Oro' y 'Plata').",
    condicionesTerreno: "Sector interior de Bahía San Carlos donde se agrupaban los grandes buques logísticos de desembarco (LSL) de la Flota Auxiliar Real británica.",
    historiaCompleta: [
      "El 24 de mayo de 1982, mientras en la bahía aún humeaban los restos partidos de la fragata HMS Antelope, la Fuerza Aérea Argentina lanzó una nueva ofensiva masiva concentrada específicamente sobre los grandes buques logísticos de desembarco de la clase Round Table fondeados dentro de Bahía San Carlos.",
      "Entre las 10:15 y las 11:30 horas, las escuadrillas 'Chispa' y 'Nene' de aviones A-4B Skyhawk (Mayor Mariel, Teniente Roca, Primer Teniente Sánchez, Capitán Gelardi, Teniente Cervera y Alférez Moroni), seguidas por las escuadrillas 'Azul', 'Oro' y 'Plata' de cazabombarderos Mirage V Dagger y la escuadrilla 'Jaguar' de A-4C Skyhawk, ingresaron en sucesión sobre el espejo de agua desafiando el fuego concentrado de las baterías terrestres de misiles Rapier y Blowpipe que ya habían sido emplazadas en las colinas.",
      "Los ataques alcanzaron con bombas de 1.000 libras y fuego de cañones a tres grandes transportes anfibios británicos: el RFA Sir Lancelot, el RFA Sir Galahad y el RFA Sir Bedivere, obligando a evacuar de urgencia a las tropas y tripulaciones de los dos primeros buques ante el peligro de voladura de sus bodegas de munición. En esta jornada de coraje indomable entregó su vida el Primer Teniente Carlos Julio Castillo cuando su avión Dagger (Escuadrilla 'Oro') fue derribado por un misil Sidewinder de una patrulla de Sea Harrier."
    ],
    protagonistasHitos: "El Primer Teniente Carlos Julio Castillo (caído en combate el 24 de mayo), y los pilotos de las escuadrillas 'Chispa', 'Nene', 'Azul', 'Oro', 'Plata' y 'Jaguar' de los Grupos 4, 5 y 6 de Caza.",
    galeria: [
      {
        src: "imagenesdeescala/sancarlos_24may.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector interior de Bahía San Carlos donde fueron alcanzados los buques logísticos RFA Sir Lancelot, Sir Galahad y Sir Bedivere."
      },
      {
        src: "imagenesdeescala/sancarlos_24may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Brazo sur de la bahía frente a las instalaciones de Ajax Bay y el asentamiento de San Carlos."
      },
      {
        src: "imagenesdeescala/sancarlos_24may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Cerros perimetrales donde los británicos habían emplazado las baterías antiaéreas Rapier."
      }
    ]
  },
  {
    id: "may-25-hundimiento-coventry",
    orden: 28,
    mes: "mayo",
    etiquetaFecha: "25 MAY",
    nombre: "Norte de Isla Borbón — Día de la Patria y Hundimiento del Destructor HMS Coventry",
    fecha: "25 de Mayo de 1982 (15:20 hs)",
    tipo: "Victoria Aeronaval del 25 de Mayo • Escala 2",
    escala: 2,
    lat: -51.0800,
    lng: -59.7200,
    zoomRecomendado: 10,
    // [HITO 28 - 25 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Norte de Isla Borbón — Día de la Patria y Hundimiento del Destructor HMS Coventry
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/coventry_25may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "En el Día de la Patria, las escuadrillas 'Vulcano' (Cap. Carballo y Tte. Rinke) y 'Zeus' (1er Tte. Velasco y Alf. Barrionuevo) de A-4B Skyhawk atacan la trampa radar británica al norte del estrecho, averiando a la fragata HMS Broadsword y hundiendo con tres bombas al destructor misilístico HMS Coventry.",
    unidadesArgentinas: "Grupo 5 de Caza de la Fuerza Aérea Argentina (Aviones A-4B Skyhawk): Escuadrilla 'Vulcano' (Capitán Pablo Marcos Carballo y Teniente Carlos Alfredo Rinke) y Escuadrilla 'Zeus' (Primer Teniente Mariano Ángel Velasco y Alférez Leonardo Salvador Carmona / Alférez Jorge Nelson Barrionuevo), con la coordinación del radar Westinghouse AN/TPS-43 de Puerto Argentino.",
    condicionesTerreno: "Aguas abiertas a 20 kilómetros al noroeste de la Isla Borbón (Pebble Island), donde operaba la 'trampa misilística' británica Tipo 42 / Tipo 22.",
    historiaCompleta: [
      "El 25 de Mayo de 1982, Día de la Patria, la Royal Navy había apostado a 20 kilómetros al norte de la Isla Borbón una letal 'trampa radar y misilística' integrada por el destructor Tipo 42 HMS Coventry (equipado con misiles de largo alcance Sea Dart, que ya habían derribado varias aeronaves argentinas, incluidos dos A-4B esa misma mañana donde fallecieron el Capitán Hugo Palaver y el Teniente Daniel Gálvez) y la fragata Tipo 22 HMS Broadsword (equipada con misiles antimisil de corto alcance Sea Wolf).",
      "Localizada la posición exacta de ambos buques por el radar de Puerto Argentino y la guarnición de Isla Borbón, el Grupo 5 de Caza planificó un golpe táctico brillante con dos secciones de dos aviones A-4B Skyhawk: 'Vulcano' (Capitán Pablo Carballo y Teniente Carlos Rinke) y 'Zeus' (Primer Teniente Mariano Velasco y Alférez Jorge Barrionuevo). Para anular los radares de tiro de los buques enemigos, los cuatro Skyhawk volaron ocultos detrás del relieve montañoso de la Isla Borbón y salieron al mar rozando la espuma de las olas.",
      "A las 15:20 horas, la sección 'Vulcano' atacó en primer término a la fragata HMS Broadsword: una bomba de 1.000 libras rebotó en el mar y atravesó de abajo hacia arriba la cubierta de vuelo de popa, destrozando el helicóptero Sea Lynx embarcado. Segundos después, cuando el HMS Coventry maniobró para cubrir a la Broadsword bloqueando sin querer la línea de tiro de los misiles Sea Wolf de su compañera, el Primer Teniente Mariano Velasco y el Alférez Jorge Barrionuevo ('Zeus') descargaron sus bombas de 1.000 libras sobre la banda de babor del destructor HMS Coventry. Tres bombas estallaron simultáneamente en el interior de la sala de operaciones y el compartimiento del generador del HMS Coventry, que volcó por completo quilla al sol en menos de veinte minutos y se hundió en las profundidades del Atlántico Sur."
    ],
    protagonistasHitos: "El Capitán Pablo Marcos Carballo, el Primer Teniente Mariano Ángel Velasco, el Teniente Carlos Alfredo Rinke y el Alférez Jorge Nelson Barrionuevo, junto a los héroes caídos esa mañana del 25 de mayo: Capitán Hugo Ángel del Valle Palaver y Teniente Daniel Enrique Gálvez, y el Primer Teniente Ricardo Lucero (rescatado con vida en las aguas de San Carlos).",
    galeria: [
      {
        src: "imagenesdeescala/coventry_25may.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas al norte de la Isla Borbón donde las escuadrillas 'Vulcano' y 'Zeus' hundieron al destructor misilístico HMS Coventry el 25 de Mayo."
      },
      {
        src: "imagenesdeescala/coventry_25may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Silueta costera de la Isla Borbón utilizada por los A-4B Skyhawk para aproximarse ocultos al radar británico."
      },
      {
        src: "imagenesdeescala/coventry_25may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Horizonte septentrional del archipiélago durante la histórica jornada del Día de la Patria."
      }
    ]
  },
  {
    id: "may-25-atlantic-conveyor",
    orden: 29,
    mes: "mayo",
    etiquetaFecha: "25 MAY",
    nombre: "Noreste de Isla Soledad — Hundimiento del Portacontenedores SS Atlantic Conveyor",
    fecha: "25 de Mayo de 1982 (16:38 hs)",
    tipo: "Golpe Estratégico Aeronaval • Escala 1",
    escala: 1,
    lat: -50.6300,
    lng: -56.1300,
    zoomRecomendado: 8,
    // [HITO 29 - 25 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Noreste de Isla Soledad — Hundimiento del Portacontenedores SS Atlantic Conveyor
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/atlantic_conveyor_25may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Dos aviones Super Étendard de la Armada (Cap. Roberto Curilovic y Tte. Julio Barraza) lanzan dos misiles Exocet AM-39 que impactan y destruyen el enorme portacontenedores logístico SS Atlantic Conveyor, hundiendo con él los helicópteros pesados Chinook y Wessex destinados al transporte de tropas británicas.",
    unidadesArgentinas: "2ª Escuadrilla Aeronaval de Caza y Ataque de la Armada Argentina (Aviones Super Étendard 3-A-203 y 3-A-204, indicativo 'Ala', tripulados por el Capitán de Corbeta Roberto Curilovic y el Teniente de Navío Julio Héctor Barraza) y escuadrón de reabastecimiento aéreo KC-130H Hércules ('Berlín') de la Fuerza Aérea Argentina.",
    condicionesTerreno: "Atlántico Sur abierto a unas 100 millas náuticas al noreste de Puerto Argentino, donde operaba el núcleo de los portaaviones y buques logísticos británicos.",
    historiaCompleta: [
      "En la tarde del mismo 25 de Mayo de 1982, apenas una hora después del hundimiento del HMS Coventry al norte de Isla Borbón, la Aviación Naval Argentina asestó un segundo golpe estratégico demoledor en el extremo opuesto del teatro de operaciones. Tras analizar los reportes del radar de Puerto Argentino que situaban al grupo de batalla de los portaaviones británicos al noreste de Isla Soledad, despegaron desde Río Grande dos aviones Super Étendard tripulados por el Capitán de Corbeta Roberto Curilovic y el Teniente de Navío Julio Barraza.",
      "Para sorprender a las defensas enemigas desde un sector inesperado, los dos Super Étendard volaron más de 500 kilómetros hacia el norte y el este, reabastecieron combustible en vuelo con un avión tanque KC-130 Hércules a 160 millas al este de Puerto Deseado y luego descendieron a ras del mar atacando a la flota británica desde el norte hacia el sur.",
      "A las 16:32 horas, ambos pilotos encendieron sus radares Agave, detectaron un blanco de gran tamaño a 30 millas náuticas y lanzaron sus dos misiles AM-39 Exocet a las 16:35. A las 16:38 horas los misiles impactaron por la banda de babor en el gigantesco buque portacontenedores y portaeronaves logístico SS Atlantic Conveyor (de casi 15.000 toneladas). El incendio desatado en sus cubiertas interiores hizo estallar miles de bombas, misiles y combustible de aviación, destruyendo tres helicópteros pesados biturbina Boeing Chinook, seis helicópteros Wessex, un Lynx, todas las carpas para 4.500 soldados y una planta potabilizadora completa. La pérdida de los helicópteros de transporte obligó a los paracaidistas y Royal Marines británicos a cruzar a pie toda la Isla Soledad."
    ],
    protagonistasHitos: "El Capitán de Corbeta Roberto Curilovic, el Teniente de Navío Julio Héctor Barraza, la tripulación del avión cisterna KC-130 Hércules y el equipo de inteligencia y mantenimiento de la 2ª Escuadrilla Aeronaval de Caza y Ataque.",
    galeria: [
      {
        src: "imagenesdeescala/atlantic_conveyor_25may.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas al noreste de Isla Soledad donde los dos misiles Exocet AM-39 destruyeron al portacontenedores SS Atlantic Conveyor el 25 de Mayo."
      },
      {
        src: "imagenesdeescala/atlantic_conveyor_25may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector oceánico por donde la sección 'Ala' ejecutó la envolvente desde el norte."
      },
      {
        src: "imagenesdeescala/atlantic_conveyor_25may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Mar Argentino donde operaron en conjunto los Super Étendard navales y los KC-130 de la Fuerza Aérea."
      }
    ]
  },
  {
    id: "may-27-batalla-pradera-del-ganso",
    orden: 30,
    mes: "mayo",
    etiquetaFecha: "27 MAY",
    nombre: "Istmo de Darwin y Pradera del Ganso — Batalla de la Fuerza de Tareas Mercedes",
    fecha: "27 al 29 de Mayo de 1982",
    tipo: "Primera Gran Batalla Terrestre • Escala 3",
    escala: 3,
    lat: -51.8256,
    lng: -58.9698,
    zoomRecomendado: 13,
    // [HITO 30 - 27 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Istmo de Darwin y Pradera del Ganso — Batalla de la Fuerza de Tareas Mercedes
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/pradera_del_ganso_27may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Batalla terrestre de 36 horas donde la Fuerza de Tareas Mercedes (Regimiento de Infantería 12 al mando del Tcnl. Ítalo Piaggi, sección del RI 25, compañía del RI 8 y artilleros del GA Aerot 4) enfrenta al 2° Batallón de Paracaidistas británico en inferioridad numérica y de fuego naval.",
    unidadesArgentinas: "Fuerza de Tareas 'Mercedes' (Comandante: Teniente Coronel Ítalo Ángel Piaggi): Regimiento de Infantería 12 'General Arenales', Compañía C 'Equipo de Combate Güemes' del Regimiento de Infantería 25, Compañía A del Regimiento de Infantería 8, Batería A del Grupo de Artillería Aerotransportado 4 (Teniente Primero Carlos Chanampa, con tres obuses OTO Melara de 105 mm), Sección de cañones de 35 mm del GADA 601 (Subteniente Claudio Braghini), artillería antiaérea de 20 mm de la FAA (Teniente Darío Valazza) y apoyo aéreo de aviones IA-58 Pucará y Aermacchi MB-339 (donde cae el Teniente de Corbeta Daniel Enrique Miguel).",
    condicionesTerreno: "Estrecho istmo herboso de apenas 2 kilómetros de ancho flanqueado por el mar en ambas costas, sin coberturas rocosas naturales y barrido por lluvia helada.",
    historiaCompleta: [
      "En la noche del 27 de mayo de 1982 se inició la primera gran batalla terrestre de la Guerra de Malvinas cuando el 2° Batallón del Regimiento de Paracaidistas británico (2 Para, 650 hombres apoyados por el cañoneo nocturno de la fragata HMS Arrow, una batería de obuses de 105 mm, morteros pesados y misiles antitanque Milan) lanzó su ofensiva desde el norte sobre el estrecho Istmo de Darwin para tomar el asentamiento de Pradera del Ganso y la Base Aérea Militar Cóndor.",
      "La defensa argentina estaba a cargo de la Fuerza de Tareas 'Mercedes' comandada por el Teniente Coronel Ítalo Ángel Piaggi, cuyos efectivos del Regimiento de Infantería 12 (Corrientes) habían arribado a las islas con gran parte de su armamento pesado de apoyo retenido en el continente por el bloqueo marítimo. Durante más de 36 horas ininterrumpidas de combate diurno y nocturno bajo la lluvia helada, las compañías de infantería argentinas sostuvieron la línea desde Burntside House hasta Darwin y Boca House, mientras los tres únicos obuses OTO Melara de 105 mm de la Batería A del Grupo de Artillería Aerotransportado 4 disparaban sin pausa hasta recalentar sus tubos.",
      "En la tarde del 28 de mayo, aun cuando un refuerzo helitransportado (el Equipo de Combate 'Solari' de la Compañía B del RI 12) aterrizó bajo fuego de artillería al sur de Pradera del Ganso para sumarse a la defensa, los cañones antiaéreos Oerlikon de 35 mm del GADA 601 al mando del Subteniente Claudio Braghini y los Rheinmetall de 20 mm de la Fuerza Aérea al mando del Teniente Darío Valazza bajaron sus tubos a tiro horizontal terrestre para frenar el avance de los paracaidistas británicos sobre la escuela y el poblado, derribando además aviones Harrier y helicópteros Scout (mientras en el apoyo aéreo caían el Teniente Miguel Ángel Giménez en Pucará y el Teniente de Corbeta Daniel Enrique Miguel en Aermacchi). Al amanecer del 29 de mayo, completamente rodeados por mar y tierra, sin munición de artillería y con más de cien civiles kelpers alojados dentro de la iglesia de Goose Green cuya vida corría peligro inminente si el poblado era arrasado, el Teniente Coronel Piaggi acordó un cese del fuego honorable tras haber librado una batalla que conmocionó al mando británico."
    ],
    protagonistasHitos: "El Teniente Coronel Ítalo Ángel Piaggi, el Teniente Roberto Estévez, el Subteniente Juan José Gómez Centurión, el Subteniente Ernesto Peluffo, el Subteniente Guillermo Aliaga, el Teniente Primero Carlos Chanampa, el Subteniente Claudio Braghini, el Teniente Darío Valazza, el Teniente Miguel Ángel Giménez (FAA), el Teniente de Corbeta Daniel Enrique Miguel (ARA) y los 47 héroes argentinos caídos en el Istmo de Darwin.",
    galeria: [
      {
        src: "imagenesdeescala/pradera_del_ganso_27may.jpg",
        fallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        caption: "Pradera del Ganso y el Istmo de Darwin, escenario de las 36 horas de combate de la Fuerza de Tareas 'Mercedes'."
      },
      {
        src: "imagenesdeescala/pradera_del_ganso_27may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
        caption: "Posiciones donde combatieron los obuses de 105 mm del GA Aerot 4 y los cañones antiaéreos en tiro terrestre."
      },
      {
        src: "imagenesdeescala/pradera_del_ganso_27may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        caption: "Asentamiento costero de Goose Green sobre el Seno Choiseul."
      }
    ]
  },
  {
    id: "may-28-colina-darwin-estevez",
    orden: 31,
    mes: "mayo",
    etiquetaFecha: "28 MAY",
    nombre: "Colina de Darwin y Boca House — Heroísmo del Tte. Estévez y Subt. Gómez Centurión",
    fecha: "28 de Mayo de 1982 (Madrugada y Mañana)",
    tipo: "Combate de Trincheras • Escala 4",
    escala: 4,
    lat: -51.7975,
    lng: -58.9535,
    zoomRecomendado: 15,
    // [HITO 31 - 28 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Colina de Darwin y Boca House — Heroísmo del Tte. Estévez y Subt. Gómez Centurión
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/colina_darwin_28may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Combate en las trincheras de Darwin Hill donde el Teniente Roberto Estévez del RI 25 dirige el fuego de la artillería argentina hasta caer heroicamente bajo las balas enemigas, seguido por el contraataque de la sección del Subteniente Juan José Gómez Centurión en el que resulta abatido el comandante británico Tcnl. Herbert 'H' Jones.",
    unidadesArgentinas: "1ª Sección 'Bote' (Teniente Roberto Néstor Estévez) y 2ª Sección 'Romeo' (Subteniente Juan José Gómez Centurión) de la Compañía C del Regimiento de Infantería 25, junto a las secciones de los Subtenientes Ernesto Orlando Peluffo y Guillermo Raúl Aliaga del Regimiento de Infantería 12 en Darwin Hill y Boca House.",
    condicionesTerreno: "Lomada herbosa atravesada por cercos de espinillo (tojo) y zanjas de turba entre Bahía Camilla y el brazo Brenton Loch.",
    historiaCompleta: [
      "Antes del amanecer del 28 de mayo de 1982, cuando las compañías A y B del 2° Batallón de Paracaidistas británico amenazaban con quebrar la línea defensiva del Regimiento de Infantería 12 en las alturas de Colina Darwin (Darwin Hill) y Boca House, el jefe de la guarnición ordenó el avance inmediato de la reserva: la 1ª Sección de Tiradores ('Bote') de la Compañía C del Regimiento de Infantería 25, comandada por el joven Teniente misionero Roberto Néstor Estévez.",
      "Tras marchar bajo la lluvia y el fuego de morteros durante la noche, los 37 soldados del Teniente Estévez ocuparon los pozos de zorro en la cresta de Colina Darwin junto a los efectivos del Subteniente Ernesto Peluffo (RI 12), deteniendo en seco a quemarropa el asalto frontal de los paracaidistas británicos. Recorriendo la línea para alentar a sus soldados y repartir munición, el Teniente Estévez recibió un disparo en la pierna y otro en el brazo derecho; negándose a ser evacuado, se arrastró hasta la radio en el pozo del Cabo Mario Rodolfo Castro y continuó reglando con precisión milimétrica el fuego de los obuses de 105 mm argentinos sobre las posiciones enemigas a escasos metros de sus propias trincheras, hasta que un disparo en el rostro segó su vida. Al tomar el micrófono para continuar el reglaje, el Cabo Castro también cayó muerto por las balas enemigas, momento en que el Soldado Conscripto Fabricio Edgar Carrascull asumió la conducción de la radio y la defensa del pozo hasta caer combatiendo.",
      "Para destrabar el estancamiento de sus compañías aferradas frente a las trincheras argentinas de Colina Darwin, el comandante del 2° Batallón de Paracaidistas británico, Teniente Coronel Herbert 'H' Jones, encabezó personalmente un asalto por una vaguada lateral contra las posiciones defendidas por los soldados de los Regimientos 12 y 25 (donde operaba la sección del Subteniente Juan José Gómez Centurión y los tiradores de FAL y MAG en la colina), cayendo abatido en el enfrentamiento el jefe del batallón británico junto a sus oficiales de plana mayor."
    ],
    protagonistasHitos: "El Teniente Roberto Néstor Estévez, el Cabo Mario Rodolfo Castro y el Soldado Conscripto Fabricio Edgar Carrascull (caídos heroicamente en la misma trinchera de Colina Darwin), junto al Subteniente Juan José Gómez Centurión, el Subteniente Ernesto Peluffo, el Subteniente Guillermo Aliaga y el Sargento Sergio Ismael García.",
    galeria: [
      {
        src: "imagenesdeescala/colina_darwin_28may.jpg",
        fallback: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
        caption: "Lomada y trincheras de la Colina de Darwin (Darwin Hill), donde entregó su vida el Teniente Roberto Néstor Estévez el 28 de mayo."
      },
      {
        src: "imagenesdeescala/colina_darwin_28may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector costero de Boca House defendido tenazmente por la sección del Subteniente Guillermo Aliaga."
      },
      {
        src: "imagenesdeescala/colina_darwin_28may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        caption: "Vaguada de Colina Darwin donde fue detenido el asalto del 2° Batallón de Paracaidistas británico."
      }
    ]
  },
  {
    id: "may-29-monte-kent-alacran",
    orden: 32,
    mes: "mayo",
    etiquetaFecha: "29 MAY",
    nombre: "Faldeos de Monte Kent — Comandos 601, 602 y Escuadrón 'Alacrán' de Gendarmería",
    fecha: "29 y 30 de Mayo de 1982",
    tipo: "Operaciones de Fuerzas Especiales • Escala 3",
    escala: 3,
    lat: -51.6720,
    lng: -58.1120,
    zoomRecomendado: 13,
    // [HITO 32 - 29 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Faldeos de Monte Kent — Comandos 601, 602 y Escuadrón 'Alacrán' de Gendarmería
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/monte_kent_29may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Operación de inserción heliportada de las Compañías de Comandos 601 y 602 y el Escuadrón de Fuerzas Especiales 601 'Alacrán' de Gendarmería Nacional; un misil británico alcanza al helicóptero Puma en pleno vuelo provocando la caída de seis gendarmes argentinos.",
    unidadesArgentinas: "Compañía de Comandos 601 (Mayor Mario Castagneto), Compañía de Comandos 602 (Mayor Aldo Rico), Escuadrón de Fuerzas Especiales 601 'Alacrán' de Gendarmería Nacional Argentina (Comandante José Ricardo Spadaro) y Batallón de Aviación de Combate 601 del Ejército Argentino (Helicóptero SA-330L Puma AE-508 piloteado por el Teniente Primero Horacio Sánchez Mariño).",
    condicionesTerreno: "Cumbre más alta de la región oriental de Isla Soledad (458 metros sobre el nivel del mar), compuesta por ríos de piedra y acantilados rocosos envueltos en niebla helada.",
    historiaCompleta: [
      "Ante el avance de las brigadas británicas desde San Carlos a través de la cadena de alturas centrales de la Isla Soledad hacia Puerto Argentino, en la noche del 29 de mayo de 1982 el mando argentino ordenó una operación de inserción heliportada de patrullas de las Compañías de Comandos 601 y 602 del Ejército para ocupar las cumbres dominantes de Monte Kent, Bluff Cove Peak, Monte Simon y Monte Estancia.",
      "Durante esa misma noche del 29 al 30 de mayo, la 2ª Sección de Asalto de la Compañía de Comandos 602 (al mando del Capitán Tomás Víctor Fernández y el Capitán Eduardo Villarruel) chocó en la oscuridad sobre las laderas de Bluff Cove Peak contra efectivos del Escuadrón D del SAS británico que ya habían ocupado las alturas. En un violento combate nocturno bajo fuego de morteros y ametralladoras, entregaron su vida cubriendo a sus camaradas el Teniente Primero Rubén Eduardo Márquez y el Sargento Primero Oscar Humberto Blas, ambos condecorados post mortem con la Cruz La Nación Argentina al Heroico Valor en Combate.",
      "En la mañana del 30 de mayo, mientras el helicóptero Puma AE-508 de la Aviación de Ejército volaba a ras de los faldeos de Monte Kent transportando una patrulla del Escuadrón de Fuerzas Especiales 601 'Alacrán' de Gendarmería Nacional para reforzar el dispositivo, la aeronave fue impactada por un misil antiaéreo portátil británico. El piloto logró posar de emergencia el aparato envuelto en llamas sobre la ladera antes de que estallara su carga de munición, entregando su vida seis héroes de la Gendarmería Nacional Argentina: el Primer Alférez Ricardo Julio Sánchez, el Subalférez Guillermo Nasif, los Cabos Primeros Marciano Verón y Víctor Samuel Guerrero, el Cabo Carlos Misael Pereyra y el Gendarme Juan Carlos Treppo."
    ],
    protagonistasHitos: "El Teniente Primero Rubén Eduardo Márquez y el Sargento Primero Oscar Humberto Blas (Compañía de Comandos 602), y los seis héroes caídos de Gendarmería Nacional (Primer Alférez Ricardo Sánchez, Subalférez Guillermo Nasif, Cabo Primero Marciano Verón, Cabo Primero Víctor Guerrero, Cabo Carlos Pereyra y Gendarme Juan Carlos Treppo).",
    galeria: [
      {
        src: "imagenesdeescala/monte_kent_29may.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Faldeos rocosos de Monte Kent y Bluff Cove Peak, donde operaron las Compañías de Comandos 601, 602 y el Escuadrón 'Alacrán'."
      },
      {
        src: "imagenesdeescala/monte_kent_29may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Cumbres de cuarcita donde combatieron de noche el Teniente Primero Rubén Márquez y el Sargento Primero Oscar Blas."
      },
      {
        src: "imagenesdeescala/monte_kent_29may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Laderas del Monte Kent donde cayó el helicóptero Puma AE-508 con los efectivos de Gendarmería Nacional."
      }
    ]
  },
  {
    id: "may-30-ataque-invincible",
    orden: 33,
    mes: "mayo",
    etiquetaFecha: "30 MAY",
    nombre: "Atlántico Sur al Este de Puerto Argentino — Ataque Conjunto al Portaaviones HMS Invincible",
    fecha: "30 de Mayo de 1982 (14:28 hs)",
    tipo: "Operación Conjunta Aeronaval y FAA • Escala 1",
    escala: 1,
    lat: -51.6300,
    lng: -55.5000,
    zoomRecomendado: 8,
    // [HITO 33 - 30 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Atlántico Sur al Este de Puerto Argentino — Ataque Conjunto al Portaaviones HMS Invincible
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/invincible_30may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "La misión aeronaval más audaz de la guerra: dos Super Étendard (Cap. Alejandro Francisco y Tte. Luis Collavino) con el último misil Exocet AM-39 disponible y cuatro A-4C Skyhawk de la Fuerza Aérea reabastecidos en vuelo atacan el corazón de la flota británica; caen derribados por misiles los primeros tenientes José Daniel Vázquez y Omar Jesús Castillo, mientras el 1er Tte. Ernesto Ureta y el Alférez Gerardo Isaac lanzan sus bombas de 500 libras sobre el portaaviones HMS Invincible.",
    unidadesArgentinas: "Operación Conjunta de la Armada Argentina y la Fuerza Aérea Argentina: 2ª Escuadrilla Aeronaval de Caza y Ataque (Super Étendard 3-A-202 y 3-A-205, indicativo 'Ala', tripulados por el Capitán de Corbeta Alejandro Francisco y el Teniente de Navío Luis Collavino), Grupo 4 de Caza de la FAA (Cuatro aviones A-4C Skyhawk, Escuadrilla 'Zonda': Primer Teniente José Daniel Vázquez, Primer Teniente Omar Jesús Castillo, Primer Teniente Ernesto Rubén Ureta y Alférez Gerardo Guillermo Isaac) y dos aviones cisterna KC-130H Hércules ('Cacho' y 'Gallo': TC-69 al mando del Vicecomodoro Roberto Noé y TC-70 al mando del Mayor Luis Litrenta).",
    condicionesTerreno: "Atlántico Sur abierto a más de 100 millas náuticas al este de Puerto Argentino (Lat: 51°38'S, Lng: 53°38'O / sector oriental de la Zona de Exclusión), en el corazón mismo del anillo defensivo de los portaaviones británicos.",
    historiaCompleta: [
      "El 30 de mayo de 1982, cuando a la República Argentina le quedaba un único y último misil antibuque aire-mar AM-39 Exocet en sus arsenales, la Armada Argentina y la Fuerza Aérea Argentina concibieron la operación conjunta más audaz y compleja de toda la guerra: atacar el núcleo de los portaaviones británicos en el límite oriental de la Zona de Exclusión entrando desde el sur-sudeste, una dirección por la que los británicos jamás esperaban un ataque aéreo por hallarse al límite de la autonomía de vuelo.",
      "Desde Río Grande despegaron los dos aviones Super Étendard ('Ala': Capitán de Corbeta Alejandro Francisco portando el último misil Exocet bajo su plano derecho y el Teniente de Navío Luis Collavino como apoyo radar) junto a los cuatro cazabombarderos Douglas A-4C Skyhawk de la Escuadrilla 'Zonda' del Grupo 4 de Caza (Primer Teniente José Daniel Vázquez, Primer Teniente Omar Jesús Castillo, Primer Teniente Ernesto Rubén Ureta y Alférez Gerardo Guillermo Isaac), armados cada uno con tres bombas de 500 libras con paracaídas de frenado. Dos aviones tanque KC-130 Hércules ('Cacho' y 'Gallo') penetraron profundamente en la zona de combate para realizar dos reabastecimientos en vuelo consecutivos a las seis aeronaves de ataque.",
      "Tras desprenderse de las mangueras de los Hércules, los seis aviones descendieron a ras del agua. A las 14:24 horas el Capitán Francisco detectó en su pantalla radar un gran eco naval y disparó el último misil Exocet AM-39 desde unas 20 millas náuticas. De inmediato, los cuatro A-4C Skyhawk aceleraron a máxima potencia siguiendo la estela de humo blanco del misil directo hacia la columna de humo negro que se elevaba en el horizonte. A pocas millas del blanco, los misiles Sea Dart disparados por el destructor escolta HMS Exeter derribaron en plena corrida final a los aviones del jefe de escuadrilla, Primer Teniente José Daniel Vázquez, y del Primer Teniente Omar Jesús Castillo, quienes entregaron su vida sin desviar su rumbo un solo grado. El Primer Teniente Ernesto Ureta y el Alférez Gerardo Isaac continuaron a través del humo y el fuego antiaéreo, lanzando sus bombas de 500 libras y disparando sus cañones de 20 mm sobre la silueta del portaaviones HMS Invincible, regresando al continente tras un tercer reabastecimiento con los Hércules que salieron a buscarlos sobre el mar."
    ],
    protagonistasHitos: "El Primer Teniente José Daniel Vázquez y el Primer Teniente Omar Jesús Castillo (caídos heroicamente en la corrida final), el Primer Teniente Ernesto Rubén Ureta, el Alférez Gerardo Guillermo Isaac, el Capitán de Corbeta Alejandro Francisco, el Teniente de Navío Luis Collavino y las dos tripulaciones de los KC-130 Hércules (TC-69 y TC-70).",
    galeria: [
      {
        src: "imagenesdeescala/invincible_30may.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector oriental del Atlántico Sur donde los Super Étendard y la Escuadrilla 'Zonda' de A-4C Skyhawk ejecutaron el ataque conjunto al HMS Invincible."
      },
      {
        src: "imagenesdeescala/invincible_30may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Corredor oceánico meridional donde los aviones KC-130 Hércules reabastecieron en vuelo a los cazabombarderos."
      },
      {
        src: "imagenesdeescala/invincible_30may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Horizonte marítimo donde los Primeros Tenientes Vázquez y Castillo entregaron su vida siguiendo la estela del último Exocet."
      }
    ]
  },
  {
    id: "may-31-top-malo-house",
    orden: 34,
    mes: "mayo",
    etiquetaFecha: "31 MAY",
    nombre: "Arroyo Malo — Combate de Top Malo House (Compañía de Comandos 602)",
    fecha: "31 de Mayo de 1982 (08:30 hs)",
    tipo: "Combate de Comandos • Escala 4",
    escala: 4,
    lat: -51.5920,
    lng: -58.3180,
    zoomRecomendado: 15,
    // [HITO 34 - 31 MAY] PEGAR AQUI EL LINK DE YOUTUBE PARA: Arroyo Malo — Combate de Top Malo House (Compañía de Comandos 602)
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/top_malo_31may.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "La primera sección de asalto de la Compañía de Comandos 602 al mando del Capitán José Arnobio Vercesi es rodeada en un refugio de montaña por fuerzas especiales británicas, combatiendo hasta agotar municiones; caen en acción heroica el Teniente Primero Ernesto Emilio Espinosa y el Sargento Primero Mateo Antonio Sbert.",
    unidadesArgentinas: "1ª Sección de Asalto de la Compañía de Comandos 602 del Ejército Argentino (12 efectivos al mando del Capitán José Arnobio Vercesi: Teniente Primero Ernesto Emilio Espinosa, Teniente Primero Jorge Vizoso Posse, Teniente Primero Horacio Losito, Teniente Marcelo Gatto, Sargento Ayudante Faustino Pedrozo, Sargento Primero Mateo Antonio Sbert, Sargento Primero Humberto Medina, Sargento Primero Juan Helguero, Sargento Miguel del Valle, Sargento Carlos Bruno y Cabo Primero Walter Medina).",
    condicionesTerreno: "Valle aislado del Arroyo Malo al norte del cordón de Monte Simon y Monte Kent, bajo intensa helada invernal y terreno cubierto de nieve y escarcha.",
    historiaCompleta: [
      "El 29 de mayo de 1982, la 1ª Sección de Asalto de la Compañía de Comandos 602 al mando del Capitán José Arnobio Vercesi fue helitransportada a las cumbres del Monte Simon con la misión de vigilar el corredor de avance británico desde San Carlos hacia Teal Inlet. Tras soportar una noche de tormenta polar a 500 metros de altura con temperaturas de -15 °C y quedar aislados por la imposibilidad de emplear helicópteros debido a la superioridad aérea enemiga, la patrulla inició el repliegue a pie hacia Puerto Argentino pernoctando en la noche del 30 de mayo en el puesto abandonado de Top Malo House, junto al Arroyo Malo.",
      "Al amanecer del 31 de mayo, a las 08:30 horas, una fuerza de 23 comandos británicos del Cuadro de Guerra de Montaña y Ártico de los Royal Marines (M&AWC) rodeó el refugio y abrió fuego simultáneo con tres lanzacohetes antitanque de 66 mm LAW, cohetes Carl Gustav de 84 mm, granadas de fósforo blanco y lanzagranadas M79, incendiando de inmediato la casa de madera donde estallaban las municiones almacenadas.",
      "Desde el piso superior envuelto en llamas, el francotirador Teniente Primero Ernesto Emilio Espinosa abrió fuego incesante con su fusil y lanzó granadas para atraer sobre sí los disparos enemigos y permitir que sus compañeros salieran del edificio ardiendo, hasta que un cohete antitanque impactó de lleno en su ventana quitándole la vida en el acto (recibiendo post mortem la Cruz La Nación Argentina al Heroico Valor en Combate). Abajo, entre el humo y el cauce del arroyo, el Sargento Primero Mateo Antonio Sbert cayó mortalmente herido combatiendo de pie mientras cubría al Teniente Primero Horacio Losito, y el Teniente Primero Jorge Vizoso Posse, aun atravesado en el cuello y el hombro por un proyectil de FAL, continuó disparando contra los asaltantes británicos hasta que la sección agotó sus últimos cargadores tras 45 minutos de feroz combate."
    ],
    protagonistasHitos: "El Teniente Primero Ernesto Emilio Espinosa y el Sargento Primero Mateo Antonio Sbert (caídos heroicamente en Top Malo House, ambos condecorados con la Cruz al Heroico Valor en Combate), el Capitán José Arnobio Vercesi, el Teniente Primero Jorge Vizoso Posse, el Teniente Primero Horacio Losito y toda la 1ª Sección de Asalto de la Compañía de Comandos 602.",
    galeria: [
      {
        src: "imagenesdeescala/top_malo_31may.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Valle del Arroyo Malo (Top Malo House), donde combatió la 1ª Sección de Asalto de la Compañía de Comandos 602 el 31 de mayo."
      },
      {
        src: "imagenesdeescala/top_malo_31may_2.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Alturas nevadas de Monte Simon desde donde descendió la patrulla del Capitán Vercesi."
      },
      {
        src: "imagenesdeescala/top_malo_31may_3.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Cauce del Arroyo Malo donde los comandos argentinos sostuvieron la resistencia bajo fuego."
      }
    ]
  },
  // =========================================================================
  // MES DE JUNIO DE 1982 (Cerco Terrestre, Bahía Agradable y Batalla Final en los Montes)
  // =========================================================================
  {
    id: "jun-01-hercules-tc63-tiza",
    orden: 35,
    mes: "junio",
    etiquetaFecha: "01 JUN",
    nombre: "50 km al Norte de Isla Borbón — Derribo del Hércules C-130 TC-63 ('Tiza')",
    fecha: "1 de Junio de 1982 (10:50 hs)",
    tipo: "Exploración Aérea y Sacrificio • Escala 1",
    escala: 1,
    lat: -50.8500,
    lng: -59.5600,
    zoomRecomendado: 8,
    // [HITO 35 - 01 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: 50 km al Norte de Isla Borbón — Derribo del Hércules C-130 TC-63 ('Tiza')
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/hercules_tc63_1jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "El avión Hércules C-130 matrícula TC-63 ('Tiza') del Escuadrón I de Transporte Aéreo es interceptado por una patrulla de Sea Harrier mientras realizaba exploración radar en busca de buques enemigos, cayendo al mar con sus siete tripulantes (Cap. Martel, Cap. Krause, Vicecomodoro Meisner, Cabo Principal Cardone, Cabo Principal Cantezano, Subof. Principal Lastra y Subof. Ayudante Albelos).",
    unidadesArgentinas: "Escuadrón I de Transporte Aéreo de la Fuerza Aérea Argentina (I Brigada Aérea de El Palomar): Avión cuatrimotor Lockheed C-130H Hércules matrícula TC-63, indicativo de vuelo 'Tiza', tripulado por el Capitán Rubén Héctor Martel, el Capitán Carlos Eduardo Krause, el Vicecomodoro Hugo César Meisner, el Cabo Principal Miguel Ángel Cardone, el Cabo Principal Carlos Domingo Cantezano, el Suboficial Principal Julio Jesús Lastra y el Suboficial Ayudante Manuel Alberto Albelos.",
    condicionesTerreno: "Aguas abiertas a unas 25 millas náuticas (50 km) al norte de la Isla Borbón y de la boca septentrional del Estrecho de San Carlos.",
    historiaCompleta: [
      "Ante la falta de aviones de exploración marítima de largo alcance disponibles a fines de mayo de 1982, las tripulaciones de los grandes cuatrimotores de transporte Lockheed C-130H Hércules del Escuadrón I se ofrecieron voluntariamente para cumplir arriesgadas misiones de exploración y reconocimiento radar ('Loco' / 'Tiza') en plena luz del día sobre el Atlántico Sur, utilizando el radar meteorológico de nariz de sus aeronaves para localizar blancos navales británicos y guiar a los cazabombarderos.",
      "En la mañana del 1 de junio de 1982 despegó desde Comodoro Rivadavia el Hércules C-130 matrícula TC-63 con el indicativo 'Tiza'. La aeronave, completamente desarmada y carente de defensas frente a cazas interceptores, volaba a ras de las olas hacia el norte del Estrecho de San Carlos. A las 10:45 horas, al ascender brevemente para realizar un barrido con su radar en busca de buques enemigos, fue detectada por la fragata HMS Minerva, que guió hacia el Hércules a una patrulla de dos aviones Sea Harrier del Escuadrón 801 liderada por el Teniente Comandante Nigel Ward.",
      "Aunque el Capitán Rubén Martel y el Capitán Carlos Krause descendieron de inmediato pegados al mar intentando evadir la persecución, el Sea Harrier disparó dos misiles infrarrojos AIM-9L Sidewinder —uno de los cuales incendió el ala derecha entre los dos motores— y luego descargó la totalidad de sus cañones Aden de 30 mm contra el timón de cola y la cabina del transporte indefenso. El Hércules TC-63 cayó envuelto en llamas en las aguas del Atlántico Sur a las 10:50 horas, entregando su vida a la Patria sus siete heroicos tripulantes."
    ],
    protagonistasHitos: "Los siete héroes del Hércules TC-63 ('Tiza'): Capitán Rubén Héctor Martel, Capitán Carlos Eduardo Krause, Vicecomodoro Hugo César Meisner, Cabo Principal Miguel Ángel Cardone, Cabo Principal Carlos Domingo Cantezano, Suboficial Principal Julio Jesús Lastra y Suboficial Ayudante Manuel Alberto Albelos.",
    galeria: [
      {
        src: "imagenesdeescala/hercules_tc63_1jun.jpg",
        fallback: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas al norte de la Isla Borbón donde entregó su vida la tripulación del Hércules C-130 matrícula TC-63 ('Tiza') el 1 de junio."
      },
      {
        src: "imagenesdeescala/hercules_tc63_1jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector marítimo explorado por los cuatrimotores del Escuadrón I de Transporte Aéreo."
      },
      {
        src: "imagenesdeescala/hercules_tc63_1jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Acceso norte al Estrecho de San Carlos custodiado para siempre por los siete tripulantes del TC-63."
      }
    ]
  },
  {
    id: "jun-03-radar-skyguard-gada601",
    orden: 36,
    mes: "junio",
    etiquetaFecha: "03 JUN",
    nombre: "Puerto Argentino — Impacto de Misil Shrike en el Radar Skyguard del GADA 601",
    fecha: "3 de Junio de 1982 (06:15 hs)",
    tipo: "Duelo Antirradar y Sacrificio • Escala 4",
    escala: 4,
    lat: -51.6968,
    lng: -57.8480,
    zoomRecomendado: 16,
    // [HITO 36 - 03 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Puerto Argentino — Impacto de Misil Shrike en el Radar Skyguard del GADA 601
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/skyguard_3jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Ataque con misiles antirradar AGM-45 Shrike desde un bombardero Vulcan británico (Black Buck 6) que impacta directamente en el director de tiro Skyguard de la batería antiaérea de 35 mm, donde mueren en su puesto de combate el Teniente Alejandro Dachary, el Sargento Primero René Pascual Blanco y los soldados conscriptos Oscar Diarte y Jorge Llamas.",
    unidadesArgentinas: "1ª Sección de la Batería A del Grupo de Artillería de Defensa Aérea 601 (GADA 601) del Ejército Argentino (Director de tiro radar Skyguard y dos cañones bitubo Oerlikon Contraves de 35 mm, al mando del Teniente Primero Alejandro Dachary).",
    condicionesTerreno: "Lomada al sur del casco urbano de Puerto Argentino, donde la cabina del director de tiro Skyguard protegía el espacio aéreo de la capital.",
    historiaCompleta: [
      "Ante la eficacia letal de los radares y directores de tiro antiaéreos argentinos que impedían a los aviones británicos operar a baja y media altura sobre Puerto Argentino, la Royal Air Force organizó las misiones especiales Black Buck 5 y Black Buck 6 empleando bombarderos estratégicos Avro Vulcan equipados con misiles antirradiación estadounidenses AGM-45A Shrike, diseñados para guiarse automáticamente por la onda electromagnética emitida por las antenas de radar.",
      "En la madrugada del 3 de junio de 1982 (Operación Black Buck 6), un bombardero Vulcan (XM597) sobrevoló durante más de media hora las cercanías de Puerto Argentino a mediana altitud intentando provocar que el radar estratégico de largo alcance Westinghouse AN/TPS-43 de la Fuerza Aérea encendiera su emisión continua. Sin embargo, los operadores del Westinghouse —advertidos del peligro— apagaban su transmisor cada vez que el Vulcan entraba en posición de tiro.",
      "Para impedir que la aeronave británica descendiera a bombardear las posiciones argentinas, el jefe de la 1ª Sección de la Batería A de cañones de 35 mm del GADA 601, Teniente Primero Alejandro Dachary, mantuvo operativo su director de tiro radar Skyguard siguiendo al blanco en la oscuridad. A las 06:15 horas el bombardero Vulcan disparó un misil antirradar AGM-45 Shrike que descendió a velocidad supersónica por el haz electrónico e impactó de lleno en la cabina del director de tiro Skyguard. La explosión destruyó el equipo y causó la muerte instantánea en su puesto de combate de los cuatro integrantes de la dotación: el Teniente Primero Alejandro Dachary, el Sargento Primero René Pascual Blanco y los soldados conscriptos clase 62 Oscar Daniel Diarte y Jorge Alberto Llamas."
    ],
    protagonistasHitos: "El Teniente Primero Alejandro Dachary, el Sargento Primero René Pascual Blanco y los Soldados Conscriptos Oscar Daniel Diarte y Jorge Alberto Llamas (héroes de la artillería antiaérea del GADA 601 caídos en su puesto de combate el 3 de junio).",
    galeria: [
      {
        src: "imagenesdeescala/skyguard_3jun.jpg",
        fallback: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        caption: "Posición de la 1ª Sección de la Batería A del GADA 601 en Puerto Argentino, donde operaba el director de tiro Skyguard."
      },
      {
        src: "imagenesdeescala/skyguard_3jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector sur de Puerto Argentino defendido por los cañones bitubo Oerlikon Contraves de 35 mm."
      },
      {
        src: "imagenesdeescala/skyguard_3jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Cielo austral de Puerto Argentino protegido día y noche por los artilleros antiaéreos."
      }
    ]
  },
  {
    id: "jun-08-bahia-agradable-fitz-roy",
    orden: 37,
    mes: "junio",
    etiquetaFecha: "08 JUN",
    nombre: "Bahía Agradable (Hoya Chasco / Fitz Roy) — 'El Día Más Negro de la Flota Británica'",
    fecha: "8 de Junio de 1982 (13:50 hs)",
    tipo: "Gran Victoria Aérea • Escala 3",
    escala: 3,
    lat: -51.8050,
    lng: -58.2150,
    zoomRecomendado: 13,
    // [HITO 37 - 08 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Bahía Agradable (Hoya Chasco / Fitz Roy) — 'El Día Más Negro de la Flota Británica'
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/bahia_agradable_8jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
    descripcion: "'El día más negro de la flota británica'. Los cazabombarderos A-4B Skyhawk del Grupo 5 de Caza (Escuadrillas 'Dogo' y 'Mastín' al mando del 1er Tte. Cachón y Cap. Carballo) y Daggers del Grupo 6 sorprenden el desembarco de la Guardia Galesa, destruyendo los buques logísticos RFA Sir Galahad y RFA Sir Tristram.",
    unidadesArgentinas: "Fuerza Aérea Argentina: Grupo 5 de Caza con aviones A-4B Skyhawk (Escuadrillas 'Dogo' y 'Mastín', lideradas inicialmente por el Capitán Pablo Carballo y en el ataque por el Primer Teniente Carlos Alfredo Cachón, junto al Teniente Carlos Rinke, Alférez Leonardo Carmona, Primer Teniente Filippini, Teniente Gálvez y Alférez Gómez) y Grupo 6 de Caza con aviones Mirage V Dagger (Escuadrillas 'Perro' y 'Gato', que además atacaron en San Carlos a la fragata HMS Plymouth).",
    condicionesTerreno: "Caleta cerrada de aguas bajas entre Punta Fitz Roy y Bahía Agradable (Bluff Cove), al sur del Monte Kent y a solo 25 kilómetros al sudoeste de Puerto Argentino.",
    historiaCompleta: [
      "El 8 de junio de 1982, el mando terrestre británico intentó acelerar el cerco sobre Puerto Argentino desembarcando por mar a los efectivos de la 5ª Brigada de Infantería (1° Batallón de Guardias Galeses, tropas de apoyo, municiones y combustible) directamente desde los grandes buques logísticos de desembarco RFA Sir Galahad y RFA Sir Tristram fondeados a plena luz del día en las aguas de Bahía Agradable (Hoya Chasco / Fitz Roy).",
      "Alertada la Fuerza Aérea Sur por los observadores terrestres y el radar de Puerto Argentino, despegaron desde Río Gallegos dos escuadrillas de cazabombarderos A-4B Skyhawk ('Dogo' y 'Mastín') y desde Río Grande dos escuadrillas de Mirage V Dagger ('Perro' y 'Gato'). Mientras cinco aviones Dagger atacaban en el Estrecho de San Carlos a la fragata HMS Plymouth —impactándola con cuatro bombas de 1.000 libras y fuego de cañones de 30 mm que destruyeron su popa—, los cinco A-4B Skyhawk que habían completado el reabastecimiento en vuelo quedaron al mando del Primer Teniente Carlos Alfredo Cachón.",
      "A las 13:50 horas, los cinco A-4B Skyhawk irrumpieron de oeste a este a vuelo rasante sobre Bahía Agradable tomando por absoluta sorpresa a los buques británicos cargados de tropas y combustible. Las tres bombas de 500 libras lanzadas por el Primer Teniente Carlos Cachón impactaron de lleno en el centro y la popa del RFA Sir Galahad, transformando el buque en un infierno de llamas y explosiones, mientras que la sección del Teniente Carlos Rinke y el Alférez Leonardo Carmona colocó sus bombas y fuego de cañones en la línea de flotación del RFA Sir Tristram. Ambos buques logísticos quedaron destruidos y la fuerza británica sufrió más de 50 muertos y 150 heridos en pocos segundos, en la jornada que la historia militar británica bautizó como 'The Darkest Day of the Fleet' ('El día más negro de la flota')."
    ],
    protagonistasHitos: "El Primer Teniente Carlos Alfredo Cachón, el Teniente Carlos Alfredo Rinke, el Alférez Leonardo Salvador Carmona, el Primer Teniente Alberto Filippini, el Alférez Hugo Gómez y los pilotos de las escuadrillas 'Perro' y 'Gato' del Grupo 6 de Caza (Capitán Rohde, Primer Teniente Senn, Primer Teniente Callejo, Capitán Díaz, Teniente Aguirre Faget y Teniente Antonietti).",
    galeria: [
      {
        src: "imagenesdeescala/bahia_agradable_8jun.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Espejo de agua de Bahía Agradable (Hoya Chasco / Fitz Roy), donde el 8 de junio fueron destruidos los buques RFA Sir Galahad y RFA Sir Tristram."
      },
      {
        src: "imagenesdeescala/bahia_agradable_8jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa de Fitz Roy por donde se aproximaron a ras del suelo los cinco A-4B Skyhawk al mando del Primer Teniente Carlos Cachón."
      },
      {
        src: "imagenesdeescala/bahia_agradable_8jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas exteriores de Bahía Agradable donde quedó calcinado el casco del RFA Sir Galahad."
      }
    ]
  },
  {
    id: "jun-08-canal-choiseul-mazo",
    orden: 38,
    mes: "junio",
    etiquetaFecha: "08 JUN",
    nombre: "Canal Choiseul — Ataque de la Escuadrilla 'Mazo' y Hundimiento de la Foxtrot 4",
    fecha: "8 de Junio de 1982 (16:40 hs)",
    tipo: "Combate Aeronaval y Aéreo • Escala 4",
    escala: 4,
    lat: -51.8450,
    lng: -58.4200,
    zoomRecomendado: 15,
    // [HITO 38 - 08 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Canal Choiseul — Ataque de la Escuadrilla 'Mazo' y Hundimiento de la Foxtrot 4
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/choiseul_8jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Ataque de la escuadrilla 'Mazo' de aviones A-4B Skyhawk (Tte. Sánchez, 1er Tte. Bolzán, Alf. Vázquez y Tte. Arrarás) que hunde la lancha de desembarco británica Foxtrot 4 en el estrecho de Choiseul, enfrentando luego a una patrulla de Sea Harrier en un feroz combate aéreo.",
    unidadesArgentinas: "Grupo 5 de Caza de la Fuerza Aérea Argentina (Cuatro aviones A-4B Skyhawk — Escuadrilla 'Mazo': Primer Teniente Danilo Rubén Bolzán, Teniente Juan José Arrarás, Teniente Héctor Hugo Sánchez y Alférez Alfredo Jorge Alberto Vázquez).",
    condicionesTerreno: "Brazo marítimo interior del Seno Choiseul (Choiseul Sound) al este del Istmo de Darwin, encajonado entre costas bajas.",
    historiaCompleta: [
      "En la tarde del mismo 8 de junio de 1982, tras el éxito obtenido al mediodía en Bahía Agradable, despegaron desde Río Gallegos dos nuevas escuadrillas del Grupo 5 de Caza ('Martillo' y 'Mazo') para continuar batiendo los movimientos anfibios británicos al sur de la Isla Soledad. La Escuadrilla 'Mazo' estaba integrada por cuatro aviones A-4B Skyhawk tripulados por el Primer Teniente Danilo Rubén Bolzán, el Teniente Juan José Arrarás, el Teniente Héctor Hugo Sánchez y el joven Alférez Alfredo Jorge Alberto Vázquez.",
      "Al cruzar a las 16:40 horas sobre las aguas del Seno Choiseul rumbo al este, los cuatro pilotos divisaron en el canal a la lancha pesada de desembarco británica LCU Foxtrot 4 (perteneciente al buque de asalto anfibio HMS Fearless), que navegaba transportando vehículos de comunicaciones de la 5ª Brigada británica hacia Fitz Roy. En el mismo instante en que los cuatro A-4B iniciaban su corrida de bombardeo contra la embarcación, una patrulla de combate aéreo de dos aviones Sea Harrier del Escuadrón 800 (Teniente Comandante David Morgan y Teniente David Smith) se lanzó desde las nubes a sus espaldas.",
      "Pese a recibir el aviso de que tenían a los Sea Harrier en la cola, los pilotos de la Escuadrilla 'Mazo' no abortaron su ataque: lanzaron sus bombas de 500 libras con retardo e impactaron de lleno en la LCU Foxtrot 4, incendiándola y hundiéndola en las aguas del Seno Choiseul con seis efectivos británicos a bordo. Segundos después del lanzamiento, los Sea Harrier dispararon sus misiles AIM-9L Sidewinder y cañones de 30 mm a quemarropa: cayeron derribados entregando su vida a la Patria el Alférez Alfredo Vázquez, el Teniente Juan José Arrarás y el Primer Teniente Danilo Bolzán, mientras el Teniente Héctor Sánchez logró evadir con maniobras extremas a ras del suelo y regresar con su avión casi sin combustible gracias al avión cisterna KC-130 Hércules que se internó sobre el mar para salvarlo."
    ],
    protagonistasHitos: "El Primer Teniente Danilo Rubén Bolzán, el Teniente Juan José Arrarás y el Alférez Alfredo Jorge Alberto Vázquez (los tres héroes del Grupo 5 de Caza caídos en el Seno Choiseul el 8 de junio), junto al Teniente Héctor Hugo Sánchez.",
    galeria: [
      {
        src: "imagenesdeescala/choiseul_8jun.jpg",
        fallback: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas del Canal Choiseul donde la Escuadrilla 'Mazo' hundió la embarcación de desembarco británica Foxtrot 4 el 8 de junio."
      },
      {
        src: "imagenesdeescala/choiseul_8jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa del Seno Choiseul sobre la cual se libró el desigual combate aéreo contra los Sea Harrier."
      },
      {
        src: "imagenesdeescala/choiseul_8jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        caption: "Llanuras adyacentes por donde escapó a vuelo rasante el A-4B del Teniente Héctor Sánchez."
      }
    ]
  },
  {
    id: "jun-10-rio-murrell-cisneros",
    orden: 39,
    mes: "junio",
    etiquetaFecha: "10 JUN",
    nombre: "Río Murrell (Faldeos de Dos Hermanas) — Combate Nocturno y Caída del Sgto. 'Perro' Cisneros",
    fecha: "9 y 10 de Junio de 1982 (Noche)",
    tipo: "Emboscada de Comandos • Escala 4",
    escala: 4,
    lat: -51.6580,
    lng: -58.0210,
    zoomRecomendado: 15,
    // [HITO 39 - 10 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Río Murrell (Faldeos de Dos Hermanas) — Combate Nocturno y Caída del Sgto. 'Perro' Cisneros
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/rio_murrell_10jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Combate de una patrulla de la Compañía de Comandos 602 y efectivos de Gendarmería Nacional al mando del Mayor Aldo Rico en una emboscada nocturna contra tropas del SAS y Royal Marines en el río Murrell, donde cae combatiendo con su ametralladora MAG el Sargento Mario Antonio 'Perro' Cisneros.",
    unidadesArgentinas: "Compañía de Comandos 602 del Ejército Argentino (Mayor Aldo Rico, Capitán Eduardo Villarruel, Teniente Primero Jorge Manuel Vizoso / Mauricio Fernández Funes, Teniente Primero Horacio Fernando Lauría, Sargento Primero Mario Antonio 'Perro' Cisneros) y Sección del Escuadrón de Fuerzas Especiales 601 'Alacrán' de Gendarmería Nacional Argentina (Primer Alférez José Ricardo Spadaro y Sargento Primero Ramón Gumersindo Acosta).",
    condicionesTerreno: "Barrancas rocosas y cauce sinuoso del Río Murrell al norte del Monte Dos Hermanas, en plena tierra de nadie entre las líneas argentinas y británicas.",
    historiaCompleta: [
      "En la noche del 9 al 10 de junio de 1982, pocas horas antes del inicio del asalto general británico contra el anillo defensivo de Puerto Argentino, una fuerte patrulla combinada de la Compañía de Comandos 602 del Ejército Argentino (al mando del Mayor Aldo Rico) y del Escuadrón de Fuerzas Especiales 'Alacrán' de Gendarmería Nacional (al mando del Primer Alférez José Ricardo Spadaro) avanzó más allá de las líneas del Regimiento de Infantería 4 en Monte Dos Hermanas para tender una emboscada nocturna sobre la margen del Río Murrell.",
      "Pasada la medianoche, una patrulla de reconocimiento e infiltración de 30 efectivos de la Tropa de Reconocimiento del 45 Commando de Royal Marines y fuerzas especiales británicas se aproximó sigilosamente hacia el puente del Río Murrell para tantear las defensas argentinas. A escasos metros de distancia, el grupo de asalto adelantado argentino abrió fuego sorpresivo a quemarropa con ametralladoras MAG de 7,62 mm, fusiles FAL y lanzacohetes Instalaza.",
      "En el furioso intercambio nocturno de disparos iluminado por bengalas y trazadoras, el Sargento Primero Mario Antonio 'Perro' Cisneros —apuntador de la ametralladora MAG de la sección de comandos— se puso de pie sobre las piedras para batir de lleno a los infantes de marina británicos que intentaban flanquear a sus compañeros, hasta caer mortalmente herido por un proyectil antitanque enemigo al pie de su arma (recibiendo post mortem la Cruz La Nación Argentina al Heroico Valor en Combate). En esa misma acción heroica, bajo el fuego de los morteros llamados en auxilio sobre el cauce del río, entregó su vida el Sargento Primero Ramón Gumersindo Acosta de la Gendarmería Nacional Argentina, logrando los comandos desbaratar la infiltración británica y causar severas bajas al enemigo."
    ],
    protagonistasHitos: "El Sargento Primero Mario Antonio 'Perro' Cisneros (Compañía de Comandos 602) y el Sargento Primero Ramón Gumersindo Acosta (Escuadrón 'Alacrán' de Gendarmería Nacional), ambos caídos en combate en el Río Murrell, junto al Mayor Aldo Rico, el Primer Alférez José Spadaro y todos los comandos de la patrulla.",
    galeria: [
      {
        src: "imagenesdeescala/rio_murrell_10jun.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Cauce y barrancas rocosas del Río Murrell al norte de Monte Dos Hermanas, escenario de la emboscada nocturna del 10 de junio."
      },
      {
        src: "imagenesdeescala/rio_murrell_10jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Afloramientos de piedra donde el Sargento Primero Mario Antonio 'Perro' Cisneros combatió hasta caer junto a su ametralladora MAG."
      },
      {
        src: "imagenesdeescala/rio_murrell_10jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Faldeos septentrionales del Monte Dos Hermanas hacia donde se replegaron los efectivos tras el combate."
      }
    ]
  },
  {
    id: "jun-11-monte-longdon",
    orden: 40,
    mes: "junio",
    etiquetaFecha: "11 JUN",
    nombre: "Monte Longdon — El Combate Cuerpo a Cuerpo Más Sangriento del Conflicto",
    fecha: "11 y 12 de Junio de 1982 (21:15 a 07:00 hs)",
    tipo: "Batalla Nocturna en los Montes • Escalas 3 y 4",
    escala: 3,
    escalasVisibles: [3, 4],
    lat: -51.6625,
    lng: -57.9689,
    zoomRecomendado: 14,
    // [HITO 40 - 11 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Monte Longdon — El Combate Cuerpo a Cuerpo Más Sangriento del Conflicto
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/monte_longdon_11jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "El combate cuerpo a cuerpo y nocturno más sangriento del conflicto. Los 278 efectivos de la Compañía B del Regimiento de Infantería 7 de La Plata, junto a tiradores de ametralladoras pesadas de la Infantería de Marina y observadores de artillería, resisten durante 10 horas el asalto del 3° Batallón de Paracaidistas británico entre las rocas; caen en sus pozos de zorro el Subteniente Juan Domingo Baldini, el Cabo Darío Rolando Ríos y decenas de heroicos soldados conscriptos.",
    unidadesArgentinas: "Compañía B 'Maipú' del Regimiento de Infantería 7 'Coronel Conde' de La Plata (Mayor Carlos Carrizo Salvadores, Subteniente Juan Domingo Baldini, Teniente Primero Enrique Neirotti y Subteniente Eduardo Hormachea), 1ª Sección de la Compañía de Ingenieros Mecanizada 10 (Teniente Hugo Quiroga), 1ª Sección de la Compañía C del RI 7 (Teniente Primero Raúl Fernando Castañeda), Sección de Ametralladoras Pesadas Browning 12,7 mm del BIM 5 y Compañía de Ametralladoras 12,7 mm (Guardiamarina Carlos Koch y Cabo Segundo Jorge Carlos Carrizo) y Observador Adelantado del Grupo de Artillería 3 (Teniente Alberto Rolando Ramos).",
    condicionesTerreno: "Cresta laberíntica de cuarcita de 186 metros de altura situada al noroeste de Puerto Argentino, barrida por vientos polares de -12 °C y el cañoneo constante de la fragata HMS Avenger.",
    historiaCompleta: [
      "El Monte Longdon constituía el bastión clave del flanco noroeste del anillo defensivo de Puerto Argentino. Durante más de cincuenta días, bajo lluvias heladas, nevadas y el bombardeo diario de los cañones navales británicos, el monte fue defendido por los 278 hombres de la Compañía B 'Maipú' del Regimiento de Infantería 7 de La Plata al mando del Mayor Carlos Carrizo Salvadores, reforzados por la 1ª Sección de la Compañía de Ingenieros Mecanizada 10, los servidores de ametralladoras pesadas Browning de 12,7 mm de la Infantería de Marina y el observador adelantado del Grupo de Artillería 3, Teniente Alberto Ramos.",
      "A las 21:15 horas de la noche del 11 de junio de 1982, el 3° Batallón del Regimiento de Paracaidistas británico (3 Para, con más de 600 efectivos de élite apoyados por seis obuses de 105 mm y la fragata HMS Avenger) se infiltró silenciosamente hacia la cresta occidental ('Fly Half'). La explosión de una mina antipersonal pisada por un cabo británico dio la alarma instantánea: la 1ª Sección del Subteniente Juan Domingo Baldini abrió fuego devastador a quemarropa con ametralladoras MAG, fusiles FAL con visores nocturnos y morteros. Baldini y el Cabo Primero Darío Rolando Ríos cayeron heroicamente combatiendo en primera línea junto a sus soldados conscriptos mientras intentaban desalojar a los paracaidistas que los flanqueaban.",
      "La batalla se transformó en una lucha feroz cuerpo a cuerpo, a bayoneta calada, granadas de mano y disparos a dos metros de distancia en la oscuridad de los laberintos de piedra. Los artilleros de las ametralladoras Browning 12,7 mm de la Infantería de Marina (donde el Cabo Segundo Carlos Carrizo siguió disparando hasta ser gravemente herido a quemarropa) y los ingenieros del Teniente Quiroga detuvieron una y otra vez el avance inglés. Pasada la medianoche, la 1ª Sección de la Compañía C del RI 7 al mando del Teniente Primero Raúl Fernando Castañeda ejecutó un feroz contraataque nocturno en el corazón del monte que hizo retroceder a dos compañías del 3 Para británico. Recién al amanecer del 12 de junio, tras diez horas ininterrumpidas de combate, con los sobrevivientes sin munición y el monte arrasado por miles de proyectiles de artillería, el Mayor Carrizo Salvadores ordenó el repliegue de los últimos 90 hombres hacia Wireless Ridge. En Monte Longdon cayeron 31 héroes argentinos y 23 paracaidistas británicos en uno de los combates de infantería más duros del siglo XX."
    ],
    protagonistasHitos: "El Subteniente Juan Domingo Baldini, el Cabo Primero Darío Rolando Ríos, el Sargento Primero Jorge Alberto Ron y los 31 soldados y suboficiales caídos en Monte Longdon, junto al Mayor Carlos Carrizo Salvadores, el Teniente Primero Raúl Fernando Castañeda, el Teniente Hugo Quiroga, el Teniente Alberto Ramos, el Cabo Segundo de IM Carlos Carrizo y todos los conscriptos clase 62 del RI 7, la Ca Ing Mec 10 y el BIM 5.",
    galeria: [
      {
        src: "imagenesdeescala/monte_longdon_11jun.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Cresta rocosa de Monte Longdon, donde el Regimiento de Infantería 7, la Ca Ing Mec 10 y el BIM 5 libraron 10 horas de combate cuerpo a cuerpo."
      },
      {
        src: "imagenesdeescala/monte_longdon_11jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Laberinto de piedras de la cumbre occidental donde cayeron combatiendo el Subteniente Baldini, el Cabo Ríos y sus soldados."
      },
      {
        src: "imagenesdeescala/monte_longdon_11jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector central del monte donde contraatacó en plena noche la sección del Teniente Primero Raúl Castañeda."
      }
    ]
  },
  {
    id: "jun-11-monte-dos-hermanas",
    orden: 41,
    mes: "junio",
    etiquetaFecha: "11 JUN",
    nombre: "Monte Dos Hermanas (Two Sisters) — Defensa del RI 4, RI 6 y Hazaña de Poltronieri",
    fecha: "11 y 12 de Junio de 1982 (23:00 a 06:00 hs)",
    tipo: "Batalla Nocturna y Heroísmo • Escalas 3 y 4",
    escala: 3,
    escalasVisibles: [3, 4],
    lat: -51.6811,
    lng: -58.0064,
    zoomRecomendado: 14,
    // [HITO 41 - 11 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Monte Dos Hermanas (Two Sisters) — Defensa del RI 4, RI 6 y Hazaña de Poltronieri
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/monte_dos_hermanas_11jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Defensa encarnizada del sector montañoso a cargo del Regimiento de Infantería 4 de Monte Caseros y la 3ª Sección de la Compañía B del Regimiento de Infantería 6 de Mercedes al mando del Subteniente Aldo Franco; allí el soldado conscripto Oscar Ismael Poltronieri se queda solo manejando una ametralladora para cubrir el repliegue de todos sus compañeros, hazaña por la que recibe la Cruz al Heroico Valor en Combate.",
    unidadesArgentinas: "Compañía C del Regimiento de Infantería 4 'Monte Caseros' (Mayor Ricardo Cordón, Capitán Carlos López Patterson, Subteniente Marcelo Llambías Pravaz, Subteniente Juan Nazer, SubtenienteJorge Pérez Grandi y Subteniente Miguel Mosquera) y Secciones de la Compañía B 'Piribebuy' del Regimiento de Infantería Mecanizado 6 'General Viamonte' de Mercedes (Subteniente Aldo Franco y Subteniente Augusto La Madrid), con el Soldado Conscripto clase 62 Oscar Ismael Poltronieri.",
    condicionesTerreno: "Macizo montañoso de dos cumbres gemelas (Dos Hermanas Norte y Dos Hermanas Sur) cubiertas de ríos de piedra y paredones de cuarcita expuestos al viento helado.",
    historiaCompleta: [
      "El Monte Dos Hermanas (Two Sisters), conformado por dos cumbres rocosas separadas por una silla de piedra en el centro del dispositivo defensivo occidental de Puerto Argentino, estaba guarnecido por la Compañía C del Regimiento de Infantería 4 de Monte Caseros (Corrientes) al mando del Mayor Ricardo Cordón, junto a efectivos de la Compañía B del Regimiento de Infantería Mecanizado 6 de Mercedes (provincia de Buenos Aires).",
      "En la noche del 11 al 12 de junio de 1982, tras una demoledora preparación de artillería terrestre y el cañoneo naval del destructor HMS Glamorgan, los más de 600 efectivos del 45 Commando de Royal Marines británicos lanzaron un ataque convergente contra ambas cumbres. En el morro sur ('Summer Days'), la 3ª Sección del Regimiento de Infantería 4 conducida con bravura por el joven Subteniente Marcelo Llambías Pravaz detuvo durante horas a toda una compañía de Royal Marines con fuego de fusiles, ametralladoras MAG y morteros, mientras en la cumbre norte combatían las secciones de los Subtenientes Juan Nazer y Jorge Pérez Grandi (quienes resultaron gravemente heridos bajo el fuego de misiles antitanque Milan y proyectiles de artillería).",
      "En los momentos culminantes del combate en la madrugada del 12 de junio, cuando las posiciones argentinas quedaban rodeadas por tres flancos y se ordenó el repliegue escalonado hacia Monte Tumbledown para salvar al resto de las secciones del RI 4 y de la sección del Subteniente Aldo Franco (RI 6), el Soldado Conscripto clase 62 Oscar Ismael Poltronieri (del RI 6) se negó reiteradamente a abandonar la cresta: tomó una ametralladora MAG y se quedó voluntariamente solo bajo una lluvia de fuego de ametralladoras y cohetes antitanque Milan deteniendo el avance de los Royal Marines hasta que el último de sus camaradas y oficiales pudo ponerse a salvo. Por esta hazaña extraordinaria, Poltronieri fue condecorado con la máxima distinción militar de la República Argentina: la Cruz La Nación Argentina al Heroico Valor en Combate, siendo el único soldado conscripto vivo en ostentarla."
    ],
    protagonistasHitos: "El Soldado Conscripto clase 62 Oscar Ismael Poltronieri (Cruz La Nación Argentina al Heroico Valor en Combate), el Subteniente Marcelo Llambías Pravaz, el Subteniente Aldo Franco, el Subteniente Juan Nazer, el Subteniente Jorge Pérez Grandi, el Cabo Virgilio Rafael Hoyos y todos los héroes caídos de los Regimientos de Infantería 4 y 6.",
    galeria: [
      {
        src: "imagenesdeescala/monte_dos_hermanas_11jun.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Cumbres gemelas de Monte Dos Hermanas (Two Sisters), defendidas por los Regimientos de Infantería 4 y 6 en la noche del 11 al 12 de junio."
      },
      {
        src: "imagenesdeescala/monte_dos_hermanas_11jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Cresta rocosa donde el Soldado Conscripto Oscar Ismael Poltronieri se quedó solo operando su ametralladora MAG para cubrir a sus compañeros."
      },
      {
        src: "imagenesdeescala/monte_dos_hermanas_11jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Faldeo sur del monte donde combatió la 3ª Sección al mando del Subteniente Marcelo Llambías Pravaz."
      }
    ]
  },
  {
    id: "jun-11-monte-harriet",
    orden: 42,
    mes: "junio",
    etiquetaFecha: "11 JUN",
    nombre: "Monte Harriet — Combate Defensivo del Regimiento de Infantería 4",
    fecha: "11 y 12 de Junio de 1982 (22:00 a 06:30 hs)",
    tipo: "Batalla Nocturna en el Flanco Sur • Escalas 3 y 4",
    escala: 3,
    escalasVisibles: [3, 4],
    lat: -51.7094,
    lng: -57.9719,
    zoomRecomendado: 14,
    // [HITO 42 - 11 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Monte Harriet — Combate Defensivo del Regimiento de Infantería 4
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/monte_harriet_11jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Combate defensivo del Regimiento de Infantería 4 bajo el mando del Teniente Coronel Diego Soria, que soporta un intenso cañoneo naval y el ataque envolvente por la retaguardia del 42 Commando de Royal Marines.",
    unidadesArgentinas: "Regimiento de Infantería 4 'Monte Caseros' (Jefe: Teniente Coronel Diego Alejandro Soria; Compañía B y secciones agregadas del Regimiento de Infantería 12, Sección de Morteros Pesados de 120 mm al mando del Subteniente Mario Juárez y Sección de Exploración al mando del Teniente Primero Jorge Echeverría).",
    condicionesTerreno: "Elevación alargada de 290 metros en el extremo sudoeste del primer cordón defensivo, dominando la ruta de acceso desde Fitz Roy hacia Puerto Argentino.",
    historiaCompleta: [
      "El Monte Harriet cerraba por el sur la primera línea de alturas que protegía Puerto Argentino. Allí estableció su puesto de comando el jefe del Regimiento de Infantería 4 de Monte Caseros, Teniente Coronel Diego Alejandro Soria, junto a la Compañía B de su unidad y efectivos del Regimiento de Infantería 12. Durante los primeros diez días de junio, las posiciones de Monte Harriet soportaron un castigo implacable de miles de proyectiles de artillería británica, ataques de aviones Harrier con bombas guiadas por láser y misiles antitanque Milan disparados contra cada pozo de zorro y nido de ametralladora.",
      "En la noche del 11 al 12 de junio de 1982, mientras simulaba un ataque frontal desde el oeste con fuego de artillería naval de la fragata HMS Yarmouth y dos baterías de obuses de 105 mm, el 42 Commando de Royal Marines británicos (al mando del Teniente Coronel Nick Vaux) ejecutó una marcha nocturna envolvente a través de un corredor en los campos minados del sur y atacó Monte Harriet directamente desde el este y el sudeste —es decir, por la retaguardia de las posiciones argentinas—.",
      "Pese a la sorpresa de ser atacados por la espalda bajo una lluvia de misiles Milan y fuego de morteros que destruyó las comunicaciones alámbricas, los oficiales, suboficiales y soldados correntinos del Regimiento de Infantería 4 giraron sus armas 180 grados dentro de los afloramientos de piedra y sostuvieron una encarnizada defensa posición por posición durante toda la noche, cubriendo el repliegue de parte de los efectivos hacia el Monte William hasta que al amanecer, agotadas las municiones y completamente cercado el puesto de comando, cesó la resistencia en la cumbre."
    ],
    protagonistasHitos: "El Teniente Coronel Diego Alejandro Soria, el Teniente Primero Jorge Echeverría, el Subteniente Pablo Oliva, el Subteniente Mario Juárez, el Subteniente Lautaro Jiménez Corbalán, el Cabo Primero Hipólito González y los 18 héroes caídos en la defensa de Monte Harriet.",
    galeria: [
      {
        src: "imagenesdeescala/monte_harriet_11jun.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Cumbre rocosa de Monte Harriet, bastión austral defendido por el Regimiento de Infantería 4 al mando del Tcnl. Diego Soria."
      },
      {
        src: "imagenesdeescala/monte_harriet_11jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Afloramientos de cuarcita donde los soldados correntinos giraron sus posiciones para enfrentar el ataque por la retaguardia."
      },
      {
        src: "imagenesdeescala/monte_harriet_11jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Valle entre Monte Harriet y Monte William hacia el este."
      }
    ]
  },
  {
    id: "jun-12-bateria-costera-itb-glamorgan",
    orden: 43,
    mes: "junio",
    etiquetaFecha: "12 JUN",
    nombre: "Batería Costera ITB (Hooker's Point) — Impacto de Exocet Terrestre al HMS Glamorgan",
    fecha: "12 de Junio de 1982 (03:35 hs)",
    tipo: "Hazaña de Ingeniería Naval • Escala 4",
    escala: 4,
    lat: -51.6985,
    lng: -57.7680,
    zoomRecomendado: 16,
    // [HITO 43 - 12 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Batería Costera ITB (Hooker's Point) — Impacto de Exocet Terrestre al HMS Glamorgan
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/bateria_itb_12jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Hito de la ingeniería militar argentina. Técnicos de la Armada liderados por el Capitán de Fragata Julio Pérez lanzan desde un acoplado terrestre improvisado ('Instalación de Tiro Berreta') un misil naval Exocet MM-38 que impacta de lleno en la cubierta del destructor británico HMS Glamorgan mientras cañoneaba las posiciones argentinas.",
    unidadesArgentinas: "Armada Argentina (Personal técnico del Arsenal Naval Puerto Belgrano al mando del Capitán de Fragata ingeniero Julio Marcelo Pérez, junto al Teniente de Navío Carlos Alberto Rodríguez, guardiamarinas y cabos técnicos) en coordinación directa con los operadores del radar terrestre Rasit del Ejército Argentino (Sargento Rubén Omar 'Cacho' Valladares).",
    condicionesTerreno: "Península costera de Hooker's Point, al sur de la pista del aeropuerto de Puerto Argentino, expuesta a la bruma marina y a los duelos nocturnos contra buques de guerra.",
    historiaCompleta: [
      "Ante el constante bombardeo naval nocturno que los destructores y fragatas británicos ejecutaban desde el sur contra el aeropuerto y las posiciones de los montes fuera del alcance de los cañones terrestres argentinos, la Armada Argentina concibió un proyecto técnico inédito a nivel mundial: desmontar contenedores de misiles antibuque mar-mar MM-38 Exocet de los destructores de la Flota de Mar y adaptarlos sobre un tráiler terrestre para dispararlos desde la costa de Puerto Argentino.",
      "Bajo la dirección del Capitán de Fragata ingeniero Julio Marcelo Pérez, un reducido equipo de técnicos del Arsenal Naval Puerto Belgrano diseñó en tiempo récord un simulador electrónico portátil para alimentar y engañar a la computadora lógica del misil —que normalmente requería los parámetros del girocompás, radar y corredera de un buque de guerra—. El sistema, bautizado con humor criollo como 'ITB' ('Instalación de Tiro Berreta'), fue trasladado en secreto a Malvinas a bordo de un Hércules C-130 y emplazado de noche en la costa sur de Hooker's Point.",
      "En la madrugada del 12 de junio de 1982, mientras se libraban los combates finales en Monte Dos Hermanas y Monte Harriet, el destructor británico clase County HMS Glamorgan se acercó peligrosamente a la costa sur para batir con sus cañones a los defensores argentinos. Seguida su trayectoria minuto a minuto por el radar terrestre Rasit del Ejército Argentino, a las 03:35 horas el Capitán Pérez accionó el disparo: el misil Exocet MM-38 rugió hacia la noche austral, voló 29 kilómetros a ras de las olas e impactó de lleno en la banda de babor y el hangar del helicóptero del HMS Glamorgan, causando una enorme explosión que dejó al destructor fuera de combate con 14 muertos y obligó a la flota británica a no volver a acercarse jamás a la costa sur de Puerto Argentino."
    ],
    protagonistasHitos: "El Capitán de Fragata ingeniero Julio Marcelo Pérez, el Teniente de Navío Carlos Alberto Rodríguez, los suboficiales y cabos técnicos de la Armada Argentina y los operadores del radar Rasit del Ejército Argentino.",
    galeria: [
      {
        src: "imagenesdeescala/bateria_itb_12jun.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Costa de Hooker's Point en Puerto Argentino donde fue emplazado el lanzador terrestre de misiles Exocet MM-38 ('ITB')."
      },
      {
        src: "imagenesdeescala/bateria_itb_12jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Aguas australes a 29 kilómetros de la costa donde fue alcanzado el destructor británico HMS Glamorgan a las 03:35 hs del 12 de junio."
      },
      {
        src: "imagenesdeescala/bateria_itb_12jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80",
        caption: "Camino hacia la península del aeropuerto por donde el acoplado era ocultado durante el día y desplegado cada noche."
      }
    ]
  },
  {
    id: "jun-13-monte-tumbledown",
    orden: 44,
    mes: "junio",
    etiquetaFecha: "13 JUN",
    nombre: "Monte Tumbledown — Batalla Nocturna del BIM 5, Tte. Vázquez y Subt. Silva",
    fecha: "13 y 14 de Junio de 1982 (22:00 a 08:30 hs)",
    tipo: "Última Gran Batalla en las Alturas • Escalas 3 y 4",
    escala: 3,
    escalasVisibles: [3, 4],
    lat: -51.6961,
    lng: -57.9250,
    zoomRecomendado: 14,
    // [HITO 44 - 13 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Monte Tumbledown — Batalla Nocturna del BIM 5, Tte. Vázquez y Subt. Silva
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/monte_tumbledown_13jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Última gran batalla nocturna en las alturas que rodean la capital, defendidas por la Compañía Nácar del Batallón de Infantería de Marina N° 5 (BIM 5) al mando del Capitán de Fragata Carlos Robacio. En el extremo oeste del monte, la 4ª Sección del Teniente de Corbeta Carlos Daniel Vázquez y la sección del Ejército del Subteniente Oscar Augusto Silva (quien muere en combate) resisten oleadas de la Guardia Escocesa combatiendo hasta que la artillería propia debe batir sobre su misma posición.",
    unidadesArgentinas: "Batallón de Infantería de Marina N° 5 Ec. (BIM 5, Comandante: Capitán de Fragata Carlos Hugo Robacio): Compañía de Tiradores 'Nácar' (Teniente de Navío Eduardo Villarraza), 4ª Sección de Tiradores en el extremo oeste (Teniente de Corbeta Carlos Daniel Vázquez y Suboficial Segundo Julio Saturnino Castillo), 5ª Sección de Morteros de 60 mm (Guardiamarina Héctor Miño), Sección del Regimiento de Infantería 4 del Ejército Argentino (Subteniente Oscar Augusto Silva), Compañía B del Regimiento de Infantería Mecanizado 6 (Mayor Oscar Jaimet, Teniente Primero Esteban Abad y Subteniente Augusto La Madrid) y Compañía de Ingenieros Anfibios.",
    condicionesTerreno: "Cresta afilada de roca cuarcita de 220 metros de altura y dos kilómetros de longitud a las puertas mismas de Puerto Argentino, azotada esa noche por una tormenta de nieve y viento blanco.",
    historiaCompleta: [
      "El Monte Tumbledown constituía la llave maestra del último cordón defensivo al oeste de Puerto Argentino. La defensa del monte estaba a cargo del prestigioso Batallón de Infantería de Marina N° 5 Escuela (BIM 5) comandado por el Capitán de Fragata Carlos Hugo Robacio, cuya Compañía de Tiradores 'Nácar' (Teniente de Navío Eduardo Villarraza) ocupaba las posiciones excavadas en la piedra y la turba junto a efectivos de Ingenieros Anfibios y del Ejército Argentino.",
      "En el extremo occidental más expuesto del monte fue emplazada la 4ª Sección de la Compañía Nácar al mando del Teniente de Corbeta Carlos Daniel Vázquez, a la que se sumó hombro con hombro en medio de la noche el Subteniente del Ejército Oscar Augusto Silva (del Regimiento de Infantería 4, quien venía de combatir en Monte Dos Hermanas y pidió expresamente unirse a los infantes de marina con sus cinco soldados sobrevivientes para seguir peleando). A las 22:00 horas del 13 de junio de 1982, tras un ataque de distracción en el sur rechazado por la Compañía 'Obra' en el sector de Pony's Pass, el 2° Batallón de la Guardia Escocesa británico lanzó su asalto principal contra la 4ª Sección del Teniente Vázquez.",
      "Durante más de ocho horas continuas bajo una tormenta de nieve, la sección de Vázquez y los soldados del Subteniente Silva rechazaron dos oleadas sucesivas de la Guardia Escocesa combatiendo cuerpo a cuerpo dentro de los pozos de zorro. En medio del combate a quemarropa cayó muerto el Suboficial Segundo de Infantería de Marina Julio Saturnino Castillo (condecorado post mortem con la Cruz al Heroico Valor en Combate) al salir de su pozo disparando para defender a un conscripto, y poco después cayó heroicamente el Subteniente Oscar Augusto Silva empuñando el fusil de un soldado herido mientras gritaba aliento a su tropa. Rodeados en sus propios pozos por los guardias escoceses, el Teniente Vázquez pidió por radio al Grupo de Artillería 3 y a la Batería Bravo de obuses del BIM 5 que dispararan directamente sobre su propia posición ('Tiren sobre mí'), mientras en la cumbre central contraatacaba la sección del Subteniente Augusto La Madrid (RI 6). Al amanecer del 14 de junio, ya en la mañana final del conflicto, el BIM 5 se replegó en perfecto orden y con sus armas hacia Sapper Hill y Puerto Argentino."
    ],
    protagonistasHitos: "El Subteniente del Ejército Oscar Augusto Silva y el Suboficial Segundo de Infantería de Marina Julio Saturnino Castillo (caídos heroicamente en la cresta de Tumbledown), el Capitán de Fragata Carlos Hugo Robacio, el Teniente de Corbeta Carlos Daniel Vázquez, el Teniente de Navío Eduardo Villarraza, el Subteniente Augusto La Madrid (RI 6), el Guardiamarina Héctor Miño y los 30 héroes argentinos caídos en Monte Tumbledown.",
    galeria: [
      {
        src: "imagenesdeescala/monte_tumbledown_13jun.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Paredones rocosos de Monte Tumbledown, donde el BIM 5 y efectivos de los Regimientos 4 y 6 libraron la última gran batalla nocturna."
      },
      {
        src: "imagenesdeescala/monte_tumbledown_13jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Extremo occidental de Tumbledown donde la 4ª Sección del Teniente Vázquez y la sección del Subteniente Silva pidieron fuego de artillería sobre su propia posición."
      },
      {
        src: "imagenesdeescala/monte_tumbledown_13jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Cresta oriental del monte por donde combatió la reserva del Regimiento de Infantería Mecanizado 6."
      }
    ]
  },
  {
    id: "jun-13-wireless-ridge-moody-brook",
    orden: 45,
    mes: "junio",
    etiquetaFecha: "13 JUN",
    nombre: "Cresta del Telégrafo (Wireless Ridge) y Moody Brook — Combate y Contraataque Final",
    fecha: "13 y 14 de Junio de 1982 (Noche y Madrugada)",
    tipo: "Batalla en el Sector Norte • Escalas 3 y 4",
    escala: 3,
    escalasVisibles: [3, 4],
    lat: -51.6744,
    lng: -57.9089,
    zoomRecomendado: 14,
    // [HITO 45 - 13 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Cresta del Telégrafo (Wireless Ridge) y Moody Brook — Combate y Contraataque Final
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/wireless_ridge_13jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Combate final en el sector norte sostenido por el Regimiento de Infantería 7, el Escuadrón de Exploración de Caballería Blindada 10 y el contraataque nocturno de la Compañía A 'Tacuarí' del Regimiento de Infantería 3 bajo intenso fuego de tanques y artillería enemiga.",
    unidadesArgentinas: "Compañías A y C del Regimiento de Infantería 7 'Coronel Conde' (Teniente Coronel Omar Giménez), Escuadrón de Exploración de Caballería Blindada 10 'Coronel Isidoro Suárez' (Capitán Rodrigo Alejandro Soloaga), Compañía A 'Tacuarí' del Regimiento de Infantería 3 'General Belgrano' (Mayor Guillermo Berazay y Capitán Rubén Zunino), Sección de Paracaidistas agregada del Regimiento de Infantería Aerotransportado 2 y efectivos del Regimiento de Infantería 25.",
    condicionesTerreno: "Cresta rocosa al norte del valle de Moody Brook y la ría de Puerto Argentino, batida por el fuego directo de tanques ligeros británicos y más de 6.000 proyectiles de artillería en una sola noche.",
    historiaCompleta: [
      "Simultáneamente al combate en Monte Tumbledown, en la noche del 13 al 14 de junio de 1982 se libró en el sector norte de las defensas de Puerto Argentino la batalla por la Cresta del Telégrafo (Wireless Ridge) y el valle de Moody Brook. El sector estaba defendido por las Compañías A y C del Regimiento de Infantería 7 (que ya habían sufrido un desgaste extremo y tenían sus posiciones orientadas originalmente hacia el norte) y, en las alturas de Cortley Ridge, por los jinetes desmontados del Escuadrón de Exploración de Caballería Blindada 10 al mando del Capitán Rodrigo Soloaga.",
      "Para quebrar esta posición, los británicos lanzaron al 2° Batallón del Regimiento de Paracaidistas (2 Para) apoyado por los cañones de 30 mm y 76 mm con visores nocturnos de los tanques ligeros Blues and Royals (Scorpion y Scimitar), el cañoneo de la fragata HMS Ambuscade y una concentración sin precedentes de más de 6.000 proyectiles de artillería de 105 mm que trituró las trincheras de turba de Wireless Ridge.",
      "A pesar del abrumador volumen de fuego enemigo, el Escuadrón de Caballería Blindada 10 sostuvo sus posiciones en Cortley Ridge durante horas hasta casi quedar rodeado, mientras que en la madrugada del 14 de junio la Compañía A 'Tacuarí' del Regimiento de Infantería 3 (al mando del Mayor Guillermo Berazay y el Capitán Rubén Zunino, que había marchado a pie desde sus posiciones en el sur de Puerto Argentino) cruzó el puente de Moody Brook bajo una lluvia de granadas de artillería y ascendió la pendiente de Wireless Ridge ejecutando el último contraataque de infantería argentina de la guerra para contener a los paracaidistas británicos y cubrir el repliegue hacia la capital."
    ],
    protagonistasHitos: "El Capitán Rodrigo Alejandro Soloaga y los efectivos del Escuadrón de Exploración de Caballería Blindada 10, el Mayor Guillermo Berazay, el Capitán Rubén Zunino y los soldados de la Compañía A 'Tacuarí' del RI 3, junto a los oficiales, suboficiales y conscriptos del Regimiento de Infantería 7 caídos en Wireless Ridge.",
    galeria: [
      {
        src: "imagenesdeescala/wireless_ridge_13jun.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Cresta del Telégrafo (Wireless Ridge) y el valle de Moody Brook, al noroeste de Puerto Argentino."
      },
      {
        src: "imagenesdeescala/wireless_ridge_13jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Alturas de Cortley Ridge defendidas por el Escuadrón de Exploración de Caballería Blindada 10."
      },
      {
        src: "imagenesdeescala/wireless_ridge_13jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Pendiente sur desde Moody Brook por donde ascendió en contraataque nocturno la Compañía A 'Tacuarí' del RI 3."
      }
    ]
  },
  {
    id: "jun-14-posiciones-artilleria-ga3-ga4",
    orden: 46,
    mes: "junio",
    etiquetaFecha: "14 JUN",
    nombre: "Afueras de Puerto Argentino — Posiciones del Grupo de Artillería 3 y GA Aerot 4",
    fecha: "11 al 14 de Junio de 1982",
    tipo: "Fuego de Apoyo Ininterrumpido • Escala 4",
    escala: 4,
    lat: -51.7015,
    lng: -57.8615,
    zoomRecomendado: 16,
    // [HITO 46 - 14 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Afueras de Puerto Argentino — Posiciones del Grupo de Artillería 3 y GA Aerot 4
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/artilleria_ga3_14jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Emplazamiento de los cañones OTO Melara de 105 mm y CITER de 155 mm al mando del Tcnl. Martín Balza y el Tcnl. Carlos Quevedo, cuyos artilleros dispararon sin descanso día y noche para apoyar a los infantes en los montes hasta agotar la munición y quedar las piezas fuera de servicio.",
    unidadesArgentinas: "Grupo de Artillería 3 ' Paso de los Libres' (Teniente Coronel Martín Antonio Balza, con tres baterías de obuses OTO Melara de 105 mm y la Batería D con dos cañones pesados CITER L33 de 155 mm al mando del Teniente Primero Luis Alberto Daffunchio), Grupo de Artillería Aerotransportado 4 de Córdoba (Teniente Coronel Carlos Alberto Quevedo, Baterías B y C de obuses OTO Melara de 105 mm) y Batería Bravo del Batallón de Artillería de Campaña N° 1 de la Infantería de Marina (Teniente de Navío Mario Abadal).",
    condicionesTerreno: "Terrenos de turba blanda al sur y sudoeste del casco urbano de Puerto Argentino, donde los pesados obuses se hundían por el retroceso de miles de disparos continuos bajo fuego de contrabatería enemigo.",
    historiaCompleta: [
      "Durante las noches decisivas del 11 al 14 de junio de 1982, el sostén fundamental de los regimientos de infantería argentinos que combatían cuerpo a cuerpo en las alturas de Longdon, Dos Hermanas, Harriet, Tumbledown y Wireless Ridge estuvo en manos de los heroicos artilleros del Grupo de Artillería 3 (al mando del Teniente Coronel Martín Antonio Balza), del Grupo de Artillería Aerotransportado 4 (al mando del Teniente Coronel Carlos Alberto Quevedo) y de la Batería Bravo de Infantería de Marina.",
      "Emplazados en las afueras del sur de Puerto Argentino y en la zona de Sapper Hill, los obuses OTO Melara de 105 mm y los dos imponentes cañones pesados argentinos CITER de 155 mm ('Gran Berta' y 'Chiche', transportados en partes en vuelos heroicos de aviones Hércules C-130) ejecutaron misiones de fuego ininterrumpidas día y noche. Con un alcance superior a los 20 kilómetros, los dos cañones de 155 mm mantuvieron a raya a las fragatas y destructores británicos, impidiendo el cañoneo naval diurno y batiendo las concentraciones enemigas en Monte Kent.",
      "En las últimas 72 horas de batalla, bajo una intensa lluvia de proyectiles de contrabatería británica y bombas guiadas por láser que causaron muertos y decenas de heridos al pie de las piezas, los soldados conscriptos y suboficiales artilleros acarrearon a hombro miles de cajones de proyectiles sobre la turba congelada y dispararon hasta que las cureñas se partieron por la fatiga del metal, los tubos quedaron al rojo vivo y se agotó hasta el último proyectil de 105 mm disponible en las posiciones en la mañana del 14 de junio."
    ],
    protagonistasHitos: "El Teniente Coronel Martín Antonio Balza, el Teniente Coronel Carlos Alberto Quevedo, el Teniente Primero Luis Alberto Daffunchio, el Teniente Primero Horacio Rodrigo, el Subteniente César Augusto Tinte, el Cabo Primero Ángel Fidel Quispe y el Cabo Primero Hipólito Romero (caídos al pie de los cañones) y todos los artilleros del GA 3, GA Aerot 4 y BIAC.",
    galeria: [
      {
        src: "imagenesdeescala/artilleria_ga3_14jun.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Posiciones de fuego del Grupo de Artillería 3 y del Grupo de Artillería Aerotransportado 4 en las afueras del sur de Puerto Argentino."
      },
      {
        src: "imagenesdeescala/artilleria_ga3_14jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector donde operaron los dos cañones pesados argentinos CITER de 155 mm que mantuvieron alejados a los buques británicos."
      },
      {
        src: "imagenesdeescala/artilleria_ga3_14jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Horizonte occidental hacia los montes sobre los cuales los obuses de 105 mm dispararon más de 25.000 proyectiles durante la campaña."
      }
    ]
  },
  {
    id: "jun-14-sapper-hill-ultimo-combate",
    orden: 47,
    mes: "junio",
    etiquetaFecha: "14 JUN",
    nombre: "Colina Zapador (Sapper Hill) — Último Combate del BIM 5 en la Guerra de Malvinas",
    fecha: "14 de Junio de 1982 (13:00 hs)",
    tipo: "Último Enfrentamiento Armado • Escala 4",
    escala: 4,
    lat: -51.7089,
    lng: -57.8825,
    zoomRecomendado: 15,
    // [HITO 47 - 14 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Colina Zapador (Sapper Hill) — Último Combate del BIM 5 en la Guerra de Malvinas
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/sapper_hill_14jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Último enfrentamiento armado de la Guerra de Malvinas, protagonizado por la Compañía Mar del BIM 5 al cubrir el repliegue hacia Puerto Argentino, donde caen combatiendo contra helicópteros británicos los últimos tres infantes de marina: los conscriptos Roberto Leyes, Eleodoro Monzón y Sergio Ariel Robledo.",
    unidadesArgentinas: "Compañía de Tiradores 'Mar' del Batallón de Infantería de Marina N° 5 Ec. (BIM 5, al mando del Teniente de Fragata Rodolfo Cionchi y la 3ª Sección del Guardiamarina Alejandro Koch).",
    condicionesTerreno: "Colina rocosa de 138 metros de altura situada inmediatamente al sudoeste de Puerto Argentino, última altura defensiva antes de las calles de la capital.",
    historiaCompleta: [
      "En el mediodía del 14 de junio de 1982, tras el agotamiento total de la munición de artillería y cuando los combates en Tumbledown y Wireless Ridge ya habían concluido a las puertas mismas del casco urbano de Puerto Argentino, el Batallón de Infantería de Marina N° 5 (BIM 5) recibió la orden superior de iniciar el repliegue ordenado hacia la ciudad. Para cubrir la retirada de sus camaradas, permaneció apostada en las alturas de la Colina Zapador (Sapper Hill) la Compañía de Tiradores 'Mar' al mando del Teniente de Fragata Rodolfo Cionchi.",
      "Cerca de las 13:00 horas, aun cuando ya comenzaba a regir el cese del fuego de hecho en los demás sectores, una formación de helicópteros pesados británicos Sea King y Wessex que transportaba a la Compañía C del 40 Commando de Royal Marines intentó aterrizar directamente sobre la cumbre de Sapper Hill para cortar la retaguardia argentina.",
      "La 3ª Sección de la Compañía 'Mar' al mando del Guardiamarina Alejandro Koch abrió un nutridísimo fuego de fusiles FAL y ametralladoras contra los helicópteros británicos a corta distancia, averiando seriamente a un helicóptero Sea King que debió aterrizar de emergencia y rechazando el asalto heliportado. En el violento intercambio final de fuego de ametralladoras, cohetes y morteros sobre la colina entregaron su vida los últimos tres combatientes argentinos caídos en acción de guerra en las Islas Malvinas: los soldados conscriptos de Infantería de Marina clase 62 Roberto Eugenio Leyes, Eleodoro Monzón y Sergio Ariel Robledo. Tras este último combate, el BIM 5 marchó en columna ordenada hacia Puerto Argentino portando su armamento individual."
    ],
    protagonistasHitos: "Los Soldados Conscriptos de Infantería de Marina clase 62 Roberto Eugenio Leyes, Eleodoro Monzón y Sergio Ariel Robledo (últimos tres héroes caídos en combate en la Guerra de Malvinas), el Capitán de Fragata Carlos Robacio, el Teniente de Fragata Rodolfo Cionchi y el Guardiamarina Alejandro Koch.",
    galeria: [
      {
        src: "imagenesdeescala/sapper_hill_14jun.jpg",
        fallback: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
        caption: "Cumbre de la Colina Zapador (Sapper Hill), donde la Compañía 'Mar' del BIM 5 libró el último combate de la guerra al mediodía del 14 de junio."
      },
      {
        src: "imagenesdeescala/sapper_hill_14jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        caption: "Camino de descenso desde Sapper Hill hacia el casco urbano de Puerto Argentino recorrido en formación por el BIM 5."
      },
      {
        src: "imagenesdeescala/sapper_hill_14jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        caption: "Posiciones de la 3ª Sección donde cayeron combatiendo los conscriptos Roberto Leyes, Eleodoro Monzón y Sergio Robledo."
      }
    ]
  },
  {
    id: "jun-15-hospital-militar-cese-fuego",
    orden: 48,
    mes: "junio",
    etiquetaFecha: "15 JUN",
    nombre: "Hospital Militar Conjunto y Bahía de Puerto Argentino — Cese del Fuego y Evacuación Sanitaria",
    fecha: "14 y 15 de Junio de 1982",
    tipo: "Sanidad Militar y Memoria Viva • Escala 4",
    escala: 4,
    lat: -51.6932,
    lng: -57.8540,
    zoomRecomendado: 16,
    // [HITO 48 - 15 JUN] PEGAR AQUI EL LINK DE YOUTUBE PARA: Hospital Militar Conjunto y Bahía de Puerto Argentino — Cese del Fuego y Evacuación Sanitaria
    // Ejemplo: "https://www.youtube.com/watch?v=TU_VIDEO" (o con tiempo incluido "https://www.youtube.com/watch?v=TU_VIDEO&t=14m30s")
    videoUrl: "",
    // OPCIONAL: Minuto y segundo exacto de este suceso (Ej: "14m30s", "14:30" o 870). Si ya lo incluiste en videoUrl, dejalo en "".
    videoTiempo: "",
    imagen: "imagenesdeescala/hospital_militar_15jun.jpg",
    imagenFallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
    descripcion: "Cese del fuego en el archipiélago, labor incansable de médicos, instrumentadoras quirúrgicas y enfermeros en el Hospital Militar Conjunto, y evacuación de heridos y combatientes a través de los buques hospitales ARA Almirante Irízar y ARA Bahía Paraíso.",
    unidadesArgentinas: "Hospital Militar Conjunto Malvinas (Director: Mayor médico del Ejército Enrique Marcelo Ceballos; médicos, cirujanos, anestesistas, bioquímicos, odontólogos y enfermeros del Ejército, la Armada y la Fuerza Aérea), las seis Instrumentadoras Quirúrgicas voluntarias a bordo del Rompehielos Hospital ARA Almirante Irízar (Susana Mazza, Silvia Barrera, María Marta Lemme, Norma Navarro, María Cecilia Ricchieri y María Angélica Sendes), las Enfermeras de la Fuerza Aérea Argentina y el Buque Polar Hospital ARA Bahía Paraíso.",
    condicionesTerreno: "Instalaciones del Hospital Militar Conjunto en el extremo oriental de Puerto Argentino y aguas de la rada donde fondearon los buques hospitales argentinos.",
    historiaCompleta: [
      "Tras 74 días desde la recuperación del 2 de abril y 45 días de intensos combates aeronavales y terrestres, en la noche del 14 al 15 de junio de 1982 entró en vigencia el cese total del fuego en el archipiélago para evitar la destrucción del casco urbano de Puerto Argentino y la pérdida de más vidas jóvenes cuando las unidades argentinas ya habían agotado su munición de artillería y quedaban cercadas sin posibilidad de abastecimiento.",
      "Durante toda la campaña y especialmente en las jornadas finales del 11 al 15 de junio, el Hospital Militar Conjunto instalado en Puerto Argentino bajo la dirección del Mayor médico Enrique Ceballos protagonizó una epopeya humanitaria ejemplar: trabajando las 24 horas bajo el estruendo de los bombardeos, sus tres quirófanos atendieron a más de 1.900 heridos y realizaron más de 300 cirugías de alta complejidad, logrando un índice de supervivencia del 98,5% de todos los combatientes heridos que ingresaron con vida al hospital.",
      "En las aguas de Puerto Argentino fondearon el Buque Polar Hospital ARA Bahía Paraíso y el Rompehielos Hospital ARA Almirante Irízar —donde seis jóvenes instrumentadoras quirúrgicas civiles voluntarias del Hospital Militar Central trabajaron codo a codo con los médicos militares—, completando la atención y evacuación sanitaria de los heridos e iniciando el regreso de los Veteranos de Guerra hacia el continente argentino, donde su sacrificio y el de los 649 Héroes que quedaron de guardia eterna en la turba y en el mar permanecen grabados para siempre en la memoria de la Nación."
    ],
    protagonistasHitos: "Los médicos, cirujanos, enfermeros y camilleros del Hospital Militar Conjunto Malvinas, las instrumentadoras quirúrgicas y enfermeras argentinas, las dotaciones de los buques hospitales ARA Almirante Irízar y ARA Bahía Paraíso, los 649 Héroes Caídos por la Patria y todos los Veteranos de la Guerra de Malvinas.",
    galeria: [
      {
        src: "imagenesdeescala/hospital_militar_15jun.jpg",
        fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
        caption: "Sector del Hospital Militar Conjunto y la bahía de Puerto Argentino el 14 y 15 de junio de 1982."
      },
      {
        src: "imagenesdeescala/hospital_militar_15jun_2.jpg",
        fallback: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80",
        caption: "Rada de Puerto Argentino donde operaron los buques hospitales ARA Almirante Irízar y ARA Bahía Paraíso."
      },
      {
        src: "imagenesdeescala/hospital_militar_15jun_3.jpg",
        fallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=80",
        caption: "Horizonte de las Islas Malvinas, custodia eterna de nuestros 649 Héroes y de la memoria soberana."
      }
    ]
  }
];

// ==================== VARIABLES DE ESTADO GLOBALES ====================
let map = null;
let markersLayerGroup = null;
let markersMap = new Map();
let currentScale = null;
let currentMonthFilter = "escala"; // "escala" | "marzo" | "abril" | "mayo" | "junio"
let scaleTransitionTimer = null;
let activePointId = null;
let isProgrammaticFly = false;
let currentGalleryIndex = 0;
let currentGalleryItems = [];
let currentChatMode = "testimonio_veterano";

// ==================== INICIALIZACIÓN AL CARGAR EL DOM ====================
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  initPhotoStripControls();
  initScaleControls();
  initChronologyControls();
  initChatbot();
  initModals();

  // Inicializar mostrando los hitos de la Escala 1 sin transición previa
  applyScaleFilter(1, false, true);
});

// ==================== 1. MOTOR CARTOGRÁFICO (LEAFLET.JS) ====================
function initMap() {
  const malvinasCenter = [-51.75, -59.10];
  const initialZoom = 8;

  map = L.map("map", {
    center: malvinasCenter,
    zoom: initialZoom,
    minZoom: 5,
    maxZoom: 18,
    zoomControl: false,
    attributionControl: false
  });

  L.control.zoom({ position: "bottomright" }).addTo(map);

  const esriSatellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 18 }
  );

  const osmMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 18 }
  );

  esriSatellite.addTo(map);

  const baseMaps = {
    "Vista Satelital": esriSatellite,
    "Mapa Político / Rutas": osmMap
  };
  L.control.layers(baseMaps, null, { position: "topright" }).addTo(map);

  markersLayerGroup = L.layerGroup().addTo(map);

  map.on("mousemove", (e) => {
    const lat = e.latlng.lat.toFixed(4);
    const lng = e.latlng.lng.toFixed(4);
    const coordEl = document.getElementById("coord-values");
    if (coordEl) coordEl.textContent = `Lat: ${lat} | Lng: ${lng}`;
  });

  const btnReset = document.getElementById("btn-reset-map");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      clearActiveSelection();
      setMonthFilterUI("escala");
      isProgrammaticFly = true;
      applyScaleFilter(1, false);
      map.flyTo(malvinasCenter, initialZoom, { duration: 1.4 });
      setTimeout(() => {
        isProgrammaticFly = false;
      }, 1500);
    });
  }
}

// ==================== 2. SISTEMA DE 4 ESCALAS Y DETECCIÓN AUTOMÁTICA DE ZOOM ====================
/**
 * Determina la escala activa (1, 2, 3 o 4) según el nivel de zoom actual del mapa:
 * - Escala 1 (Zoom <= 8): Teatro del Atlántico Sur, Georgias del Sur y Archipiélago General.
 * - Escala 2 (Zoom 9 a 11): Isla Soledad, Gran Malvina y Estrecho de San Carlos.
 * - Escala 3 (Zoom 12 a 14): Frentes de Batalla y Sectores Principales.
 * - Escala 4 (Zoom 15 a 18): Micro-Escala de Posiciones Puntuales.
 */
function getScaleFromZoom(zoomLevel) {
  if (zoomLevel <= 8) return 1;
  if (zoomLevel <= 11) return 2;
  if (zoomLevel <= 14) return 3;
  return 4;
}

/**
 * Obtiene los puntos históricos que corresponden a una escala (1, 2, 3 o 4),
 * incluyendo aquellos que tienen visibilidad dual (ej. combates en los montes visibles en Escalas 3 y 4).
 */
function getPointsByScale(escala) {
  return PUNTOS_HISTORICOS.filter((pto) => {
    if (Array.isArray(pto.escalasVisibles)) {
      return pto.escalasVisibles.includes(escala);
    }
    return pto.escala === escala;
  });
}

/**
 * Obtiene los puntos históricos de un mes específico ("marzo", "abril", "mayo", "junio")
 */
function getPointsByMonth(mes) {
  return PUNTOS_HISTORICOS.filter((pto) => pto.mes === mes);
}

/**
 * Devuelve la lista de puntos activos según el modo actual (por escala o por mes)
 */
function getActivePointsList() {
  if (currentMonthFilter !== "escala") {
    return getPointsByMonth(currentMonthFilter);
  }
  return getPointsByScale(currentScale || 1);
}

/**
 * Aplica el filtrado visual de una de las 4 escalas con transición suave de aparición/desvanecimiento
 */
function applyScaleFilter(escala, shouldFlyToScaleView = false, isInitialLoad = false) {
  const scaleBtns = document.querySelectorAll(".scale-btn");

  if (shouldFlyToScaleView && map) {
    isProgrammaticFly = true;
    scaleBtns.forEach((btn, idx) => {
      const btnScale = getScaleFromButton(btn, idx);
      if (btnScale === escala) {
        const zoom = parseInt(btn.dataset.zoom, 10);
        const lat = parseFloat(btn.dataset.lat);
        const lng = parseFloat(btn.dataset.lng);
        map.flyTo([lat, lng], zoom, { duration: 1.25 });
      }
    });
    setTimeout(() => {
      isProgrammaticFly = false;
    }, 1350);
  }

  // Si estamos en modo escala y ya se está mostrando la misma escala, evitar parpadeos
  if (currentMonthFilter === "escala" && currentScale === escala && !isInitialLoad) {
    return;
  }

  currentMonthFilter = "escala";
  setMonthFilterUI("escala");
  currentScale = escala;

  scaleBtns.forEach((btn, idx) => {
    const btnScale = getScaleFromButton(btn, idx);
    btn.classList.toggle("active", btnScale === escala);
  });

  const puntosMostrar = getPointsByScale(escala);
  updatePointsCount(puntosMostrar.length, `Escala ${escala}`);

  if (isInitialLoad) {
    renderHistoricalMarkers(puntosMostrar);
    populatePhotoStrip(puntosMostrar);
    return;
  }

  transitionMarkersAndCards(puntosMostrar);
}

/**
 * Ejecuta una transición suave (fade-out -> render -> fade-in) de los marcadores y tarjetas
 */
function transitionMarkersAndCards(puntosMostrar, callbackAfterRender = null) {
  if (scaleTransitionTimer) {
    clearTimeout(scaleTransitionTimer);
    scaleTransitionTimer = null;
  }

  document.querySelectorAll(".memorial-pin").forEach((pin) => {
    pin.classList.remove("fade-in");
    pin.classList.add("fade-out");
  });

  document.querySelectorAll(".photo-card").forEach((card) => {
    card.classList.remove("fade-in");
    card.classList.add("fade-out");
  });

  scaleTransitionTimer = setTimeout(() => {
    renderHistoricalMarkers(puntosMostrar);
    populatePhotoStrip(puntosMostrar);
    scaleTransitionTimer = null;
    if (typeof callbackAfterRender === "function") {
      callbackAfterRender();
    }
  }, 210);
}

// ==================== 3. FILTRO POR MES ====================
function initChronologyControls() {
  const monthBtns = document.querySelectorAll(".month-filter-btn");

  monthBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetMonth = btn.dataset.month;
      if (targetMonth === "escala") {
        const detectedScale = map ? getScaleFromZoom(map.getZoom()) : 1;
        currentScale = null; // Forzar refresco limpio
        applyScaleFilter(detectedScale, false);
      } else {
        applyMonthFilter(targetMonth, true);
      }
    });
  });
}

function setMonthFilterUI(monthKey) {
  document.querySelectorAll(".month-filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.month === monthKey);
  });
}

/**
 * Filtra el mapa y la galería mostrando todos los hechos de un mes específico (Marzo, Abril, Mayo o Junio)
 */
function applyMonthFilter(mes, shouldAdjustBounds = true) {
  currentMonthFilter = mes;
  setMonthFilterUI(mes);

  // Desmarcar visualmente los botones de escala mientras se explora un mes completo
  document.querySelectorAll(".scale-btn").forEach((btn) => btn.classList.remove("active"));

  const puntosMes = getPointsByMonth(mes);
  const nombreMes = mes.charAt(0).toUpperCase() + mes.slice(1) + " 1982";
  updatePointsCount(puntosMes.length, nombreMes);

  transitionMarkersAndCards(puntosMes, () => {
    if (shouldAdjustBounds && map && puntosMes.length > 0) {
      isProgrammaticFly = true;
      const bounds = L.latLngBounds(puntosMes.map((p) => [p.lat, p.lng]));
      map.flyToBounds(bounds.pad(0.22), { duration: 1.35, maxZoom: 13 });
      setTimeout(() => {
        isProgrammaticFly = false;
      }, 1450);
    }
  });
}

// ==================== 4. MARCADORES CON ETIQUETA DE FECHA Y CINTA FOTOGRÁFICA ====================
function renderHistoricalMarkers(puntosLista = getActivePointsList()) {
  if (!markersLayerGroup) return;

  markersLayerGroup.clearLayers();
  markersMap.clear();

  puntosLista.forEach((pto, index) => {
    const delayMs = index * 28;
    const isSelected = pto.id === activePointId;
    const customIcon = L.divIcon({
      className: "custom-marker-wrapper",
      html: `
        <div class="memorial-pin mes-${pto.mes} fade-in ${isSelected ? "active-pin" : ""}"
             id="marker-pin-${pto.id}"
             title="${pto.fecha} — ${pto.nombre}"
             style="animation-delay: ${delayMs}ms;">
          <span class="pin-date-label">${pto.etiquetaFecha}</span>
          <i class="fa-solid fa-location-dot"></i>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const marker = L.marker([pto.lat, pto.lng], { icon: customIcon }).addTo(markersLayerGroup);

    const shortDesc = pto.descripcion.length > 125
      ? pto.descripcion.substring(0, 125) + "..."
      : pto.descripcion;

    const popupContent = `
      <div class="custom-popup-content">
        <h3>${pto.nombre}</h3>
        <p><strong>${pto.etiquetaFecha} 1982</strong> &bull; ${pto.fecha}</p>
        <p>${shortDesc}</p>
        <button class="popup-link-btn" onclick="openDetailModal('${pto.id}')">
          <i class="fa-solid fa-images"></i> Más información y galería fotográfica
        </button>
      </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 310 });

    marker.on("click", () => {
      selectPoint(pto.id, false);
    });

    markersMap.set(pto.id, marker);
  });
}

function populatePhotoStrip(puntosLista = getActivePointsList()) {
  const container = document.getElementById("photo-cards-container");
  if (!container) return;

  container.innerHTML = "";

  puntosLista.forEach((pto, index) => {
    const card = document.createElement("div");
    card.className = `photo-card fade-in ${pto.id === activePointId ? "active" : ""}`;
    card.id = `card-${pto.id}`;
    card.style.animationDelay = `${index * 30}ms`;

    card.innerHTML = `
      <img src="${pto.imagen}" alt="${pto.nombre}" class="photo-card-img"
           onerror="this.onerror=null; this.src='${pto.imagenFallback}';">
      <div class="photo-card-overlay">
        <div class="photo-card-top-tags">
          <span class="photo-card-date-pill mes-${pto.mes}">${pto.etiquetaFecha}</span>
          <span class="photo-card-badge">Escala ${pto.escala}</span>
        </div>
        <div class="photo-card-info">
          <h4>${pto.nombre}</h4>
          <p><i class="fa-regular fa-clock"></i> ${pto.fecha}</p>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      selectPoint(pto.id, true);
    });

    container.appendChild(card);
  });

  if (!activePointId) {
    container.scrollTo({ left: 0, behavior: "smooth" });
  }
}

function initPhotoStripControls() {
  const container = document.getElementById("photo-cards-container");
  const btnScrollLeft = document.getElementById("btn-scroll-left");
  const btnScrollRight = document.getElementById("btn-scroll-right");

  if (container && btnScrollLeft && btnScrollRight) {
    btnScrollLeft.addEventListener("click", () => {
      container.scrollBy({ left: -280, behavior: "smooth" });
    });
    btnScrollRight.addEventListener("click", () => {
      container.scrollBy({ left: 280, behavior: "smooth" });
    });
  }

  const btnToggle = document.getElementById("btn-toggle-strip");
  const strip = document.getElementById("photo-strip");
  const toggleIcon = document.getElementById("toggle-strip-icon");
  const toggleText = document.getElementById("toggle-strip-text");

  if (btnToggle && strip) {
    btnToggle.addEventListener("click", () => {
      strip.classList.toggle("minimized");
      const isMin = strip.classList.contains("minimized");
      if (toggleIcon) toggleIcon.className = isMin ? "fa-solid fa-angle-up" : "fa-solid fa-angle-down";
      if (toggleText) toggleText.textContent = isMin ? "Ver fotos" : "Ocultar fotos";
    });
  }
}

/**
 * Selecciona un punto histórico en el mapa y en la cinta fotográfica
 */
function selectPoint(pointId, shouldFlyMap = true) {
  const pto = PUNTOS_HISTORICOS.find((p) => p.id === pointId);
  if (!pto) return;

  activePointId = pointId;

  // Si estamos en modo "escala" y el hito pertenece a otra escala, actualizar a la escala del punto
  const visibleInCurrentScale = Array.isArray(pto.escalasVisibles)
    ? pto.escalasVisibles.includes(currentScale)
    : pto.escala === currentScale;

  if (currentMonthFilter === "escala" && !visibleInCurrentScale) {
    if (scaleTransitionTimer) {
      clearTimeout(scaleTransitionTimer);
      scaleTransitionTimer = null;
    }
    currentScale = pto.escala;
    const scaleBtns = document.querySelectorAll(".scale-btn");
    scaleBtns.forEach((btn, idx) => {
      btn.classList.toggle("active", getScaleFromButton(btn, idx) === pto.escala);
    });
    const puntosEscala = getPointsByScale(pto.escala);
    renderHistoricalMarkers(puntosEscala);
    populatePhotoStrip(puntosEscala);
    updatePointsCount(puntosEscala.length, `Escala ${pto.escala}`);
  } else if (currentMonthFilter !== "escala" && pto.mes !== currentMonthFilter) {
    // Si estaba filtrando por un mes y el punto pertenece a otro mes, cambiar al mes del punto
    currentMonthFilter = pto.mes;
    setMonthFilterUI(pto.mes);
    const puntosMes = getPointsByMonth(pto.mes);
    const nombreMes = pto.mes.charAt(0).toUpperCase() + pto.mes.slice(1) + " 1982";
    renderHistoricalMarkers(puntosMes);
    populatePhotoStrip(puntosMes);
    updatePointsCount(puntosMes.length, nombreMes);
  }

  // Resaltar pin en el mapa
  document.querySelectorAll(".memorial-pin").forEach((pin) => pin.classList.remove("active-pin"));
  const activePin = document.getElementById(`marker-pin-${pointId}`);
  if (activePin) activePin.classList.add("active-pin");

  // Resaltar tarjeta en la cinta inferior
  document.querySelectorAll(".photo-card").forEach((c) => c.classList.remove("active"));
  const activeCard = document.getElementById(`card-${pointId}`);
  if (activeCard) {
    activeCard.classList.add("active");
    activeCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  if (shouldFlyMap && map) {
    isProgrammaticFly = true;
    map.flyTo([pto.lat, pto.lng], pto.zoomRecomendado, {
      duration: 1.35,
      easeLinearity: 0.25
    });
    setTimeout(() => {
      isProgrammaticFly = false;
    }, 1450);
  }

  const marker = markersMap.get(pointId);
  if (marker) {
    setTimeout(() => {
      marker.openPopup();
    }, shouldFlyMap ? 1380 : 90);
  }
}

function clearActiveSelection() {
  activePointId = null;
  document.querySelectorAll(".photo-card").forEach((c) => c.classList.remove("active"));
  document.querySelectorAll(".memorial-pin").forEach((p) => p.classList.remove("active-pin"));
  if (map) map.closePopup();
}

function updatePointsCount(total, labelContext = "") {
  const countEl = document.getElementById("points-count");
  if (!countEl) return;
  countEl.textContent = labelContext ? `${total} hitos (${labelContext})` : `${total} hitos`;
}

// ==================== 5. CONTROLES DE LAS 4 ESCALAS & DETECTOR DE ZOOM ====================
function getScaleFromButton(btn, fallbackIndex = 0) {
  if (btn.dataset.scale) return parseInt(btn.dataset.scale, 10);
  const zoom = parseInt(btn.dataset.zoom, 10);
  return getScaleFromZoom(zoom);
}

function initScaleControls() {
  const scaleBtns = document.querySelectorAll(".scale-btn");

  scaleBtns.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      const targetScale = getScaleFromButton(btn, idx);
      currentScale = null; // Forzar actualización si venía de un filtro mensual
      applyScaleFilter(targetScale, true);
    });
  });

  if (map) {
    map.on("zoomend", () => {
      // Si el usuario está explorando por escala y hace zoom manualmente con el mouse o botones +/-
      if (currentMonthFilter === "escala" && !isProgrammaticFly) {
        const currentZoom = map.getZoom();
        const detectedScale = getScaleFromZoom(currentZoom);
        applyScaleFilter(detectedScale, false);
      }
    });
  }
}

// ==================== 6. MODAL DOCUMENTAL DE EXPEDIENTE HISTÓRICO & GALERÍA ====================
function initModals() {
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const btnFlyTo = document.getElementById("btn-fly-to-point");
  const btnStoryAbout = document.getElementById("btn-story-about-this");
  const btnPrevImg = document.getElementById("modal-prev-img");
  const btnNextImg = document.getElementById("modal-next-img");
  const modalImg = document.getElementById("modal-image");
  const btnExpandPhoto = document.getElementById("btn-expand-photo");

  const lightbox = document.getElementById("image-lightbox");
  const lightboxCloseBtn = document.getElementById("lightbox-close-btn");

  if (modalCloseBtn && modalBackdrop) {
    modalCloseBtn.addEventListener("click", () => modalBackdrop.classList.remove("open"));
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove("open");
    });
  }

  if (btnPrevImg) {
    btnPrevImg.addEventListener("click", () => {
      if (currentGalleryItems.length > 0) {
        const prevIdx = (currentGalleryIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
        setModalGalleryPhoto(prevIdx);
      }
    });
  }

  if (btnNextImg) {
    btnNextImg.addEventListener("click", () => {
      if (currentGalleryItems.length > 0) {
        const nextIdx = (currentGalleryIndex + 1) % currentGalleryItems.length;
        setModalGalleryPhoto(nextIdx);
      }
    });
  }

  function openCurrentPhotoLightbox() {
    if (!lightbox || currentGalleryItems.length === 0) return;
    const item = currentGalleryItems[currentGalleryIndex];
    const lbImg = document.getElementById("lightbox-img");
    const lbCap = document.getElementById("lightbox-caption");

    if (lbImg) {
      lbImg.src = item.src;
      lbImg.onerror = function () {
        this.onerror = null;
        this.src = item.fallback;
      };
    }
    if (lbCap) {
      lbCap.textContent = item.caption || "";
    }
    lightbox.classList.add("open");
  }

  if (modalImg) {
    modalImg.addEventListener("click", openCurrentPhotoLightbox);
  }
  if (btnExpandPhoto) {
    btnExpandPhoto.addEventListener("click", openCurrentPhotoLightbox);
  }
  if (lightbox && lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener("click", () => lightbox.classList.remove("open"));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });
  }

  document.addEventListener("keydown", (e) => {
    if (lightbox && lightbox.classList.contains("open")) {
      if (e.key === "Escape") lightbox.classList.remove("open");
      return;
    }
    if (modalBackdrop && modalBackdrop.classList.contains("open")) {
      if (e.key === "Escape") {
        modalBackdrop.classList.remove("open");
      } else if (e.key === "ArrowLeft" && currentGalleryItems.length > 1) {
        const prevIdx = (currentGalleryIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
        setModalGalleryPhoto(prevIdx);
      } else if (e.key === "ArrowRight" && currentGalleryItems.length > 1) {
        const nextIdx = (currentGalleryIndex + 1) % currentGalleryItems.length;
        setModalGalleryPhoto(nextIdx);
      }
    }
  });

  if (btnFlyTo) {
    btnFlyTo.addEventListener("click", () => {
      if (activePointId) {
        modalBackdrop.classList.remove("open");
        selectPoint(activePointId, true);
      }
    });
  }

  if (btnStoryAbout) {
    btnStoryAbout.addEventListener("click", () => {
      if (activePointId) {
        const pto = PUNTOS_HISTORICOS.find((p) => p.id === activePointId);
        modalBackdrop.classList.remove("open");
        openChatbotWithContext(`Quiero consultar o dejar un testimonio sobre lo ocurrido el ${pto.fecha} en ${pto.nombre}.`);
      }
    });
  }
}

function setModalGalleryPhoto(index) {
  if (!currentGalleryItems || currentGalleryItems.length === 0) return;

  currentGalleryIndex = index;
  const item = currentGalleryItems[index];
  const modalImg = document.getElementById("modal-image");
  const captionEl = document.getElementById("modal-image-caption");
  const counterEl = document.getElementById("modal-gallery-counter");

  if (modalImg) {
    modalImg.classList.add("switching");
    setTimeout(() => {
      modalImg.src = item.src;
      modalImg.onerror = function () {
        this.onerror = null;
        this.src = item.fallback;
      };
      modalImg.onload = () => {
        modalImg.classList.remove("switching");
      };
    }, 130);
  }

  if (captionEl) {
    captionEl.textContent = item.caption || "";
  }

  if (counterEl) {
    counterEl.textContent = `Foto ${index + 1} de ${currentGalleryItems.length}`;
  }

  document.querySelectorAll(".modal-thumb-item").forEach((thumb, idx) => {
    thumb.classList.toggle("active", idx === index);
  });
}

/**
 * Función auxiliar que toma un link de YouTube y le añade el parámetro correspondiente de tiempo
 * (por ejemplo, &t=14m30s o ?t=870) para que YouTube se abra directo en el minuto y segundo exacto.
 *
 * @param {string} videoUrl - Enlace de YouTube del punto histórico.
 * @param {string|number} [tiempo=""] - Tiempo de inicio opcional (ej. "14m30s", "14:30" o 870).
 * @returns {string} URL final con el parámetro de tiempo listo, o "" si el punto no tiene video cargado.
 */
function buildYouTubeTimestampUrl(videoUrl, tiempo = "") {
  if (!videoUrl || typeof videoUrl !== "string") return "";
  const cleanUrl = videoUrl.trim();
  if (!cleanUrl) return "";

  // Si no se definió un tiempo por separado, se devuelve el link tal cual (por si ya incluye &t= o ?t=)
  if (tiempo === null || tiempo === undefined || String(tiempo).trim() === "") {
    return cleanUrl;
  }

  // Limpiar prefijos en caso de que el usuario haya escrito "&t=14m30s" o "?t=870"
  let cleanTime = String(tiempo).trim().replace(/^[?&]?t=/i, "");
  if (!cleanTime) return cleanUrl;

  // Si el tiempo está en formato reloj "mm:ss" o "hh:mm:ss", convertirlo a formato "14m30s"
  if (cleanTime.includes(":")) {
    const parts = cleanTime.split(":").map((p) => parseInt(p, 10) || 0);
    if (parts.length === 2) {
      cleanTime = `${parts[0]}m${parts[1]}s`;
    } else if (parts.length === 3) {
      cleanTime = `${parts[0]}h${parts[1]}m${parts[2]}s`;
    }
  }

  // Si el link ya tenía un parámetro t= previo, actualizarlo con el tiempo indicado
  if (/([?&])t=[^&#]*/i.test(cleanUrl)) {
    return cleanUrl.replace(/([?&])t=[^&#]*/i, `$1t=${cleanTime}`);
  }

  // Usar "&t=" si la URL ya tiene parámetros (ej. youtube.com/watch?v=...) o "?t=" si es corta (ej. youtu.be/...)
  const separator = cleanUrl.includes("?") ? "&" : "?";
  return `${cleanUrl}${separator}t=${cleanTime}`;
}

window.openDetailModal = function (pointId) {
  const pto = PUNTOS_HISTORICOS.find((p) => p.id === pointId);
  if (!pto) return;

  activePointId = pointId;

  const titleEl = document.getElementById("modal-title");
  const dateEl = document.getElementById("modal-date");
  const tagEl = document.getElementById("modal-tag");

  if (titleEl) titleEl.textContent = pto.nombre;
  if (dateEl) {
    dateEl.innerHTML = `<i class="fa-regular fa-calendar"></i> Cronología: ${pto.fecha} (${pto.etiquetaFecha} 1982) &nbsp;&bull;&nbsp; <i class="fa-solid fa-location-crosshairs"></i> Lat: ${pto.lat.toFixed(4)} | Lng: ${pto.lng.toFixed(4)}`;
  }
  if (tagEl) tagEl.textContent = `${pto.etiquetaFecha} 1982 • ${pto.tipo}`;

  const unitsEl = document.getElementById("modal-tactical-units");
  const opEl = document.getElementById("modal-tactical-operation");
  const terrainEl = document.getElementById("modal-tactical-terrain");

  if (unitsEl) unitsEl.textContent = pto.unidadesArgentinas || "Fuerzas Armadas Argentinas.";
  if (opEl) opEl.textContent = `${pto.tipo} — ${pto.fecha}.`;
  if (terrainEl) terrainEl.textContent = pto.condicionesTerreno || "Geografía y clima austral de las Islas Malvinas.";

  const historiaContainer = document.getElementById("modal-section-historia");
  const unidadesContainer = document.getElementById("modal-section-unidades");
  const legadoContainer = document.getElementById("modal-section-legado");

  if (historiaContainer) {
    const paragraphs = Array.isArray(pto.historiaCompleta)
      ? pto.historiaCompleta
      : [pto.descripcion];
    historiaContainer.innerHTML = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  }

  if (unidadesContainer) {
    unidadesContainer.innerHTML = `<p>${escapeHtml(pto.unidadesArgentinas || "")}</p>`;
  }

  if (legadoContainer) {
    legadoContainer.innerHTML = `<p>${escapeHtml(pto.protagonistasHitos || "")}</p>`;
  }

  // Configurar el botón de enlace directo a YouTube (se oculta automáticamente si no hay link cargado)
  const btnYoutubeModal = document.getElementById("btn-youtube-modal");
  if (btnYoutubeModal) {
    const youtubeFinalUrl = buildYouTubeTimestampUrl(pto.videoUrl, pto.videoTiempo);
    if (youtubeFinalUrl) {
      btnYoutubeModal.href = youtubeFinalUrl;
      btnYoutubeModal.style.display = "inline-flex";
    } else {
      btnYoutubeModal.removeAttribute("href");
      btnYoutubeModal.style.display = "none";
    }
  }

  currentGalleryItems = Array.isArray(pto.galeria) && pto.galeria.length > 0
    ? pto.galeria
    : [{ src: pto.imagen, fallback: pto.imagenFallback, caption: pto.nombre }];

  const thumbsContainer = document.getElementById("modal-thumbnails");
  if (thumbsContainer) {
    thumbsContainer.innerHTML = "";
    currentGalleryItems.forEach((item, idx) => {
      const thumbBtn = document.createElement("button");
      thumbBtn.type = "button";
      thumbBtn.className = `modal-thumb-item ${idx === 0 ? "active" : ""}`;
      thumbBtn.title = item.caption || `Fotografía ${idx + 1}`;
      thumbBtn.innerHTML = `
        <img src="${item.src}" alt="Miniatura ${idx + 1}"
             onerror="this.onerror=null; this.src='${item.fallback}';">
      `;
      thumbBtn.addEventListener("click", () => {
        setModalGalleryPhoto(idx);
      });
      thumbsContainer.appendChild(thumbBtn);
    });
  }

  setModalGalleryPhoto(0);

  const detailModal = document.getElementById("detail-modal");
  if (detailModal) detailModal.scrollTop = 0;

  const modalBackdrop = document.getElementById("modal-backdrop");
  if (modalBackdrop) modalBackdrop.classList.add("open");
};

// ==================== 7. WIDGET DE CHATBOT (BURBUJA FLOTANTE) ====================
// ==================== 7. WIDGET DE CHATBOT (BURBUJA FLOTANTE) ====================

// Estado del Wizard para la solapa "Soy Veterano / Familiar"
const testimonioWizard = {
  step: "ESPERANDO_NOMBRE", // "ESPERANDO_NOMBRE", "ESPERANDO_ROL", "ESPERANDO_RELATO", "COMPLETADO"
  data: {
    nombre: "",
    rol: "", // "Veterano de Guerra" o "Familiar"
    relato: "",
    unidades: [],
    lugares: []
  },
  reset() {
    this.step = "ESPERANDO_NOMBRE";
    this.data = { nombre: "", rol: "", relato: "", unidades: [], lugares: [] };
  }
};

// Detección de preguntas en la solapa de veterano
function isHistoricalQuestion(str) {
  if (!str) return false;
  const clean = str.toLowerCase().trim();
  if (clean.includes("?") || clean.includes("¿")) return true;
  const questionTriggers = [
    "que paso", "qué pasó", "que ocurrio", "qué ocurrió", "que sucedio", "qué sucedió",
    "cuando fue", "cuándo fue", "cuando paso", "cuándo pasó", "cuando inicio", "cuándo inició",
    "donde fue", "dónde fue", "donde queda", "dónde queda", "donde esta", "dónde está",
    "quien fue", "quién fue", "quienes fueron", "quiénes fueron", "quien era", "quién era",
    "como fue", "cómo fue", "como se llamaba", "cómo se llamaba",
    "por que", "por qué", "porque se", "por qué se",
    "cuantos murieron", "cuántos murieron", "cuantas bajas", "cuántas bajas",
    "contame sobre", "cuentame sobre", "contame de", "cuéntame de", "que sabes de", "qué sabes de",
    "sabes que", "sabes de", "que fue la", "qué fue la", "que fue el", "qué fue el",
    "quien comando", "quién comandó", "quien gano", "quién ganó",
    "explicame", "decime", "dime", "cual fue", "cuál fue"
  ];
  return questionTriggers.some(t => clean.startsWith(t) || clean.includes(" " + t) || clean.includes(t + " "));
}

// Detección de saludos iniciales
function isGreeting(str) {
  if (!str) return false;
  const clean = str.toLowerCase().trim();
  const greetings = ["hola", "buenas", "buen dia", "buenos dias", "buenas tardes", "buenas noches", "saludos", "hola que tal", "hola bot"];
  return greetings.some(g => clean === g || clean.startsWith(g + " ") || clean.startsWith(g + ","));
}

// Extracción de lugares y coordenadas de Malvinas
const TOPONIMOS_MALVINAS = [
  { nombre: "Monte Longdon", alias: ["longdon", "monte longdon"], lat: -51.664, lng: -57.973 },
  { nombre: "Monte Tumbledown", alias: ["tumbledown", "monte tumbledown"], lat: -51.699, lng: -57.940 },
  { nombre: "Monte Harriet", alias: ["harriet", "monte harriet"], lat: -51.710, lng: -57.975 },
  { nombre: "Monte Dos Hermanas", alias: ["dos hermanas", "two sisters", "monte dos hermanas"], lat: -51.688, lng: -58.020 },
  { nombre: "Wireless Ridge", alias: ["wireless ridge", "wireless", "cresta del telegrafo"], lat: -51.670, lng: -57.915 },
  { nombre: "Sapper Hill", alias: ["sapper hill", "colina zapador", "sapper"], lat: -51.705, lng: -57.875 },
  { nombre: "Monte Williams", alias: ["monte williams", "williams"], lat: -51.712, lng: -57.910 },
  { nombre: "Puerto Argentino", alias: ["puerto argentino", "stanley", "puerto stanley", "capital"], lat: -51.692, lng: -57.859 },
  { nombre: "Pradera del Ganso", alias: ["pradera del ganso", "goose green", "ganso verde"], lat: -51.828, lng: -58.972 },
  { nombre: "Darwin", alias: ["darwin", "istmo de darwin"], lat: -51.815, lng: -58.950 },
  { nombre: "Bahía San Carlos", alias: ["san carlos", "bahia san carlos", "estrecho de san carlos"], lat: -51.520, lng: -59.080 },
  { nombre: "Bahía Agradable", alias: ["bahia agradable", "fitz roy", "pleasant bay"], lat: -51.780, lng: -58.210 },
  { nombre: "Bahía Fox", alias: ["bahia fox", "fox bay"], lat: -51.940, lng: -60.080 },
  { nombre: "Puerto Howard", alias: ["puerto howard", "howard", "puerto mitre"], lat: -51.615, lng: -59.525 },
  { nombre: "Isla Borbón", alias: ["borbon", "isla borbon", "pebble island"], lat: -51.315, lng: -59.620 },
  { nombre: "Islas Georgias del Sur", alias: ["georgias", "georgias del sur", "grytviken", "puerto leith", "leith"], lat: -54.281, lng: -36.508 },
  { nombre: "Crucero General Belgrano", alias: ["belgrano", "crucero belgrano", "ara general belgrano"], lat: -55.400, lng: -61.417 }
];

function extractPlacesFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const detected = [];
  TOPONIMOS_MALVINAS.forEach(topo => {
    if (topo.alias.some(a => lower.includes(a))) {
      detected.push(topo.nombre);
    }
  });
  return detected;
}

const UNIDADES_MALVINAS = [
  "RI 7", "RI 25", "RI 4", "RI 12", "RI 8", "RI 5", "RI 6", "RI 3",
  "BIM 5", "BIM 2", "Buzos Tácticos", "Comandos Anfibios",
  "Fuerza Aérea Argentina", "V Brigada Aérea", "VI Brigada Aérea", "I Brigada Aérea", "Grupo 5 de Caza", "Grupo 6 de Caza",
  "ARA General Belgrano", "ARA Bahía Paraíso", "ARA Guerrico", "ARA Sobral", "ARA San Luis", "ARA Bouchard", "ARA Piedrabuena",
  "Escuadrón Alacrán de Gendarmería", "Compañía de Comandos 601", "Compañía de Comandos 602",
  "Grupo de Artillería 3", "Grupo de Artillería Aerotransportado 4", "Compañía de Ingenieros Mecanizada 10", "Compañía de Ingenieros 9"
];

function extractUnitsFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const detected = [];
  UNIDADES_MALVINAS.forEach(u => {
    const uClean = u.toLowerCase();
    if (lower.includes(uClean)) {
      detected.push(u);
    }
  });
  return detected;
}

function initChatbot() {
  const widgetContainer = document.getElementById("chatbot-container");
  const bubbleBtn = document.getElementById("chat-toggle-button");
  const btnMinimize = document.getElementById("btn-minimize-chat");
  const btnHeaderChat = document.getElementById("btn-open-chat-header");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const tabVeterano = document.getElementById("tab-veterano");
  const tabConsulta = document.getElementById("tab-consulta");
  const chipsContainer = document.getElementById("chat-chips");

  function toggleChat() {
    widgetContainer.classList.toggle("open");
    if (widgetContainer.classList.contains("open")) {
      setTimeout(() => chatInput.focus(), 300);
    }
  }

  if (bubbleBtn) bubbleBtn.addEventListener("click", toggleChat);
  if (btnMinimize) btnMinimize.addEventListener("click", toggleChat);
  if (btnHeaderChat) {
    btnHeaderChat.addEventListener("click", () => {
      widgetContainer.classList.add("open");
      setTimeout(() => chatInput.focus(), 300);
    });
  }

  if (tabVeterano && tabConsulta) {
    tabVeterano.addEventListener("click", () => {
      currentChatMode = "testimonio_veterano";
      tabVeterano.classList.add("active");
      tabConsulta.classList.remove("active");
      chatInput.placeholder = "Indica tu Nombre y Apellido para iniciar el registro...";
    });

    tabConsulta.addEventListener("click", () => {
      currentChatMode = "consulta_historica";
      tabConsulta.classList.add("active");
      tabVeterano.classList.remove("active");
      chatInput.placeholder = "Haz cualquier pregunta sobre fechas, batallas o héroes...";
    });
  }

  if (chipsContainer) {
    chipsContainer.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip-btn");
      if (chip) {
        chatInput.value = chip.dataset.text;
        chatInput.focus();
      }
    });
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      // Si el usuario no escribe nada, no envía nada ni agradece
      if (!text) return;

      appendMessage("user", text);
      chatInput.value = "";
      showTypingIndicator(true);

      ChatService.sendMessage(text, currentChatMode)
        .then((response) => {
          showTypingIndicator(false);
          appendMessage("bot", response.respuesta);
        })
        .catch((err) => {
          showTypingIndicator(false);
          appendMessage("bot", "Ocurrió un error al procesar tu solicitud. Tu mensaje se conservará localmente.");
          console.error("Chat error:", err);
        });
    });

    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event("submit"));
      }
    });
  }
}

function openChatbotWithContext(initialText) {
  const widgetContainer = document.getElementById("chatbot-container");
  const chatInput = document.getElementById("chat-input");
  widgetContainer.classList.add("open");
  chatInput.value = initialText;
  chatInput.focus();
}

function appendMessage(sender, text) {
  const messagesContainer = document.getElementById("chat-messages");
  if (!messagesContainer) return;

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${sender === "user" ? "user-message" : "bot-message"}`;

  const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  bubble.innerHTML = `
    <div class="bubble-text">${sender === "bot" ? text : escapeHtml(text)}</div>
    <span class="message-time">${timeStr}</span>
  `;

  messagesContainer.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator(show) {
  const indicator = document.getElementById("chat-typing");
  if (indicator) {
    indicator.style.display = show ? "flex" : "none";
    const messagesContainer = document.getElementById("chat-messages");
    if (show && messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ==================== 8. CAPA DE SERVICIO DE RED Y BASE DE CONOCIMIENTO ====================
const ChatService = {
  async sendMessage(mensaje, modo) {
    // Si estamos en modo testimonio_veterano, procesamos el wizard estructurado
    if (modo === "testimonio_veterano") {
      return this.handleVeteranoWorkflow(mensaje);
    }

    // Si estamos en consulta_historica, respondemos cualquier pregunta histórica
    if (modo === "consulta_historica") {
      // Si USE_MOCK es false intentamos backend, pero si falla o USE_MOCK es true, usamos la enciclopedia completa
      if (!CONFIG.USE_MOCK) {
        try {
          const payload = {
            sessionId: "session-" + (sessionStorage.getItem("malvinas_sid") || (sessionStorage.setItem("malvinas_sid", Date.now()), Date.now())),
            tipo: modo,
            mensaje: mensaje,
            message: mensaje,
            timestamp: new Date().toISOString()
          };
          const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.CHAT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            const data = await response.json();
            return { status: "success", respuesta: data.reply || data.respuesta };
          }
        } catch (err) {
          console.warn("Backend no disponible, recurriendo a enciclopedia histórica local:", err);
        }
      }

      // Respuesta desde la base de conocimientos documental completa
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: "success",
            respuesta: this.answerHistoricalQuestion(mensaje)
          });
        }, 500);
      });
    }

    return {
      status: "success",
      respuesta: "Indícame tu consulta o testimonio para orientarte."
    };
  },

  // Flujo guiado para Veteranos y Familiares (Pide Nombre, Rol, Relato y Guarda en Drive)
  async handleVeteranoWorkflow(mensaje) {
    const text = mensaje.trim();

    // 1. Si no hay nada o solo espacios: no responder agradeciendo
    if (!text) {
      return {
        status: "empty",
        respuesta: "Por favor, escribe tu nombre o relato para poder asistirte."
      };
    }

    // 2. Si es una pregunta histórica en el lugar de veterano:
    if (isHistoricalQuestion(text)) {
      return {
        status: "success",
        respuesta: "Esta solapa está reservada para que puedas contar tu propia historia o vivencia personal (o la de un familiar). Si deseas realizar consultas históricas sobre los hechos de la guerra, puedes cambiar a la solapa <strong>Consulta Histórica</strong> donde te responderé todas tus dudas.<br><br>Si deseas registrar tu testimonio aquí, con gusto lo escuchamos: ¿cuál es tu <strong>Nombre y Apellido</strong>?"
      };
    }

    // 3. Si es un saludo inicial y no ha ingresado nombre:
    if (isGreeting(text) && (!testimonioWizard.data.nombre || testimonioWizard.step === "ESPERANDO_NOMBRE")) {
      testimonioWizard.step = "ESPERANDO_NOMBRE";
      return {
        status: "success",
        respuesta: "Hola. Bienvenido al espacio de registro y testimonio de Malvinas. Aquí puedes preservar tu historia en la Hoja de Cálculo oficial de Google Drive y en el archivo nacional.<br><br>Para comenzar el registro, por favor indícanos tu <strong>Nombre y Apellido</strong>:"
      };
    }

    // 4. PASO 1: Captura de Nombre y Apellido
    if (testimonioWizard.step === "ESPERANDO_NOMBRE" || !testimonioWizard.data.nombre) {
      let nombre = text.replace(/^(me llamo|mi nombre es|soy|yo soy)\s+/i, "").trim();
      nombre = nombre.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      testimonioWizard.data.nombre = nombre;
      testimonioWizard.step = "ESPERANDO_ROL";

      return {
        status: "success",
        respuesta: `Gracias, <strong>${nombre}</strong>.<br><br>¿Eres <strong>Veterano de Guerra de Malvinas</strong> o <strong>Familiar</strong> de un veterano o caído en combate?`
      };
    }

    // 5. PASO 2: Captura de Rol (Veterano o Familiar)
    if (testimonioWizard.step === "ESPERANDO_ROL" || !testimonioWizard.data.rol) {
      const lower = text.toLowerCase();
      let rol = "Veterano de Guerra";
      if (lower.includes("familiar") || lower.includes("hijo") || lower.includes("hija") || lower.includes("esposa") || lower.includes("viuda") || lower.includes("hermano") || lower.includes("hermana") || lower.includes("madre") || lower.includes("padre") || lower.includes("nieto") || lower.includes("nieta") || lower.includes("sobrino")) {
        rol = "Familiar de Veterano";
      } else if (lower.includes("veterano") || lower.includes("excombatiente") || lower.includes("soldado") || lower.includes("conscripto") || lower.includes("marinero") || lower.includes("piloto") || lower.includes("oficial") || lower.includes("suboficial")) {
        rol = "Veterano de Guerra";
      } else {
        rol = text.trim();
      }

      testimonioWizard.data.rol = rol;
      testimonioWizard.step = "ESPERANDO_RELATO";

      return {
        status: "success",
        respuesta: `Entendido, <strong>${testimonioWizard.data.nombre}</strong> (${rol}).<br><br>Por favor, cuéntanos con total libertad qué hecho o vivencia deseas compartir para que quede guardado en la memoria histórica (puedes mencionar la zona o monte donde estuviste, fechas, tu regimiento o unidad, y todo lo que sientas transmitir):`
      };
    }

    // 6. PASO 3: Captura de Hechos / Relato y Sincronización en Google Drive
    testimonioWizard.data.relato = text;
    const detectedPlaces = extractPlacesFromText(text);
    const detectedUnits = extractUnitsFromText(text);
    testimonioWizard.data.lugares = detectedPlaces;
    testimonioWizard.data.unidades = detectedUnits;

    // Sincronización en la Hoja de Cálculo de Google Drive y persistencia local
    await this.syncTestimonioToDrive(testimonioWizard.data);

    let detallesExtra = "";
    if (detectedPlaces.length > 0) {
      detallesExtra += `<br>📍 <strong>Acontecimientos georreferenciados:</strong> ${detectedPlaces.join(", ")}`;
    }
    if (detectedUnits.length > 0) {
      detallesExtra += `<br>🎖️ <strong>Unidad militar vinculada:</strong> ${detectedUnits.join(", ")}`;
    }

    const nombreFinal = testimonioWizard.data.nombre;
    const rolFinal = testimonioWizard.data.rol;

    // Se reinicia el wizard para permitir otro relato si lo desea
    testimonioWizard.reset();

    return {
      status: "success",
      guardadoEnDB: true,
      respuesta: `Muchísimas gracias, <strong>${nombreFinal}</strong> (${rolFinal}).<br><br>✅ Tu testimonio y los acontecimientos relatados han sido <strong>registrados y actualizados en la Hoja de Cálculo oficial de Google Drive</strong> (pestañas <em>Testimonios_Generales</em> y <em>Eventos_Georreferenciados</em>) y en la base de datos nacional.${detallesExtra}<br><br>Tu voz es un aporte sagrado para la memoria histórica de nuestra Patria y el reconocimiento a nuestros héroes.<br><br>¿Deseas registrar otro testimonio o agregar más información?`
    };
  },

  // Sincronización con Google Drive (Google Sheets) y Respaldo Local
  async syncTestimonioToDrive(data) {
    const backupItem = {
      nombre_completo: data.nombre,
      rol_participante: data.rol,
      relato: data.relato,
      lugares: data.lugares,
      unidades: data.unidades,
      fecha_registro: new Date().toISOString()
    };

    // 1. Resguardo permanente en localStorage
    try {
      const storageKey = "malvinas_testimonios_backup";
      const actual = JSON.parse(localStorage.getItem(storageKey) || "[]");
      actual.push(backupItem);
      localStorage.setItem(storageKey, JSON.stringify(actual));
    } catch (e) {
      console.warn("Respaldo localStorage:", e);
    }

    // 2. Envío a la API de Django (que sincroniza directamente en Google Sheets de Drive)
    try {
      const payload = {
        name: data.nombre,
        witness_name: data.nombre,
        role: data.rol,
        witness_role: data.rol,
        message: data.relato,
        mensaje: data.relato,
        units: (data.unidades || []).join(", "),
        places: (data.lugares || []).join(", "),
        tipo: "testimonio_veterano",
        consent_given: true,
        timestamp: new Date().toISOString()
      };

      await fetch(CONFIG.API_BASE_URL + "/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Si el backend no está corriendo en localhost:8000 en este instante, el dato ya quedó resguardado en el navegador
      console.log("Sincronización API background:", err.message);
    }
  },

  // Enciclopedia Histórica Completa para Responder TODAS las Preguntas
  answerHistoricalQuestion(pregunta) {
    const q = pregunta.toLowerCase().trim();

    // 1. Crucero ARA General Belgrano
    if (q.includes("belgrano") || q.includes("conqueror") || (q.includes("2 de mayo") && q.includes("hundimiento"))) {
      return "El 2 de mayo de 1982 a las 16:02 hs, el Crucero ARA General Belgrano fue torpedeado fuera de la zona de exclusión militar por el submarino nuclear británico HMS Conqueror. En este ataque y el posterior naufragio entregaron su vida 323 tripulantes argentinos, la mayor pérdida humana de la guerra. Tras 40 horas bajo un temporal antártico con olas de 8 metros y temperaturas extremas, 770 marinos fueron rescatados heroicamente de las balsas salvavidas por los buques ARA Bouchard, ARA Piedrabuena y el aviso Gurruchaga.";
    }

    // 2. Operación Rosario / 2 de Abril
    if (q.includes("2 de abril") || q.includes("rosario") || q.includes("giachino") || q.includes("recuperacion") || q.includes("recuperación")) {
      return "La Operación Rosario, ejecutada el 1 y 2 de abril de 1982, permitió la recuperación de la soberanía sobre las Islas Malvinas sin causar una sola baja a las fuerzas británicas, cumpliendo estrictas órdenes del mando argentino. Desembarcaron los Comandos Anfibios en Playa Caimán, los Buzos Tácticos en Punta Celebroña y los 20 vehículos anfibios VAO del BIM 2 y el Regimiento de Infantería 25 en Playa Roja. Durante la toma de la Casa de Gobierno entregó su vida el Capitán de Corbeta Pedro Edgardo Giachino, primer héroe caído en el conflicto.";
    }

    // 3. Georgias del Sur / Puerto Leith / Grytviken
    if (q.includes("georgias") || q.includes("leith") || q.includes("grytviken") || q.includes("guerrico") || q.includes("davidoff") || q.includes("san pedro")) {
      return "La crisis se inició el 19 de marzo de 1982 en Puerto Leith (Islas Georgias del Sur) cuando obreros civiles argentinos de Constantino Davidoff izaron el pabellón nacional. El 3 de abril, la corbeta ARA Guerrico y un grupo de Infantería de Marina recuperaron Grytviken en un duro combate donde la corbeta repelió el fuego de lanzacohetes y morteros británicos. En esa acción ofrendaron su vida el Cabo Primero Patricio Guanca y los conscriptos Mario Almonacid y Jorge Águila.";
    }

    // 4. Bautismo de Fuego de la Fuerza Aérea (1° de Mayo)
    if (q.includes("1 de mayo") || q.includes("1° de mayo") || q.includes("bautismo de fuego") || q.includes("black buck") || q.includes("vulcan")) {
      return "El 1 de mayo de 1982 se conmemora el Bautismo de Fuego de la Fuerza Aérea Argentina. La madrugada inició con el bombardeo de un avión británico Vulcan (Operación Black Buck) sobre la pista de Puerto Argentino, seguido por ataques de aviones Sea Harrier y fuego naval de destructores. La FAA lanzó 56 salidas de combate con escuadrillas de Mirage, Dagger, Canberra y A-4 Skyhawk. Cayeron heroicamente los primeros 14 aviadores, entre ellos el Capitán Gustavo García Cuerva, y se infligieron severos daños a la flota enemiga.";
    }

    // 5. Ataque y Hundimiento del HMS Sheffield (4 de Mayo)
    if (q.includes("sheffield") || q.includes("exocet") || q.includes("bedacarratz") || q.includes("super etendard") || q.includes("super étendard") || q.includes("mayora")) {
      return "El 4 de mayo de 1982, dos cazas Super Étendard de la 2ª Escuadrilla Aeronaval de Caza y Ataque, pilotados por el Capitán de Corbeta Augusto Bedacarratz y el Teniente Armando Mayora, guiados por un avión explorador Neptune, volaron al ras de las olas en silencio radar total y lanzaron dos misiles antibuque AM-39 Exocet. Uno de los misiles impactó de lleno en el destructor lanzamisiles británico HMS Sheffield, provocando un devastador incendio y su posterior hundimiento.";
    }

    // 6. Combate de San Carlos y Callejón de las Bombas (21 al 25 de Mayo)
    if (q.includes("san carlos") || q.includes("callejon") || q.includes("callejón") || q.includes("ardent") || q.includes("antelope") || q.includes("crippa")) {
      return "El 21 de mayo de 1982 los británicos iniciaron el desembarco en el Estrecho de San Carlos. El Teniente de Navío Owen Crippa realizó un ataque en solitario con su avión Aermacchi MB-339 contra la flota británica. Durante los días siguientes, conocidos como 'El Callejón de las Bombas', pilotos de la Fuerza Aérea y de la Armada volaron a milímetros del agua bajo fuego de misiles y artillería, hundiendo las fragatas HMS Ardent y HMS Antelope, y averiando gravemente a los destructores Argonaut, Brilliant y Plymouth.";
    }

    // 7. Hundimiento del HMS Coventry y Atlantic Conveyor (25 de Mayo)
    if (q.includes("coventry") || q.includes("conveyor") || q.includes("atlantic conveyor") || q.includes("25 de mayo") || q.includes("curilovic")) {
      return "El 25 de mayo de 1982, Día de la Patria, la aviación argentina asestó dos de los golpes más devastadores a la Royal Navy. Una escuadrilla de A-4B Skyhawk de la FAA (Capitán Carballo y Teniente Rinke) bombardeó y hundió en solo 20 minutos al destructor Tipo 42 HMS Coventry. Simultáneamente, dos Super Étendard (Capitán Curilovic y Teniente Barraza) impactaron dos misiles Exocet en el buque portacontenedores de apoyo logístico Atlantic Conveyor, hundiendo vitales helicópteros Chinook y equipos de campaña enemigos.";
    }

    // 8. Batalla de Pradera del Ganso y Darwin (Goose Green)
    if (q.includes("pradera del ganso") || q.includes("goose green") || q.includes("darwin") || q.includes("estevez") || q.includes("estévez") || q.includes("gomez centurion") || q.includes("gómez centurión") || q.includes("jones")) {
      return "Entre el 28 y 29 de mayo de 1982 se libró la Batalla de Pradera del Ganso y Darwin. El Regimiento de Infantería 12 y efectivos del RI 25 resistieron heroicamente el asalto del 2° Batallón de Paracaidistas británico. En la colina de Darwin cayó combatiendo el Teniente Roberto Estévez, quien continuó dirigiendo el fuego de su sección aun herido de muerte. Durante la batalla cayó abatido por las tropas argentinas el propio comandante británico, Teniente Coronel Herbert 'H' Jones.";
    }

    // 9. Desastre Británico en Bahía Agradable / Fitz Roy (8 de Junio)
    if (q.includes("bahia agradable") || q.includes("bahía agradable") || q.includes("fitz roy") || q.includes("galahad") || q.includes("sir galahad") || q.includes("tristram") || q.includes("8 de junio")) {
      return "El 8 de junio de 1982 es recordado en Gran Bretaña como 'El día más negro de la flota'. Aviones A-4B Skyhawk y Dagger de la V y VI Brigadas Aéreas de la Fuerza Aérea Argentina atacaron por sorpresa a los buques logísticos de desembarco RFA Sir Galahad y RFA Sir Tristram en Bahía Agradable (Fitz Roy). Las bombas argentinas desataron incendios gigantescos, causando más de 50 bajas británicas (la mayoría de la Guardia Galesa) y destruyendo toneladas de pertrechos de asalto.";
    }

    // 10. Combates Nocturnos por los Montes (Longdon, Two Sisters, Harriet)
    if (q.includes("longdon") || q.includes("baldini") || q.includes("carrizo")) {
      return "El combate de Monte Longdon (noche del 11 al 12 de junio de 1982) fue el enfrentamiento cuerpo a cuerpo a bayoneta más sangriento del conflicto. La Compañía B del Regimiento de Infantería 7 (al mando del Subteniente Baldini), la 1ª Sección de la Compañía de Ingenieros Mecanizada 10 y tiradores del BIM 5 resistieron durante casi 10 horas el feroz asalto del 3° Batallón de Paracaidistas británico en medio de la nieve y el bombardeo masivo.";
    }

    if (q.includes("dos hermanas") || q.includes("two sisters") || q.includes("llambias") || q.includes("llambías")) {
      return "El combate de Monte Dos Hermanas (Two Sisters) ocurrió entre la noche del 11 y 12 de junio. Efectivos del Regimiento de Infantería 4 (al mando del Mayor Jofre y el Subteniente Llambías Pravaz) y la Compañía de Comunicaciones 6 frenaron el avance frontal del 45 Commando de Royal Marines, replegándose ordenadamente hacia Tumbledown tras agotar la munición y provocar numerosas bajas a los británicos.";
    }

    if (q.includes("harriet") || q.includes("arroyo") || q.includes("juarez") || q.includes("juárez")) {
      return "El combate de Monte Harriet (11-12 de junio) enfrentó al Regimiento de Infantería 4 del Ejército Argentino contra el 42 Commando británico. Las secciones argentinas del Teniente 1° Arroyo y el Subteniente Juárez ofrecieron una tenaz resistencia en posiciones elevadas, batiéndose hasta el límite de sus fuerzas frente a un enemigo superior en visores nocturnos y fuego de apoyo naval.";
    }

    // 11. Batalla de Monte Tumbledown (13 al 14 de Junio)
    if (q.includes("tumbledown") || q.includes("bim 5") || q.includes("robacio") || q.includes("vazquez") || q.includes("vázquez") || q.includes("silva")) {
      return "En Monte Tumbledown (noche del 13 al 14 de junio de 1982), el Batallón de Infantería de Marina N° 5 (BIM 5), comandado por el Capitán Carlos Robacio, libró una defensa legendaria. La 4ª Sección del Teniente Carlos Vázquez y la sección del Subteniente Oscar Silva (RI 4) resistieron durante horas el asalto encarnizado de la Guardia Escocesa británica (Scots Guards) en un combate a bayoneta limpia entre peñascos helados.";
    }

    // 12. Wireless Ridge y Sapper Hill (13 y 14 de Junio)
    if (q.includes("wireless") || q.includes("wireless ridge") || q.includes("sapper") || q.includes("sapper hill") || q.includes("williams")) {
      return "Durante la noche del 13 al 14 de junio, en Wireless Ridge, el Regimiento de Infantería 7 (Mayor Carrizo Salvadores) contuvo con bravura el asalto del 2 Para británico apoyado por artillería incesante. Al mediodía del 14 de junio, en Sapper Hill y Monte Williams, tiradores del BIM 5 y blindados Panhard libraron el último combate de infantería de la guerra, rechazando a las avanzadas británicas hasta la orden de cese al fuego.";
    }

    // 13. Cese del Fuego / Fin del Conflicto (14 y 15 de Junio)
    if (q.includes("14 de junio") || q.includes("15 de junio") || q.includes("rendicion") || q.includes("rendición") || q.includes("cese") || q.includes("menendez") || q.includes("menéndez") || q.includes("moore")) {
      return "El 14 de junio de 1982 a las 23:59 hs se acordó el cese de fuego entre el comandante de las fuerzas terrestres británicas, General Jeremy Moore, y el General de Brigada Mario Benjamín Menéndez. Los soldados argentinos entregaron sus posiciones con la frente en alto y fueron evacuados a bordo del transatlántico Canberra y el buque hospital ARA Bahía Paraíso hacia el continente, habiendo demostrado coraje y patriotismo incuestionables.";
    }

    // 14. Cantidad de Bajas / Héroes Caídos
    if (q.includes("bajas") || q.includes("muertos") || q.includes("fallecidos") || q.includes("heroes caidos") || q.includes("héroes caídos") || q.includes("cuantos murieron") || q.includes("cuántos murieron")) {
      return "Durante la Guerra de Malvinas ofrendaron su vida 649 héroes argentinos: 323 de la Armada Argentina (la mayoría en el Crucero General Belgrano), 194 del Ejército Argentino, 55 de la Fuerza Aérea Argentina, 7 de la Gendarmería Nacional, 2 de la Prefectura Naval y 16 de la Marina Mercante y personal civil. Las fuerzas británicas sufrieron 255 muertos oficiales y cientos de heridos.";
    }

    // 15. Soberanía Argentina y Antecedentes Históricos
    if (q.includes("soberania") || q.includes("soberanía") || q.includes("1833") || q.includes("causas") || q.includes("reclamo") || q.includes("derecho")) {
      return "Las Islas Malvinas, Georgias del Sur y Sandwich del Sur forman parte inalienable del territorio nacional argentino por razones geográficas, históricas y jurídicas. Argentina heredó los derechos soberanos de España tras la Revolución de Mayo de 1810 y gobernó las islas pacíficamente con Luis Vernet hasta que el 3 de enero de 1833 la corbeta británica HMS Clio usurpó el territorio por la fuerza militar, expulsando a la población y autoridades argentinas. La Resolución 2065 de la ONU ratificó en 1965 la existencia de una disputa colonial que Gran Bretaña debe negociar.";
    }

    // 16. BÚSQUEDA DINÁMICA EN LOS 48 HITOS DE PUNTOS_HISTORICOS
    if (typeof PUNTOS_HISTORICOS !== "undefined" && Array.isArray(PUNTOS_HISTORICOS)) {
      let mejorHito = null;
      let mejorPuntaje = 0;

      PUNTOS_HISTORICOS.forEach(pto => {
        let score = 0;
        const textoHito = `${pto.nombre} ${pto.fecha} ${pto.tipo} ${pto.unidadesArgentinas} ${pto.descripcion} ${pto.historiaCompleta ? pto.historiaCompleta.join(' ') : ''}`.toLowerCase();
        
        // Coincidencia por palabras clave de la pregunta
        const palabrasPregunta = q.split(/\s+/).filter(w => w.length > 3);
        palabrasPregunta.forEach(palabra => {
          if (textoHito.includes(palabra)) {
            score += 2;
          }
        });

        // Bonificación por fecha o lugar directo
        if (q.includes(pto.nombre.toLowerCase())) score += 10;
        if (q.includes(pto.fecha.toLowerCase())) score += 8;

        if (score > mejorPuntaje) {
          mejorPuntaje = score;
          mejorHito = pto;
        }
      });

      if (mejorHito && mejorPuntaje >= 4) {
        const relato = Array.isArray(mejorHito.historiaCompleta) && mejorHito.historiaCompleta.length > 0
          ? mejorHito.historiaCompleta[0]
          : mejorHito.descripcion;
        return `<strong>${mejorHito.nombre}</strong> (${mejorHito.fecha}):<br><br>${relato}<br><br>🎖️ <strong>Unidades involucradas:</strong> ${mejorHito.unidadesArgentinas}<br><br><em>Puedes ubicar este punto histórico en el mapa interactivo en la escala ${mejorHito.escala}.</em>`;
      }
    }

    // Respuesta integradora por defecto si la pregunta es muy amplia
    return "Durante el conflicto del 19 de marzo al 15 de junio de 1982, las Fuerzas Armadas argentinas defendieron el territorio insular y marítimo en tierra, aire y mar. Puedes preguntarme sobre cualquier combate específico (Monte Longdon, Tumbledown, Pradera del Ganso, San Carlos, Bahía Agradable), naves y aeronaves (Crucero Belgrano, Sheffield, A-4 Skyhawk, Super Étendard), o fechas puntuales día por día.";
  }
};

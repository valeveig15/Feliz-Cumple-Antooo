// ==========================================================
// BUTTERFLY HEART TUNNEL
// HTML Canvas + JavaScript
// Compatible con GitHub Pages
// ==========================================================


// ==========================================================
// CANVAS
// ==========================================================

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");


// ==========================================================
// CONFIGURACIÓN GENERAL
// ==========================================================

let WIDTH;
let HEIGHT;

let cx;
let cy;


// cantidad de mariposas por corazón

const BUTTERFLIES = 45;


// puntos que forman el corazón

const baseHeart = [];


// partículas brillantes

const particles = [];


// corazones activos

let activeRings = [];


// estado de animación

let mode = "BUILD";

let buildIndex = 0;

let traceCount = 0;


// ==========================================================
// AJUSTES PRINCIPALES
// ==========================================================


// Dejamos solamente los corazones 2, 4, 6 y 8
// respecto de la versión original.

const targetScales = [

    0.25,

    0.55,

    1.05,

    1.80

];


// tamaño máximo antes de desaparecer hacia la cámara

const MAX_SCALE = 2.25;


// tamaño mínimo al reaparecer al fondo

const MIN_SCALE = 0.23;


// velocidad del túnel

const GROWTH_SPEED = 0.0032;


// velocidad de construcción inicial

const BUILD_SPEED = 0.7;


// separación espacial del corazón

const HEART_SPACING = 15;


// ==========================================================
// AJUSTAR CANVAS A LA PANTALLA
// ==========================================================

function resizeCanvas() {

    const dpr =
        window.devicePixelRatio || 1;


    WIDTH =
        window.innerWidth;


    HEIGHT =
        window.innerHeight;


    canvas.width =
        WIDTH * dpr;


    canvas.height =
        HEIGHT * dpr;


    canvas.style.width =
        WIDTH + "px";


    canvas.style.height =
        HEIGHT + "px";


    ctx.setTransform(

        dpr,
        0,
        0,
        dpr,
        0,
        0

    );


    cx =
        WIDTH / 2;


    cy =
        HEIGHT / 2;

}


window.addEventListener(

    "resize",

    resizeCanvas

);


resizeCanvas();


// ==========================================================
// FUNCIÓN RANDOM
// ==========================================================

function randomRange(

    min,
    max

) {

    return (

        Math.random() *

        (max - min)

        +

        min

    );

}


// ==========================================================
// CREAR FORMA DEL CORAZÓN
// ==========================================================

for (

    let i = 0;

    i < BUTTERFLIES;

    i++

) {

    const t =

        i *

        Math.PI *

        2 /

        BUTTERFLIES;


    const x =

        16 *

        Math.pow(

            Math.sin(t),

            3

        );


    const y =

        -(

            13 * Math.cos(t)

            -

            5 * Math.cos(2 * t)

            -

            2 * Math.cos(3 * t)

            -

            Math.cos(4 * t)

        );


    const tilt =

        randomRange(

            -0.25,

            0.25

        );


    const flapSpeed =

        randomRange(

            0.004,

            0.009

        );


    const flapOffset =

        randomRange(

            0,

            Math.PI * 2

        );


    baseHeart.push({

        x,

        y,

        tilt,

        flapSpeed,

        flapOffset

    });

}


// ==========================================================
// DIBUJAR MARIPOSA
// ==========================================================

function drawButterfly(

    x,

    y,

    size,

    flap,

    rotation,

    alpha = 1

) {


    ctx.save();


    ctx.translate(

        x,

        y

    );


    ctx.rotate(

        rotation

    );


    ctx.globalAlpha =

        alpha;



    // ======================================================
    // RESPLANDOR
    // ======================================================

    ctx.shadowColor =

        "rgba(190, 70, 255, 1)";


    ctx.shadowBlur =

        Math.max(

            8,

            size * 0.7

        );



    // ======================================================
    // APERTURA DE ALAS
    // ======================================================

    const wingWidth =

        size *

        (

            0.25

            +

            0.75 * flap

        );


    const wingHeight =

        size;



    // ======================================================
    // ALA SUPERIOR IZQUIERDA
    // ======================================================

    ctx.beginPath();


    ctx.moveTo(

        0,

        0

    );


    ctx.bezierCurveTo(

        -wingWidth * 0.4,

        -wingHeight * 0.35,


        -wingWidth,

        -wingHeight * 0.55,


        -wingWidth * 0.9,

        -wingHeight * 0.05

    );


    ctx.bezierCurveTo(

        -wingWidth * 0.7,

        wingHeight * 0.05,


        -wingWidth * 0.25,

        wingHeight * 0.1,


        0,

        0

    );


    ctx.fillStyle =

        "rgba(100, 20, 180, 0.95)";


    ctx.fill();



    // ======================================================
    // ALA SUPERIOR DERECHA
    // ======================================================

    ctx.beginPath();


    ctx.moveTo(

        0,

        0

    );


    ctx.bezierCurveTo(

        wingWidth * 0.4,

        -wingHeight * 0.35,


        wingWidth,

        -wingHeight * 0.55,


        wingWidth * 0.9,

        -wingHeight * 0.05

    );


    ctx.bezierCurveTo(

        wingWidth * 0.7,

        wingHeight * 0.05,


        wingWidth * 0.25,

        wingHeight * 0.1,


        0,

        0

    );


    ctx.fillStyle =

        "rgba(100, 20, 180, 0.95)";


    ctx.fill();



    // ======================================================
    // ALA INFERIOR IZQUIERDA
    // ======================================================

    ctx.beginPath();


    ctx.moveTo(

        0,

        0

    );


    ctx.bezierCurveTo(

        -wingWidth * 0.3,

        wingHeight * 0.1,


        -wingWidth * 0.75,

        wingHeight * 0.6,


        -wingWidth * 0.4,

        wingHeight * 0.7

    );


    ctx.bezierCurveTo(

        -wingWidth * 0.15,

        wingHeight * 0.65,


        -wingWidth * 0.1,

        wingHeight * 0.2,


        0,

        0

    );


    ctx.fillStyle =

        "rgba(165, 70, 220, 0.95)";


    ctx.fill();



    // ======================================================
    // ALA INFERIOR DERECHA
    // ======================================================

    ctx.beginPath();


    ctx.moveTo(

        0,

        0

    );


    ctx.bezierCurveTo(

        wingWidth * 0.3,

        wingHeight * 0.1,


        wingWidth * 0.75,

        wingHeight * 0.6,


        wingWidth * 0.4,

        wingHeight * 0.7

    );


    ctx.bezierCurveTo(

        wingWidth * 0.15,

        wingHeight * 0.65,


        wingWidth * 0.1,

        wingHeight * 0.2,


        0,

        0

    );


    ctx.fillStyle =

        "rgba(165, 70, 220, 0.95)";


    ctx.fill();



    // ======================================================
    // DETALLES INTERIORES
    // ======================================================

    ctx.shadowBlur = 0;


    ctx.fillStyle =

        "rgba(230, 130, 255, 0.85)";



    // izquierda

    ctx.beginPath();


    ctx.ellipse(

        -wingWidth * 0.45,

        -wingHeight * 0.12,


        Math.max(

            1,

            wingWidth * 0.18

        ),


        Math.max(

            1,

            wingHeight * 0.17

        ),


        -0.5,

        0,

        Math.PI * 2

    );


    ctx.fill();



    // derecha

    ctx.beginPath();


    ctx.ellipse(

        wingWidth * 0.45,

        -wingHeight * 0.12,


        Math.max(

            1,

            wingWidth * 0.18

        ),


        Math.max(

            1,

            wingHeight * 0.17

        ),


        0.5,

        0,

        Math.PI * 2

    );


    ctx.fill();



    // ======================================================
    // CUERPO
    // ======================================================

    ctx.fillStyle =

        "#090015";


    ctx.beginPath();


    ctx.ellipse(

        0,

        wingHeight * 0.05,


        Math.max(

            1.2,

            size * 0.055

        ),


        Math.max(

            3,

            size * 0.35

        ),


        0,

        0,

        Math.PI * 2

    );


    ctx.fill();



    // ======================================================
    // ANTENAS
    // ======================================================

    ctx.strokeStyle =

        "rgba(210, 150, 255, 0.9)";


    ctx.lineWidth =

        Math.max(

            0.5,

            size * 0.015

        );



    // antena izquierda

    ctx.beginPath();


    ctx.moveTo(

        -size * 0.015,

        -size * 0.2

    );


    ctx.quadraticCurveTo(

        -size * 0.15,

        -size * 0.4,


        -size * 0.2,

        -size * 0.48

    );


    ctx.stroke();



    // antena derecha

    ctx.beginPath();


    ctx.moveTo(

        size * 0.015,

        -size * 0.2

    );


    ctx.quadraticCurveTo(

        size * 0.15,

        -size * 0.4,


        size * 0.2,

        -size * 0.48

    );


    ctx.stroke();


    ctx.restore();

}


// ==========================================================
// DIBUJAR CORAZÓN DE MARIPOSAS
// ==========================================================

function drawRing(

    scale,

    drawLimit,

    time

) {


    const limit =

        Math.min(

            drawLimit,

            baseHeart.length

        );



    for (

        let i = 0;

        i < limit;

        i++

    ) {


        const b =

            baseHeart[i];



        const px =

            cx

            +

            b.x

            *

            scale

            *

            HEART_SPACING;



        const py =

            cy

            +

            b.y

            *

            scale

            *

            HEART_SPACING;



        // no dibujar fuera de un margen razonable

        if (

            px < -300

            ||

            px > WIDTH + 300

            ||

            py < -300

            ||

            py > HEIGHT + 300

        ) {

            continue;

        }



        // ==================================================
        // ALETEO
        // ==================================================

        const flap =

            Math.abs(

                Math.sin(

                    time

                    *

                    b.flapSpeed

                    +

                    b.flapOffset

                )

            );



        // ==================================================
        // TAMAÑO
        // ==================================================

        const size =

            7

            +

            scale * 13;



        // ==================================================
        // DIBUJAR
        // ==================================================

        drawButterfly(

            px,

            py,

            size,

            flap,

            b.tilt

        );



        // ==================================================
        // PARTÍCULAS
        // ==================================================

        if (

            particles.length < 350

            &&

            Math.random() < 0.018

        ) {


            createParticle(

                px,

                py,

                size

            );

        }

    }

}


// ==========================================================
// CREAR PARTÍCULA
// ==========================================================

function createParticle(

    x,

    y,

    size

) {


    const life =

        randomRange(

            30,

            70

        );


    particles.push({

        x:

            x

            +

            randomRange(

                -size / 3,

                size / 3

            ),


        y:

            y

            +

            randomRange(

                -size / 3,

                size / 3

            ),


        dx:

            randomRange(

                -0.25,

                0.25

            ),


        dy:

            randomRange(

                -0.45,

                0.05

            ),


        size:

            randomRange(

                1,

                3

            ),


        life:

            life,


        maxLife:

            life

    });

}


// ==========================================================
// ACTUALIZAR PARTÍCULAS
// ==========================================================

function updateParticles() {


    for (

        let i = particles.length - 1;

        i >= 0;

        i--

    ) {


        const p =

            particles[i];


        p.x +=

            p.dx;


        p.y +=

            p.dy;


        p.life--;



        if (

            p.life <= 0

        ) {


            particles.splice(

                i,

                1

            );


            continue;

        }



        const ratio =

            p.life

            /

            p.maxLife;



        ctx.save();



        ctx.globalAlpha =

            ratio * 0.8;



        ctx.fillStyle =

            "#d784ff";



        ctx.shadowColor =

            "#bd5cff";



        ctx.shadowBlur =

            8;



        ctx.beginPath();



        ctx.arc(

            p.x,

            p.y,


            Math.max(

                0.3,

                p.size * ratio

            ),


            0,

            Math.PI * 2

        );



        ctx.fill();



        ctx.restore();

    }

}


// ==========================================================
// FONDO
// ==========================================================

function drawBackground() {


    const gradient =

        ctx.createRadialGradient(

            cx,

            cy,

            0,


            cx,

            cy,


            Math.max(

                WIDTH,

                HEIGHT

            )

            *

            0.75

        );


    gradient.addColorStop(

        0,

        "#080019"

    );


    gradient.addColorStop(

        0.45,

        "#020009"

    );


    gradient.addColorStop(

        1,

        "#000000"

    );


    ctx.fillStyle =

        gradient;


    ctx.fillRect(

        0,

        0,

        WIDTH,

        HEIGHT

    );



    // ======================================================
    // LUZ CENTRAL
    // ======================================================

    const centerGlow =

        ctx.createRadialGradient(

            cx,

            cy,

            0,


            cx,

            cy,


            Math.min(

                WIDTH,

                HEIGHT

            )

            *

            0.25

        );


    centerGlow.addColorStop(

        0,

        "rgba(105, 20, 180, 0.08)"

    );


    centerGlow.addColorStop(

        1,

        "rgba(0,0,0,0)"

    );


    ctx.fillStyle =

        centerGlow;


    ctx.fillRect(

        0,

        0,

        WIDTH,

        HEIGHT

    );

}


// ==========================================================
// ANIMACIÓN PRINCIPAL
// ==========================================================

function animate(time) {


    drawBackground();



    // ======================================================
    // ETAPA 1
    // CREACIÓN DE LOS CORAZONES
    // ======================================================

    if (

        mode === "BUILD"

    ) {


        // dibujar corazones ya terminados

        for (

            const ringScale

            of activeRings

        ) {


            drawRing(

                ringScale,

                BUTTERFLIES,

                time

            );

        }



        // dibujar corazón que se está formando

        if (

            buildIndex

            <

            targetScales.length

        ) {


            const currentScale =

                targetScales[

                    buildIndex

                ];



            traceCount +=

                BUILD_SPEED;



            drawRing(

                currentScale,

                Math.floor(

                    traceCount

                ),

                time

            );



            if (

                traceCount

                >=

                BUTTERFLIES

            ) {


                activeRings.push(

                    currentScale

                );


                buildIndex++;


                traceCount = 0;

            }

        }


        else {


            mode =

                "TUNNEL";

        }

    }



    // ======================================================
    // ETAPA 2
    // TÚNEL INFINITO
    // ======================================================

    else if (

        mode === "TUNNEL"

    ) {


        // ==================================================
        // HACER CRECER LOS CORAZONES
        // ==================================================

        for (

            let i = 0;

            i < activeRings.length;

            i++

        ) {


            activeRings[i] *=

                1

                +

                GROWTH_SPEED;

        }



        // ==================================================
        // RECICLAR LOS QUE PASAN LA CÁMARA
        // ==================================================

        for (

            let i = 0;

            i < activeRings.length;

            i++

        ) {


            if (

                activeRings[i]

                >

                MAX_SCALE

            ) {


                let smallestScale =

                    Infinity;



                for (

                    let j = 0;

                    j < activeRings.length;

                    j++

                ) {


                    if (

                        j !== i

                        &&

                        activeRings[j]

                        <

                        smallestScale

                    ) {


                        smallestScale =

                            activeRings[j];

                    }

                }



                // crear el nuevo corazón detrás del más lejano

                let newScale =

                    smallestScale

                    *

                    0.52;



                // evitar que sea demasiado pequeño

                if (

                    newScale

                    <

                    MIN_SCALE

                ) {


                    newScale =

                        MIN_SCALE;

                }



                activeRings[i] =

                    newScale;

            }

        }



        // ==================================================
        // ORDENAR POR PROFUNDIDAD
        // ==================================================

        const sortedRings =

            [

                ...activeRings

            ]

            .sort(

                (

                    a,

                    b

                )

                =>

                a - b

            );



        // ==================================================
        // DIBUJAR DE ATRÁS HACIA ADELANTE
        // ==================================================

        for (

            const ringScale

            of sortedRings

        ) {


            drawRing(

                ringScale,

                BUTTERFLIES,

                time

            );

        }

    }



    // ======================================================
    // PARTÍCULAS
    // ======================================================

    updateParticles();



    // ======================================================
    // SIGUIENTE FRAME
    // ======================================================

    requestAnimationFrame(

        animate

    );

}


// ==========================================================
// INICIAR
// ==========================================================

requestAnimationFrame(

    animate

);

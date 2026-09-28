import pygame
import math
import random
import sys

pygame.init()

# --------------------------------------------------
# CONFIGURACIÓN
# --------------------------------------------------

WIDTH, HEIGHT = 1000, 800

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Butterfly Heart Tunnel")

clock = pygame.time.Clock()

FPS = 60

cx = WIDTH // 2
cy = HEIGHT // 2


# --------------------------------------------------
# CREAR MARIPOSA
# --------------------------------------------------

def create_butterfly():

    color_outer = (75, 0, 130, 255)
    color_inner = (186, 85, 211, 255)

    canvas = pygame.Surface((400, 400), pygame.SRCALPHA)

    lt_outer = [
        (200, 200),
        (140, 60),
        (60, 20),
        (10, 80),
        (30, 170),
        (100, 210)
    ]

    lt_inner = [
        (200, 200),
        (140, 80),
        (75, 45),
        (35, 90),
        (50, 160),
        (100, 200)
    ]

    lb_outer = [
        (200, 200),
        (100, 210),
        (30, 290),
        (50, 370),
        (130, 360),
        (170, 270)
    ]

    lb_inner = [
        (200, 200),
        (100, 220),
        (50, 285),
        (65, 345),
        (125, 335),
        (160, 270)
    ]

    rt_outer = [(400 - x, y) for x, y in lt_outer]
    rt_inner = [(400 - x, y) for x, y in lt_inner]

    rb_outer = [(400 - x, y) for x, y in lb_outer]
    rb_inner = [(400 - x, y) for x, y in lb_inner]

    # Alas exteriores

    pygame.draw.polygon(canvas, color_outer, lt_outer)
    pygame.draw.polygon(canvas, color_outer, rt_outer)
    pygame.draw.polygon(canvas, color_outer, lb_outer)
    pygame.draw.polygon(canvas, color_outer, rb_outer)

    # Alas interiores

    pygame.draw.polygon(canvas, color_inner, lt_inner)
    pygame.draw.polygon(canvas, color_inner, rt_inner)
    pygame.draw.polygon(canvas, color_inner, lb_inner)
    pygame.draw.polygon(canvas, color_inner, rb_inner)

    # Cuerpo

    pygame.draw.ellipse(
        canvas,
        (10, 20, 40, 255),
        (192, 120, 16, 160)
    )

    # Antenas

    pygame.draw.line(
        canvas,
        (30, 20, 50),
        (196, 125),
        (175, 90),
        4
    )

    pygame.draw.line(
        canvas,
        (30, 20, 50),
        (204, 125),
        (225, 90),
        4
    )

    return pygame.transform.smoothscale(canvas, (100, 100))


sprite = create_butterfly()


# --------------------------------------------------
# CREAR FORMA DEL CORAZÓN
# --------------------------------------------------

base_heart = []

BUTTERFLIES = 45

for i in range(BUTTERFLIES):

    t = i * math.pi * 2 / BUTTERFLIES

    x = 16 * (math.sin(t) ** 3)

    y = -(
        13 * math.cos(t)
        - 5 * math.cos(2 * t)
        - 2 * math.cos(3 * t)
        - math.cos(4 * t)
    )

    tilt = random.randint(-15, 15)

    flap_speed = random.uniform(0.008, 0.018)

    flap_offset = random.uniform(
        0,
        math.pi * 2
    )

    base_heart.append(
        (x, y, tilt, flap_speed, flap_offset)
    )


# --------------------------------------------------
# ESCALAS DEL TÚNEL
#
# Antes llegaban hasta 75.
# Eso mandaba las mariposas miles de píxeles
# fuera de la pantalla.
# --------------------------------------------------

target_scales = [
    0.35,
    0.50,
    0.70,
    0.95,
    1.25,
    1.60,
    2.00,
    2.45
]

MAX_SCALE = 3.0

growth_rate = 1.004


# --------------------------------------------------
# ESTADO
# --------------------------------------------------

mode = "BUILD"

active_rings = []

build_idx = 0

trace_count = 0.0

particles = []


# --------------------------------------------------
# DIBUJAR ANILLO DE MARIPOSAS
# --------------------------------------------------

def draw_ring(scale, draw_limit, ticks):

    # Distancia del corazón respecto al centro

    HEART_SCALE = 12

    # Tamaño visual de las mariposas

    size = max(
        4,
        int(12 + scale * 10)
    )

    limit = min(
        draw_limit,
        len(base_heart)
    )

    for i in range(limit):

        x, y, tilt, speed, offset = base_heart[i]

        px = cx + x * scale * HEART_SCALE
        py = cy + y * scale * HEART_SCALE

        # No procesar objetos extremadamente alejados

        if (
            px < -200
            or px > WIDTH + 200
            or py < -200
            or py > HEIGHT + 200
        ):
            continue

        # Movimiento de las alas

        flap = abs(
            math.sin(
                ticks * speed + offset
            )
        )

        width = max(
            3,
            int(
                size
                * (0.25 + flap * 0.75)
            )
        )

        # ---------------------------
        # RESPLANDOR
        # ---------------------------

        glow_size = max(
            1,
            int(size * 1.35)
        )

        glow_width = max(
            1,
            int(width * 1.35)
        )

        glow = pygame.transform.smoothscale(
            sprite,
            (glow_width, glow_size)
        )

        glow.set_alpha(80)

        glow = pygame.transform.rotate(
            glow,
            tilt
        )

        glow_rect = glow.get_rect(
            center=(int(px), int(py))
        )

        screen.blit(
            glow,
            glow_rect,
            special_flags=pygame.BLEND_RGBA_ADD
        )

        # ---------------------------
        # MARIPOSA
        # ---------------------------

        butterfly = pygame.transform.smoothscale(
            sprite,
            (width, size)
        )

        butterfly = pygame.transform.rotate(
            butterfly,
            tilt
        )

        rect = butterfly.get_rect(
            center=(int(px), int(py))
        )

        screen.blit(
            butterfly,
            rect
        )

        # ---------------------------
        # PARTÍCULAS
        # ---------------------------

        # Antes se generaban demasiadas.
        # Limitamos tanto la probabilidad
        # como el número total.

        if (
            len(particles) < 500
            and random.random() < 0.025
        ):

            life = random.randint(20, 45)

            particles.append({
                "x": px + random.uniform(-size / 3, size / 3),
                "y": py + random.uniform(-size / 3, size / 3),

                "dx": random.uniform(-0.35, 0.35),
                "dy": random.uniform(-0.5, 0.1),

                "size": random.randint(2, 5),

                "life": life,
                "max_life": life
            })


# --------------------------------------------------
# PARTÍCULAS
# --------------------------------------------------

def handle_particles():

    for p in particles[:]:

        p["x"] += p["dx"]
        p["y"] += p["dy"]

        p["life"] -= 1

        if p["life"] <= 0:

            particles.remove(p)

            continue

        ratio = (
            p["life"]
            / p["max_life"]
        )

        alpha = int(
            ratio * 180
        )

        current_size = max(
            1,
            int(p["size"] * ratio)
        )

        dot = pygame.Surface(
            (current_size, current_size),
            pygame.SRCALPHA
        )

        pygame.draw.circle(
            dot,
            (200, 100, 255, alpha),
            (
                current_size // 2,
                current_size // 2
            ),
            max(1, current_size // 2)
        )

        screen.blit(
            dot,
            (
                int(p["x"]),
                int(p["y"])
            ),
            special_flags=pygame.BLEND_RGBA_ADD
        )


# --------------------------------------------------
# LOOP PRINCIPAL
# --------------------------------------------------

running = True

while running:

    # ---------------------------
    # EVENTOS
    # ---------------------------

    for event in pygame.event.get():

        if event.type == pygame.QUIT:
            running = False

        if event.type == pygame.KEYDOWN:

            if event.key == pygame.K_ESCAPE:
                running = False


    # ---------------------------
    # FONDO
    # ---------------------------

    screen.fill(
        (0, 2, 8)
    )

    ticks = pygame.time.get_ticks()


    # --------------------------------------------------
    # CONSTRUCCIÓN INICIAL
    # --------------------------------------------------

    if mode == "BUILD":

        # Corazones ya terminados

        for ring_scale in active_rings:

            draw_ring(
                ring_scale,
                BUTTERFLIES,
                ticks
            )

        # Corazón que se está dibujando

        if build_idx < len(target_scales):

            current_scale = target_scales[
                build_idx
            ]

            trace_count += 0.8

            draw_ring(
                current_scale,
                int(trace_count),
                ticks
            )

            if trace_count >= BUTTERFLIES:

                active_rings.append(
                    current_scale
                )

                build_idx += 1

                trace_count = 0

        else:

            mode = "TUNNEL"


    # --------------------------------------------------
    # TÚNEL
    # --------------------------------------------------

    elif mode == "TUNNEL":

        for i in range(
            len(active_rings)
        ):

            active_rings[i] *= growth_rate

            # Cuando el corazón llega hacia la cámara,
            # vuelve al fondo.

            if active_rings[i] > MAX_SCALE:

                active_rings[i] = 0.30

            draw_ring(
                active_rings[i],
                BUTTERFLIES,
                ticks
            )


    # --------------------------------------------------
    # PARTÍCULAS
    # --------------------------------------------------

    handle_particles()


    # --------------------------------------------------
    # ACTUALIZAR PANTALLA
    # --------------------------------------------------

    pygame.display.flip()

    clock.tick(FPS)


# --------------------------------------------------
# SALIR
# --------------------------------------------------

pygame.quit()
sys.exit()

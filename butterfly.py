import pygame
import math
import random
import sys

pygame.init()
WIDTH, HEIGHT = 1000, 800
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Butterfly Tunnel")
clock = pygame.time.Clock()

def create_butterfly():
    color_outer = (75, 0, 130, 255)
    color_inner = (186, 85, 211, 255)
    
    canvas = pygame.Surface((400, 400), pygame.SRCALPHA)
    
    lt_outer = [(200, 200), (140, 60), (60, 20), (10, 80), (30, 170), (100, 210)]
    lt_inner = [(200, 200), (140, 80), (75, 45), (35, 90), (50, 160), (100, 200)]
    lb_outer = [(200, 200), (100, 210), (30, 290), (50, 370), (130, 360), (170, 270)]
    lb_inner = [(200, 200), (100, 220), (50, 285), (65, 345), (125, 335), (160, 270)]
    
    rt_outer = [(400 - x, y) for x, y in lt_outer]
    rt_inner = [(400 - x, y) for x, y in lt_inner]
    rb_outer = [(400 - x, y) for x, y in lb_outer]
    rb_inner = [(400 - x, y) for x, y in lb_inner]
    
    pygame.draw.polygon(canvas, color_outer, lt_outer)
    pygame.draw.polygon(canvas, color_outer, rt_outer)
    pygame.draw.polygon(canvas, color_outer, lb_outer)
    pygame.draw.polygon(canvas, color_outer, rb_outer)
    
    pygame.draw.polygon(canvas, color_inner, lt_inner)
    pygame.draw.polygon(canvas, color_inner, rt_inner)
    pygame.draw.polygon(canvas, color_inner, lb_inner)
    pygame.draw.polygon(canvas, color_inner, rb_inner)
    
    pygame.draw.ellipse(canvas, (10, 20, 40), (192, 120, 16, 160))
    
    return pygame.transform.smoothscale(canvas, (100, 100))

sprite = create_butterfly()

base_heart = []
for i in range(45):
    t = i * math.pi * 2 / 45
    x = 16 * (math.sin(t) ** 3)
    y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
    
    tilt = random.randint(-15, 15)
    flap_speed = random.uniform(0.010, 0.020)
    flap_offset = random.uniform(0, math.pi * 2)
    
    base_heart.append((x, y, tilt, flap_speed, flap_offset))

target_scales = [0.05, 0.15, 0.4, 1.0, 2.5, 6.0, 14.0, 32.0, 75.0]
growth_rate = 1.012 
cx, cy = WIDTH // 2, HEIGHT // 2

mode = "BUILD"
active_rings = []
build_idx = 0
trace_count = 0
particles = []

def draw_ring(scale, draw_limit, ticks):
    size = max(1, int(15 * math.sqrt(scale)))
    if size < 3: 
        return
    
    limit = min(draw_limit, len(base_heart))
    for i in range(limit):
        x, y, tilt, speed, offset = base_heart[i]
        px = cx + (x * scale * 7)
        py = cy + (y * scale * 7)
        
        flap = abs(math.sin((ticks * speed) + offset))
        width = max(1, int(size * (0.15 + flap * 0.85)))
        
        scaled = pygame.transform.smoothscale(sprite, (width, size))
        rotated = pygame.transform.rotate(scaled, tilt)
        rect = rotated.get_rect(center=(px, py))
        screen.blit(rotated, rect.topleft)
        
        glow_size = int(size * 1.3)
        glow_width = max(1, int(width * 1.3))
        glow_scaled = pygame.transform.smoothscale(sprite, (glow_width, glow_size))
        glow_scaled.set_alpha(120) 
        glow_rotated = pygame.transform.rotate(glow_scaled, tilt)
        glow_rect = glow_rotated.get_rect(center=(px, py))
        screen.blit(glow_rotated, glow_rect.topleft, special_flags=pygame.BLEND_RGBA_ADD)
        
        if random.random() < 0.15:
            particles.append({
                'x': px + random.uniform(-size/3, size/3),
                'y': py + random.uniform(-size/3, size/3),
                'dx': random.uniform(-0.5, 0.5),
                'dy': random.uniform(-0.5, 0.5),
                'size': max(2, size // 6),
                'life': random.randint(20, 40),
                'max_life': 40
            })

def handle_particles():
    for p in reversed(particles):
        p['x'] += p['dx']
        p['y'] += p['dy']
        p['life'] -= 1
        
        if p['life'] <= 0:
            particles.remove(p)
        else:
            alpha = int((p['life'] / p['max_life']) * 200)
            current_size = max(1, int(p['size'] * (p['life'] / p['max_life'])))
            
            dot = pygame.Surface((current_size, current_size), pygame.SRCALPHA)
            dot.fill((186, 85, 211, alpha))
            screen.blit(dot, (p['x'], p['y']), special_flags=pygame.BLEND_RGBA_ADD)

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    screen.fill((0, 2, 8)) 
    ticks = pygame.time.get_ticks()

    if mode == "BUILD":
        for ring_scale in active_rings:
            draw_ring(ring_scale, 45, ticks)
            
        if build_idx < len(target_scales):
            current_scale = target_scales[build_idx]
            trace_count += 1.2
            draw_ring(current_scale, int(trace_count), ticks)
            
            if trace_count >= len(base_heart):
                active_rings.append(current_scale)
                build_idx += 1
                trace_count = 0
        else:
            mode = "TUNNEL"
                
    elif mode == "TUNNEL":
        for i in range(len(active_rings)):
            active_rings[i] *= growth_rate
            
            if active_rings[i] > 150.0:
                active_rings[i] = 0.05

            draw_ring(active_rings[i], 45, ticks)

    handle_particles()

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()

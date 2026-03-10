"use client"

import { useEffect, useRef, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  life: number
  maxLife: number
  opacity: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  const createParticle = useCallback((x: number, y: number, radius: number = 3): Particle => {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 0.5 + 0.2
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      life: 0,
      maxLife: 200 + Math.random() * 300,
      opacity: 0.6 + Math.random() * 0.4,
    }
  }, [])

  const spawnChildParticles = useCallback((parent: Particle) => {
    if (parent.radius < 1) return []
    const children: Particle[] = []
    const numChildren = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < numChildren; i++) {
      const child = createParticle(parent.x, parent.y, parent.radius * 0.5)
      child.maxLife = parent.maxLife * 0.6
      child.opacity = parent.opacity * 0.7
      children.push(child)
    }
    return children
  }, [createParticle])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const initialCount = Math.min(30, Math.floor(window.innerWidth / 50))
    for (let i = 0; i < initialCount; i++) {
      particlesRef.current.push(
        createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          2 + Math.random() * 2
        )
      )
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      const newParticles: Particle[] = []

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++

        // Calculate opacity based on life
        const lifeRatio = p.life / p.maxLife
        const currentOpacity = p.opacity * (1 - lifeRatio)

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3)
        gradient.addColorStop(0, `rgba(5, 242, 155, ${currentOpacity})`)
        gradient.addColorStop(0.5, `rgba(5, 242, 155, ${currentOpacity * 0.3})`)
        gradient.addColorStop(1, "rgba(5, 242, 155, 0)")

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(5, 242, 155, ${currentOpacity})`
        ctx.fill()

        // Check for collision with other particles
        for (let j = i - 1; j >= 0; j--) {
          const other = particles[j]
          const dx = p.x - other.x
          const dy = p.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < p.radius + other.radius && particles.length < 80) {
            // Collision - spawn child particles
            const children = spawnChildParticles(p)
            newParticles.push(...children)
            p.life = p.maxLife // Mark for removal
            break
          }
        }

        // Remove dead particles or out of bounds
        if (
          p.life >= p.maxLife ||
          p.x < -50 ||
          p.x > canvas.width + 50 ||
          p.y < -50 ||
          p.y > canvas.height + 50
        ) {
          particles.splice(i, 1)
        }
      }

      // Add new particles
      particles.push(...newParticles)

      // Spawn new particles to maintain count
      if (particles.length < 20 && Math.random() < 0.05) {
        const edge = Math.floor(Math.random() * 4)
        let x, y
        switch (edge) {
          case 0: x = Math.random() * canvas.width; y = -20; break
          case 1: x = canvas.width + 20; y = Math.random() * canvas.height; break
          case 2: x = Math.random() * canvas.width; y = canvas.height + 20; break
          default: x = -20; y = Math.random() * canvas.height
        }
        particles.push(createParticle(x, y, 2 + Math.random() * 2))
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [createParticle, spawnChildParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  )
}

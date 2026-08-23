import { useEffect, useRef } from 'react'

export default function NetworkCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Particles / Distributed System Nodes
    const nodeCount = 45
    const nodes = []
    const colors = ['#38bdf8', '#60a5fa', '#818cf8', '#f97316', '#34d399', '#c084fc']

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02
      })
    }

    // Packet transmission pulses along network edges
    const packets = []
    const maxPackets = 16

    const spawnPacket = () => {
      if (packets.length >= maxPackets || nodes.length < 2) return
      const srcIdx = Math.floor(Math.random() * nodes.length)
      let dstIdx = Math.floor(Math.random() * nodes.length)
      while (dstIdx === srcIdx) {
        dstIdx = Math.floor(Math.random() * nodes.length)
      }
      const src = nodes[srcIdx]
      const dst = nodes[dstIdx]
      const dist = Math.hypot(src.x - dst.x, src.y - dst.y)
      if (dist < 280) {
        packets.push({
          src,
          dst,
          progress: 0,
          speed: 0.012 + Math.random() * 0.016,
          color: src.color
        })
      }
    }

    let mouse = { x: -1000, y: -1000, active: false }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }

    const handleMouseLeave = () => {
      mouse.active = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    let lastPacketTime = 0

    const render = (time) => {
      ctx.clearRect(0, 0, width, height)

      // 1. Draw Subtle Tech Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'
      ctx.lineWidth = 1
      const gridSize = 65
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // 2. Spawn periodic packet transmissions
      if (time - lastPacketTime > 300) {
        spawnPacket()
        lastPacketTime = time
      }

      // 3. Update & Draw Node Network Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 210

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.32
            ctx.beginPath()
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`
            ctx.lineWidth = 0.95
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // 4. Mouse Interaction Connections
      if (mouse.active) {
        for (let i = 0; i < nodes.length; i++) {
          const dx = mouse.x - nodes[i].x
          const dy = mouse.y - nodes[i].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const mouseMaxDist = 200

          if (dist < mouseMaxDist) {
            const alpha = (1 - dist / mouseMaxDist) * 0.6
            ctx.beginPath()
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`
            ctx.lineWidth = 1.5
            ctx.moveTo(mouse.x, mouse.y)
            ctx.lineTo(nodes[i].x, nodes[i].y)
            ctx.stroke()
          }
        }
      }

      // 5. Draw Traveling Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i]
        p.progress += p.speed
        if (p.progress >= 1) {
          packets.splice(i, 1)
          continue
        }

        const currX = p.src.x + (p.dst.x - p.src.x) * p.progress
        const currY = p.src.y + (p.dst.y - p.src.y) * p.progress

        ctx.beginPath()
        ctx.arc(currX, currY, 3, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 10
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // 6. Update & Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.x += n.vx
        n.y += n.vy
        n.pulse += n.pulseSpeed

        if (n.x < 0) n.x = width
        if (n.x > width) n.x = 0
        if (n.y < 0) n.y = height
        if (n.y > height) n.y = 0

        const pulseScale = Math.sin(n.pulse) * 0.35 + 1
        const currentRadius = n.radius * pulseScale

        // Node Halo
        ctx.beginPath()
        ctx.arc(n.x, n.y, currentRadius * 2.4, 0, Math.PI * 2)
        ctx.fillStyle = n.color.replace('rgb', 'rgba').replace(')', ', 0.18)')
        ctx.fill()

        // Node Core
        ctx.beginPath()
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2)
        ctx.fillStyle = n.color
        ctx.shadowBlur = 8
        ctx.shadowColor = n.color
        ctx.fill()
        ctx.shadowBlur = 0
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.95
      }}
    />
  )
}

import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import useViewport from '../../hooks/useViewport'
import { brandGreen, brandBlue } from '../../styles/colors'
import * as THREE from 'three'

// Constants for the neural network
const NODE_COUNT = 30
const CONNECTION_THRESHOLD = 0.2 // Lower number = more connections
const NODE_SIZE = 0.04
const MAX_CONNECTION_DISTANCE = 3

// Neural network node component
const Node = ({ position, color, hovered, scrollFactor }) => {
  const ref = useRef()
  const [initialPos] = useState(position.clone())
  
  // Apply subtle animation based on scroll position
  useFrame(() => {
    if (ref.current) {
      // Animate size based on hover state
      ref.current.scale.lerp(new THREE.Vector3(
        hovered ? 1.4 : 1, 
        hovered ? 1.4 : 1, 
        hovered ? 1.4 : 1
      ), 0.1)
      
      // Apply subtle movement based on scroll
      ref.current.position.y = initialPos.y + Math.sin(Date.now() / 2000) * 0.05 * scrollFactor
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[NODE_SIZE, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

// Connection line between nodes
const ConnectionLine = ({ start, end, opacity, thickness = 1 }) => {
  const ref = useRef()

  useEffect(() => {
    if (ref.current) {
      ref.current.geometry.setFromPoints([start, end].map(point => new THREE.Vector3(...point)))
      ref.current.geometry.computeBoundingSphere()
    }
  }, [start, end])

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial
        color="#ffffff"
        transparent
        opacity={opacity}
        linewidth={thickness}
        linecap="round"
        linejoin="round"
      />
    </line>
  )
}

// Animation for flowing particles along connections
const FlowingParticle = ({ startPoint, endPoint, speed = 1 }) => {
  const ref = useRef()
  const [progress, setProgress] = useState(0)
  
  // Calculate the vector between start and end points
  const vector = useMemo(() => {
    return new THREE.Vector3(
      endPoint[0] - startPoint[0],
      endPoint[1] - startPoint[1],
      endPoint[2] - startPoint[2]
    )
  }, [startPoint, endPoint])

  useFrame(() => {
    // Update progress and reset when reaching the end
    setProgress((prev) => {
      const next = prev + 0.01 * speed
      return next > 1 ? 0 : next
    })
    
    // Update position along the path
    if (ref.current) {
      ref.current.position.set(
        startPoint[0] + vector.x * progress,
        startPoint[1] + vector.y * progress,
        startPoint[2] + vector.z * progress
      )
    }
  })
  
  return (
    <mesh ref={ref} position={[startPoint[0], startPoint[1], startPoint[2]]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}

// The main neural network scene
const NeuralNetworkScene = ({ mousePosition, scrollPosition }) => {
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width
  
  const [hoveredNode, setHoveredNode] = useState(null)
  const scrollFactor = useMemo(() => scrollPosition / 500, [scrollPosition])
  
  // Generate random nodes and connections
  const [nodes, connections, particles] = useMemo(() => {
    // Create nodes with random positions
    const nodesArray = Array.from({ length: NODE_COUNT }, (_, i) => {
      const x = (Math.random() - 0.5) * 6
      const y = (Math.random() - 0.5) * 4
      const z = (Math.random() - 0.5) * 2
      
      // Color based on position (just for visual distinction)
      let color
      if (i % 3 === 0) color = brandGreen[400]
      else if (i % 3 === 1) color = brandBlue[500]
      else color = brandGreen[500]
      
      return {
        id: i,
        position: new THREE.Vector3(x, y, z),
        color
      }
    })
    
    // Create connections between nodes that are close enough
    const connectionsArray = []
    const particlesArray = []
    
    for (let i = 0; i < nodesArray.length; i++) {
      for (let j = i + 1; j < nodesArray.length; j++) {
        const distance = nodesArray[i].position.distanceTo(nodesArray[j].position)
        
        if (distance < MAX_CONNECTION_DISTANCE && Math.random() > CONNECTION_THRESHOLD) {
          const startPoint = [
            nodesArray[i].position.x,
            nodesArray[i].position.y,
            nodesArray[i].position.z
          ]
          
          const endPoint = [
            nodesArray[j].position.x,
            nodesArray[j].position.y,
            nodesArray[j].position.z
          ]
          
          // Add connection
          connectionsArray.push({
            id: `${i}-${j}`,
            start: startPoint,
            end: endPoint,
            opacity: Math.max(0.05, 1 - distance / MAX_CONNECTION_DISTANCE)
          })
          
          // Only add particles to some connections (for performance)
          if (Math.random() > 0.7) {
            particlesArray.push({
              id: `particle-${i}-${j}`,
              start: startPoint,
              end: endPoint,
              speed: Math.random() + 0.5
            })
          }
        }
      }
    }
    
    return [nodesArray, connectionsArray, particlesArray]
  }, [])
  
  // Update hovered node based on mouse position
  useFrame(() => {
    if (!mousePosition.current) return
    
    // Convert mouse position to scene coordinates
    const x = (mousePosition.current.x / size.width) * 2 - 1
    const y = -(mousePosition.current.y / size.height) * 2 + 1
    
    // Find the closest node to the mouse position
    let closestNode = null
    let closestDistance = 0.5 // Threshold for "closeness"
    
    nodes.forEach(node => {
      // Convert node position to screen coordinates (approximate)
      const screenX = node.position.x / aspect
      const screenY = node.position.y / aspect
      
      // Calculate distance to mouse in screen space
      const distance = Math.sqrt(
        Math.pow(screenX - x, 2) + 
        Math.pow(screenY - y, 2)
      )
      
      if (distance < closestDistance) {
        closestNode = node.id
        closestDistance = distance
      }
    })
    
    setHoveredNode(closestNode)
  })
  
  return (
    <>
      {/* Render connections */}
      {connections.map(connection => (
        <ConnectionLine
          key={connection.id}
          start={connection.start}
          end={connection.end}
          opacity={connection.opacity * (0.3 + scrollFactor * 0.4)}
        />
      ))}
      
      {/* Render flowing particles */}
      {particles.map(particle => (
        <FlowingParticle
          key={particle.id}
          startPoint={particle.start}
          endPoint={particle.end}
          speed={particle.speed}
        />
      ))}
      
      {/* Render nodes */}
      {nodes.map(node => (
        <Node
          key={node.id}
          position={node.position}
          color={node.color}
          hovered={node.id === hoveredNode}
          scrollFactor={scrollFactor}
        />
      ))}
    </>
  )
}

// Main component with Canvas setup
const NeuralNetworkCanvas = ({ scrollPosition = 0 }) => {
  const mousePosition = useRef({ x: 0, y: 0 })
  const { isDesktop } = useViewport()
  
  // Track mouse position
  const handleMouseMove = (e) => {
    mousePosition.current = {
      x: e.clientX,
      y: e.clientY
    }
  }
  
  // Only render on desktop
  if (!isDesktop) return null
  
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        dpr={[1, 2]} // Performance optimization
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ 
          opacity: 0.4,
          mixBlendMode: 'screen'
        }}
      >
        <NeuralNetworkScene 
          mousePosition={mousePosition}
          scrollPosition={scrollPosition}
        />
      </Canvas>
    </div>
  )
}

export default NeuralNetworkCanvas

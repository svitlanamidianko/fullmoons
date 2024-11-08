import { useState, useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import './App.css'

function Starfield() {
  const count = 5000
  const mesh = useRef()

  // Generate random star positions
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300 // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300 // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300 // z
    }
    return positions
  }, [])

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.0001
      mesh.current.rotation.x += 0.0001
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        sizeAttenuation={true}
        color="white"
        transparent
        opacity={0.8}
      />
    </points>
  )
}

function Moon({ illumination = 1 }) {
  const moonRef = useRef()
  
  const textureURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg"
  const displacementURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/ldem_3_8bit.jpg"

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(textureURL)
    const displacementMap = textureLoader.load(displacementURL)

    if (moonRef.current) {
      moonRef.current.material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: texture,
        displacementMap: displacementMap,
        displacementScale: 0.06,
        bumpMap: displacementMap,
        bumpScale: 0.04,
        reflectivity: 0,
        shininess: 0
      })

      moonRef.current.rotation.x = 3.1415 * 0.02
      moonRef.current.rotation.y = 3.1415 * 1.54
    }
  }, [])

  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.001 // Slower rotation
    }
  })

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[2, 60, 60]} />
    </mesh>
  )
}

function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <color attach="background" args={['#000000']} />
      <OrbitControls 
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 2.5}
      />
      <Starfield />
      <directionalLight position={[-100, 10, 50]} intensity={1} />
      <hemisphereLight intensity={0.1} />
      <Moon />
    </Canvas>
  )
}

function App() {
  const [illumination, setIllumination] = useState(null)
  const [fullMoons, setFullMoons] = useState(null)

  useEffect(() => {
    setIllumination(0.75)
  }, [])

  return (
    <div className="app-container">
      <div className="moon-container">
        <Scene />
      </div>
      <div className="info-overlay">
        <h1>Moon Phase Tracker</h1>
        {illumination !== null && (
          <p>Current illumination: {(illumination * 100).toFixed(1)}%</p>
        )}
        {fullMoons !== null && (
          <p>Full moons since Jan 1st, 2024: {fullMoons}</p>
        )}
      </div>
    </div>
  )
}

export default App
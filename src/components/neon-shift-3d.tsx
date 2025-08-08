"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function NeonShift3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();

  const isDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 25;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Object
    const geometry = new THREE.TorusKnotGeometry(8, 2, 128, 16);
    const primaryMaterial = new THREE.MeshStandardMaterial({
      color: 0x6A3CBC,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x39FF14,
      emissive: 0x39FF14,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, primaryMaterial);
    scene.add(mesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6A3CBC, 3.0, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x39FF14, 3.0, 100);
    pointLight2.position.set(-20, -20, -20);
    scene.add(pointLight2);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 30, 0);
    scene.add(directionalLight);

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isDraggingRef.current) {
        mesh.rotation.y += 0.001;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Event Handlers
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const rotation = scrollY * 0.001;
        mesh.rotation.z = rotation;
        mesh.rotation.x = rotation;
    };

    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      wasDraggedRef.current = false;
      previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      wasDraggedRef.current = true;
      const deltaX = event.clientX - previousMousePositionRef.current.x;
      const deltaY = event.clientY - previousMousePositionRef.current.y;
      mesh.rotation.y += deltaX * 0.005;
      mesh.rotation.x += deltaY * 0.005;
      previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    let isAlternateMaterial = false;
    const handleClick = (event: MouseEvent) => {
      if (wasDraggedRef.current) return;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / currentMount.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / currentMount.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects([mesh]);

      if (intersects.length > 0) {
        isAlternateMaterial = !isAlternateMaterial;
        mesh.material = isAlternateMaterial ? accentMaterial : primaryMaterial;
        (mesh.material as THREE.Material).needsUpdate = true;
      }
    };
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('scroll', handleScroll);
    currentMount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    currentMount.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('scroll', handleScroll);
      currentMount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      currentMount.removeEventListener('click', handleClick);

      cancelAnimationFrame(frameId);
      if (rendererRef.current && currentMount.contains(rendererRef.current.domElement)) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      primaryMaterial.dispose();
      accentMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}

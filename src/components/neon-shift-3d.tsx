"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { UltraHDRLoader } from '../components/ultraHDRLoader';
import {TextureUtils} from '../components/TextureUtils';
import { gsap } from 'gsap';


export function NeonShift3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();

  const isDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  

  
  useEffect(() => {
    if (!mountRef.current) return;
    let diff = 0;
    let diffx = 0;
    let mousepos =  new THREE.Vector2(0,0);
    let timeoutid: NodeJS.Timeout;
    let scrolliter: NodeJS.Timeout;
    let scrollint: NodeJS.Timeout;
    let clock = new THREE.Clock(false);
    let dragd = 0;
    let enterstop: NodeJS.Timeout;
    let enteranim: NodeJS.Timeout;

    // Animation loop
    let frameId: number;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 1;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer( renderer );
    
    const renderPass = new RenderPass( scene, camera );
    const outputPass = new OutputPass();
    const glitchPass = new GlitchPass();
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( currentMount.clientHeight, currentMount.clientWidth ), 0.3, 0.5, 0.95 );
    
    const primaryMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x921C1C,
      metalness: 0.9,
      roughness: 0.3,
      emissive: 0xFFFFFF,
      emissiveIntensity: 0,
      wireframe: false,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x39FF14,
      emissive: 0x39FF14,
      emissiveIntensity: 0.1,
      metalness: 0.2,
      roughness: 0.6,
      wireframe: true,
    });
    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0.2,
      roughness: 0.6,
      wireframe: false,
      transparent: true,
      opacity: 0,
    });

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const backgeometry = new THREE.BoxGeometry(currentMount.clientHeight/4, currentMount.clientWidth/4, 1);
    const backwall = new THREE.BoxGeometry(currentMount.clientWidth/10, currentMount.clientHeight/10, 1);
    const textgeo = new TextGeometry('three.js')

    scene.background = new THREE.Color(0x000000);
    let mesh = new THREE.Mesh(geometry, primaryMaterial);
    let meshtext = new THREE.Mesh(textgeo, primaryMaterial);

    let mesh2 = new THREE.Mesh(geometry, primaryMaterial);
    mesh2.position.y = mesh.position.y - 50;
    let mesh2text = new THREE.Mesh(textgeo, primaryMaterial);

    let mesh3 = new THREE.Mesh(backwall, backMaterial);

    let backmesh = new THREE.Mesh(backgeometry, backMaterial);
    backmesh.position.z = -14

    const loadManager = new THREE.LoadingManager();
    const iloader = new THREE.TextureLoader(loadManager);
    const floader = new FontLoader(loadManager);
    
    const loader = new GLTFLoader(loadManager);

    let wtextured = iloader.load('texts/brick_wall_001_diffuse_1k.jpg');
    let wtexturen = iloader.load('texts/brick_wall_001_nor_gl_1k.jpg');
    let wtexturer = iloader.load('texts/brick_wall_001_rough_1k.jpg');
    

    loader.load( 'textexp/Untitled.gltf', function ( gltf ) {
      const root = gltf.scene
      let locscene = root.getObjectByName('Pen');
      mesh = locscene.children[0]
      mesh.rotateY(1.4);
      mesh.rotateX(-0.5);
      mesh.geometry.scale(3,3,3)
      //mesh.rotation.y = 1.3;
      //mesh.rotation.x = 0.5;
      mesh.material.transparent = true;
      
      //scene.add(root);
    }, undefined, function ( error ) {
  
      console.error( error );
  
    } );

    floader.load('Bahianita_Regular.json', (font) => {
      const text = 'BLOODY';  
        const geometry = new TextGeometry(text, {
          font: font,
          size: 5,  
      
          depth: 0.5,  
      
          curveSegments: 12,  
      
          bevelEnabled: true,  
          bevelThickness: 0.05,  
      
          bevelSize: 0.06,  
      
          bevelSegments: 3,  
      
        });
        meshtext = new THREE.Mesh(geometry, primaryMaterial)
        meshtext.position.x = -5.7
        meshtext.position.z = 15;
        
        
    });

    loader.load( 'textexp/Untitled.gltf', function ( gltf ) {
      const root = gltf.scene
      let locscene = root.getObjectByName('Pen');
      mesh2 = locscene.children[0]
      mesh2.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 1.3);
      mesh2.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), 1);
      mesh2.geometry.scale(3,3,3)
      mesh2.position.y = mesh.position.y - (window.outerHeight / 15);
      //mesh.rotation.y = 1.3;
      //mesh.rotation.x = 0.5;
      
      //scene.add(root);
    }, undefined, function ( error ) {
  
      console.error( error );
  
    } );
    
    floader.load('Bahianita_Regular.json', (font) => {
      const text = 'BLOODY INK';  
        const geometry = new TextGeometry(text, {
          font: font,
          size: 5,  
      
          depth: 0.5,  
      
          curveSegments: 12,  
      
          bevelEnabled: true,  
          bevelThickness: 0.05,  
      
          bevelSize: 0.06,  
      
          bevelSegments: 3,   
      
        });
        mesh2text = new THREE.Mesh(geometry, primaryMaterial)
        mesh2text.position.x = -9
        mesh2text.position.z = 15;
        
        
    });

    loadManager.onLoad = () => {
      wtextured = TextureUtils.cover(wtextured,window.devicePixelRatio < 1.5 ? 1.2 : 0.5 )
      wtexturen = TextureUtils.cover(wtexturen,window.devicePixelRatio < 1.5 ? 1.2 : 0.5 )
      wtexturer = TextureUtils.cover(wtexturer,window.devicePixelRatio < 1.5 ? 1.2 : 0.5 )

      const wallMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xBB9090,
        metalness: 0.0,
        wireframe: false,
        roughnessMap: wtexturer,
        roughness: 0.7,
        normalMap: wtexturen,
        normalScale: new THREE.Vector2(0.5,0.5),
        map: wtextured,
        ior: 1.43,
        specularIntensity: 0.7,
      }); 
      mesh3.material = wallMaterial;
      mesh3.position.z = -15
      
      scene.add(backmesh)
      scene.add(mesh3);
      scene.add(mesh);
      scene.add(meshtext);
      scene.add(mesh2);
      scene.add(mesh2text);

      composer.addPass( renderPass );
      composer.addPass( bloomPass );
      composer.addPass( glitchPass );
      composer.addPass( outputPass );

      removeglitch;

    };

    // This code now runs only on the client, avoiding hydration errors
    camera.position.z = 35 + window.outerWidth / 100;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight3.position.set(30, 0, 20);
    scene.add(directionalLight3);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(0, 30, 0);
    scene.add(directionalLight2);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, -30, 0);
    scene.add(directionalLight);

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight4.position.set(2, -6, 20);
    scene.add(directionalLight4);

    const animate = () => {
      if (!isDraggingRef.current) {
        mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), ( 0.002))
        mesh2.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), ( 0.002))
      }
      meshtext.position.y = mesh.position.y - 10;
      mesh2text.position.y = mesh2.position.y - 10;

      composer.render();

      frameId = requestAnimationFrame(animate);
    };

    const fadepost = () => {
      glitchPass.enabled = false;
    }
    const removeglitch = setTimeout(fadepost, 2500)

    const camerazoom = () => {
      if (camera.position.z > -5 ) {
        camera.position.z -= 1;
      }
      if (mesh.material.opacity > 0.03) {
        mesh.material.opacity -= 0.04;
      }
      if (backmesh.material.opacity < 0.99) {
      backmesh.material.opacity += 0.02;
      }
    }
    
    const stopcamerazoom = () => {
      clearInterval(enteranim);      
      window.location.href = "https://inkomnia.bigcartel.com/product/bloody";
    }

    const checkIntersect = () => {
      return
      const raycaster = new THREE.Raycaster();

      raycaster.setFromCamera(mousepos, camera);
      
      const intersects = raycaster.intersectObjects([mesh, mesh2]);
      // const intersects2 = raycaster.intersectObjects([mesh2]);
      if (intersects.length > 0) {
        //isAlternateMaterial = !isAlternateMaterial;
        //gives error but its actually working as intended for simple scenes
        //intersects[0].object.material = isAlternateMaterial ? accentMaterial : primaryMaterial;
        //intersects[0].object.material.needsUpdate = true;
        
      }
    }

    let gsap1;
    let gsap2;
    const snapScroll = () => {
       if (mesh.position.y < 0) {
        gsap1 = gsap.to(mesh.position, {duration: 2, y:0})
        gsap2 = gsap.to(mesh2.position, {duration: 2, y:-(window.outerHeight / 15)})
      }
      else if (mesh.position.y > 0 && mesh2.position.y < -25) {
        gsap2 = gsap.to(mesh2.position, {duration: 2, y:0})
        gsap1 = gsap.to(mesh.position, {duration: 2, y:(window.outerHeight / 15)})
      } 
      else if (mesh.position.y > 0 && mesh2.position.y < 0) {
        gsap1 = gsap.to(mesh.position, {duration: 2, y:0})
        gsap2 = gsap.to(mesh2.position, {duration: 2, y:-(window.outerHeight / 15)})
      }
      else if (mesh2.position.y > 0 && mesh2.position.y < (window.outerHeight / 15)) {
        gsap2 = gsap.to(mesh2.position, {duration: 2, y:0})
        gsap1 = gsap.to(mesh.position, {duration: 2, y:(window.outerHeight / 15)})
      }
    }

    const snapBack = () => {
        //handle the snap back in place timeout on scrolling
        snapScroll()
    }

    // Event Handlers
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    const handletouch = (event: TouchEvent) => {
      diff = event.touches[0].screenY;
      diffx = event.touches[0].screenX;
      
    }

    const handledragtouch = (event: TouchEvent) => {
      mousepos.x = (event.touches[0].clientX / currentMount.clientWidth) * 2 -1;
      mousepos.y = (event.touches[0].clientY / currentMount.clientHeight) * -2 + 1;

      const deltay = diff - event.touches[0].screenY;
      const deltax = diffx - event.touches[0].screenX;
      dragd += deltay;
      diff = event.touches[0].screenY;
      diffx = event.touches[0].screenX;
      const myAxis = new THREE.Vector3(0, -1, 0);
      const rotation = (deltax / window.outerWidth) * 5;

      //prevent scroll to refresh on mobile
      if (deltay < 0 && event.cancelable == true ) {
        event.preventDefault();
      }

      //handleTranslate(deltay, 0.07)

      mesh.rotateOnWorldAxis(myAxis, ( rotation ))
      mesh2.rotateOnWorldAxis(myAxis, ( rotation ))

    }

    const handleScroll = (event: WheelEvent) => {
        if (event.deltaY > 0) {
          mesh.position.y += 1.1;
        } else if (event.deltaY < 0) {
          mesh2.position.y -= 1.1
        }
        snapBack()
    };

    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      wasDraggedRef.current = false;
      clearTimeout(timeoutid)
      clearInterval(scrollint)
      clearTimeout(scrolliter)
      previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) {
        //update mouse position uniform inside shader
        mousepos.x = (event.clientX / window.innerWidth) * 2 - 1;
        mousepos.y = -(event.clientY / window.innerHeight) * 2 + 1;
        checkIntersect()
        return
      };
      wasDraggedRef.current = true;
      const myAxis = new THREE.Vector3(0, 1, 0);
      const deltaX = event.clientX - previousMousePositionRef.current.x;
      const deltaY = event.clientY - previousMousePositionRef.current.y;
      const translation = (deltaY / window.outerHeight) * 100.5;

      mesh.rotateOnWorldAxis(myAxis, ( deltaX * 0.005))
      mesh2.rotateOnWorldAxis(myAxis, ( deltaX * 0.005))

      //update mouse position uniform inside shader
      mousepos.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousepos.y = -(event.clientY / window.innerHeight) * 2 + 1;

      previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      dragd = 0;
      isDraggingRef.current = false;
      //snapBack()
    };

    const handleTouchUp = () => {
      isDraggingRef.current = false;
      console.log(dragd);
      if (dragd > 20) {
        mesh.position.y += 1.1;
      } else if (dragd < -20) {
        mesh2.position.y -= 1.1
      }
      snapBack()
    };

    const handleClick = (event: MouseEvent) => {
      if (wasDraggedRef.current) return;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / currentMount.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / currentMount.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects([mesh, mesh2]);
      //const intersects2 = raycaster.intersectObjects([mesh2]);
      if (intersects.length > 0) {
        glitchPass.enabled = true;
        composer.addPass( glitchPass );
        enteranim = setInterval(camerazoom, 10);
        enterstop = setTimeout(stopcamerazoom, 700);
      }
    };
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('touchmove', handledragtouch, { passive: false });
    document.addEventListener('touchstart', handletouch);
    document.addEventListener('wheel', handleScroll);
    currentMount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchUp);
    currentMount.addEventListener('click', handleClick);
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('touchmove', handledragtouch);
      document.removeEventListener('touchstart', handletouch);
      document.removeEventListener('wheel', handleScroll);
      currentMount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchUp);
      currentMount.removeEventListener('click', handleClick);

      cancelAnimationFrame(frameId);
      if (rendererRef.current && currentMount.contains(rendererRef.current.domElement)) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      backgeometry.dispose();
      backwall.dispose();
      textgeo.dispose();
      primaryMaterial.dispose();
      accentMaterial.dispose();
      backMaterial.dispose();
      
      renderer.dispose();
      composer.dispose();
      
    };
  }, []);

  return  <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
;
}

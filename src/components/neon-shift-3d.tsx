"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

let VerticalBlurShader = {

  uniforms: {

    "tDiffuse": {
      value: null
    },
    "v": {
      value: 1.0 / 256.0
    },
    "mouse": {
      value: new THREE.Vector2()
    },
    "ratio": {
      value: 1
    }

  },

  vertexShader: `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`,

  fragmentShader: `

  uniform sampler2D tDiffuse;
  uniform float v;
  uniform vec2 mouse;
  uniform float ratio;
  varying vec2 vUv;

  
  void main() {
    vec2 uv = vUv;
    uv = -1. + 2. * uv;
    uv -= mouse;
    uv.x *= ratio;
    if ( length(uv) > 0.1 ) {
      gl_FragColor = texture2D(tDiffuse, vUv);
    } 
    else{
      vec4 sum = vec4( 0.0 );
      
      sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 9.0 * v ) ) * 0.0051;
      sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;
      sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;
      sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;
      sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
      sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;
      sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;
      sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;
      sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.0051;

      gl_FragColor = sum;
    }

  }`
};

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
    

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true });
    //renderer.setAnimationLoop( animate );
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer( renderer );
    
    const renderPass = new RenderPass( scene, camera );
    const outputPass = new OutputPass();
    
    const glitchPass = new GlitchPass();
    
    var hblur = new ShaderPass(VerticalBlurShader);
    
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( currentMount.clientHeight, currentMount.clientWidth ), 0.2, 1.0, 0.95 );
    composer.addPass( renderPass );
    composer.addPass(bloomPass);
    composer.addPass( glitchPass );
    composer.addPass( outputPass );
    //composer.addPass(hblur);
    
    

    // Object
    const geometry = new THREE.TorusKnotGeometry(8, 2, 128, 16);
    const geometry2 = new THREE.TorusKnotGeometry(8, 2, 128, 16);
    const primaryMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      metalness: 0.9,
      roughness: 0.4,
      emissive: 0xFFFFFF,
      emissiveIntensity: 0,
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
    const mesh2 = new THREE.Mesh(geometry2, primaryMaterial);
    scene.add(mesh);
    
    scene.add(mesh2);

    // This code now runs only on the client, avoiding hydration errors
    camera.position.z = 35 + window.outerWidth / 50;
    mesh2.position.y = mesh.position.y - (window.outerHeight / 10);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6A3CBC, 3.0, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x39FF14, 3.0, 100);
    pointLight2.position.set(-20, -20, -20);
    scene.add(pointLight2);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 30, 0);
    scene.add(directionalLight);

    let diff = 0;
    let diffx = 0;
    let mousepos =  new THREE.Vector2(0,0);
    let timeoutid: NodeJS.Timeout;
    let scrolliter: NodeJS.Timeout;
    let scrollint: NodeJS.Timeout;
    let clock = new THREE.Clock(false);

    const fadepost = () => {
      glitchPass.enabled = false;
      console.log("test")
    }

    const removeglitch = setTimeout(fadepost, 500)
    
    const checkIntersect = () => {
      const raycaster = new THREE.Raycaster();

      raycaster.setFromCamera(mousepos, camera);
      
      const intersects = raycaster.intersectObjects([mesh, mesh2]);
      // const intersects2 = raycaster.intersectObjects([mesh2]);
      if (intersects.length > 0) {
        primaryMaterial.emissiveIntensity = 0.1;
        //(mesh.material as THREE.Material).needsUpdate = true;
      }
      else if (intersects.length > 0) {
        primaryMaterial.emissiveIntensity = 0.1;
        //(mesh.material as THREE.Material).needsUpdate = true;
      } else {
        primaryMaterial.emissiveIntensity = 0.0;
        //(mesh.material as THREE.Material).needsUpdate = true;
      }
    }

    const snapScroll = () => {
      if (mesh.position.y < -1) {
        mesh.position.y += 0.25;
        mesh2.position.y += 0.25;
        timeoutid = setTimeout(snapScroll, 10);
      }
      else if (mesh.position.y > 0 && mesh.position.y < (window.outerHeight / 20)) {
        mesh.position.y -= 0.25;
        mesh2.position.y -= 0.25;
        timeoutid = setTimeout(snapScroll, 10);
      } 
      else if (mesh.position.y > (window.outerHeight / 20) && mesh2.position.y < -1) {
        mesh.position.y += 0.25;
        mesh2.position.y += 0.25;
        timeoutid = setTimeout(snapScroll, 10);
      }
      else if (mesh2.position.y > 1 && mesh2.position.y < (window.outerHeight / 20)) {
        mesh.position.y -= 0.25;
        mesh2.position.y -= 0.25;
        timeoutid = setTimeout(snapScroll, 10);
      }
      else {
        clearTimeout(timeoutid);
      }
    }

    const snapBack = () => {
        //handle the snap back in place timeout on scrolling
      if (mesh.position.y > 5 || mesh.position.y < 0){
        clearTimeout(timeoutid)
        timeoutid = setTimeout(snapScroll, 300);
      }
      if (mesh2.position.y > -(window.outerHeight / 20) ){
        clearTimeout(timeoutid)
        timeoutid = setTimeout(snapScroll, 300); 
      }
    }

    const mouseover = () => {
      primaryMaterial.roughness = 0.2;
      (mesh.material as THREE.Material).needsUpdate = true;
      clearTimeout(timeoutid);
    }

    const handleTranslate = (delta: number, translation: number) => {
      //handle mesh movement/rotation on touch drag
      if (mesh.position.y < -1) {
        if (delta > 0) {
          mesh.translateY(translation);
          mesh2.translateY(translation);
        }
      } else {
        mesh.translateY(translation);
        mesh2.translateY(translation);
      }
    }

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isDraggingRef.current) {
        //mesh.rotation.y += 0.003;
      }
       
      //mesh2.position.y = mesh.position.y - 60;
      //renderer.render(scene, camera);
      hblur.uniforms.mouse.value.copy(mousepos);
      composer.render();
    };
    animate();
    
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
      const myAxis = new THREE.Vector3(0, -1, 0);

      const translation = (deltay / window.outerHeight) * 120.5;
      const rotation = (deltax / window.outerWidth) * 5;

      //prevent scroll to refresh on mobile
      if (deltay < 0 && event.cancelable == true ) {
        event.preventDefault();
      }

      handleTranslate(deltay, translation)

      mesh.rotateOnWorldAxis(myAxis, ( rotation ))
      mesh2.rotateOnWorldAxis(myAxis, ( rotation ))

      diff = event.touches[0].screenY;
      diffx = event.touches[0].screenX;

      scrollkinetic(deltay / 5)

      checkIntersect()
    }

    const scrollstep = (delta:number) => {
      let et = clock.getElapsedTime() + 1;
      
      if (mesh.position.y > -1) {
        mesh.translateY(delta / et);
        mesh2.translateY(delta / et);
      } else {
        clearInterval(scrollint)
        clearTimeout(scrolliter)
        clock.stop()
      }
    }

    const stopkinetic = () => {
      clearInterval(scrollint)
      clearTimeout(scrolliter)
      clock.stop()
    }

    const scrollkinetic = (delta: number) => {
      clearInterval(scrollint)
      clearTimeout(scrolliter)
      if (mesh.position.y > -1) {
        clock.start()
        scrollint = setInterval(scrollstep, 10, delta/5)
        scrolliter = setTimeout(stopkinetic, 700)
      }
    }

    const handleScroll = (event: WheelEvent) => {
        const scrollY = event.deltaY * 4;
        const rotation = scrollY / window.innerHeight
        const myAxis = new THREE.Vector3(0, 1, 0);
        //diff = window.scrollY

        scrollkinetic(scrollY / 100)

        snapBack()
    };

    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      wasDraggedRef.current = false;
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

      handleTranslate(-deltaY, -translation)

      scrollkinetic(-deltaY / 3)

      

      checkIntersect()

      previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      snapBack()
    };
    
    let isAlternateMaterial = false;
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
        isAlternateMaterial = !isAlternateMaterial;
        intersects[0].object.material = isAlternateMaterial ? accentMaterial : primaryMaterial;
        intersects[0].object.material.needsUpdate = true;
        
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
    window.addEventListener('touchend', handleMouseUp);
    currentMount.addEventListener('click', handleClick);

    removeglitch
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('touchmove', handledragtouch);
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

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
    let dragd = 0;
    let dragx = 0;

    let gss1: GSAPAnimation;
    let gss2: GSAPAnimation;
    let gss3: GSAPAnimation;
    let gss4: GSAPAnimation;
    let gss5: GSAPAnimation;
    let gsap1 = gsap.to({x:0,y:0}, {duration: 1, y:0}).pause();
    let gsap2: GSAPAnimation;

    let frameId: number;
    let isRevealing = false;
    const clock = new THREE.Clock();
    
    let revealStartTime = 0;

    let primaryMaterial: THREE.MeshPhysicalMaterial;
    let accentMaterial: THREE.MeshStandardMaterial;
    let backMaterial: THREE.MeshStandardMaterial;
    let wallMaterial: THREE.MeshPhysicalMaterial;
    
    let mesh: THREE.Mesh;
    let mesh2: THREE.Mesh;
    let mesh3: THREE.Mesh;
    let meshtext: THREE.Mesh;
    let mesh2text: THREE.Mesh;
    let backmesh: THREE.Mesh;

    let composer: EffectComposer;
    let renderPass: RenderPass;
    let outputPass: OutputPass;
    let glitchPass: GlitchPass;
    let bloomPass: UnrealBloomPass;

    let wtextured: THREE.Texture;
    let wtexturen: THREE.Texture;
    let wtexturer: THREE.Texture;

    const loadManager = new THREE.LoadingManager();
    const iloader = new THREE.TextureLoader(loadManager);
    const floader = new FontLoader(loadManager);
    const loader = new GLTFLoader(loadManager);
    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 35 + window.outerWidth / 100;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 1;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const initmats = () => {
      primaryMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x921C1C,
        metalness: 0.9,
        roughness: 0.3,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0,
        wireframe: false,
      });
      accentMaterial = new THREE.MeshStandardMaterial({
        color: 0x39FF14,
        emissive: 0x39FF14,
        emissiveIntensity: 0.1,
        metalness: 0.2,
        roughness: 0.6,
        wireframe: true,
      });
      backMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.2,
        roughness: 0.6,
        wireframe: false,
        transparent: true,
        opacity: 0,
      });
      wallMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xBB9090,
        metalness: 0.1,
        wireframe: false,
        roughness: 1.8,
        displacementScale: 1.5,
        ior: 1.73,
        specularIntensity: 0.4,
        transparent: true,
      });
      wallMaterial.onBeforeCompile = (shader) => {
        // Pass uniform values to the shader program for JS to control.
        shader.uniforms.u_progress = { value: 0.0 };
        shader.uniforms.u_aspect = { value: currentMount.clientWidth / currentMount.clientHeight };
  
        // === Vertex Shader Modification ===
        // 1. Declare our custom varying variable.
        // 2. Assign the built-in 'uv' attribute to it.
        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `
          #include <common>
          uniform float u_progress;
          uniform float u_aspect;
          varying vec2 vRevealUv;
          `
        );
        shader.vertexShader = shader.vertexShader.replace(
          '#include <uv_vertex>',
          `
          #include <uv_vertex>
          vRevealUv = uv;
  
          `
        );
  
        // === Fragment Shader Modification ===
        // 1. Declare the uniforms and the matching 'in' varying.
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `
          #include <common>
          uniform float u_progress;
          uniform float u_aspect;
          varying vec2 vRevealUv;
          `
        );
  
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <normal_fragment_maps>',
            `
            #include <normal_fragment_maps>
            
            vec2 centerx = vec2(0.5, 0.5);
            vec2 px = vRevealUv - centerx;
            px.x *= u_aspect; // Correct for aspect ratio to keep the reveal circular
  
            float distx = length(px) * fract(sin(dot(px.xy ,vec2(12.9898,78.233)) * 314.5453));
            float radiusx = u_progress;
  
            float reveal_alphax = 1.0 - smoothstep(radiusx - 0.45, radiusx, distx);
            
            // Blend normals using partial derivative blending
  
            normal.xyz = normal.xyz *= reveal_alphax;
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <displacement_fragment_maps>',
          `
          #include <displacement_fragment_maps>
          
          vec2 centerx = vec2(0.5, 0.5);
          vec2 px = vRevealUv - centerx;
          px.x *= u_aspect; // Correct for aspect ratio to keep the reveal circular

          float distx = length(px) * fract(sin(dot(py.xy ,vec2(12.9898,78.233));
          float radiusx = u_progress;

          float reveal_alphax = 1.0 - smoothstep(radiusx -(0.4), radiusx, distx);
          
          // Blend normals using partial derivative blending

          displacement.xyz = displacement.xyz *= reveal_alphax;
          `
      );
  
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          `
          #include <color_fragment>

          
          vec2 centery = vec2(0.5, 0.5);
          vec2 py = vRevealUv - centery; // Use our own varying now
          py.x *= u_aspect; // Correct for aspect ratio to keep the reveal circular
          
          float disty = length(py) ;
          float radiusy = u_progress ;
          float feathery = 0.5;
          // Calculate alpha based on distance from center
          float reveal_alphay = 1.0 - smoothstep(radiusy - feathery, radiusy, disty);  
  
          diffuseColor = mix(vec4(1,1,1,0),diffuseColor, reveal_alphay);
          `
        );
  
        // Store the modified shader on the material so we can access uniforms later
        wallMaterial.userData.shader = shader;
        //console.log(shader)
      };

      wtextured = iloader.load('texts/brick_wall_001_diffuse_1k.jpg');
      wtexturen = iloader.load('texts/brick_wall_001_nor_gl_1k.jpg');
      wtexturer = iloader.load('texts/brick_wall_001_rough_1k.jpg');
    }

    const initcomposer = () => {
      composer = new EffectComposer( renderer );
      renderPass = new RenderPass( scene, camera );
      outputPass = new OutputPass();
      glitchPass = new GlitchPass();
      bloomPass = new UnrealBloomPass( new THREE.Vector2( currentMount.clientHeight, currentMount.clientWidth ), 0.3, 0.5, 0.95 );
    }
    
    const initgeos = () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const backgeometry = new THREE.BoxGeometry(currentMount.clientHeight/4, currentMount.clientWidth/4, 1);
      const backwall = new THREE.BoxGeometry(currentMount.clientWidth/6, currentMount.clientHeight/6, 1,200,200);
      const textgeo = new TextGeometry('three.js')
      mesh = new THREE.Mesh();
      meshtext = new THREE.Mesh(textgeo, primaryMaterial);
      mesh2 = new THREE.Mesh();
      mesh2text = new THREE.Mesh(textgeo, primaryMaterial);
      mesh3 = new THREE.Mesh(backwall, backMaterial);
      backmesh = new THREE.Mesh(backgeometry, backMaterial);

      backmesh.position.z = -10
    }

    const initLoader = () => {
      loader.load( 'marker/markercustom.gltf', function ( gltf ) {
        const calizStella_mat = new THREE.MeshPhysicalMaterial({
            metalness: .7,
            roughness: .2,
            envMapIntensity: 0.9,
            clearcoat: 0.6,
            transparent: true,
            //transmission: 0.3,
            opacity: .5,
            reflectivity: 0.2,
            //refractionRatio: 0.985,
            ior: 0.9,
          })
        const root = gltf.scene
        let locscene = root.getObjectByName('Marker');
        let locscene2 = root.getObjectByName('Cap');
        
        if (locscene?.children[0]) {
          mesh.add(locscene.children[0])
          mesh.add(locscene2.children[0])
          mesh.children[0].children[1].material.roughness = 0.3,
          mesh.children[0].children[1].material.clearcoat = 0,
          mesh.children[1].material = calizStella_mat;
          mesh.children[1].position.x = 0;
          mesh2.copy(mesh)
        }
        mesh.rotateZ(0.7);
        mesh.rotateX(1.4);
        
        mesh2.rotateZ(0.7);
        mesh2.rotateX(1.4);
        mesh.position.y = -60;
        mesh2.position.y = mesh.position.y - 90

        locscene?.clear();
        locscene2?.clear();
        root.clear();
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

          const text2 = 'BLOODY INK';  
          const geometry2 = new TextGeometry(text2, {
            font: font,
            size: 5,  
        
            depth: 0.5,  
        
            curveSegments: 12,  
        
            bevelEnabled: true,  
            bevelThickness: 0.05,  
        
            bevelSize: 0.06,  
        
            bevelSegments: 3,   
        
          });
          mesh2text = new THREE.Mesh(geometry2, primaryMaterial)
          mesh2text.position.x = -9
          mesh2text.position.z = 15;
      });
    }

    loadManager.onProgress = (url, loaded, total) => {
      let prel = document.getElementById('pretext')
      let prog = loaded + "/" + total;
      prel.innerHTML = "LOADING - " + prog;
    }
    loadManager.onLoad = () => {
      wtextured = TextureUtils.cover(wtextured,window.devicePixelRatio < 1.5 ? 1.3 : 0.6 )
      wtexturen = TextureUtils.cover(wtexturen,window.devicePixelRatio < 1.5 ? 1.3 : 0.6 )
      wtexturer = TextureUtils.cover(wtexturer,window.devicePixelRatio < 1.5 ? 1.3 : 0.6 )

      mesh3.material = wallMaterial;
      mesh3.material.roughnessMap = wtextured,
      mesh3.material.normalMap = wtexturen,
      mesh3.material.displacementMap = wtexturen,
      mesh3.material.map = wtextured,
      
      
      mesh3.position.z = -15
      //mesh3.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), ( 0.10))
      
      meshtext.position.y = mesh.position.y - 10;
      mesh2text.position.y = mesh2.position.y - 10;

      scene.add(backmesh)
      scene.add(mesh3);
      scene.add(mesh);
      scene.add(meshtext);
      scene.add(mesh2);
      scene.add(mesh2text);

      scene.add(ambientLight);
      scene.add(directionalLight3);
      scene.add(directionalLight2);
      scene.add(directionalLight);
      scene.add(directionalLight4);

      composer.addPass( renderPass );
      composer.addPass( bloomPass );
      //composer.addPass( glitchPass );
      composer.addPass( outputPass );
      setgsap();
      setTimeout(fadepost, 200)
      gsap.to(mesh.position, {duration:1.5, delay:1, y:0})
      gsap.to(meshtext.position, {duration: 1.7, delay:1, y:-10})
      gsap.to('#preloader', {duration:1, opacity:0})
      .eventCallback('onComplete', () => {document.getElementById('preloader')?.remove()})
      
    };

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight3.position.set(30, 0, 20);
    

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(0, 30, 0);
    

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, -30, 0);
    

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight4.position.set(2, -6, 20);
    
    
    const revealDuration = 5.0; // seconds

    const animate = () => {
      if (!isDraggingRef.current) {
        mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), ( 0.002))
        mesh2.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), ( 0.002))
      }
      const elapsedTime = clock.getElapsedTime();
      if (isRevealing) {
        const timeSinceStart = elapsedTime - revealStartTime;
        let progress = timeSinceStart / revealDuration;
        
        if (progress >= 1.0) {
          progress = 1.0;
          isRevealing = false;
        }
        
        // Update the u_progress uniform on the modified shader
        if (wallMaterial.userData.shader) {
          // Ease-out function for a smoother stop
          wallMaterial.userData.shader.uniforms.u_progress.value = 1.0 - Math.pow(1.0 - progress, 4);
        }
      }
      composer.render();

      frameId = requestAnimationFrame(animate);
    };

    const fadepost = () => {
      glitchPass.enabled = false;
      isRevealing = true;
      revealStartTime = clock.getElapsedTime()
    }

    const camerazoom = () => {
      gsap.to(camera.position, {duration:1, z:-5})
      gsap.to(mesh.material, {duration:0.7, opacity:0})
      gsap.to(mesh2.material, {duration:0.7, opacity:0})
      gsap.to(backmesh.material, {duration:0.7, opacity:1})
      .eventCallback('onComplete', () => {
        stopcamerazoom()
      })
 
    }
    
    const stopcamerazoom = () => {
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
      if (rendererRef.current) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      
      primaryMaterial.dispose();
      accentMaterial.dispose();
      backMaterial.dispose();
      scene.clear()
      renderer.dispose();
      composer.dispose();
      window.location.assign("https://inkomnia.bigcartel.com/product/bloody");
      let fadereload = setTimeout(() => {
        let after = document.getElementById('reload')
        after.className = "fixed flex top-0 bg-transparent backdrop-blur-sm w-full h-20 z-10"
      }, 500);
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

    const snapScroll = () => {

       if (mesh.position.y < 0) {
        mesh.getWorldPosition
        gsap1 = gsap.to(mesh.position, {duration: 2, y:0})
        gsap2 = gsap.to(mesh2.position, {duration: 2, y:-(window.outerHeight / 15)})

        gsap.to(meshtext.position, {duration: 2, y:0})
        gsap.to(mesh2text.position, {duration: 2, y:-(window.outerHeight / 15)})
        gsap.to(mesh3.rotation, {duration:2, z:90})
      }
      else if (mesh.position.y > 0 && mesh2.position.y < -25) {
        gsap.to(mesh3.position, {duration:2, y:0.45})
        gsap2 = gsap.to(mesh2.position, {duration: 2, y:0})
        gsap1 = gsap.to(mesh.position, {duration: 2, y:(window.outerHeight / 15)})
        gsap.to(mesh2text.position, {duration: 2, y:-10})
        gsap.to(meshtext.position, {duration: 2, y:(window.outerHeight / 15)})
      } 
      else if (mesh.position.y > 0 && mesh2.position.y < 0) {
        gsap.to(mesh3.position, {duration:2, y:-0.45})
        gsap1 = gsap.to(mesh.position, {duration: 2, y:0})
        gsap2 = gsap.to(mesh2.position, {duration: 2, y:-(window.outerHeight / 15)})
        gsap.to(meshtext.position, {duration: 2, y:-10})
        gsap.to(mesh2text.position, {duration: 2, y:-(window.outerHeight / 15)})
      }
      else if (mesh2.position.y > 0 && mesh2.position.y < (window.outerHeight / 15)) {
        gsap2 = gsap.to(mesh2.position, {duration: 2, y:0})
        gsap1 = gsap.to(mesh.position, {duration: 2, y:(window.outerHeight / 15)})
        gsap.to(mesh2text.position, {duration: 2, y:0})
        gsap.to(meshtext.position, {duration: 2, y:-(window.outerHeight / 15)})
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
    let holdingrotate;
    let isholding;

    const touchrotate = () => {
      if (isholding == true && dragx < 10 && dragd < 10) {
        holdingrotate = true;
        if (!gss1.isActive() && !gsap1.isActive()) {
          setgsap();
        }
        if (!gsap1.isActive()) {
          gss1.play()
          gss2.play()
          gss3.play()
          gss4.play()
          gss5.play()
        }
      } else {
        holdingrotate = false
      }
    }

    
    let recall;
    const handletouch = (event: TouchEvent) => {
      dragd = 0;
      dragx = 0;
      diff = event.touches[0].screenY;
      diffx = event.touches[0].screenX;
      isholding = true;
      recall = setTimeout(touchrotate, 500)

      
    }

    const handledragtouch = (event: TouchEvent) => {
      mousepos.x = (event.touches[0].clientX / currentMount.clientWidth) * 2 -1;
      mousepos.y = (event.touches[0].clientY / currentMount.clientHeight) * -2 + 1;

      const deltay = diff - event.touches[0].screenY;
      const deltax = diffx - event.touches[0].screenX;
      
      dragd += deltay;
      dragx += deltax;
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
          gsap.to(mesh3.position, {duration:2, y:0.45})
          gsap2 = gsap.to(mesh2.position, {duration: 2, y:0})
          gsap1 = gsap.to(mesh.position, {duration: 2, y:(window.outerHeight / 15)})
          gsap.to(mesh2text.position, {duration: 2, y:-10})
          gsap.to(meshtext.position, {duration: 2, y:(window.outerHeight / 15)})
        } else if (event.deltaY < 0) {
          gsap.to(mesh3.position, {duration:2, y:-0.45})
          gsap1 = gsap.to(mesh.position, {duration: 2, y:0})
          gsap2 = gsap.to(mesh2.position, {duration: 2, y:-(window.outerHeight / 15)})
          gsap.to(meshtext.position, {duration: 2, y:-10})
          gsap.to(mesh2text.position, {duration: 2, y:-(window.outerHeight / 15)})
        }
        //snapScroll()
    };
    const setgsap = () => {
      gss1 = gsap.to(mesh.position, {duration: 1, z:mesh.position.z +7}).pause()
      gss2 = gsap.to(meshtext.position, {duration: 1, y:meshtext.position.y -5}).pause()
      gss3 = gsap.to(mesh2.position, {duration: 1, z:mesh2.position.z +7}).pause()
      gss4 = gsap.to(mesh2text.position, {duration: 1, y:mesh2text.position.y -5}).pause()
      gss5 = gsap.to(mesh.children[1].position, {duration: 1, x:3}).pause()
    }
    
    const handleMouseDown = (event: MouseEvent) => {
      if (!gss1.isActive() && !gsap1.isActive()) {
        setgsap();
      }
      isDraggingRef.current = true;
      wasDraggedRef.current = false;
      clearTimeout(timeoutid)
      clearInterval(scrollint)
      clearTimeout(scrolliter)
      previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
      if (!gsap1.isActive()) {
        gss1.play()
        gss2.play()
        gss3.play()
        gss4.play()
        gss5.play()
      }
      console.log('mousedown')
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) {
        //update mouse position uniform inside shader
        mousepos.x = (event.clientX / window.innerWidth) * 2 - 1;
        mousepos.y = -(event.clientY / window.innerHeight) * 2 + 1;
        //checkIntersect()
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
      gss1.reverse()
      gss2.reverse()
      gss3.reverse()
      gss4.reverse()
      gss5.reverse()
      //snapBack()
    };

    const handleTouchUp = () => {
      
      isDraggingRef.current = false;
      console.log(dragd);
      if (dragd > 55) {
        mesh.position.y += 1.1;
      } else if (dragd < -55) {
        mesh2.position.y -= 1.1
      }
      gss1.reverse()
      gss2.reverse()
      gss3.reverse()
      gss4.reverse()
      gss5.reverse()
      isholding = false;
      holdingrotate = false
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
        camerazoom()
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

    initcomposer()
    initmats()
    initgeos()
    initLoader()

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
      if (rendererRef.current) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      
      primaryMaterial.dispose();
      accentMaterial.dispose();
      backMaterial.dispose();
      scene.clear()
      renderer.dispose();
      composer.dispose();
      
    };
  }, []);

  return  <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
;
}

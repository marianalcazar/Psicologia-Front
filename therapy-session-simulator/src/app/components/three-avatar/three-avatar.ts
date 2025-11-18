import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-three-avatar',
  standalone: true,
  templateUrl: './three-avatar.html',
  styleUrls: ['./three-avatar.css']
})
export class ThreeAvatar implements AfterViewInit, OnDestroy {
  @ViewChild('avatarContainer', { static: true }) container!: ElementRef<HTMLDivElement>;
  @Input() modelUrl: string = 'assets/models/paciente3.glb';
    
  private _isTalking: boolean = false;
  @Input() 
  set isTalking(value: boolean) {
    this._isTalking = value;
  }
  get isTalking(): boolean {
    return this._isTalking;
  }

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private avatarModel: THREE.Group | null = null;
  private jawBone: THREE.Bone | null = null;
  private mouthMesh: THREE.Mesh | null = null;
  private mouthMorphIndex: number = -1;
  private animationFrameId: number | null = null;
  private allMorphTargets: Array<{mesh: THREE.Mesh; name: string; index: number}> = [];

  ngAfterViewInit() {
    this.initScene();
    this.loadModel();
    this.animate();
  }

  private initScene() {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // Cámara EXACTAMENTE a la altura del centro del modelo
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.8, 3.5); // Y = 0.3 para estar a la altura correcta

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    // Luces más intensas para ver mejor
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 4);
    dirLight.position.set(3, 8, 5);
    this.scene.add(dirLight);

    // Luz adicional frontal para iluminar la cara
    const frontLight = new THREE.DirectionalLight(0xffffff, 2);
    frontLight.position.set(0, 2, 5);
    this.scene.add(frontLight);
  }

  private loadModel() {
    if (!this.modelUrl) {
      console.error('No se proporcionó la URL del modelo.');
      return;
    }

    const loader = new GLTFLoader();
    loader.load(
      this.modelUrl,
      (gltf: GLTF) => {
        console.log('✅ Modelo cargado correctamente:', gltf);
        this.avatarModel = gltf.scene;

        // Escala y posición para centrar SOLO la cara
        this.avatarModel.scale.set(3.0, 3.0, 3.0);
        this.avatarModel.position.set(0, -1.0, 0); // Subimos el modelo (era -1.5)
        
        this.scene.add(this.avatarModel);

        // Centrar cámara EXACTAMENTE a la altura de los ojos
        const box = new THREE.Box3().setFromObject(this.avatarModel);
        const center = box.getCenter(new THREE.Vector3());
        // No agregamos offset en Y para estar exactamente al frente
        this.camera.lookAt(center);

        // 🦴 Buscar el hueso de la mandíbula (Jaw)
        this.avatarModel.traverse((child) => {
          // Buscar hueso de mandíbula
          if (child.type === 'Bone') {
            const bone = child as THREE.Bone;
            const name = bone.name.toLowerCase();
            if (name.includes('jaw') || name.includes('mandible') || name.includes('chin')) {
              this.jawBone = bone;
              console.log('✅ Hueso de mandíbula encontrado:', bone.name);
            }
          }

          // 💡 Buscar mesh con morph targets de boca
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.morphTargetDictionary) {
              console.log('🎭 Mesh encontrado:', mesh.name, 'con morph targets:', 
                          Object.keys(mesh.morphTargetDictionary));
              
              // Guardar TODOS los morph targets para debugging
              Object.keys(mesh.morphTargetDictionary).forEach(targetName => {
                this.allMorphTargets.push({
                  mesh: mesh,
                  name: targetName,
                  index: mesh.morphTargetDictionary![targetName]
                });
              });
              
              // Buscar diferentes nombres comunes de morph targets
              const mouthTargets = ['mouthOpen', 'mouth_open', 'MouthOpen', 'viseme_aa', 
                                    'mouthSmile', 'jawOpen', 'viseme_O'];
              
              for (const target of mouthTargets) {
                if (mesh.morphTargetDictionary[target] !== undefined) {
                  this.mouthMesh = mesh;
                  this.mouthMorphIndex = mesh.morphTargetDictionary[target];
                  console.log('✅ Morph target de boca encontrado:', target, 'index:', this.mouthMorphIndex);
                  break;
                }
              }
            }
          }
        });

        if (!this.jawBone && !this.mouthMesh) {
          console.warn('⚠️ No se encontró ni hueso de mandíbula ni morph target de boca.');
          console.log('📋 Estructura del modelo:');
          this.logModelStructure(this.avatarModel);
        }

        // 🔍 DEBUG: Mostrar TODOS los morph targets encontrados
        if (this.allMorphTargets.length > 0) {
          console.log('🎭 TODOS los morph targets disponibles:', this.allMorphTargets);
          console.log('💡 Prueba con estos nombres si "mouthOpen" no funciona');
        }
      },
      (progress: ProgressEvent<EventTarget>) => {
        const loaded = (progress.loaded || 0);
        const total = (progress.total || 1);
        const percent = (loaded / total) * 100;
        console.log(`Cargando modelo: ${percent.toFixed(2)}%`);
      },
      (error: unknown) => console.error('❌ Error cargando modelo:', error)
    );
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.isTalking) {
      const time = Date.now() * 0.002; // MÁS LENTO: de 0.008 a 0.002
      
      // Animación de boca usando hueso de mandíbula
      if (this.jawBone) {
        // Movimiento más natural y variado
        const jawMovement = Math.sin(time) * 0.1 + Math.sin(time * 2.3) * 0.05;
        this.jawBone.rotation.x = Math.max(0, jawMovement + 0.08);
      }

      // Animación de morph targets con variación natural
      if (this.allMorphTargets.length > 0) {
        // Combinar varias ondas para movimiento más natural
        const base = Math.abs(Math.sin(time * 2.5)); // Onda principal
        const variation = Math.abs(Math.sin(time * 3.7)) * 0.3; // Variación
        const influence = (base * 0.6 + variation) * 0.7; // Intensidad reducida: 0.7 en vez de 1.0
        
        this.allMorphTargets.forEach((target: {mesh: THREE.Mesh; name: string; index: number}) => {
          if (target.mesh.morphTargetInfluences) {
            const lowerName = target.name.toLowerCase();
            if (lowerName.includes('mouth') || lowerName.includes('jaw') || 
                lowerName.includes('viseme') || lowerName.includes('open')) {
              target.mesh.morphTargetInfluences[target.index] = influence;
            }
          }
        });
      }
    } else {
      // Cerrar boca cuando no está hablando
      if (this.jawBone) {
        this.jawBone.rotation.x = 0;
      }
      
      // Resetear TODOS los morph targets
      this.allMorphTargets.forEach((target: {mesh: THREE.Mesh; name: string; index: number}) => {
        if (target.mesh.morphTargetInfluences) {
          target.mesh.morphTargetInfluences[target.index] = 0;
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  };

  // Método helper para debug - ver estructura del modelo
  private logModelStructure(obj: THREE.Object3D, indent: string = '') {
    console.log(`${indent}${obj.type}: ${obj.name}`);
    
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (mesh.morphTargetDictionary) {
        console.log(`${indent}  Morph Targets:`, Object.keys(mesh.morphTargetDictionary));
      }
    }
    
    obj.children.forEach(child => this.logModelStructure(child, indent + '  '));
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer?.dispose();
  }
}
"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseNDC = useRef(new THREE.Vector2(-9999, -9999)); // Normalized device coordinates for Raycasting
  const scrollYRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    const bgColor = isDayTime ? 0x0f172a : 0x030712;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(bgColor, isDayTime ? 0.014 : 0.012); // Fog for depth

    const isMobile = window.innerWidth < 768;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 70 : 60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, isMobile ? 28 : 24);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);

    // --- Add Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 3.5); // Indigo light
    dirLight1.position.set(-10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 2); // Emerald fill
    dirLight2.position.set(15, -10, 10);
    scene.add(dirLight2);

    // --- Floating Cosmic Stars (Subtle background dust) ---
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 100;
      starPositions[i + 1] = (Math.random() - 0.5) * 60;
      starPositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x6366f1,
      transparent: true,
      opacity: 0.4,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Dynamic 3D Floating Code Snippets ---
    const codeSnippets = [
      { text: "const [user, setUser] = useState();", color: "#61dafb" }, // React Blue
      { text: "import { motion } from 'framer-motion';", color: "#ff007f" }, // Framer Pink
      { text: "public class Program { void Main() }", color: "#10b981" }, // C# Green
      { text: "app.use('/api/v1', router);", color: "#8b5cf6" }, // Node Purple
      { text: "SELECT * FROM database.users;", color: "#e34c26" }, // SQL Red
      { text: "npm run dev --turbo", color: "#ffd21e" }, // NPM Yellow
      { text: "const db = client.db('portfolio');", color: "#336791" }, // MongoDB Teal
      { text: "await page.goto(url);", color: "#00f2fe" }, // Playwright Cyan
      { text: "var app = builder.Build();", color: "#512bd4" }, // .NET Indigo
      { text: "git commit -m 'feat: 3d code particles'", color: "#ff6c37" }, // Git Orange
      { text: "const token = jwt.sign({ id }, key);", color: "#4f46e5" }, // JWT Blue
      { text: "model.generateContent(prompt);", color: "#1a73e8" } // Gemini Blue
    ];

    const createCodeTexture = (text: string, color: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024; // Doubled width to fit longer code strings without clipping
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(0, 0, 1024, 128);
        
        ctx.font = "bold 30px monospace";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 512, 64);
      }
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const codeMeshes: THREE.Mesh[] = [];
    const codeSpeeds: number[] = [];

    codeSnippets.forEach((snippet, index) => {
      const texture = createCodeTexture(snippet.text, snippet.color);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const planeGeo = new THREE.PlaneGeometry(16, 2); // Doubled width to match canvas aspect ratio (1024/128 = 8/1) without stretching text
      const mesh = new THREE.Mesh(planeGeo, material);
      
      // Scatter in depth and width/height
      mesh.position.set(
        (Math.random() - 0.5) * 55,
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 60 - 20
      );
      
      scene.add(mesh);
      codeMeshes.push(mesh);
      codeSpeeds.push(Math.random() * 0.06 + 0.02);
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      };

      // Set Normalized Device Coordinates (-1 to +1)
      mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Track scroll events
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      camera.fov = mobile ? 70 : 60;
      camera.position.z = mobile ? 28 : 24;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const mouse = mouseRef.current;
      const scrollY = scrollYRef.current;

      // Update stars slowly rotating
      stars.rotation.y = elapsedTime * 0.015;

      // --- Update Floating Code Snippets Positions ---
      const baseCodeSpeed = 0.7;
      const codeSpeedBoost = scrollY * 0.025; // Accelerate code speeds when scrolling down!
      const totalCodeSpeed = baseCodeSpeed + codeSpeedBoost;

      codeMeshes.forEach((mesh, i) => {
        mesh.position.z += codeSpeeds[i] * 12 * totalCodeSpeed * delta;
        mesh.position.y += Math.sin(elapsedTime * 0.3 + i) * 0.01; // gentle bobbing

        // Fade out code lines as they approach the camera/reset boundary (z = 10)
        // Camera is at z = 24, so this ensures they never get close enough to warp or overlay.
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (mesh.position.z > 0) {
          mat.opacity = Math.max(0, 1 - mesh.position.z / 10);
        } else {
          mat.opacity = 1;
        }

        // Reset code lines once they reach the boundary
        if (mesh.position.z > 10) {
          mesh.position.z = -65;
          mesh.position.x = (Math.random() - 0.5) * 55;
          mesh.position.y = (Math.random() - 0.5) * 35;
          mat.opacity = 1;
        }
      });



      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 5, 0.04);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, -mouse.y * 5, 0.04);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.body.style.cursor = ""; // Reset cursor

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const hour = typeof window !== "undefined" ? new Date().getHours() : 12;
  const isDayTime = hour >= 6 && hour < 18;
  const bgClass = isDayTime ? "bg-[#0f172a]" : "bg-[#030712]";

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 -z-10 w-full h-full pointer-events-none transition-colors duration-1000 ${bgClass}`}
    />
  );
}

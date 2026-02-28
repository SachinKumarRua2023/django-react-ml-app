import { Suspense, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  ContactShadows,
  PresentationControls,
  Html,
  useProgress,
  Stars,
  Sparkles,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// Loading component for 3D scene
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cyan-400 font-mono text-sm">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  );
}

// Animated floating shapes (low memory, no external models needed)
function FloatingShapes() {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={group}>
      {/* Neural Network Nodes */}
      {[...Array(8)].map((_, i) => (
        <Float
          key={i}
          speed={2}
          rotationIntensity={1}
          floatIntensity={2}
          position={[
            Math.sin(i * 0.8) * 4,
            Math.cos(i * 0.5) * 2,
            Math.sin(i * 0.3) * 3,
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#06b6d4" : "#3b82f6"}
              emissive={i % 2 === 0 ? "#06b6d4" : "#3b82f6"}
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
          {/* Connection lines */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, Math.sin(i) * 2, Math.cos(i) * 2, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#06b6d4" opacity={0.3} transparent />
          </line>
        </Float>
      ))}

      {/* Data Cubes */}
      {[...Array(5)].map((_, i) => (
        <Float
          key={`cube-${i}`}
          speed={1.5}
          rotationIntensity={2}
          floatIntensity={1}
          position={[Math.cos(i * 1.2) * 5, Math.sin(i * 0.8) * 3 - 2, -2]}
        >
          <mesh rotation={[Math.random(), Math.random(), Math.random()]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Central Brain/AI Model (Procedural, no external GLB needed for main element)
function AICore() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Core Sphere */}
        <mesh>
          <icosahedronGeometry args={[1.5, 2]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.9}
            wireframe
          />
        </mesh>
        {/* Inner Core */}
        <mesh scale={0.7}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={1}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Orbiting Rings */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[i * 0.5, i * 1, 0]}>
            <torusGeometry args={[2.2 + i * 0.3, 0.02, 16, 100]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// 3D Scene Component
function Scene3D() {
  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <fog attach="fog" args={["#0f172a", 10, 50]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#06b6d4" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={10} size={2} speed={0.4} color="#06b6d4" />
      
      <PresentationControls
        global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-1, 0.75]}
        config={{ mass: 2, tension: 400 }}
        snap={{ mass: 4, tension: 400 }}
      >
        <AICore />
        <FloatingShapes />
      </PresentationControls>
      
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2.5} far={4} />
      <Environment preset="city" />
    </>
  );
}

// UI Components
function SkillCard({ title, skills, icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 group"
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm border border-slate-600/50 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
          >
            {skill}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function ProjectCard({ title, description, tech, link, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 group"
    >
      <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMjBoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🚀</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 mb-4 text-sm leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tech.map((t) => (
            <span key={t} className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs border border-purple-500/20">
              {t}
            </span>
          ))}
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium text-sm group/link"
        >
          View Project
          <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 max-w-2xl mx-auto"
    >
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Share Your Feedback</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Your Name"
            required
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <input
            type="email"
            placeholder="Your Email"
            required
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <textarea
          placeholder="Your message..."
          rows={4}
          required
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
        >
          {submitted ? "Sent! 🎉" : "Send Feedback"}
        </motion.button>
      </form>
    </motion.div>
  );
}

// Main Portfolio Component
export default function Portfolio3D() {
  const [activeSection, setActiveSection] = useState("hero");

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Hero Section with 3D */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 8], fov: 45 }}
            frameloop="demand"
            gl={{ antialias: false, alpha: false }}
          >
            <Suspense fallback={<Loader />}>
              <Scene3D />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center pointer-events-none">
          <div className="text-center px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6 backdrop-blur-sm">
                🤖 Data Science & ML Engineer
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                Transforming Data
                <br />
                Into Intelligence
              </h1>
              <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                Building cutting-edge machine learning solutions and AI systems that drive real-world impact.
                Specializing in deep learning, MLOps, and scalable data pipelines.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
                <motion.a
                  href="#projects"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                >
                  View Projects
                </motion.a>
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-full font-bold text-lg hover:bg-slate-700/80 transition-all"
                >
                  Get In Touch
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Skills Section */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Technical Expertise
            </h2>
            <p className="text-slate-400 text-lg">Mastering the modern data stack</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkillCard
              title="Machine Learning"
              icon="🧠"
              delay={0.1}
              skills={["TensorFlow", "PyTorch", "Scikit-learn", "XGBoost", "LightGBM"]}
            />
            <SkillCard
              title="Deep Learning"
              icon="🔮"
              delay={0.2}
              skills={["CNN", "RNN", "Transformers", "NLP", "Computer Vision"]}
            />
            <SkillCard
              title="MLOps & Cloud"
              icon="☁️"
              delay={0.3}
              skills={["Docker", "Kubernetes", "AWS SageMaker", "MLflow", "Kubeflow"]}
            />
            <SkillCard
              title="Data Engineering"
              icon="🔄"
              delay={0.4}
              skills={["Apache Spark", "Kafka", "Airflow", "dbt", "Snowflake"]}
            />
            <SkillCard
              title="Programming"
              icon="💻"
              delay={0.5}
              skills={["Python", "SQL", "R", "Scala", "JavaScript"]}
            />
            <SkillCard
              title="Visualization"
              icon="📊"
              delay={0.6}
              skills={["Tableau", "PowerBI", "Plotly", "D3.js", "Matplotlib"]}
            />
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <p className="text-slate-400 text-lg">AI solutions that make a difference</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProjectCard
              title="NeuralForecast Pro"
              description="Advanced time series forecasting using transformer architectures. Achieved 15% improvement over traditional ARIMA models."
              tech={["PyTorch", "Transformers", "AWS"]}
              link="#"
              delay={0.1}
            />
            <ProjectCard
              title="AutoML Pipeline"
              description="End-to-end automated machine learning platform with feature engineering and hyperparameter optimization."
              tech={["Python", "Kubernetes", "MLflow"]}
              link="#"
              delay={0.2}
            />
            <ProjectCard
              title="NLP Sentiment Engine"
              description="Real-time sentiment analysis system processing 1M+ social media posts daily with 92% accuracy."
              tech={["BERT", "FastAPI", "Redis"]}
              link="#"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* About/LMS Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Learn With Me
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              I believe in sharing knowledge. Check out my comprehensive courses on machine learning,
              data science, and AI engineering. From beginner to advanced levels.
            </p>
            <motion.a
              href="/syllabus"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              Explore Courses
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FeedbackForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <span className="text-slate-400">ML Engineer Portfolio</span>
          </div>
          <div className="flex space-x-6 text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
          </div>
          <p className="text-slate-500 text-sm">© 2024 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
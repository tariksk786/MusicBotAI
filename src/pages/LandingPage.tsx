import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Music, Brain, FileAudio, BarChart3, FolderKanban, Download, ChevronRight,
  Star, Users, Disc, Zap, Play, ArrowRight, Mail, Github, Twitter, Linkedin
} from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import AudioVisualizer from '../components/AudioVisualizer';

const features = [
  { icon: Brain, title: 'AI Music Generation', desc: 'Create original compositions with state-of-the-art neural networks trained on your style.' },
  { icon: FileAudio, title: 'MIDI Training', desc: 'Upload your MIDI datasets to train custom AI models that understand your musical language.' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Monitor training progress, accuracy curves, and generation metrics in real-time.' },
  { icon: FolderKanban, title: 'Project Management', desc: 'Organize your datasets, models, and generated tracks in a unified workspace.' },
  { icon: Download, title: 'Instant Export', desc: 'Download your creations as MIDI or audio files ready for production.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimized inference engine delivers high-quality music in seconds.' },
];

const workflow = [
  { step: '01', title: 'Upload Dataset', desc: 'Drag and drop your MIDI files to create a training dataset.' },
  { step: '02', title: 'Train Model', desc: 'Our LSTM neural network learns patterns from your music.' },
  { step: '03', title: 'Generate Music', desc: 'Create infinite variations with adjustable creativity controls.' },
  { step: '04', title: 'Export Audio', desc: 'Download as MIDI or rendered audio for your productions.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Film Composer', text: 'HarmoniAI has completely transformed my workflow. I can generate unique motifs in seconds that would have taken hours.', rating: 5 },
  { name: 'Marcus Johnson', role: 'Music Producer', text: 'The training capabilities are incredible. My custom model understands my style better than any other tool.', rating: 5 },
  { name: 'Elena Rodriguez', role: 'Game Audio Designer', text: 'We use HarmoniAI to generate ambient soundscapes for our games. The quality is outstanding.', rating: 5 },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#8B5CF6]/50 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/10 to-[#06B6D4]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow">
          <Icon className="w-6 h-6 text-[#8B5CF6]" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [demoPlaying, setDemoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">HarmoniAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
            <a href="#workflow" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a>
            <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors text-sm">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Sign In</Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B5CF6]/5 via-transparent to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300">AI Music Generation Platform v2.0</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#06B6D4] bg-clip-text text-transparent">
              Compose the Future
            </span>
            <br />
            <span className="text-white">with AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Train, Generate, and Discover Unique Music Using Artificial Intelligence.
            Create professional-quality compositions in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-semibold hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all hover:scale-105"
            >
              Start Creating
            </Link>
            <button
              onClick={() => setDemoPlaying(!demoPlaying)}
              className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </motion.div>

          {/* Visualizer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <AudioVisualizer isPlaying={demoPlaying} barCount={64} height={80} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Disc, label: 'Songs Generated', value: 125000, suffix: '+' },
              { icon: Users, label: 'Active Users', value: 8400, suffix: '+' },
              { icon: Brain, label: 'Models Trained', value: 3200, suffix: '+' },
              { icon: Download, label: 'Downloads', value: 45000, suffix: '+' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
                >
                  <Icon className="w-8 h-8 text-[#8B5CF6] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything you need to create AI-powered music at scale.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 relative">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">From dataset to masterpiece in four simple steps.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#8B5CF6] to-[#06B6D4] hidden md:block" />
            {workflow.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12"
              >
                <div className="flex-1 w-full md:w-auto text-center">
                  <div className="inline-block p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-full md:w-auto">
                    <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">{step.step}</span>
                    <h3 className="text-lg md:text-xl font-semibold text-white mt-2">{step.title}</h3>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">{step.desc}</p>
                  </div>
                </div>
                <div className="hidden md:flex w-12 h-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] items-center justify-center z-10 shrink-0">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
                Loved by Creators
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">See what musicians and producers are saying about HarmoniAI.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 md:p-12 rounded-3xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/20 border border-white/10 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Create?</h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto">Join thousands of musicians and producers using AI to push creative boundaries.</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-semibold hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">HarmoniAI</span>
              </div>
              <p className="text-gray-400 text-sm">The future of music creation powered by artificial intelligence.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50"
                  />
                  <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-500">
            © 2024 HarmoniAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// BuilderTools.jsx — Landing page for all builder tools
import { Link } from 'react-router-dom';

const tools = [
  {
    id: 'ai-agent-builder',
    name: 'AI Agent Builder',
    icon: '🤖',
    color: '#7c3aed',
    description: 'Build AI automation workflows like n8n, but 100% FREE. Create chatbots, automations, and AI agents with Groq LLM.',
    features: ['Visual Workflow Editor', 'Groq LLM Integration', '25+ Node Types', 'Webhook Triggers', 'Schedule Automation'],
    path: '/ai-agent-builder',
    status: 'Coming Soon',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)'
  },
  {
    id: 'app-builder',
    name: 'App Builder',
    icon: '📱',
    color: '#00d4ff',
    description: 'Create mobile apps visually. Drag-drop UI builder that exports to React Native. No coding required!',
    features: ['Visual UI Designer', 'React Native Export', '50+ Components', 'Data Binding', 'Live Preview'],
    path: '/app-builder',
    status: 'Coming Soon',
    gradient: 'linear-gradient(135deg, #00d4ff, #06b6d4)'
  },
  {
    id: 'website-builder',
    name: 'Website Builder',
    icon: '🌐',
    color: '#22c55e',
    description: 'Design professional websites with Next.js export. SEO-optimized templates for Indian market.',
    features: ['Next.js Export', 'SEO Auto-Optimizer', '50+ Templates', 'UPI Integration', 'Vercel Deploy'],
    path: '/website-builder',
    status: 'Coming Soon',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)'
  }
];

export default function BuilderTools() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0d0d2a 100%)',
      padding: '40px 20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>🛠️</div>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '42px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed, #22c55e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            Builder Tools
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Create AI workflows, mobile apps, and websites — all 100% FREE and better than paid alternatives.
            No subscriptions, no vendor lock-in, export your code anytime.
          </p>
        </div>

        {/* Tools Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px'
        }}>
          {tools.map(tool => (
            <Link
              key={tool.id}
              to={tool.path}
              style={{
                background: 'rgba(10,10,30,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '40px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'block'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = tool.color;
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${tool.color}20`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 600
              }}>
                {tool.status}
              </div>

              {/* Icon */}
              <div style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>{tool.icon}</div>

              {/* Title */}
              <h2 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '12px'
              }}>
                {tool.name}
              </h2>

              {/* Description */}
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6,
                marginBottom: '24px'
              }}>
                {tool.description}
              </p>

              {/* Features */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {tool.features.map((feature, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      background: tool.gradient,
                      borderRadius: '20px',
                      fontSize: '11px',
                      color: '#fff',
                      fontWeight: 600
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: tool.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '20px'
              }}>
                →
              </div>
            </Link>
          ))}
        </div>

        {/* Comparison Section */}
        <div style={{
          marginTop: '80px',
          background: 'rgba(10,10,30,0.6)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Why Our Builders Are Better
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              { icon: '💰', title: '100% FREE', desc: 'No subscriptions, no paid tiers, no hidden fees' },
              { icon: '🔓', title: 'Open Source', desc: 'Export your code anytime, no vendor lock-in' },
              { icon: '🇮🇳', title: 'Made for India', desc: 'UPI payments, Hindi support, local templates' },
              { icon: '🚀', title: 'Export & Deploy', desc: 'Vercel, Render, anywhere — your choice' },
              { icon: '🤖', title: 'AI-Powered', desc: 'Groq LLM integration for smart automation' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Built with modern tech — React, Next.js, Django' }
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '16px', color: '#00d4ff', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(0,212,255,0.2))',
          borderRadius: '20px',
          border: '1px solid rgba(124,58,237,0.3)'
        }}>
          <h3 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '24px',
            color: '#fff',
            marginBottom: '16px'
          }}>
            Start Building Today
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '24px'
          }}>
            Join 1000+ creators building with SeekhoWithRua tools. Completely free forever.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #7c3aed, #00d4ff)',
              borderRadius: '30px',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  );
}

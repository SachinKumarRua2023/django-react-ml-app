// AppHome.jsx — Landing page explaining Seekhowithrua App Portal features
import { Link } from 'react-router-dom';
import { useState } from 'react';

const features = [
  {
    icon: '🔴',
    title: 'Live Voice Chat Rooms',
    color: '#ef4444',
    description: 'WebRTC-powered real-time voice communication rooms for learning, debates, hiring, and earning.',
    benefits: [
      'Join knowledge-sharing rooms instantly',
      'Host your own learning sessions',
      'Participate in live debates & discussions',
      'Get discovered by hiring companies',
      'Build your audience & monetize at 1K followers'
    ]
  },
  {
    icon: '🧠',
    title: 'ML Predictor',
    color: '#00ff88',
    description: 'Machine learning prediction tools powered by advanced algorithms.',
    benefits: [
      'YouTube Growth Predictor',
      'Data analysis & visualization',
      'Multiple ML algorithms support',
      'Real-time predictions',
      'Export results for reports'
    ]
  },
  {
    icon: '🧘',
    title: 'Talk with Rua (Bodhi AI)',
    color: '#f59e0b',
    description: 'Ancient wisdom meets modern AI. Get mentorship from our enlightened monk AI.',
    benefits: [
      'Voice-enabled AI conversations',
      'Learn AI, ML, and life wisdom',
      'Memory enhancement techniques',
      'Career guidance & strategy',
      'Available 24/7'
    ]
  },
  {
    icon: '🎓',
    title: 'Trainer KPI Dashboard',
    color: '#fbbf24',
    description: 'Comprehensive performance tracking for educators and trainers.',
    benefits: [
      'Student progress analytics',
      'Engagement metrics',
      'Course completion rates',
      'Performance insights',
      'Data-driven improvements'
    ]
  },
  {
    icon: '🧮',
    title: 'Mnemonic Memory System',
    color: '#a855f7',
    description: 'Science-backed memory techniques based on WMSC methods.',
    benefits: [
      'Memory palace training',
      'Number memorization systems',
      'Card deck memorization',
      'Speed memory exercises',
      'Competition-level training'
    ]
  },
  {
    icon: '👥',
    title: 'Employee Management',
    color: '#ffaa00',
    description: 'Complete employee data management and analytics system.',
    benefits: [
      'Employee directory',
      'Performance tracking',
      'Department analytics',
      'Export capabilities',
      'Search & filter tools'
    ]
  }
];

const guidelines = [
  {
    icon: '🎙️',
    title: 'Respectful Communication',
    desc: 'Maintain professional and respectful discourse in all voice rooms.'
  },
  {
    icon: '⏰',
    title: 'Punctuality',
    desc: 'Join scheduled rooms on time. If hosting, start within 5 minutes of scheduled time.'
  },
  {
    icon: '🎯',
    title: 'Stay On Topic',
    desc: 'Keep discussions relevant to the room topic. Off-topic conversations should move to general rooms.'
  },
  {
    icon: '📵',
    title: 'No Recording Without Consent',
    desc: 'Recording voice rooms without explicit permission from all participants is prohibited.'
  },
  {
    icon: '🤝',
    title: 'Constructive Engagement',
    desc: 'Provide constructive feedback. Debates are welcome, personal attacks are not.'
  }
];

const restrictions = [
  {
    icon: '🚫',
    title: 'Prohibited Content',
    items: ['Hate speech or discrimination', 'Harassment or bullying', 'Explicit or adult content', 'Illegal activities discussion']
  },
  {
    icon: '🔇',
    title: 'Audio Quality',
    items: ['Use headphones to prevent echo', 'Mute when not speaking', 'Stable internet required', 'No background noise/music']
  },
  {
    icon: '👤',
    title: 'Account Requirements',
    items: ['Valid email required', 'One account per person', 'Real name recommended for hiring rooms', 'Profile completion required for hosting']
  },
  {
    icon: '⚠️',
    title: 'Consequences',
    items: ['First violation: Warning', 'Second violation: 24h mute', 'Third violation: 7-day suspension', 'Severe violations: Permanent ban']
  }
];

export default function AppHome() {
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      width: '100%',
      maxWidth: '100%',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0d0d2a 100%)',
      padding: '40px 20px',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box',
      flex: '1'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>🚀</div>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '42px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            Seekhowithrua App Portal
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Your gateway to AI-powered learning, live voice collaboration, and memory mastery. 
            Join the future of education.
          </p>
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              borderRadius: '12px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}>
              Get Started
            </Link>
            <Link to="/live-voice" style={{
              padding: '14px 32px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}>
              🔴 Try Live Voice
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'features', label: '✨ Features', icon: '✨' },
            { id: 'guidelines', label: '📋 Guidelines', icon: '📋' },
            { id: 'restrictions', label: '⚠️ Rules', icon: '⚠️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #00d4ff, #7c3aed)' 
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '25px'
          }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{
                background: 'rgba(10,10,30,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '30px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: feature.color
                }} />
                <div style={{
                  fontSize: '40px',
                  marginBottom: '15px'
                }}>{feature.icon}</div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '12px',
                  fontFamily: 'Orbitron, sans-serif'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '20px',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {feature.benefits.map((benefit, bidx) => (
                    <li key={bidx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 0',
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.8)',
                      borderBottom: bidx < feature.benefits.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                    }}>
                      <span style={{ color: feature.color }}>✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Guidelines Tab */}
        {activeTab === 'guidelines' && (
          <div style={{
            background: 'rgba(10,10,30,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '40px'
          }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              color: 'white',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              📋 Voice Chat Room Guidelines
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '25px'
            }}>
              {guidelines.map((guide, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  gap: '15px',
                  padding: '20px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ fontSize: '32px' }}>{guide.icon}</div>
                  <div>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '8px'
                    }}>
                      {guide.title}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      lineHeight: 1.5
                    }}>
                      {guide.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.1))',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.8)'
              }}>
                💡 <strong>Pro Tip:</strong> Quality participants build reputation. Active, helpful users get featured and priority access to hiring rooms.
              </p>
            </div>
          </div>
        )}

        {/* Restrictions Tab */}
        {activeTab === 'restrictions' && (
          <div style={{
            background: 'rgba(10,10,30,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '40px'
          }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              color: 'white',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              ⚠️ Community Rules & Restrictions
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '25px'
            }}>
              {restrictions.map((rule, idx) => (
                <div key={idx} style={{
                  padding: '25px',
                  background: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '15px'
                  }}>
                    <span style={{ fontSize: '28px' }}>{rule.icon}</span>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#fca5a5'
                    }}>
                      {rule.title}
                    </h4>
                  </div>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    {rule.items.map((item, iidx) => (
                      <li key={iidx} style={{
                        padding: '8px 0',
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.7)',
                        borderBottom: iidx < rule.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span style={{ color: '#ef4444' }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '15px',
                color: '#86efac'
              }}>
                ✅ Following these rules ensures a safe, productive environment for all learners and professionals.
              </p>
            </div>
          </div>
        )}

        {/* Quick Links Footer */}
        <div style={{
          marginTop: '60px',
          padding: '30px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '20px',
            color: 'white',
            marginBottom: '20px'
          }}>
            🔗 Quick Access
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <a href="https://seekhowithrua.com" target="_blank" rel="noopener noreferrer" style={{
              padding: '12px 24px',
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: '10px',
              color: '#00d4ff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              🌐 Main Website
            </a>
            <a href="https://lms.seekhowithrua.com" target="_blank" rel="noopener noreferrer" style={{
              padding: '12px 24px',
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '10px',
              color: '#a78bfa',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              📚 Learning Management System
            </a>
            <Link to="/live-voice" style={{
              padding: '12px 24px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              color: '#fca5a5',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              🔴 Live Voice Rooms
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px'
        }}>
          <p>© 2024 Seekhowithrua. Built with the UEEP Framework.</p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowRight, Zap, Brain, Target, Shield, TrendingUp, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function LandingPage() {
  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="glassmorphism fixed w-full top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-outfit font-semibold text-slate-50">SignalOps AI</span>
          </div>
          <Button 
            data-testid="login-nav-button"
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 hero-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 bg-blue-600/10 px-4 py-2 rounded-full">
              AI-Powered Escalation Intelligence
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-outfit font-semibold tracking-tight text-slate-50 mb-6">
            Transform Enterprise Escalations<br />Into Actionable Intelligence
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            SignalOps AI automatically analyzes customer escalations, predicts operational risk, 
            and routes incidents intelligently across enterprise workflows.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              data-testid="get-started-button"
              onClick={handleLogin}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              data-testid="watch-demo-button"
              variant="outline"
              size="lg"
              className="border-slate-700 text-slate-300 hover:bg-slate-900 text-lg px-8 py-6"
            >
              Watch Demo
            </Button>
          </div>

          {/* Dashboard Preview Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-lg p-2 shadow-2xl">
              <img 
                src="https://static.prod-images.emergentagent.com/jobs/ab7b3950-8dac-4af2-aa8a-fbed9287f225/images/e564ade6ebe64675908f87bfdfca234be7c80286ea15599e3e41c7461cb5da53.png"
                alt="Dashboard Preview"
                className="w-full rounded-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section data-testid="features-section" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 mb-4 block">
              PLATFORM CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-outfit font-medium text-slate-50 mb-4">
              Enterprise-Grade Escalation Management
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-md hover-lift">
              <Brain className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-outfit font-medium text-slate-50 mb-3">AI Analysis</h3>
              <p className="text-slate-400 leading-relaxed">
                Automatically classify severity, predict escalation probability, and analyze customer sentiment in real-time.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-md hover-lift">
              <Target className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-outfit font-medium text-slate-50 mb-3">Smart Routing</h3>
              <p className="text-slate-400 leading-relaxed">
                Intelligent incident routing based on customer priority, SLA risk, and historical escalation patterns.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-md hover-lift">
              <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-outfit font-medium text-slate-50 mb-3">Executive Insights</h3>
              <p className="text-slate-400 leading-relaxed">
                Real-time dashboards with revenue impact analysis and operational metrics for C-level visibility.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-md hover-lift">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-outfit font-medium text-slate-50 mb-3">SLA Protection</h3>
              <p className="text-slate-400 leading-relaxed">
                Predictive SLA breach detection with automated escalation to prevent customer churn.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-md hover-lift">
              <Bell className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-outfit font-medium text-slate-50 mb-3">Multi-Channel Alerts</h3>
              <p className="text-slate-400 leading-relaxed">
                Automated notifications via Slack, Jira, PagerDuty, and email for critical incidents.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-md hover-lift">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-outfit font-medium text-slate-50 mb-3">Workflow Automation</h3>
              <p className="text-slate-400 leading-relaxed">
                Seamless integration with existing ticketing systems and automated workflow triggers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section data-testid="how-it-works-section" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-outfit font-medium text-slate-50 mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg">Enterprise escalation intelligence in four steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Email Received', desc: 'Customer escalation arrives via email' },
              { step: '02', title: 'AI Analysis', desc: 'ML models analyze severity and sentiment' },
              { step: '03', title: 'Smart Routing', desc: 'Incident routed to appropriate team' },
              { step: '04', title: 'Action Taken', desc: 'Automated workflows trigger responses' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-outfit font-light text-blue-600 mb-4">{item.step}</div>
                <h3 className="text-lg font-outfit font-medium text-slate-50 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-slate-500 mb-8 tracking-[0.2em] uppercase">Trusted By Industry Leaders</p>
          <div className="flex justify-center items-center gap-12 flex-wrap opacity-50 grayscale">
            <img src="https://images.pexels.com/photos/15863044/pexels-photo-15863044.jpeg" alt="Partner" className="h-8" />
            <img src="https://images.unsplash.com/photo-1661347998423-b15d37d6f61e" alt="Partner" className="h-8" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600/10 to-slate-900 border border-blue-600/20 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-outfit font-semibold text-slate-50 mb-4">
            Ready to Transform Your Escalation Management?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join enterprise teams using SignalOps AI to prevent customer churn and improve operational efficiency.
          </p>
          <Button 
            data-testid="cta-start-button"
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-6"
          >
            Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2026 SignalOps AI. Enterprise Escalation Intelligence Platform.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

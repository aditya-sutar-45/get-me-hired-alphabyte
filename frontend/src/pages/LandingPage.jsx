
import { ArrowRight, Mic, FileText, BarChart3, Building2, MessageSquare, Check } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef([]);
  const [visibleCards, setVisibleCards] = useState([]);
  const [billingCycle, setBillingCycle] = useState("individual"); // individual, university, or enterprise

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = featuresRef.current.indexOf(entry.target);
            setVisibleCards((prev) => [...prev, index]);
          }
        });
      },
      { threshold: 0.2 }
    );

    featuresRef.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-x-hidden relative">
      <Toaster />
      
      {/* Global Animated Grid Background */}
      <div className="fixed inset-0 h-full w-full -z-10 bg-base-200">
        <div 
          className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f18_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f18_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{
            animation: 'gridFlow 30s linear infinite',
          }}
        ></div>
      </div>

      {/* Hero Section */}
      <div className="hero min-h-[95vh] font-work-sans relative">
        <div className="hero-content text-center relative z-10">
          <div className="max-w-md">
            <h1 className="text-6xl font-bold font-space-mono">Get Me Hired</h1>
            <p className="py-6 text-lg">
              Get ready for your next interview with guided practice sessions
              and practical insights to help you improve.
            </p>
            <button
              className="btn btn-primary italic m-1"
              onClick={() => navigate("/job")}
            >
              Browse Jobs <ArrowRight />
            </button>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <div
            className="flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
          >
            <span className="text-sm font-medium">Scroll Down</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <div className="flex-1">
              <div className="inline-block mb-6">
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                  TRUSTED AT SCALE
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold font-space-mono mb-6 leading-tight">
                Transforming Interview Practice
              </h2>
              
              <p className="text-2xl text-base-content/50 font-light mb-6">
                with Voice-Based AI and Real-Time Feedback.
              </p>
              
              <p className="text-lg text-base-content/70 leading-relaxed mb-8">
                Get-Me-Hired combines adaptive AI interviews with contextual RAG-powered 
                conversations, live code assessments, and actionable performance analytics 
                to help you ace any interview.
              </p>
              
              <button className="btn btn-outline btn-primary gap-2 font-work-sans group">
                Explore Features
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Visualization - Pulsing Wave */}
      <div className="flex-1 relative h-96 w-full">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Concentric Circles */}
          {[1, 2, 3, 4, 5].map((ring) => (
            <div
              key={ring}
              className="absolute rounded-full border-2 border-primary/30"
              style={{
                width: `${ring * 80}px`,
                height: `${ring * 80}px`,
                animation: `ripple 3s ease-out ${ring * 0.3}s infinite`,
              }}
            ></div>
          ))}
          
          {/* Center Circle */}
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <Mic className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          
          {/* Orbiting Dots */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <div
              key={angle}
              className="absolute w-4 h-4 bg-primary rounded-full shadow-lg"
              style={{
                animation: `orbit 4s linear ${i * 0.2}s infinite`,
                transformOrigin: '0 0',
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Features Section */}
      <div className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 font-space-mono">
              What We Offer
            </h2>
            <p className="text-base-content/60 text-lg">
              Everything you need to ace your next interview
            </p>
          </div>

          {/* First Row - 3 Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            {/* Item 1 */}
            <div
              ref={(el) => (featuresRef.current[0] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(0)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <Mic className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Voice Interview Practice</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Practice with AI voice interviews that feel real and help you
                improve
              </p>
            </div>

            {/* Item 2 */}
            <div
              ref={(el) => (featuresRef.current[1] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(1)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <FileText className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Custom Questions</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Questions matched to your background and the job you want
              </p>
            </div>

            {/* Item 3 */}
            <div
              ref={(el) => (featuresRef.current[2] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(2)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Your Progress</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Get instant feedback and see how you improve over time
              </p>
            </div>
          </div>

          {/* Second Row - 2 Items Centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-3xl mx-auto">
            {/* Item 4 */}
            <div
              ref={(el) => (featuresRef.current[3] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(3)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-success to-success/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <Building2 className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Company Interviews</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Practice with real interview questions from actual companies
              </p>
            </div>

            {/* Item 5 */}
            <div
              ref={(el) => (featuresRef.current[4] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(4)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Join the Community</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Share tips, learn from others, and get support from job seekers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-base-100 rounded-full px-4 py-2 mb-6 shadow-md">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-semibold">Plans & Pricing</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-space-mono">
              Choose the perfect plan
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 font-space-mono text-base-content/70">
              for your needs
            </h3>
            <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
              Flexible pricing for individuals, institutions, and enterprises.
              <br />
              Start free, scale as you grow.
            </p>
          </div>

          {/* Pricing Type Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-base-100 rounded-full p-1 inline-flex shadow-lg flex-wrap gap-1">
              <button
                onClick={() => setBillingCycle("individual")}
                className={`px-4 md:px-6 py-2 rounded-full font-semibold transition-all duration-300 text-sm md:text-base ${
                  billingCycle === "individual"
                    ? "bg-base-content text-base-100"
                    : "text-base-content hover:text-primary"
                }`}
              >
                For Individuals
              </button>
              <button
                onClick={() => setBillingCycle("university")}
                className={`px-4 md:px-6 py-2 rounded-full font-semibold transition-all duration-300 text-sm md:text-base ${
                  billingCycle === "university"
                    ? "bg-base-content text-base-100"
                    : "text-base-content hover:text-primary"
                }`}
              >
                For Universities
              </button>
              <button
                onClick={() => setBillingCycle("enterprise")}
                className={`px-4 md:px-6 py-2 rounded-full font-semibold transition-all duration-300 text-sm md:text-base ${
                  billingCycle === "enterprise"
                    ? "bg-base-content text-base-100"
                    : "text-base-content hover:text-primary"
                }`}
              >
                For Companies
              </button>
            </div>
          </div>

          {/* Individual Plans (B2C) */}
          {billingCycle === "individual" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="bg-base-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-300">
                <h3 className="text-2xl font-bold mb-2 font-space-mono">Free</h3>
                <p className="text-sm text-base-content/60 mb-6">
                  Perfect for getting started with interview practice.
                </p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold">₹0</span>
                  <span className="text-base-content/60 ml-2 block text-sm mt-2">Forever free</span>
                </div>

                <button className="btn btn-neutral w-full mb-8 font-work-sans">
                  Get Started Free
                </button>

                <ul className="space-y-3">
                  {[
                    "5 AI interviews per month",
                    "Basic interview questions",
                    "Text-based feedback",
                    "Community access",
                    "Email support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-base-content/40 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Plan - Featured */}
              <div className="bg-base-300 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-primary relative transform md:scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-content px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                
                <h3 className="text-2xl font-bold mb-2 font-space-mono text-base-content">Pro</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  For serious job seekers and students.
                </p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-base-content">₹199</span>
                  <span className="text-base-content/70 ml-2 block text-sm mt-2">per month</span>
                </div>

                <button className="btn btn-primary w-full mb-8 font-work-sans">
                  Start 7-Day Free Trial
                </button>

                <ul className="space-y-3">
                  {[
                    "30 voice interviews per month",
                    "AI Resume analyzer",
                    "Domain-specific interviews",
                    "Detailed performance analytics",
                    "Priority email support",
                    "Progress tracking dashboard"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-base-content">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Plan */}
              <div className="bg-base-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-300">
                <h3 className="text-2xl font-bold mb-2 font-space-mono">Premium</h3>
                <p className="text-sm text-base-content/60 mb-6">
                  Complete career transformation package.
                </p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold">₹999</span>
                  <span className="text-base-content/60 ml-2 block text-sm mt-2">per month</span>
                </div>

                <button className="btn btn-outline w-full mb-8 font-work-sans">
                  Upgrade to Premium
                </button>

                <ul className="space-y-3">
                  {[
                    "Unlimited voice interviews ",
                    "AI Resume analyzer",
                    "Domain-specific interviews",
                    "Detailed performance analytics",
                    "Interview recordings",
                    "Priority email support",
                    "Progress tracking dashboard",
                    "LinkedIn profile optimization"
                    
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-base-content/40 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* University Plans (B2B) */}
          {billingCycle === "university" && (
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-12 border-2 border-primary/30">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4 font-space-mono">Placement Readiness Suite</h3>
                  <p className="text-lg text-base-content/70">
                    Transform your institution's placement outcomes with AI-powered interview training
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-base-100 rounded-xl p-6">
                    <h4 className="font-bold text-xl mb-4 font-space-mono">What You Get</h4>
                    <ul className="space-y-3">
                      {[
                        "Unlimited student accounts",
                        "Admin dashboard with analytics",
                        "Batch interview management",
                        "Resume audits for entire batch",
                        "Proctored AI coding tests",
                        "Domain-specific training modules",
                        "Placement readiness reports",
                        "Faculty training & support"
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-base-100 rounded-xl p-6">
                    <h4 className="font-bold text-xl mb-4 font-space-mono">Solving Your Challenges</h4>
                    <ul className="space-y-3">
                      {[
                        "Improve placement percentages",
                        "Train thousands of students efficiently",
                        "Provide unlimited mock interviews",
                        "Track student progress with analytics",
                        "Reduce training costs",
                        "Demonstrate ROI to management",
                        "Build industry-ready graduates",
                        "24/7 student access"
                      ].map((challenge, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl p-8 text-center">
                  <div className="mb-4">
                    <span className="text-4xl font-bold">₹50,000 - ₹5,00,000</span>
                    <span className="text-base-content/60 ml-2 block text-sm mt-2">per year (based on institution size)</span>
                  </div>
                  <p className="text-sm text-base-content/60 mb-6">
                    Custom pricing based on student count • Flexible payment terms • Free trial available
                  </p>
                  <button className="btn btn-primary btn-lg font-work-sans">
                    Schedule a Demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enterprise/Company Plans (B2B) */}
          {billingCycle === "enterprise" && (
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-3xl p-12 border-2 border-secondary/30">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4 font-space-mono">Enterprise Recruitment Solution</h3>
                  <p className="text-lg text-base-content/70">
                    Streamline your hiring with AI-powered candidate screening and assessment
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-base-100 rounded-xl p-6">
                    <h4 className="font-bold text-xl mb-4 font-space-mono">Platform Features</h4>
                    <ul className="space-y-3">
                      {[
                        "Voice-based candidate screening",
                        "Communication & soft skills scoring",
                        "Coding + behavioral evaluation",
                        "Anti-cheating detection system",
                        "Automated candidate shortlisting",
                        "Bias-free AI assessments",
                        "Large-volume candidate filtering",
                        "Customizable evaluation criteria"
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-base-100 rounded-xl p-6">
                    <h4 className="font-bold text-xl mb-4 font-space-mono">Business Benefits</h4>
                    <ul className="space-y-3">
                      {[
                        "Reduce time-to-hire by 60%",
                        "Cut recruitment costs significantly",
                        "Scale hiring without adding recruiters",
                        "Eliminate unconscious bias",
                        "Improve candidate quality",
                        "Data-driven hiring decisions",
                        "Better candidate experience",
                        "Compliance & audit trail"
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <BarChart3 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-base-100 rounded-xl p-6 text-center">
                    <h4 className="font-bold text-lg mb-3 font-space-mono">Pay Per Assessment</h4>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">₹25 - ₹80</span>
                      <span className="text-base-content/60 block text-sm mt-2">per candidate</span>
                    </div>
                    <p className="text-xs text-base-content/60 mb-4">
                      Perfect for project-based or seasonal hiring
                    </p>
                    <button className="btn btn-outline btn-sm w-full font-work-sans">
                      Get Started
                    </button>
                  </div>

                  <div className="bg-base-100 rounded-xl p-6 text-center border-2 border-secondary">
                    <div className="badge badge-secondary mb-2">Recommended</div>
                    <h4 className="font-bold text-lg mb-3 font-space-mono">Annual Subscription</h4>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">₹1L - ₹12L</span>
                      <span className="text-base-content/60 block text-sm mt-2">per year</span>
                    </div>
                    <p className="text-xs text-base-content/60 mb-4">
                      Best value for continuous hiring needs
                    </p>
                    <button className="btn btn-secondary btn-sm w-full font-work-sans">
                      Contact Sales
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-base-content/60">
                    Custom integrations with your ATS • Dedicated account manager • White-label options available
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trust Badge Section */}
          <div className="mt-16 text-center">
            <p className="text-sm text-base-content/50 mb-4">Trusted by thousands across India</p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-xs text-base-content/60">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-xs text-base-content/60">Colleges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-xs text-base-content/60">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">85%</div>
                <div className="text-xs text-base-content/60">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center bg-base-300 text-base-content p-10 relative">
        <nav className="grid grid-flow-col gap-4">
          <a className="link link-hover">About</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Privacy Policy</a>
          <a className="link link-hover">Terms of Service</a>
        </nav>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a>
            <a className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
              </svg>
            </a>
            <a className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </div>
        </nav>
        <aside>
          <p className="font-semibold">
            Get Me Hired
            <br />
            Your Career, Our Mission
          </p>
          <p className="text-sm opacity-70">
            Copyright © {new Date().getFullYear()} - All rights reserved
          </p>
        </aside>
      </footer>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes gridFlow {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(40px, 40px);
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0.3);
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;


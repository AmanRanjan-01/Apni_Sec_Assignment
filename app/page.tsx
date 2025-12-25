import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ApniSec - Cybersecurity Solutions & Issue Tracking",
  description:
    "ApniSec provides comprehensive cybersecurity solutions including Cloud Security, VAPT, and Red Team assessments. Track and manage security issues with Trackify.",
  openGraph: {
    title: "ApniSec - Cybersecurity Solutions",
    description: "Leading cybersecurity platform for modern enterprises",
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>✨</span>
              <span>Enterprise-Grade Security Platform</span>
            </div>

            <h1 id="hero-title" className="hero-title">
              Secure Your Digital Assets with{" "}
              <span className="gradient-text">ApniSec Trackify</span>
            </h1>

            <p className="hero-description">
              Comprehensive security issue tracking for Cloud Security, VAPT,
              and Red Team assessments. Streamline your security operations with
              our powerful platform.
            </p>

            <div className="hero-actions">
              <Link href="/register" className="btn btn-primary">
                Start Free Trial
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="#features" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features" aria-labelledby="features-title">
        <div className="container">
          <header className="section-header">
            <h2 id="features-title" className="section-title">
              Powerful Features for{" "}
              <span className="gradient-text">Security Teams</span>
            </h2>
            <p className="section-description">
              Everything you need to track, manage, and resolve security issues
              efficiently.
            </p>
          </header>

          <div className="features-grid">
            <article className="card feature-card">
              <div className="feature-icon" aria-hidden="true">📊</div>
              <h3 className="feature-title">Real-time Dashboard</h3>
              <p className="feature-description">
                Monitor all your security issues in one centralized dashboard
                with real-time updates and comprehensive analytics.
              </p>
            </article>

            <article className="card feature-card">
              <div className="feature-icon" aria-hidden="true">🔐</div>
              <h3 className="feature-title">Secure Authentication</h3>
              <p className="feature-description">
                Enterprise-grade JWT authentication with secure session
                management and role-based access control.
              </p>
            </article>

            <article className="card feature-card">
              <div className="feature-icon" aria-hidden="true">📧</div>
              <h3 className="feature-title">Email Notifications</h3>
              <p className="feature-description">
                Stay informed with instant email notifications for new issues,
                updates, and important security alerts.
              </p>
            </article>

            <article className="card feature-card">
              <div className="feature-icon" aria-hidden="true">🚀</div>
              <h3 className="feature-title">Fast & Reliable</h3>
              <p className="feature-description">
                Built with modern technology stack ensuring lightning-fast
                performance and 99.9% uptime guarantee.
              </p>
            </article>

            <article className="card feature-card">
              <div className="feature-icon" aria-hidden="true">📱</div>
              <h3 className="feature-title">Fully Responsive</h3>
              <p className="feature-description">
                Access your security dashboard from any device with our fully
                responsive design optimized for all screens.
              </p>
            </article>

            <article className="card feature-card">
              <div className="feature-icon" aria-hidden="true">🛡️</div>
              <h3 className="feature-title">Rate Limiting</h3>
              <p className="feature-description">
                Built-in protection against abuse with intelligent rate limiting
                to keep your data secure.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services" aria-labelledby="services-title">
        <div className="container">
          <header className="section-header">
            <h2 id="services-title" className="section-title">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="section-description">
              Comprehensive security assessment services tailored for your
              organization.
            </p>
          </header>

          <div className="services-grid">
            <article className="card service-card">
              <div className="service-icon" aria-hidden="true">☁️</div>
              <h3 className="service-title">Cloud Security</h3>
              <p className="service-description">
                Protect your cloud infrastructure with comprehensive security
                assessments, configuration reviews, and continuous monitoring.
              </p>
            </article>

            <article className="card service-card">
              <div className="service-icon" aria-hidden="true">🎯</div>
              <h3 className="service-title">Red Team Assessment</h3>
              <p className="service-description">
                Simulate real-world attacks to identify vulnerabilities in your
                security posture before malicious actors do.
              </p>
            </article>

            <article className="card service-card">
              <div className="service-icon" aria-hidden="true">🔍</div>
              <h3 className="service-title">VAPT</h3>
              <p className="service-description">
                Vulnerability Assessment and Penetration Testing to discover and
                remediate security weaknesses in your applications.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="features" aria-labelledby="cta-title">
        <div className="container">
          <div className="hero-content">
            <h2 id="cta-title" className="section-title">
              Ready to Secure Your Business?
            </h2>
            <p className="section-description" style={{ marginBottom: "32px" }}>
              Join thousands of organizations that trust ApniSec for their
              security needs.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="btn btn-primary">
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span role="img" aria-label="Shield">🛡️</span>
                <span>ApniSec</span>
              </div>
              <p className="footer-description">
                Leading cybersecurity platform providing comprehensive security
                solutions for modern enterprises. Protect your digital assets
                with confidence.
              </p>
            </div>

            <div className="footer-column">
              <h4>Product</h4>
              <ul className="footer-links">
                <li>
                  <Link href="#features">Features</Link>
                </li>
                <li>
                  <Link href="#services">Services</Link>
                </li>
                <li>
                  <Link href="/login">Dashboard</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <ul className="footer-links">
                <li>
                  <Link href="#about">About Us</Link>
                </li>
                <li>
                  <Link href="#contact">Contact</Link>
                </li>
                <li>
                  <Link href="#">Careers</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#">Terms of Service</Link>
                </li>
                <li>
                  <Link href="#">Security</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              © {new Date().getFullYear()} ApniSec. All rights reserved.
            </p>
            <div className="navbar-actions">
              <Link href="#" className="btn btn-ghost" aria-label="Twitter">
                𝕏
              </Link>
              <Link href="#" className="btn btn-ghost" aria-label="LinkedIn">
                in
              </Link>
              <Link href="#" className="btn btn-ghost" aria-label="GitHub">
                GH
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

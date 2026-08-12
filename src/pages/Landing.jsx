import React from 'react';
import { GLOBAL_CSS } from '../components/landing/landingCss';
import LandingNav from '../components/landing/LandingNav';
import Hero from '../components/landing/Hero';
import TrustMarquee from '../components/landing/TrustMarquee';
import ProductRail from '../components/landing/ProductRail';
import ProductPanel from '../components/landing/ProductPanel';
import ModeSwitcher from '../components/landing/ModeSwitcher';
import HowItWorks from '../components/landing/HowItWorks';
import StoryMosaic from '../components/landing/StoryMosaic';
import TrustGrid from '../components/landing/TrustGrid';
import Pricing from '../components/landing/Pricing';
import FinalCTA from '../components/landing/FinalCTA';
import SiteFooter from '../components/landing/SiteFooter';
import PoolMockup from '../components/landing/mockups/PoolMockup';
import LinkMockup from '../components/landing/mockups/LinkMockup';
import PayrollMockup from '../components/landing/mockups/PayrollMockup';

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'clip' }}>
      <style>{GLOBAL_CSS}</style>

      <LandingNav />
      <Hero />
      <TrustMarquee />
      <ProductRail />

      <section id="features" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <ProductPanel
          tag="Payment Pools"
          headline="Ajo, esusu, and group collections, with a live ledger"
          body="Create a pool, share the invite code in your WhatsApp group, and request contributions. Every member pays through Flutterwave checkout. The activity feed shows who paid, how much, and when, in real time, visible to all members."
          fee="0.15% per contribution"
          cta="Create a pool" to="/register" color="#00d4aa" side="right"
          slot="panelPools" MockupComponent={PoolMockup}
        />
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'var(--bg-2)' }}>
          <ProductPanel
            tag="Payment Links"
            headline="One link. Card, transfer, or USSD. Automatic records."
            body="Create a Qreek link in 2 minutes. Share it on WhatsApp or Instagram. Clients open it in the browser, pay through Flutterwave secure checkout, and you get instant confirmation. No bank alert chasing, no manual reconciliation."
            fee="0.25% per payment"
            cta="Create a link" to="/register" color="#f5a623" side="left"
            slot="panelLinks" MockupComponent={LinkMockup}
          />
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <ProductPanel
            tag="Enterprise Payroll"
            headline="Pay 500 employees in 4 minutes. 0.2% fee. No subscription."
            body="Import your employee roster via CSV, review salaries by department, confirm with your PIN, and every salary hits every bank account in parallel. Real-time status per employee. Printable receipt for accounting."
            fee="0.2% per payroll run"
            cta="Set up payroll" to="/register" color="#9b59b6" side="right"
            slot="panelPayroll" MockupComponent={PayrollMockup}
          />
        </div>
      </section>

      <ModeSwitcher />
      <HowItWorks />
      <StoryMosaic />
      <TrustGrid />
      <Pricing />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import HeroContent from '@/components/HomePage/HeroContent';
import AnimatedSection from '@/components/AnimatedSection';

// ---------- Helpers: ErrorBoundary, Shimmer, Section Wrapper ----------
class ErrorBoundary extends React.Component<{ name?: string; children: React.ReactNode; messages?: { somethingWentWrong: string; tryAgain: string } }, { hasError: boolean; error?: Error }> {
  constructor(props: { name?: string; children: React.ReactNode; messages?: { somethingWentWrong: string; tryAgain: string } }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ErrorBoundary] ${this.props.name || 'Section'} crashed`, error, info);
    }
    toast.error(this.props.messages?.somethingWentWrong || 'Something went wrong.');
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="relative mx-auto my-6 w-full max-w-5xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <div className="font-semibold">
            {this.props.name
              ? `${this.props.name} – ${this.props.messages?.somethingWentWrong || 'Something went wrong'}`
              : (this.props.messages?.somethingWentWrong || 'Something went wrong')}
          </div>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-red-300">
              {this.state.error?.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-3 inline-flex rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
          >
            {this.props.messages?.tryAgain || 'Try again'}
          </button>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const Shimmer: React.FC<{ height?: number | string; className?: string }> = ({ height = 48, className }) => (
  <div
    aria-busy="true"
    className={`w-full overflow-hidden rounded-xl bg-white/5 ${className || ''}`}
    style={{ height }}
  >
    <div className="h-full w-full animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
  </div>
);

// Reusable Section Divider
const SectionDivider = ({ gradient = 'gold' }: { gradient?: 'gold' | 'cyber' | 'white' }) => {
  const gradients = {
    gold: 'from-transparent via-gold-500/30 to-transparent',
    cyber: 'from-transparent via-cyan-500/20 to-transparent',
    white: 'from-transparent via-white/10 to-transparent',
  };
  return <div className={`w-full h-px bg-gradient-to-r ${gradients[gradient]} my-8`} />;
};

// Lazy loaded components
const WhyPierogiCoinSection = dynamic(() => import('@/components/WhyPierogiCoinSection'), { suspense: true });
const AirdropCalculator = dynamic(() => import('@/components/AirdropCalculator'), { ssr: false });
const TokenomicsSection = dynamic(() => import('@/components/TokenomicsSection'), { suspense: true });
const RoadmapSection = dynamic(() => import('@/components/RoadmapSection'), { suspense: true });
const HowToBuySection = dynamic(() => import('@/components/HowToBuySection'), { suspense: true });
const FAQSection = dynamic(() => import('@/components/FAQSection'), { ssr: false });
const FundingHubSection = dynamic(() => import('@/components/Funding/FundingHubSection'), { suspense: true });
const LiveGameStats = dynamic(() => import('@/components/LiveGameStats'), { suspense: true });
const TrustBadges = dynamic(() => import('@/components/TrustBadges'), { suspense: true });
const NewsletterSection = dynamic(() => import('@/components/NewsletterSection'), { suspense: true });
const FoundersClubSection = dynamic(() => import('@/components/FoundersClubSection'), { suspense: true });
const LiveActivityTicker = dynamic(() => import('@/components/LiveActivityTicker'), { ssr: false });
const PierogiGalaxyMap = dynamic(() => import('@/components/PierogiGalaxyMap'), { suspense: true });
const StickyStatusTracker = dynamic(() => import('@/components/StickyStatusTracker'), { ssr: false });
const UtilitySection = dynamic(() => import('@/components/UtilitySection'), { suspense: true });

export default function HomePage() {
  const { t: tCommon } = useTranslation('common');
  const errorMessages = {
    somethingWentWrong: tCommon('error_something_went_wrong'),
    tryAgain: tCommon('try_again')
  };

  const SkipLink = () => {
    const { t } = useTranslation('common');
    return (
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded"
      >
        {t('skip_to_content')}
      </a>
    );
  };

  return (
    <div className="relative bg-[#030014]">
      <SkipLink />
      <div id="main" />

      {/* Gradient overlay for smooth nav blend */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 h-20 z-30 pointer-events-none bg-gradient-to-b from-[#030014] via-[#030014]/80 to-transparent"
      />

      {/* ========== HERO SECTION ========== */}
      <section id="hero" className="relative">
        <HeroContent />
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <LiveActivityTicker />
        </div>
      </section>

      {/* ========== LIVE GAME STATS ========== */}
      <section id="game-stats" className="relative scroll-mt-24 py-16 md:py-24">
        <Suspense fallback={<Shimmer height={320} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Live Game Stats" messages={errorMessages}>
            <AnimatedSection>
              <LiveGameStats />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>


      {/* ========== AIRDROP CALCULATOR ========== */}
      <section id="calculator" className="relative z-20 py-16 md:py-24">
        <Suspense fallback={<Shimmer height={400} className="max-w-6xl mx-auto" />}>
          <ErrorBoundary name="Calculator" messages={errorMessages}>
            <AirdropCalculator />
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== FUNDING HUB ========== */}
      <section id="funding-hub" className="relative scroll-mt-24 py-16 md:py-24 bg-gradient-to-b from-transparent via-[#050510]/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <SectionDivider gradient="gold" />
        </div>
        <Suspense fallback={<Shimmer height={600} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Funding Hub" messages={errorMessages}>
            <AnimatedSection>
              <FundingHubSection />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>


      {/* ========== FOUNDERS CLUB ========== */}
      <section id="founders" className="relative scroll-mt-24 py-16 md:py-24 bg-gradient-to-b from-transparent via-amber-950/10 to-transparent">
        <Suspense fallback={<Shimmer height={400} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Founders Club" messages={errorMessages}>
            <AnimatedSection>
              <FoundersClubSection />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== WHY PIEROGICOIN ========== */}
      <section id="why" className="relative scroll-mt-24 py-16 md:py-24">
        <Suspense fallback={<Shimmer height={192} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Why PierogiCoin" messages={errorMessages}>
            <AnimatedSection>
              <WhyPierogiCoinSection />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== UTILITY ========== */}
      <section id="utility" className="relative scroll-mt-24 py-16 md:py-24 bg-gradient-to-b from-transparent via-[#0a0a14]/50 to-transparent">
        <Suspense fallback={<Shimmer height={192} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Utility" messages={errorMessages}>
            <AnimatedSection>
              <UtilitySection />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== TOKENOMICS ========== */}
      <section id="tokenomics" className="relative scroll-mt-24 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionDivider gradient="cyber" />
        </div>
        <Suspense fallback={<Shimmer height={256} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Tokenomics" messages={errorMessages}>
            <AnimatedSection>
              <TokenomicsSection />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== GALAXY MAP ========== */}
      <section id="galaxy-map" className="relative scroll-mt-24 py-16 md:py-24">
        <Suspense fallback={<Shimmer height={800} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Galaxy Map" messages={errorMessages}>
            <PierogiGalaxyMap />
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== ROADMAP ========== */}
      <section id="roadmap" className="relative scroll-mt-24 py-16 md:py-24 bg-gradient-to-b from-transparent via-[#050510]/50 to-transparent">
        <Suspense fallback={<Shimmer height={224} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Roadmap" messages={errorMessages}>
            <AnimatedSection>
              <RoadmapSection />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== HOW TO BUY ========== */}
      <section id="how-to-buy" className="relative scroll-mt-24 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionDivider gradient="gold" />
        </div>
        <Suspense fallback={<Shimmer height={192} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="How To Buy" messages={errorMessages}>
            <AnimatedSection>
              <HowToBuySection />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== FAQ ========== */}
      <section id="faq" className="relative scroll-mt-24 py-16 md:py-24 bg-gradient-to-b from-transparent via-[#0a0a14]/30 to-transparent">
        <Suspense fallback={<Shimmer height={192} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="FAQ" messages={errorMessages}>
            <AnimatedSection>
              <FAQSection />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== TRUST BADGES ========== */}
      <section id="trust-badges" className="relative scroll-mt-24 py-16 md:py-24">
        <Suspense fallback={<Shimmer height={320} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Trust Badges" messages={errorMessages}>
            <AnimatedSection>
              <TrustBadges />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* ========== NEWSLETTER ========== */}
      <section id="newsletter" className="relative scroll-mt-24 py-16 md:py-24 bg-gradient-to-b from-transparent via-gold-950/10 to-[#030014]">
        <Suspense fallback={<Shimmer height={200} className="max-w-7xl mx-auto" />}>
          <ErrorBoundary name="Newsletter" messages={errorMessages}>
            <AnimatedSection>
              <NewsletterSection />
            </AnimatedSection>
          </ErrorBoundary>
        </Suspense>
      </section>

      {/* Sticky Status Tracker */}
      <StickyStatusTracker />
    </div>
  );
}
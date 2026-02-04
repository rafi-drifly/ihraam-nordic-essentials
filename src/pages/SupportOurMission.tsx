import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Building2, Globe, Users, Check, Eye, CreditCard, Package, Mail, Shield, ArrowRight, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Donation form components
import DonationHero from "@/components/donation/DonationHero";
import CommitmentCards from "@/components/donation/CommitmentCards";
import BreakdownSection from "@/components/donation/BreakdownSection";
import DonationForm from "@/components/donation/DonationForm";
import MosqueProgramSection from "@/components/donation/MosqueProgramSection";
import NeedyProjectsSection from "@/components/donation/NeedyProjectsSection";
import TransparencyPreview from "@/components/donation/TransparencyPreview";
import DonationFAQ from "@/components/donation/DonationFAQ";
import GovernanceSection from "@/components/donation/GovernanceSection";

const SupportOurMission = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const formRef = useRef<HTMLDivElement>(null);

  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>{t('donation.seoTitle')}</title>
        <meta name="description" content={t('donation.seoDescription')} />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <DonationHero onDonateClick={scrollToForm} localePrefix={localePrefix} />

        {/* 3 Commitments */}
        <CommitmentCards />

        {/* Where Your Donation Goes */}
        <BreakdownSection localePrefix={localePrefix} />

        {/* Donation Form */}
        <div ref={formRef}>
          <DonationForm localePrefix={localePrefix} />
        </div>

        {/* Mosque Support Program */}
        <MosqueProgramSection localePrefix={localePrefix} />

        {/* Needy Projects */}
        <NeedyProjectsSection />

        {/* Transparency Preview */}
        <TransparencyPreview localePrefix={localePrefix} />

        {/* FAQ */}
        <DonationFAQ />

        {/* Contact & Governance */}
        <GovernanceSection localePrefix={localePrefix} />
      </div>
    </>
  );
};

export default SupportOurMission;

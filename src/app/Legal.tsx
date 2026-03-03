import React from 'react';
import { PublicLayout } from './components/Layout';
import { useParams } from 'react-router-dom';
import SEO from './components/SEO';

export default function Legal() {
  const { type } = useParams<{ type: 'privacy' | 'terms' | 'honor-code' }>();

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return (
          <>
            <h1 className="text-4xl font-bold mb-8 text-[#3E2723]">Privacy Policy</h1>
            <p className="mb-4 text-sm text-stone-500 font-medium">Last Updated: March 2024</p>
            <p className="mb-6">This Privacy Policy describes how Pengu collects, uses, and discloses your Personal Information when you visit or use our Premium Academic OS & Career Accelerator services.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#5D4037]">1. Information We Collect</h2>
            <p className="mb-4">We collect information you provide directly to us: account registration facts, payment details, demographic data (for Scholarship Smart Matching), academic scores (CGPA, IELTS), uploaded documents (SOPs, Resumes), and gameplay telemetry for Pengu Arcade.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#5D4037]">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to provide and enhance our ecosystem. This includes: verifying identities, facilitating payments, executing AI-driven Scholarship Smart Matching, generating automated Flashcards & study tools, processing expert mentorship requests, and managing Arcade leaderboard rankings.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#5D4037]">3. Data Sharing & Security</h2>
            <p className="mb-4">We do not sell your personal data. We share only necessary, anonymized, or explicitly authorized information with verified Experts to fulfill service requests. Your sensitive data, including bKash transaction IDs and academic transcripts, are protected with bank-level encryption.</p>
          </>
        );
      case 'terms':
        return (
          <>
            <h1 className="text-4xl font-bold mb-8 text-[#3E2723]">Terms of Service</h1>
            <p className="mb-6">Please read these Terms of Service carefully before using the Pengu Premium Academic OS & Career Accelerator.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#5D4037]">1. Conditions of Use</h2>
            <p className="mb-4">By using this platform, you agree to comply with these terms. Our ecosystem encompasses Global Scholarship Discovery, Expert Services, AI Study Tools, Career Vault, and the Pengu Arcade.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#5D4037]">2. Accounts & Platform Credits</h2>
            <p className="mb-4">Users are responsible for maintaining account security. Certain premium features require platform credits (Pengu Coins), which can be earned through the Arcade or purchased. bKash payments must reflect valid TRX IDs.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#5D4037]">3. Service Guarantees & AI Features</h2>
            <p className="mb-4">While our AI tools (Smart Match, Problem Solver) strive for high accuracy, they are provided as reference tools. Decisions regarding university applications and scholarship submissions ultimately lie with the user. We guarantee the quality of delivered expert services, but do not guarantee university admission.</p>
          </>
        );
      case 'honor-code':
        return (
          <>
            <h1 className="text-4xl font-bold mb-8 text-[#3E2723]">Honor Code</h1>
            <p className="mb-6 text-lg font-medium text-stone-600">Pengu is a powerful academic and career accelerator. We demand unwavering commitment to academic integrity and ethical use of our AI & Expert resources.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#5D4037]">1. Ethical Use of Expert Materials</h2>
            <p className="mb-4">Deliverables provided by Pengu experts (SOPs, Research assistance, Code reviews) are premium reference materials. They must be used to deepen understanding, structure personal work, or serve as high-quality examples.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#5D4037]">2. Responsible AI Interaction</h2>
            <p className="mb-4">Our AI Problem Solver and automated tools are designed to teach and guide. Users must not use these tools to bypass learning objectives, cheat on live proctored exams, or generate work to copy-paste blindly without reviewing and understanding the material.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#5D4037]">3. Zero Tolerance for Plagiarism</h2>
            <p className="mb-4">Submitting any unedited material—whether AI-generated or expert-provided—as your own original work constitutes academic dishonesty. Pengu actively supports institutional integrity policies and will permanently ban users caught misusing the platform for plagiarism.</p>
          </>
        );
      default:
        return <div>Select a policy to view.</div>;
    }
  };

  const getSEOTitle = () => {
    switch (type) {
      case 'privacy': return "Privacy Policy | Pengu Data Security";
      case 'terms': return "Terms of Service | Pengu Platform Rules";
      case 'honor-code': return "Honor Code | Academic Integrity at Pengu";
      default: return "Legal | Pengu";
    }
  };

  return (
    <PublicLayout>
      <SEO
        title={getSEOTitle()}
        description="Read Pengu's legal policies, terms of service, privacy practices, and academic honor code to understand how we protect and serve you."
        url={`https://pengu.work.gd/legal/${type}`}
        keywords="legal, privacy policy, terms of service, honor code, academic integrity, data protection"
      />
      <div className="bg-[#FAFAFA] min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 py-16 bg-white shadow-sm mt-8 rounded-2xl border border-stone-100 text-stone-700 leading-relaxed">
          {getContent()}
        </div>
      </div>
    </PublicLayout>
  );
}

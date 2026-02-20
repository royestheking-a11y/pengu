import React from 'react';
import { PublicLayout } from './components/Layout';
import { useParams } from 'react-router-dom';

export default function Legal() {
  const { type } = useParams<{ type: 'privacy' | 'terms' | 'honor-code' }>();

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return (
          <>
            <h1 className="text-4xl font-bold mb-8 text-[#3E2723]">Privacy Policy</h1>
            <p className="mb-4">Effective Date: October 26, 2023</p>
            <p className="mb-4">This Privacy Policy describes how Pengu collects, uses, and discloses your Personal Information when you visit or use our services.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to provide, maintain, and improve our services, such as to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Experts, develop safety features, authenticate users, and send product updates and administrative messages.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Sharing of Information</h2>
            <p className="mb-4">We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: with Experts to enable them to provide the Services you request.</p>
          </>
        );
      case 'terms':
        return (
          <>
            <h1 className="text-4xl font-bold mb-8 text-[#3E2723]">Terms of Service</h1>
            <p className="mb-4">Please read these Terms of Service carefully before using the Pengu website.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Conditions of Use</h2>
            <p className="mb-4">By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to leave the website accordingly.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. User Accounts</h2>
            <p className="mb-4">As a user of this website, you may be asked to register with us and provide private information. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Service Provision</h2>
            <p className="mb-4">Pengu provides a platform connecting students with experts. We guarantee the quality of work delivered by our experts but are not responsible for how you use the provided materials.</p>
          </>
        );
      case 'honor-code':
        return (
          <>
            <h1 className="text-4xl font-bold mb-8 text-[#3E2723]">Honor Code</h1>
            <p className="mb-4">Pengu is committed to academic integrity. Our services are designed to support learning, not replace it.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Permitted Use</h2>
            <p className="mb-4">Materials provided by Pengu experts are intended for research and reference purposes only. Students should use these materials to deepen their understanding of a subject, structure their own work, or check their own solutions.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Prohibited Use</h2>
            <p className="mb-4">Students are strictly prohibited from submitting any material provided by Pengu as their own work for academic credit. This constitutes plagiarism and academic dishonesty.</p>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Enforcement</h2>
            <p className="mb-4">Pengu reserves the right to terminate the account of any user found to be misusing our services in violation of this Honor Code or their institution's academic integrity policies.</p>
          </>
        );
      default:
        return <div>Select a policy to view.</div>;
    }
  };

  return (
    <PublicLayout>
      <div className="bg-[#FAFAFA] min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 py-16 bg-white shadow-sm mt-8 rounded-2xl border border-stone-100 text-stone-700 leading-relaxed">
          {getContent()}
        </div>
      </div>
    </PublicLayout>
  );
}

const PrivacyPolicyPage = () => {
  return (
    <div className="mx-auto max-w-5xl py-4 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="prose lg:prose-lg prose-headings:text-primary-600 prose-a:text-primary-600">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent sm:text-6xl">Privacy Policy</h1>
        <p className="text-gray-500">Last updated: September 15, 2025</p>

        {/* Important notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 rounded-lg">
          <p className="font-semibold text-yellow-800">
            IMPORTANT: This is a placeholder document. You must consult with a legal professional to draft a Privacy Policy that complies with data protection regulations (like NDPR in Nigeria) and accurately reflects your data handling practices.
          </p>
        </div>

        {/* Sections */}
        <section>
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy describes how PPALink ("we," "us," or "our") collects, uses, and shares information about you when you use our website and services.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, build your profile, upload documents, or post a job. This may include:</p>
          <ul className="list-disc ml-6">
            <li>Personal identification information (Name, email address, phone number).</li>
            <li>Professional information (CV, work experience, education history).</li>
            <li>Verification documents (NYSC call-up letter, CAC documents).</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc ml-6">
            <li>Provide, maintain, and improve our services.</li>
            <li>Connect Candidates with Agencies.</li>
            <li>Process transactions and send you related information.</li>
            <li>Communicate with you, including sending notifications and responding to your inquiries.</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement security measures designed to protect your information from unauthorized access, use, or disclosure. However, no security system is impenetrable.
          </p>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data.
          </p>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@ppalink.com" className="underline">privacy@ppalink.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

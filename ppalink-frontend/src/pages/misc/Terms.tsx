const TermsPage = () => {
  return (
    <div className="mx-auto max-w-5xl py-4 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="prose lg:prose-lg prose-headings:text-primary-600 prose-a:text-primary-600">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-400 to-green-500 dark:to-green-400 bg-clip-text text-transparent sm:text-6xl">
          Terms of Service
        </h1>
        <p className="text-gray-500 dark:text-zinc-400">Last updated: September 15, 2025</p>

        {/* Important notice */}
        <div className="bg-yellow-50 dark:bg-yellow-950/60 border-l-4 border-yellow-400 dark:border-yellow-400/20 p-4 my-6 rounded-lg">
          <p className="font-semibold text-yellow-800 dark:text-yellow-300">
            IMPORTANT: This is a placeholder document. You must consult with a legal professional to draft a Terms of Service agreement that is appropriate for your business, jurisdiction, and specific practices.
          </p>
        </div>

        {/* Sections */}
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the PPALink platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            PPALink provides a platform to connect National Youth Service Corps (NYSC) members ("Candidates") with organizations ("Agencies") for the purpose of securing a Place of Primary Assignment (PPA) and other employment opportunities.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2>4. Content</h2>
          <p>
            You are solely responsible for the accuracy and legality of the content you upload, including but not limited to your profile information, documents, and job postings.
          </p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            PPALink is a platform provider and is not responsible for the conduct of its users, the accuracy of user-generated content, or the outcome of any recruitment process.
          </p>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at <a href="mailto:legal@ppalink.com" className="underline">legal@ppalink.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;


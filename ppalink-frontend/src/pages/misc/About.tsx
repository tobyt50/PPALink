import { Handshake, Target, Users } from 'lucide-react';

// A reusable component for the feature cards
const FeatureCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
  <div className="rounded-2xl bg-white p-6 text-center shadow-md ring-1 ring-gray-100 transition-all hover:shadow-lg hover:-translate-y-1">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 ring-4 ring-white">
      <Icon className="h-8 w-8 text-primary-600" />
    </div>
    <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-gray-600">
      {children}
    </p>
  </div>
);

const AboutPage = () => {
  return (
    // Shift page up slightly by reducing vertical padding
    <div className="py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Renamed and styled like the empowering text, bigger */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent sm:text-6xl">
            PPALink, Inc.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            PPALink was founded on a simple yet powerful idea: to bridge the gap between talented NYSC corps members and forward-thinking organizations eager to find the nation's best emerging talent.
          </p>
        </div>
        
        {/* Features Section */}
        <div className="mx-auto mt-16 max-w-lg sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <FeatureCard icon={Target} title="Our Mission">
              To create a seamless, trusted, and efficient ecosystem where every corps member can secure a meaningful PPA that aligns with their skills and career aspirations.
            </FeatureCard>
            <FeatureCard icon={Users} title="For Candidates">
              We provide a centralized platform to showcase your skills and professional potential directly to a curated network of verified organizations looking to hire.
            </FeatureCard>
            <FeatureCard icon={Handshake} title="For Agencies">
              Access a dedicated talent pool of the brightest minds from the NYSC program. Our tools make it easier than ever to find and recruit your next great hire.
            </FeatureCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

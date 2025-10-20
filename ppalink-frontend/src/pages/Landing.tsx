import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Briefcase, Rocket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import useFetch from "../hooks/useFetch";
import type { Agency } from "../types/agency";
import { Avatar } from "../components/ui/Avatar";

const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const AgencyCard = ({ agency }: { agency: Agency }) => (
    <Link to={`/agencies/${agency.id}/profile`}>
        <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm hover:shadow-xl transition transform backdrop-blur-sm h-full flex flex-col items-center text-center"
        >
            <Avatar
                user={{ role: 'AGENCY', ownedAgencies: [agency] }}
                size="lg"
                shape="square"
            />
            <h3 className="font-semibold text-white mt-4">{agency.name}</h3>
            <p className="mt-1 text-green-300 text-sm">{agency.industry?.name || 'Various Industries'}</p>
        </motion.div>
    </Link>
);

const LandingPage = () => {
  // Parallax background
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const { data: featuredAgencies } = useFetch<Agency[]>('/public/featured-agencies');

  return (
    <div className="w-full min-h-screen relative overflow-hidden text-white">
      {/* Global Background (declared once) */}
      <motion.div
        style={{
          y,
          backgroundImage: "url('/bg.JPG')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0"
      />
      {/* Global overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute inset-0 flex justify-center pointer-events-none"
          >
            <div className="h-72 w-72 rounded-full bg-gradient-to-r from-primary-600 via-pink-500 to-yellow-400 opacity-30 blur-3xl" />
          </motion.div>

          <motion.h1
            {...fadeInUp(0.1)}
            className="relative text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
          >
            Connecting NYSC Talent
            <br />
            with{" "}
            <span className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
              Tomorrow's Opportunities
            </span>
            .
          </motion.h1>

          <motion.p
            {...fadeInUp(0.2)}
            className="mt-6 max-w-2xl mx-auto text-lg text-gray-200 dark:text-white"
          >
            PPALink is the dedicated platform for organizations to discover and
            hire talented NYSC corps members, and for corps members to launch
            their careers.
          </motion.p>

          {/* Buttons - now always horizontal */}
          <motion.div
            {...fadeInUp(0.3)}
            className="mt-10 flex flex-row flex-wrap items-center justify-center gap-4"
          >
            <Link to="/register/agency">
              <motion.div
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 shadow-lg"
                >
                  Hire Talent <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>

            <Link to="/register/candidate">
              <motion.div
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button size="lg" variant="outlineTransparent" className="w-full sm:w-auto">
  Find a Job
</Button>


              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Section (continuous bg — only overlay here) */}
      <section className="relative py-12">
        {/* Only overlay — NO background image rendering here so it feels continuous */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            {...fadeInUp(0.1)}
            className="text-3xl font-bold sm:text-4xl"
          >
            Why Choose PPALink?
          </motion.h2>
          <motion.p
            {...fadeInUp(0.2)}
            className="mt-4 max-w-2xl mx-auto text-gray-200 dark:text-white"
          >
            We make it seamless for corps members to find meaningful work and
            for organizations to hire the best emerging talent.
          </motion.p>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              {
                icon: <Briefcase className="h-8 w-8 text-primary-600" />,
                title: "Opportunities",
                desc: "Thousands of PPA listings across industries and sectors.",
              },
              {
                icon: <Users className="h-8 w-8 text-primary-600" />,
                title: "Community",
                desc: "Connect with other corps members and employers directly.",
              },
              {
                icon: <Rocket className="h-8 w-8 text-primary-600" />,
                title: "Career Growth",
                desc: "Kickstart your career with real-world experience.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                {...fadeInUp(0.3 + i * 0.1)}
                className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm hover:shadow-xl transition transform hover:-translate-y-2 backdrop-blur-sm"
              >
                <div className="flex justify-center">{f.icon}</div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-gray-200 dark:text-white text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {featuredAgencies && featuredAgencies.length > 0 && (
          <section className="relative pb-12">
            <div className="absolute inset-0 bg-black/80 pointer-events-none" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <motion.h2 {...fadeInUp(0.1)} className="text-3xl font-bold sm:text-4xl text-zinc-50">
                Hiring Now
              </motion.h2>
              <motion.p {...fadeInUp(0.2)} className="mt-4 max-w-2xl mx-auto text-gray-200 dark:text-zinc-300">
                Explore opportunities from some of the top agencies on our platform.
              </motion.p>
              <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {featuredAgencies.map((agency, i) => (
                      <motion.div key={agency.id} {...fadeInUp(0.3 + i * 0.05)}>
                          <AgencyCard agency={agency} />
                      </motion.div>
                  ))}
              </div>
            </div>
          </section>
      )}

      {/* CTA Section (darker primary gradient) */}
      <section className="relative py-20 bg-gradient-to-r from-primary-700 to-primary-600 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-white">
          <motion.h2
            {...fadeInUp(0.1)}
            className="text-3xl font-bold sm:text-4xl"
          >
            Ready to unlock your potential?
          </motion.h2>
          <motion.p
            {...fadeInUp(0.2)}
            className="mt-4 max-w-xl mx-auto text-gray-100"
          >
            Join PPALink today and connect talent with opportunities that matter.
          </motion.p>
          <motion.div
            {...fadeInUp(0.3)}
            className="mt-8 flex justify-center"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link to="/register/candidate">
                {/* Button now primary-filled (not white) */}
                <Button
                  size="lg"
                  className="bg-primary-800 text-white hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-600/25 font-semibold shadow-md"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
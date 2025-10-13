// src/HomePage.js
import React, { useState, useEffect, useCallback } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion"; // <-- AnimatePresence is new
import { useInView } from "react-intersection-observer";
import evImage from "../../assets/ev.jpg";
import useEmblaCarousel from "embla-carousel-react";
import {
  FiArrowRight,
  FiBarChart2,
  FiCpu,
  FiUsers,
  FiDollarSign,
  FiLogOut, // <-- New icon
} from "react-icons/fi";
import { Link } from "react-router-dom";

// Main Page Component (UPDATED with state)
const HomePage = () => {
  const [user, setUser] = useState(null);

  // Mock login function
  const handleLogin = () => {
    setUser({
      name: "Alex Reid",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    });
  };

  // Mock logout function
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div
      className="bg-slate-900 text-white font-sans overflow-x-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at top, #1e293b, #0f172a 30%)",
      }}
    >
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DashboardShowcase />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

// 1. Header Component (COMPLETE OVERHAUL)
const Header = ({ user, onLogin, onLogout }) => {
  return (
    <header className="sticky top-0 bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-800">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold text-sky-400">
          <span className="font-light">EV</span>Motion
        </div>
        <div className="hidden md:flex space-x-8 items-center">
          <a
            href="#features"
            className="hover:text-sky-400 transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="hover:text-sky-400 transition-colors duration-300"
          >
            Testimonials
          </a>
          <a
            href="#"
            className="hover:text-sky-400 transition-colors duration-300"
          >
            Pricing
          </a>
        </div>

        {/* Conditional rendering for Login/User Profile */}
        <div className="flex items-center space-x-4">
          <AnimatePresence mode="wait">
            {user ? (
              // -- LOGGED IN STATE --
              <motion.div
                key="user-profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-4"
              >
                <span className="font-medium text-slate-300 hidden sm:block">
                  Welcome, {user.name.split(" ")[0]}
                </span>
                <motion.img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-sky-400 object-cover"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                />
                <motion.button
                  onClick={onLogout}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-slate-700 transition-colors"
                  title="Logout"
                >
                  <FiLogOut size={20} />
                </motion.button>
              </motion.div>
            ) : (
              // -- LOGGED OUT STATE --
              <motion.div
                key="login-buttons"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-4"
              >
                <Link to='/login'
                  onClick={onLogin}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="font-bold py-2 px-5 rounded-lg hover:bg-slate-800 transition-all duration-300"
                >
                  Login
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition-all duration-300"
                >
                  Request Demo
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
};

// --- All other components below remain unchanged ---

// Reusable component for scroll-triggered animations (FIXED)
const AnimatedSection = ({ children, className }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={`py-24 px-4 sm:px-6 lg:px-8 ${className || ""}`}
    >
      {children}
    </motion.section>
  );
};

// 2. Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: [
            "linear-gradient(120deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)",
            "linear-gradient(120deg, #38bdf8 0%, #0284c7 50%, #0c4a6e 100%)",
            "linear-gradient(120deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 z-10">
        <img
          src={evImage}
          alt="EV on the road at night"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/70"></div>
      </div>

      <motion.div
        className="relative z-20 text-center container mx-auto px-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      >
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tighter"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          The Future of Dealership Management is Electric
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Streamline your operations, boost sales, and drive your EV dealership
          into the future with one unified platform.
        </motion.p>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgb(56, 189, 248)",
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg transition-all duration-300"
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

// 3. Features Section Component
const features = [
  {
    icon: <FiCpu size={32} />,
    title: "Smart Inventory",
    description:
      "AI-powered tracking for real-time stock, battery health, and charging status.",
  },
  {
    icon: <FiUsers size={32} />,
    title: "CRM for EV Buyers",
    description:
      "Manage leads and relationships with tools tailored for the modern EV buyer.",
  },
  {
    icon: <FiBarChart2 size={32} />,
    title: "Advanced Analytics",
    description:
      "Gain deep insights into sales trends, customer demographics, and performance.",
  },
  {
    icon: <FiDollarSign size={32} />,
    title: "Integrated F&I",
    description:
      "Seamlessly handle financing, insurance, and EV-specific incentives and rebates.",
  },
];

const FeaturesSection = () => (
  <AnimatedSection>
    <div className="container mx-auto" id="features">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          A Smarter Way to Sell
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Our platform is packed with features designed to accelerate your
          dealership's growth.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm"
            whileHover={{
              y: -10,
              scale: 1.03,
              borderColor: "rgb(56, 189, 248)",
              background: "rgba(30, 41, 59, 0.8)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 text-sky-400">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-slate-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </AnimatedSection>
);

// 4. Dashboard Showcase Component
const DashboardShowcase = () => (
  <AnimatedSection>
    <div className="container mx-auto text-center">
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        Your Entire Dealership, in One View
      </h2>
      <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-12">
        From inventory to sales and service, our intuitive dashboard gives you
        complete control and visibility.
      </p>
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl blur-xl opacity-40"></div>
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Dashboard UI"
          className="relative rounded-2xl shadow-2xl w-full border-2 border-slate-700"
        />
      </motion.div>
    </div>
  </AnimatedSection>
);

// 5. Testimonials Section (Carousel)
const testimonials = [
  {
    quote:
      "EVmotion transformed our dealership. Our sales process is 50% faster, and customer satisfaction has never been higher.",
    name: "Sarah Johnson",
    title: "GM, Voltaic Motors",
    image:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "The analytics dashboard is a game-changer. We can finally make data-driven decisions that impact our bottom line.",
    name: "Michael Chen",
    title: "Owner, Ampere Auto",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Inventory management used to be a nightmare. With EVmotion, it's automated, accurate, and incredibly simple.",
    name: "Jessica Williams",
    title: "Operations Manager, Ion Drive",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const DotButton = ({ selected, onClick }) => (
  <button
    className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${selected ? "bg-sky-400 scale-125" : "bg-slate-600"
      }`}
    type="button"
    onClick={onClick}
  />
);

const TestimonialsSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, setScrollSnaps, onSelect]);

  return (
    <AnimatedSection className="bg-slate-800/30" id="testimonials">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by Leading EV Dealerships
          </h2>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((testimonial, index) => (
              <div
                className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4"
                key={index}
              >
                <div className="bg-slate-800 h-full p-8 rounded-xl shadow-lg border border-slate-700 flex flex-col justify-between">
                  <p className="text-slate-300 italic mb-6 text-lg">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center mt-auto">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-sky-400"
                    />
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-sm text-slate-400">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-8">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              selected={index === selectedIndex}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

// 6. Call to Action (CTA) Section
const CTASection = () => (
  <AnimatedSection>
    <div className="container mx-auto text-center bg-slate-800/50 rounded-2xl p-12 md:p-20 relative overflow-hidden border border-slate-700">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500 rounded-full opacity-10 blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full opacity-10 blur-2xl"></div>
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        Ready to Supercharge Your Dealership?
      </h2>
      <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
        Schedule a personalized demo today and see how EVmotion can drive your
        business forward.
      </p>
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 0px 20px rgb(56, 189, 248)",
        }}
        whileTap={{ scale: 0.95 }}
        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg transition-all duration-300 inline-flex items-center"
      >
        Request Your Free Demo <FiArrowRight className="ml-2" />
      </motion.button>
    </div>
  </AnimatedSection>
);

// 7. Footer Component
const Footer = () => (
  <footer className="bg-slate-900 border-t border-slate-800">
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div className="text-xl font-bold text-sky-400 mb-4 md:mb-0">
          <span className="font-light">EV</span>Motion
        </div>
        <div className="flex space-x-6 text-slate-400 mb-4 md:mb-0">
          <a href="#features" className="hover:text-sky-400">
            Features
          </a>
          <a href="#" className="hover:text-sky-400">
            About
          </a>
          <a href="#" className="hover:text-sky-400">
            Privacy Policy
          </a>
        </div>
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} EVmotion. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default HomePage;

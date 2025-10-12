// src/HomePage.js
import React from "react";
import { useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FiArrowRight,
  FiBarChart2,
  FiCpu,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";
import { useEffect } from "react";

// Main Page Component
const HomePage = () => {
  return (
    <div className="bg-slate-900 text-white font-sans">
      <Header />
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

// Reusable component for scroll-triggered animations
const AnimatedSection = ({ children }) => {
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
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className="py-20 px-4 sm:px-6 lg:px-8"
    >
      {children}
    </motion.section>
  );
};

// 1. Header Component
const Header = () => {
  return (
    <header className="sticky top-0 bg-slate-900 bg-opacity-80 backdrop-blur-md z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
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
          <a
            href="#"
            className="hover:text-sky-400 transition-colors duration-300"
          >
            Contact
          </a>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:block bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-300"
        >
          Request a Demo
        </motion.button>
      </nav>
    </header>
  );
};

// 2. Hero Section Component
const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1617886322207-6f504e7472c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="EV Charging"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm"></div>
      </div>
      <motion.div
        className="relative z-10 text-center container mx-auto px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4"
          variants={itemVariants}
        >
          The Future of Dealership Management is Electric
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8"
          variants={itemVariants}
        >
          Streamline your operations, boost sales, and drive your EV dealership
          into the future with one unified platform.
        </motion.p>
        <motion.div variants={itemVariants}>
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
    icon: <FiCpu size={32} className="text-sky-400" />,
    title: "Smart Inventory",
    description:
      "AI-powered inventory tracking for real-time stock levels, battery health, and charging status.",
  },
  {
    icon: <FiUsers size={32} className="text-sky-400" />,
    title: "CRM for EV Buyers",
    description:
      "Manage leads and customer relationships with tools tailored for the modern electric vehicle buyer.",
  },
  {
    icon: <FiBarChart2 size={32} className="text-sky-400" />,
    title: "Advanced Analytics",
    description:
      "Gain deep insights into sales trends, customer demographics, and service performance.",
  },
  {
    icon: <FiDollarSign size={32} className="text-sky-400" />,
    title: "Integrated F&I",
    description:
      "Seamlessly handle financing, insurance, and EV-specific incentives and rebates.",
  },
];

const FeaturesSection = () => (
  <AnimatedSection>
    <div className="container mx-auto" id="features">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          A Smarter Way to Sell
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Our platform is packed with features designed to accelerate your
          dealership's growth.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700"
            whileHover={{
              y: -10,
              scale: 1.03,
              borderColor: "rgb(56, 189, 248)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-slate-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </AnimatedSection>
);

// 4. Dashboard Showcase Component
const DashboardShowcase = () => {
  return (
    <AnimatedSection>
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Your Entire Dealership, in One View
        </h2>
        <p className="text-slate-400 max-w-3xl mx-auto mb-12">
          From inventory to sales and service, our intuitive dashboard gives you
          complete control and visibility over your operations.
        </p>
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl blur-xl opacity-50"></div>
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Dashboard UI"
            className="relative rounded-2xl shadow-2xl w-full"
          />
        </motion.div>
      </div>
    </AnimatedSection>
  );
};

// 5. Testimonials Section
const TestimonialsSection = () => {
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
  ];

  return (
    <AnimatedSection>
      <div className="container mx-auto" id="testimonials">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Leading EV Dealerships
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700"
            >
              <p className="text-slate-300 italic mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

// 6. Call to Action (CTA) Section
const CTASection = () => {
  return (
    <AnimatedSection>
      <div className="container mx-auto text-center bg-slate-800 rounded-2xl p-12 md:p-20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Supercharge Your Dealership?
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mb-8">
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
};

// 7. Footer Component
const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
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
              Careers
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
};

export default HomePage;

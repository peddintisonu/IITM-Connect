import React from 'react';
import { Button } from '../components/ui/Button';
import { env } from '../config/env';

// Mock SVG Placeholder
const ImagePlaceholder = ({ width = "w-full", height = "h-full", text = "Illustration" }) => (
  <div className={`bg-card border border-border/10 rounded-2xl flex items-center justify-center ${width} ${height}`}>
    <span className="text-foreground/50 font-medium">{text}</span>
  </div>
);

export const LandingPage: React.FC = () => {
  const handleAuthRedirect = () => {
    window.location.href = `${env.API_URL}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Navigation */}
      <nav className="container mx-auto max-w-7xl px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center cursor-pointer">
             <span className="text-background text-xl leading-none font-bold block mb-1">✺</span>
          </div>
          <span className="text-2xl font-bold tracking-tight cursor-pointer">CampusOS</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[18px]">
          <a href="#" className="hover:text-primary transition-colors font-medium">Features</a>
          <a href="#" className="hover:text-primary transition-colors font-medium">Clubs</a>
          <a href="#" className="hover:text-primary transition-colors font-medium">Events</a>
          <div className="ml-4 flex gap-4">
            <Button variant="outline" className="font-normal px-8 py-3 h-auto rounded-[14px]" onClick={handleAuthRedirect}>
              Login
            </Button>
            <Button variant="primary" className="font-normal px-8 py-3 h-auto rounded-[14px]" onClick={handleAuthRedirect}>
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start gap-8">
            <h1 className="text-5xl lg:text-[64px] leading-[1.15] font-medium tracking-tight">
              Connecting the<br/>campus community<br/>for everyone
            </h1>
            <p className="text-xl lg:text-[20px] leading-relaxed max-w-lg text-foreground/80">
              CampusOS is the ultimate social network for students. Discover clubs, follow events, get verified PORs, and connect with peers seamlessly.
            </p>
            <Button size="lg" className="font-normal border-2 border-foreground shadow-[0_4px_0_0_#191A23]" onClick={handleAuthRedirect}>
              Get started
            </Button>
          </div>
          <div className="h-[400px] lg:h-[500px]">
             <ImagePlaceholder text="Students Connecting Illustration" />
          </div>
        </div>

        {/* Brand Logos Placeholder */}
        <div className="mt-20">
          <div className="flex flex-wrap justify-between items-center opacity-60 gap-8 grayscale">
             {/* Mocking the campus organizations or fests */}
             {['Saarang', 'Shaastra', 'CFI', 'E-Cell', 'Sports Council', 'Hostel Affairs'].map((brand) => (
               <span key={brand} className="text-2xl font-bold">{brand}</span>
             ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto max-w-7xl px-4 py-24">
        <div className="flex flex-col lg:flex-row items-center gap-10 mb-20 text-center lg:text-left">
          <h2 className="text-4xl font-medium bg-primary inline-block px-2 rounded-md border border-foreground shadow-[0_2px_0_0_#191A23]">Features</h2>
          <p className="max-w-xl text-lg text-foreground/80">
            CampusOS offers everything you need to navigate college life digitally. Here is what you can do on our platform:
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Card 1 */}
          <div className="bg-card rounded-[40px] p-12 border border-border shadow-[0_5px_0_0_#191A23] flex justify-between group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex flex-col justify-between">
               <div>
                 <h3 className="text-3xl font-medium mb-1"><span className="bg-primary px-2 rounded-sm inline-block">Unified</span></h3>
                 <h3 className="text-3xl font-medium"><span className="bg-primary px-2 rounded-sm inline-block">Profiles</span></h3>
               </div>
               <div className="flex items-center gap-4 mt-8">
                 <div className="w-10 h-10 rounded-full bg-foreground text-primary flex items-center justify-center text-xl group-hover:rotate-45 transition-transform">
                   ↗
                 </div>
                 <span className="text-lg font-medium">Learn more</span>
               </div>
            </div>
            <div className="w-48 h-40">
               <ImagePlaceholder text="Profile Graphic" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-primary rounded-[40px] p-12 border border-border shadow-[0_5px_0_0_#191A23] flex justify-between group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex flex-col justify-between">
               <div>
                 <h3 className="text-3xl font-medium mb-1"><span className="bg-background px-2 rounded-sm inline-block">Verified</span></h3>
                 <h3 className="text-3xl font-medium"><span className="bg-background px-2 rounded-sm inline-block">PORs</span></h3>
               </div>
               <div className="flex items-center gap-4 mt-8">
                 <div className="w-10 h-10 rounded-full bg-foreground text-primary flex items-center justify-center text-xl group-hover:rotate-45 transition-transform">
                   ↗
                 </div>
                 <span className="text-lg font-medium">Learn more</span>
               </div>
            </div>
            <div className="w-48 h-40">
               <ImagePlaceholder text="POR Graphic" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-foreground text-background rounded-[40px] p-12 border border-border shadow-[0_5px_0_0_#191A23] flex justify-between group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex flex-col justify-between">
               <div>
                 <h3 className="text-3xl font-medium text-foreground mb-1"><span className="bg-background px-2 rounded-sm inline-block">Campus</span></h3>
                 <h3 className="text-3xl font-medium text-foreground"><span className="bg-background px-2 rounded-sm inline-block">Feed</span></h3>
               </div>
               <div className="flex items-center gap-4 mt-8">
                 <div className="w-10 h-10 rounded-full bg-background text-foreground flex items-center justify-center text-xl group-hover:rotate-45 transition-transform">
                   ↗
                 </div>
                 <span className="text-lg font-medium">Learn more</span>
               </div>
            </div>
            <div className="w-48 h-40">
               <ImagePlaceholder text="Feed Graphic" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-card rounded-[40px] p-12 border border-border shadow-[0_5px_0_0_#191A23] flex justify-between group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex flex-col justify-between">
               <div>
                 <h3 className="text-3xl font-medium mb-1"><span className="bg-primary px-2 rounded-sm inline-block">Event</span></h3>
                 <h3 className="text-3xl font-medium"><span className="bg-primary px-2 rounded-sm inline-block">Tracking</span></h3>
               </div>
               <div className="flex items-center gap-4 mt-8">
                 <div className="w-10 h-10 rounded-full bg-foreground text-primary flex items-center justify-center text-xl group-hover:rotate-45 transition-transform">
                   ↗
                 </div>
                 <span className="text-lg font-medium">Learn more</span>
               </div>
            </div>
            <div className="w-48 h-40">
               <ImagePlaceholder text="Event Graphic" />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;

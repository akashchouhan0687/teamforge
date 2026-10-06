import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Briefcase, GraduationCap, Search, Globe, Sparkles, Code2, Palette, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full pt-28 pb-32 md:pt-40 md:pb-48 bg-background overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute top-32 -left-24 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-50 -z-10" />

        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-10">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/15 border-none rounded-full">
            <Sparkles className="h-4 w-4 mr-2" /> Built for students
          </Badge>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter max-w-5xl text-foreground leading-[1.1]">
            Find the people who make your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">ideas better.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Forge the right team. Build something great.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
            <Link href="/register" className={cn(buttonVariants({ size: "lg", variant: "default" }), "w-full sm:w-auto font-bold rounded-full px-8 shadow-md shadow-primary/20 transition-transform hover:scale-105")}>
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/discover" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto font-bold rounded-full px-8")}>
              Explore Students
            </Link>
          </div>

          {/* Abstract Skill Matching Visual */}
          <div className="w-full max-w-5xl mx-auto mt-16 sm:mt-24 relative">
            <style>{`
              @media (prefers-reduced-motion: no-preference) {
                .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
                .animate-float-2 { animation: float-2 7s ease-in-out infinite; animation-delay: 1s; }
                .animate-float-3 { animation: float-3 5.5s ease-in-out infinite; animation-delay: 2s; }
                .animate-float-4 { animation: float-4 6.5s ease-in-out infinite; animation-delay: 0.5s; }
                .animate-float-center { animation: float-center 8s ease-in-out infinite; }
                
                @keyframes float-1 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(1deg); } }
                @keyframes float-2 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(10px) rotate(-1deg); } }
                @keyframes float-3 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-6px) rotate(1deg); } }
                @keyframes float-4 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(8px) rotate(-1deg); } }
                @keyframes float-center { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
                
                .hero-entrance {
                  animation: hero-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  opacity: 0;
                }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
                
                @keyframes hero-fade-up {
                  from { opacity: 0; transform: translateY(15px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              }
              @media (prefers-reduced-motion: reduce) {
                .hero-entrance { opacity: 1; }
              }
            `}</style>
            
            <div className="flex flex-col gap-6 sm:gap-10 items-center px-4 w-full">
              
              {/* Top Row */}
              <div className="flex flex-row justify-between w-full max-w-3xl px-2 sm:px-12">
                <div className="hero-entrance">
                  <div className="animate-float-1 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center gap-3 hover:border-primary/30 transition-colors">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Code2 className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                    <div className="font-bold text-sm">React</div>
                  </div>
                </div>
                <div className="hero-entrance delay-100 mt-4 sm:mt-0">
                  <div className="animate-float-3 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center gap-3 hover:border-primary/30 transition-colors">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] sm:text-xs">AJ</div>
                    <div className="font-bold text-sm">Alex John</div>
                  </div>
                </div>
              </div>

              {/* Middle Row (Main Focus) */}
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 w-full relative z-10 px-2">
                
                {/* Decorative Side Card Left */}
                <div className="hidden md:flex hero-entrance delay-100 justify-center lg:justify-start lg:pl-10">
                  <div className="animate-float-2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:border-primary/30 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Palette className="h-5 w-5" /></div>
                    <div className="font-bold text-sm whitespace-nowrap">UI/UX Design</div>
                  </div>
                </div>

                {/* Main Match Card */}
                <div className="hero-entrance delay-200 flex justify-center">
                  <div className="animate-float-center bg-card border-2 border-primary/20 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-primary/5 flex items-center justify-center gap-4 sm:gap-6 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 text-white shadow-md">92%</div>
                    <div className="text-left">
                      <div className="font-black text-xl sm:text-2xl text-foreground leading-tight whitespace-nowrap">Perfect Match</div>
                      <div className="text-[10px] sm:text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest whitespace-nowrap">Skill Compatibility</div>
                    </div>
                  </div>
                </div>

                {/* Decorative Side Card Right */}
                <div className="hidden md:flex hero-entrance delay-300 justify-center lg:justify-end lg:pr-10">
                  <div className="animate-float-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:border-primary/30 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center"><Shield className="h-5 w-5" /></div>
                    <div className="font-bold text-sm whitespace-nowrap">Cybersecurity</div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex flex-row justify-between w-full max-w-3xl px-2 sm:px-16">
                <div className="hero-entrance delay-200 mt-2 sm:mt-0">
                  <div className="animate-float-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center gap-3 hover:border-primary/30 transition-colors">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-[10px] sm:text-xs">MK</div>
                    <div className="font-bold text-sm">Maya K.</div>
                  </div>
                </div>
                <div className="hero-entrance delay-300">
                  <div className="animate-float-2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center gap-3 hover:border-primary/30 transition-colors">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center"><Users className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                    <div className="font-bold text-sm">Team Alpha</div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Only Extras */}
              <div className="flex md:hidden flex-row justify-center gap-3 w-full mt-2 hero-entrance delay-300 px-2">
                  <div className="animate-float-3 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-3 shadow-sm flex items-center gap-2 hover:border-primary/30 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Palette className="h-4 w-4" /></div>
                    <div className="font-bold text-xs">UI/UX</div>
                  </div>
                  <div className="animate-float-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-3 shadow-sm flex items-center gap-2 hover:border-primary/30 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center"><Shield className="h-4 w-4" /></div>
                    <div className="font-bold text-xs">Security</div>
                  </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-card border-t border-border/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Everything you need to succeed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
              We provide the tools to help you stand out, find the right people, and build your portfolio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-border/60 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-background rounded-3xl overflow-hidden">
              <CardHeader className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-bold">Student Profiles</CardTitle>
                <CardDescription className="text-base mt-2">
                  Build a professional profile that highlights your skills, coursework, and interests.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-border/60 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-background rounded-3xl overflow-hidden">
              <CardHeader className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Briefcase className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-bold">Project Portfolios</CardTitle>
                <CardDescription className="text-base mt-2">
                  Showcase your work with rich project pages, complete with tech stacks and GitHub links.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/60 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-background rounded-3xl overflow-hidden">
              <CardHeader className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Users className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-bold">Team Formation</CardTitle>
                <CardDescription className="text-base mt-2">
                  Find the perfect teammates for your next hackathon, class project, or startup idea.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="container px-4 md:px-6 mx-auto text-center flex flex-col items-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">Ready to start building?</h2>
          <p className="text-primary-foreground/80 text-xl max-w-xl mx-auto font-medium">
            Join thousands of students already using TeamForge to advance their careers and build amazing things.
          </p>
          <Link href="/register" className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "mt-4 rounded-full px-10 font-bold text-primary hover:bg-white hover:scale-105 transition-transform")}>
            Create Your Profile Today
          </Link>
        </div>
      </section>
    </div>
  );
}

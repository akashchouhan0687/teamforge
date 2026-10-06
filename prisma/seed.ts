import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_SKILLS = [
  { name: "C", category: "Programming" },
  { name: "C++", category: "Programming" },
  { name: "Java", category: "Programming" },
  { name: "Python", category: "Programming" },
  { name: "JavaScript", category: "Programming" },
  { name: "TypeScript", category: "Programming" },
  { name: "HTML", category: "Web" },
  { name: "CSS", category: "Web" },
  { name: "React", category: "Web" },
  { name: "Next.js", category: "Web" },
  { name: "Node.js", category: "Web" },
  { name: "MySQL", category: "Database" },
  { name: "PostgreSQL", category: "Database" },
  { name: "MongoDB", category: "Database" },
  { name: "SQL", category: "Database" },
  { name: "UI/UX", category: "Other" },
  { name: "Cybersecurity", category: "Other" },
  { name: "Machine Learning", category: "Other" },
  { name: "Git", category: "Other" },
  { name: "GitHub", category: "Other" },
];

interface StudentProjectSeed {
  title: string;
  description: string;
  technologies: string;
  role: string;
  githubUrl?: string;
  liveUrl?: string;
}

interface StudentSeed {
  name: string;
  email: string;
  department: string;
  year: string;
  location: string;
  bio: string;
  interests: string;
  skills: { name: string; proficiency: string }[];
  projects: StudentProjectSeed[];
}

const STUDENTS: StudentSeed[] = [
  {
    name: "Rahul Patil",
    email: "rahul.patil@skillmatch.edu",
    department: "CSE",
    year: "2nd Year",
    location: "Campus Block A",
    bio: "Passionate computer science sophomore interested in AI security and backend systems. Looking to collaborate on upcoming hackathon projects.",
    interests: "Cybersecurity, AI",
    skills: [
      { name: "Python", proficiency: "Advanced" },
      { name: "SQL", proficiency: "Intermediate" },
      { name: "JavaScript", proficiency: "Intermediate" },
      { name: "Cybersecurity", proficiency: "Beginner" },
    ],
    projects: [
      {
        title: "Vulnerability Scanner CLI",
        description: "A Python-based command-line tool that audits local network ports and checks for known CVE vulnerabilities.",
        technologies: "Python, Socket, Nmap",
        role: "Lead Developer",
        githubUrl: "https://github.com/rahulpatil/vuln-scanner",
      },
    ],
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@skillmatch.edu",
    department: "IT",
    year: "3rd Year",
    location: "San Jose, CA",
    bio: "Fullstack enthusiast and open source contributor. Love building accessible modern web applications with React, Next.js, and TypeScript.",
    interests: "Web Dev, Open Source, UI/UX",
    skills: [
      { name: "React", proficiency: "Advanced" },
      { name: "Next.js", proficiency: "Advanced" },
      { name: "TypeScript", proficiency: "Advanced" },
      { name: "UI/UX", proficiency: "Intermediate" },
    ],
    projects: [
      {
        title: "Campus Club Hub",
        description: "Centralized discovery and announcement portal for university student organizations and clubs.",
        technologies: "Next.js, TypeScript, Tailwind CSS, PostgreSQL",
        role: "Fullstack Engineer",
        githubUrl: "https://github.com/priyasharma/campus-hub",
        liveUrl: "https://campus-hub-demo.vercel.app",
      },
    ],
  },
  {
    name: "Aarav Mehta",
    email: "aarav.mehta@skillmatch.edu",
    department: "ECE",
    year: "1st Year",
    location: "East Hall, Campus",
    bio: "Electronics freshman exploring the intersection of embedded hardware, microcontrollers, and low-latency C++ programming.",
    interests: "IoT, Embedded Systems, Hardware, Robotics",
    skills: [
      { name: "C++", proficiency: "Advanced" },
      { name: "C", proficiency: "Advanced" },
      { name: "Python", proficiency: "Intermediate" },
    ],
    projects: [
      {
        title: "Smart Grid Power Meter",
        description: "ESP32-based energy monitoring node with real-time telemetry over MQTT to a Grafana dashboard.",
        technologies: "C++, Arduino, FreeRTOS, MQTT",
        role: "Hardware & Firmware Architect",
        githubUrl: "https://github.com/aaravmehta/smart-grid-meter",
      },
    ],
  },
  {
    name: "Ananya Rao",
    email: "ananya.rao@skillmatch.edu",
    department: "CSE",
    year: "4th Year",
    location: "Boston, MA",
    bio: "Senior specializing in applied machine learning, computer vision, and neural network optimization. Seeking teammates for capstone projects.",
    interests: "AI, Machine Learning, Deep Learning, Data Science",
    skills: [
      { name: "Machine Learning", proficiency: "Advanced" },
      { name: "Python", proficiency: "Advanced" },
      { name: "PostgreSQL", proficiency: "Intermediate" },
      { name: "Git", proficiency: "Advanced" },
    ],
    projects: [
      {
        title: "Medical Image Segmentation",
        description: "U-Net architecture implemented in PyTorch for precise MRI lesion segmentation with 94% Dice coefficient.",
        technologies: "Python, PyTorch, OpenCV, NumPy",
        role: "ML Researcher & Lead",
        githubUrl: "https://github.com/ananyarao/mri-segmentation",
      },
    ],
  },
  {
    name: "Karthik Nair",
    email: "karthik.nair@skillmatch.edu",
    department: "Mechanical",
    year: "3rd Year",
    location: "Mechanical Eng Labs",
    bio: "Mechanical engineering student building robotic actuation systems, rapid 3D prototyping, and CAD modeling.",
    interests: "Robotics, CAD, 3D Printing, Autonomous Vehicles",
    skills: [
      { name: "Python", proficiency: "Intermediate" },
      { name: "UI/UX", proficiency: "Intermediate" },
      { name: "C++", proficiency: "Beginner" },
    ],
    projects: [
      {
        title: "Autonomous Rover Chassis",
        description: "Modular carbon-fiber rover chassis with rocker-bogie suspension designed and stress-tested for rough terrain.",
        technologies: "SolidWorks, ANSYS, 3D Printing, Python",
        role: "Mechanical Designer",
      },
    ],
  },
  {
    name: "Sneha Gupta",
    email: "sneha.gupta@skillmatch.edu",
    department: "Civil",
    year: "2nd Year",
    location: "South Campus",
    bio: "Civil engineering student exploring GIS data modeling and computational design for climate-resilient urban infrastructure.",
    interests: "Sustainable Cities, GIS, Smart Infrastructure",
    skills: [
      { name: "Python", proficiency: "Intermediate" },
      { name: "HTML", proficiency: "Intermediate" },
      { name: "CSS", proficiency: "Intermediate" },
    ],
    projects: [
      {
        title: "Urban Flood Risk Analysis",
        description: "Interactive hydrological modeling tool integrating elevation datasets and rain event simulations.",
        technologies: "Python, GeoPandas, Leaflet, HTML/CSS",
        role: "Data Analyst & Web Developer",
        githubUrl: "https://github.com/snehagupta/flood-risk-map",
      },
    ],
  },
  {
    name: "Devon Vance",
    email: "devon.vance@skillmatch.edu",
    department: "IT",
    year: "4th Year",
    location: "Campus Technology Park",
    bio: "Senior systems engineer. Interested in cloud infrastructure, high-throughput microservices, Docker, and Kubernetes deployment pipelines.",
    interests: "Cloud Computing, DevOps, Distributed Systems",
    skills: [
      { name: "Node.js", proficiency: "Advanced" },
      { name: "TypeScript", proficiency: "Advanced" },
      { name: "MongoDB", proficiency: "Advanced" },
      { name: "PostgreSQL", proficiency: "Intermediate" },
      { name: "Git", proficiency: "Advanced" },
      { name: "GitHub", proficiency: "Advanced" },
    ],
    projects: [
      {
        title: "Distributed Rate Limiter Service",
        description: "Token-bucket rate limiting reverse proxy built with Node.js and Redis supporting 10,000+ req/sec.",
        technologies: "Node.js, TypeScript, Redis, Docker",
        role: "Backend Architect",
        githubUrl: "https://github.com/devonvance/rate-limiter",
      },
    ],
  },
  {
    name: "Maya Lin",
    email: "maya.lin@skillmatch.edu",
    department: "CSE",
    year: "3rd Year",
    location: "Seattle, WA",
    bio: "Junior security researcher participating in CTF competitions. Passionate about reverse engineering and application hardening.",
    interests: "Cybersecurity, Ethical Hacking, Cryptography",
    skills: [
      { name: "Cybersecurity", proficiency: "Advanced" },
      { name: "Python", proficiency: "Advanced" },
      { name: "C", proficiency: "Intermediate" },
      { name: "SQL", proficiency: "Intermediate" },
    ],
    projects: [
      {
        title: "CTF Challenge Platform",
        description: "Web application hosting jeopardy-style computer security challenges with automated flag submission and scoring.",
        technologies: "Python, Flask, SQLite, Docker",
        role: "Security Engineer",
        githubUrl: "https://github.com/mayalin/ctf-platform",
      },
    ],
  },
];

async function seed() {
  console.log("Seeding default skills...");
  for (const s of DEFAULT_SKILLS) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category },
      create: { name: s.name, category: s.category },
    });
  }

  const hashedPassword = await bcrypt.hash("TeamForge2026!", 10);

  console.log("Seeding student profiles...");
  for (const s of STUDENTS) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
      },
      create: {
        name: s.name,
        email: s.email,
        password: hashedPassword,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        department: s.department,
        year: s.year,
        location: s.location,
        bio: s.bio,
        interests: s.interests,
      },
      create: {
        userId: user.id,
        department: s.department,
        year: s.year,
        location: s.location,
        bio: s.bio,
        interests: s.interests,
      },
    });

    for (const sk of s.skills) {
      const dbSkill = await prisma.skill.findUnique({ where: { name: sk.name } });
      if (dbSkill) {
        await prisma.userSkill.upsert({
          where: {
            userId_skillId: {
              userId: user.id,
              skillId: dbSkill.id,
            },
          },
          update: { proficiency: sk.proficiency },
          create: {
            userId: user.id,
            skillId: dbSkill.id,
            proficiency: sk.proficiency,
          },
        });
      }
    }

    for (const p of s.projects) {
      const existing = await prisma.project.findFirst({
        where: { userId: user.id, title: p.title },
      });
      if (!existing) {
        await prisma.project.create({
          data: {
            userId: user.id,
            title: p.title,
            description: p.description,
            technologies: p.technologies,
            role: p.role,
            githubUrl: p.githubUrl,
            liveUrl: p.liveUrl,
          },
        });
      }
    }
  }

  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

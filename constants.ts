import { ResumeData, ThemeName, ThemeColors } from './types';

export const RESUME: ResumeData = {
  name: "Yashank Kothari",
  contact: {
    phone: "+91 9653124192",
    email: "kothariyashank@gmail.com",
    linkedin: "linkedin.com/in/yashankkothari",
    github: "github.com/yashankkothari"
  },
  education: [
    {
      institution: "K.J. Somaiya College of Engineering",
      degree: "Bachelor of Technology Computer Engineering and Honours in Data Science",
      location: "Mumbai, India",
      period: "October 2022 – May 2026"
    }
  ],
  experience: [
    {
      role: "AI/ML Intern",
      company: "Card91",
      location: "Mumbai, India",
      period: "June 2025 – Present",
      details: [
        "Engineered and integrated the Tazama open-source fraud detection engine by converting core rule logic from TypeScript to Python.",
        "Adapted and implemented 30+ transaction rules across P2P and P2B payment flows, reducing false positive rates and improving fraud detection accuracy to 98.5%.",
        "Implemented Google Maps API for geolocation-based fraud detection."
      ]
    },
    {
      role: "Technical and Creative Head",
      company: "K.J. Somaiya College of Engineering",
      location: "Mumbai, India",
      period: "July 2023 – May 2025",
      details: [
        "Headed the Creative Team for the entire college, overseeing branding for 14+ major college events.",
        "Led cross-functional teams across technical and creative domains.",
        "Demonstrated strong leadership and team management skills by mentoring junior team members."
      ]
    }
  ],
  projects: [
    {
      name: "NotesAid",
      tech: "Next.js, React, TypeScript, PWA",
      year: "2025",
      description: [
        "Launched beta version achieving 17,000+ views, 1,500+ hours of active time, and 2,700+ unique users.",
        "Open-source project receiving 60+ pull requests.",
        "Developed a method for efficient content updates and PWA performance."
      ]
    },
    {
      name: "MalNotWare",
      tech: "Docker, VirusTotal API, Browser Extension",
      year: "2025",
      description: [
        "Hybrid malware detection system scanning downloaded files via browser extension.",
        "Leveraged static analysis (VirusTotal) and dynamic analysis (Docker sandbox).",
        "Real-time monitoring for malicious behavior."
      ]
    },
    {
      name: "OncoLytix",
      tech: "MobileNet V2, React Native, Expo, Flask",
      year: "2025",
      description: [
        "Cross-platform lung cancer detection mobile app.",
        "Built and trained MobileNetV2 classifier with 87% accuracy.",
        "Integrated Flask REST API for preprocessing and prediction."
      ]
    },
    {
      name: "Antiguo",
      tech: "Express, Node, React, MongoDB, Firebase",
      year: "2024",
      description: [
        "Implemented Firebase authentication for secure user management.",
        "Platform for exploring and filtering designer outfits.",
        "Integrated secure payment gateways."
      ]
    }
  ],
  certifications: [
    { name: "Neural Networks and Deep Learning – DeepLearning.AI", year: "2024" },
    { name: "Introduction to Containers with Docker, Kubernetes & OpenShift – IBM", year: "2024" },
    { name: "AWS Cloud Technical Essentials – Amazon Web Services", year: "2024" }
  ],
  skills: {
    languages: "Python, SQL (Postgres), NoSQL, JavaScript, HTML/CSS, C++",
    frameworks: "React, React Native, Expo, Node.js, Flask, FastAPI, RestAPI",
    tools: "AWS, Git, Docker, Linux",
    libraries: "pandas, NumPy, Matplotlib"
  }
};

export const ASCII_HEADER = `
  __   __      _     _             _    
  \\ \\ / /__ _ | |_  | |__   _ __  | |_  
   \\ V // _\` || __| | '_ \\ | '_ \\ | __| 
    | || (_| || |_  | | | || | | || |_  
    |_| \\__,_| \\__| |_| |_||_| |_| \\__| 
                                        
`;

export const NEOFETCH_ART = `
       _..._
     .'     '.      yashank@portfolio
    /  _   _  \\     -----------------
    | (o)_(o) |     OS: PortfolioOS (Web Based)
    (    ^    )     Kernel: React 19.2.0
     \\   =   /      Uptime: Forever
     '. '...' .'    Shell: Zsh (Simulated)
       \`'''''\`      Resolution: 1920x1080
                    Theme: Custom CSS
                    Font: Fira Code
                    CPU: Google Gemini 3.0 Pro
                    Memory: 128TB Cloud Storage
`;

export const SL_FRAMES = [
  `
      (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O
     (@@@)
    (    )
   (@@@@)
 
 (   )
 
 
    _________________________________________________
   |    |    |    |    |    |    |    |    |    |    |
   |    |    |    |    |    |    |    |    |    |    |
   |    |    |    |    |    |    |    |    |    |    |
   |    |    |    |    |    |    |    |    |    |    |
   |____|____|____|____|____|____|____|____|____|____|
 
 
 `,
  `
      (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O
     (@@@)
    (    )
   (@@@@)
 
 (   )
 
 
    _________________________________________________
   |    |    |    |    |    |    |    |    |    |    |
   |    |    |    |    |    |    |    |    |    |    |
   |    |    |    |    |    |    |    |    |    |    |
   |    |    |    |    |    |    |    |    |    |    |
   |____|____|____|____|____|____|____|____|____|____|
 
 
 `, // Just a placeholder for actual frames, we will rely on css transform for movement
];

export const VIRTUAL_FILES: Record<string, string> = {
  'resume.txt': `Yashank Kothari\nFull Stack Developer & AI Enthusiast\n\nExperience:\n- AI/ML Intern @ Card91\n- Tech Head @ K.J. Somaiya\n\nContact: kothariyashank@gmail.com`,
  'secrets.txt': `TOP SECRET:\n1. The password is 'password123'\n2. I actually use Arch btw (just kidding)\n3. There is no spoon.`,
  'todo.md': `- [x] Build portfolio\n- [ ] Conquer the world\n- [ ] Sleep`
};

export const THEMES: Record<ThemeName, ThemeColors> = {
  standard: {
    background: 'bg-slate-900',
    text: 'text-green-500',
    prompt: 'text-green-500',
    accent: 'text-blue-400'
  },
  retro: {
    background: 'bg-black',
    text: 'text-amber-500',
    prompt: 'text-amber-500',
    accent: 'text-yellow-300'
  },
  ubuntu: {
    background: 'bg-[#300a24]',
    text: 'text-white',
    prompt: 'text-[#E95420]',
    accent: 'text-[#772953]'
  },
  dracula: {
    background: 'bg-[#282a36]',
    text: 'text-[#ff79c6]',
    prompt: 'text-[#50fa7b]',
    accent: 'text-[#bd93f9]'
  }
};

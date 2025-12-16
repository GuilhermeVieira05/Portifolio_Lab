import type { ElementType } from "react";
import { SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiNodedotjs, SiExpress, SiPrisma, SiPostgresql, SiMongodb, SiDocker, SiGit, SiGithub, SiTailwindcss, SiMui, SiFigma, SiVite, SiExpo, SiLinux, SiVercel, SiLangchain, SiPython, SiOpenai, SiGooglegemini, SiPhp, SiDjango, SiSpringboot, SiRabbitmq, SiPytest, SiNeo4J, SiTerraform, SiDart, SiFlutter } from "react-icons/si";
import { FaAws, FaGolang, FaJava } from "react-icons/fa6";
import { BiVector } from "react-icons/bi";

// Categorias suportadas
export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Mobile"
  | "Database"
  | "DevOps"
  | "Testing"
  | "Design"
  | "Tools"
  | "Outros";

export type SkillItem = {
  name: string,
  icon: ElementType,
  color: string,
  bg: string,
  ariaLabel: string
  category: SkillCategory;
};

const gray100 = "#F5F5F5";
const gray200 = "#EEEEEE";

export const skills: SkillItem[] = [
  // Frontend
  {
    name: "React",
    icon: SiReact,
    color: "#61DAFB",
    bg: "#0B2C3C",
    ariaLabel: "React",
    category: "Frontend",
  },
  {
    name: "Next.js",
    icon: SiNextdotjs,
    color: "#000000",
    bg: gray200,
    ariaLabel: "Next.js",
    category: "Frontend",
  },
  {
    name: "TypeScript",
    icon: SiTypescript,
    color: "#3178C6",
    bg: "#E3F2FD",
    ariaLabel: "TypeScript",
    category: "Frontend",
  },
  {
    name: "JavaScript",
    icon: SiJavascript,
    color: "#F7DF1E",
    bg: "#FFF9C4",
    ariaLabel: "JavaScript",
    category: "Frontend",
  },
  {
    name: "MUI",
    icon: SiMui,
    color: "#007FFF",
    bg: "#E3F2FD",
    ariaLabel: "Material UI",
    category: "Frontend",
  },
  {
    name: "Tailwind CSS",
    icon: SiTailwindcss,
    color: "#06B6D4",
    bg: "#E0F7FA",
    ariaLabel: "Tailwind CSS",
    category: "Frontend",
  },

  // Backend
  {
    name: "Python",
    icon: SiPython,
    color: "#3776AB",
    bg: "#E3F2FD",
    ariaLabel: "Python",
    category: "Backend",
  },
  {
    name: "Golang",
    icon: FaGolang,
    color: "#00ADD8",
    bg: "#E3F2FD",
    ariaLabel: "Golang",
    category: "Backend",
  },
  {
    name: "PHP",
    icon: SiPhp,
    color: "#777BB3",
    bg: "#E3F2FD",
    ariaLabel: "PHP",
    category: "Backend",
  },
  {
    name: "Java",
    icon: FaJava,
    color: "#0072B5",
    bg: "#E3F2FD",
    ariaLabel: "Java",
    category: "Backend",
  },
  {
    name: "Django",
    icon: SiDjango,
    color: "#092E20",
    bg: "#E3F2FD",
    ariaLabel: "Django",
    category: "Backend",
  },
  {
    name: "SpringBoot",
    icon: SiSpringboot,
    color: "#6DB33F",
    bg: "#E3F2FD",
    ariaLabel: "SpringBoot",
    category: "Backend",
  },
  {
    name: "Node.js",
    icon: SiNodedotjs,
    color: "#5FA04E",
    bg: "#E8F5E9",
    ariaLabel: "Node.js",
    category: "Backend",
  },
  {
    name: "Express",
    icon: SiExpress,
    color: "#000000",
    bg: gray200,
    ariaLabel: "Express",
    category: "Backend",
  },
  {
    name: "Prisma",
    icon: SiPrisma,
    color: "#2D3748",
    bg: gray100,
    ariaLabel: "Prisma ORM",
    category: "Backend",
  },
  // Other
  {
    name: "RabbitMQ",
    icon: SiRabbitmq,
    color: "#F60",
    bg: "#FFF3E0",
    ariaLabel: "RabbitMQ",
    category: "Outros",
  },

  // Database
  {
    name: "PostgreSQL",
    icon: SiPostgresql,
    color: "#336791",
    bg: "#E3F2FD",
    ariaLabel: "PostgreSQL",
    category: "Database",
  },
  {
    name: "MongoDB",
    icon: SiMongodb,
    color: "#47A248",
    bg: "#E8F5E9",
    ariaLabel: "MongoDB",
    category: "Database",
  },
  {
    name: "ChromaDB",
    icon: BiVector,
    color: "#000000",
    bg: gray200,
    ariaLabel: "ChromaDB",
    category: "Database",
  },
  {
    name: "Neo4j",
    icon: SiNeo4J,
    color: "#000000",
    bg: gray200,
    ariaLabel: "Neo4j",
    category: "Database",
  },

  // Mobile
  {
    name: "React Native",
    icon: SiReact,
    color: "#61DAFB",
    bg: "#0B2C3C",
    ariaLabel: "React Native",
    category: "Mobile",
  },
  {
    name: "Expo",
    icon: SiExpo,
    color: "#000000",
    bg: gray200,
    ariaLabel: "Expo",
    category: "Mobile",
  },
  {
    name: "Flutter",
    icon: SiFlutter,
    color: "#02569B",
    bg: "#E3F2FD",
    ariaLabel: "Flutter",
    category: "Mobile",
  },
  {    name: "Dart",
    icon: SiDart,
    color: "#0175C2",
    bg: "#E3F2FD",
    ariaLabel: "Dart",
    category: "Mobile",
  },
  // DevOps
  {
    name: "Docker",
    icon: SiDocker,
    color: "#2496ED",
    bg: "#E3F2FD",
    ariaLabel: "Docker",
    category: "DevOps",
  },
  {
    name: "AWS",
    icon: FaAws,
    color: "#000000",
    bg: gray200,
    ariaLabel: "AWS",
    category: "DevOps",
  },
  {
    name: "Linux",
    icon: SiLinux,
    color: "#000000",
    bg: gray200,
    ariaLabel: "Linux",
    category: "DevOps",
  },
  {
    name: "Vercel",
    icon: SiVercel,
    color: "#000000",
    bg: gray200,
    ariaLabel: "Vercel",
    category: "DevOps",
  },
  {
    name: "Terraform",
    icon: SiTerraform,
    color: "#7B42BC",
    bg: "#EDE7F6",
    ariaLabel: "Terraform",
    category: "DevOps",
  },
  // Testing
  {
    name: "Pytest",
    icon: SiPytest,
    color: "#000000",
    bg: "#E3F2FD",
    ariaLabel: "Pytest",
    category: "Testing",
  },
  // Design
  {
    name: "Figma",
    icon: SiFigma,
    color: "#F24E1E",
    bg: "#FFF3E0",
    ariaLabel: "Figma",
    category: "Design",
  },

  // Tools
  {
    name: "Git",
    icon: SiGit,
    color: "#F05032",
    bg: "#FBE9E7",
    ariaLabel: "Git",
    category: "Tools",
  },
  {
    name: "GitHub",
    icon: SiGithub,
    color: "#181717",
    bg: gray200,
    ariaLabel: "GitHub",
    category: "Tools",
  },
  {
    name: "Langchain",
    icon: SiLangchain,
    color: "#000000",
    bg: gray200,
    ariaLabel: "Langchain",
    category: "Tools",
  },
  {
    name: "OpenAI",
    icon: SiOpenai,
    color: "#000000",
    bg: gray200,
    ariaLabel: "OpenAI",
    category: "Tools",
  },
  {
    name: "Google Gemini",
    icon: SiGooglegemini,
    color: "#000000",
    bg: gray200,
    ariaLabel: "Gemini",
    category: "Tools",
  },

  // Build
  {
    name: "Vite",
    icon: SiVite,
    color: "#646CFF",
    bg: "#EDE7F6",
    ariaLabel: "Vite",
    category: "Tools",
  }
];
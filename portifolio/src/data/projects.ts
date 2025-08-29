import type { CardType } from "../Types/cardType";
import testeVideo from '../assets/testeVideo.mp4'
import bbf from "../assets/gif/bbf.gif"
import gagro from "../assets/gif/gagro.gif"
import optima from "../assets/gif/optima.gif"
import tradutor from "../assets/projectsImages/tradutor.png"
import ComingSoon from "../assets/projectsImages/ComingSoon.png"
import gagroImg from "../assets/projectsImages/gagro.png"

export const projects: CardType[] = [
  {
    id: "1",
    title: "projects.tradutorIA.title",
    description: "projects.tradutorIA.description",
    languages: ["React", "TypeScript", "CSS3", "Langchain", "Gemini", "Python", "Fast API", "SQLite"],
    type: "projects.types.others",
    status: "projects.status.done",
    image: tradutor,
    highlight: true,
    date: '01/05/2023',
    siteLink: '',
    gitHubLink: 'https://github.com/GuilhermeVieira05/Tradutor_IA',
    video: testeVideo
  },
  {
    id: "2",
    title: "projects.ReadmeCreator.title",
    description: "projects.ReadmeCreator.description",
    languages: ["React", "TypeScript", "Langchain", "Python", "Fast API", "SQLite", "Gemini"],
    type: "projects.types.others",
    status: "projects.status.inProgress",
    image: ComingSoon,
    highlight: true,
    date: '01/05/2023',
  },
  {
    id: "3",
    title: "projects.Portifolio.title",
    description: "projects.Portifolio.description",
    languages: ["React", "TypeScript", "Langchain", "Gemini", "Python", "Fast API", "Material UI"],
    type: "projects.types.sites",
    status: "projects.status.done",
    image: "https://picsum.photos/seed/habits-app/800/600",
    highlight: true,
    date: '01/05/2023'
  },
  {
    id: "4",
    title: "projects.G-agro.title",
    description: "projects.G-agro.description",
    languages: ["React", "JavaScript", "Java", "SpringBoot", "PostgreSQL"],
    type: "projects.types.sites",
    status: "projects.status.done",
    image: gagroImg,
    date: '01/05/2023',
    video: gagro
  },
  {
    id: "5",
    title: "projects.BasicoBemFeito.title",
    description: "projects.BasicoBemFeito.description",
    languages: ["HTML5", "CSS3", "JavaScript"],
    type: "projects.types.sites",
    status: "projects.status.done",
    image: "https://picsum.photos/seed/metrics-dashboard/800/600",
    date: '01/05/2023',
    video: bbf
  },
  {
    id: "6",
    title: "projects.Optima.title",
    description: "projects.Optima.description",
    languages: ["Next.Js", "SCSS", "TypeScript", "Node.js", "Express.js", "Prisma", "PostgreSQL"],
    type: "projects.types.sites",
    status: "projects.status.done",
    image: "https://picsum.photos/seed/tech-conf-landing/800/600",
    date: '01/05/2023',
    video: optima
  },
  {
    id: "7",
    title: "projects.Ecommerce.title",
    description: "projects.Ecommerce.description",
    languages: ["HTML5", "CSS3", "JavaScript", "GSAP"],
    type: "projects.types.ecommerce",
    status: "projects.status.inProgress",
    image: ComingSoon,
    date: '01/05/2023'
  },
  {
    id: "8",
    title: "projects.Ajunta.title",
    description: "projects.Ajunta.description",
    languages: ["Next.Js", "CSS3", "TypeScript", "GraphQL", "Golang", "PostgreSQL", "Redis", "Aws", "Docker"],
    type: "projects.types.sites",
    status: "projects.status.inProgress",
    image: ComingSoon,
    date: '01/05/2023'
  },
  {
    id: "9",
    title: "projects.Voogle.title",
    description: "projects.Voogle.description",
    languages: ["React", "Tailwind", "TypeScript"],
    type: "projects.types.landing",
    status: "projects.status.done",
    image: "https://picsum.photos/seed/tech-conf-landing/800/600",
    date: '01/05/2023'
  }
];
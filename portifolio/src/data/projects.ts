import type {CardType}  from "../Types/cardType";
import bbf              from "../assets/videos/bbf.mp4"
import gagro            from "../assets/videos/gagro.mp4"
import optima           from "../assets/videos/optima.mp4"
import tradutor         from "../assets/projectsImages/tradutor.png"
import ComingSoon       from "../assets/projectsImages/ComingSoon.jpg"
import gagroImg         from "../assets/projectsImages/gagro.png"
import OptimaImg        from "../assets/projectsImages/Optima.jpg"
import voogle           from "../assets/videos/voogle.mp4"
import voogleImg        from "../assets/projectsImages/voogle.png"
import tradutorIa       from "../assets/videos/tradutorIA.mp4"
import bbfImages        from "../assets/projectsImages/bbf.png"
import portifolio       from "../assets/projectsImages/portifolio.png"
import portifolioVideo  from "../assets/videos/portifolio.mp4"

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
    video: tradutorIa
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
    image: portifolio,
    highlight: true,
    date: '01/05/2023',
    video: portifolioVideo
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
    image: bbfImages,
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
    image: OptimaImg,
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
    image: voogleImg,
    date: '01/05/2023',
    video: voogle
  }
];
import type { User } from "../Types/userType";
import profileImg from "../assets/profile.jpeg";
import curriculo from "../assets/curriculo.pdf"

export const userData: User = {
    name: "Guilherme Vieira",
    img: profileImg,
    desc: "user.desc",
    emailName: 'guilhermearv3@gmail.com',
    linkedinName: 'guilherme-arvieira',
    githubName: 'GuilhermeVieira05',
    links: {
        github: "https://github.com/GuilhermeVieira05",
        linkedin: "https://www.linkedin.com/in/guilherme-arvieira/",
        email: "guilhermearv3@gmail.com"
    },
    telefone: "+5531986991214",
    curriculo,
    caracteristicas: [
        "user.fullstack",
        "user.backend",
        "user.ai",
        "user.software"
    ]
}
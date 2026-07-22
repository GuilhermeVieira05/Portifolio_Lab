import type { User } from "../Types/userType";
import userJson from "./json/user.json";
import profileImg from "../assets/profile.jpeg";
import curriculo from "../assets/curriculo.pdf";

export const userData: User = {
  ...userJson,
  img: profileImg,
  curriculo,
};

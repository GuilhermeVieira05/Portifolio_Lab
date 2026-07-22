import type { ElementType } from "react";
import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiNodedotjs, SiExpress,
  SiPrisma, SiPostgresql, SiMongodb, SiDocker, SiGit, SiGithub, SiTailwindcss,
  SiMui, SiFigma, SiVite, SiExpo, SiLinux, SiVercel, SiLangchain, SiPython,
  SiOpenai, SiGooglegemini, SiPhp, SiDjango, SiSpringboot, SiRabbitmq,
  SiPytest, SiNeo4J, SiTerraform, SiDart, SiFlutter,
} from "react-icons/si";
import { FaAws, FaGolang, FaJava } from "react-icons/fa6";
import { BiVector } from "react-icons/bi";
import {
  Language, RocketLaunch, ShoppingCart, Link, Build, Extension,
} from "@mui/icons-material";

export const skillIconRegistry: Record<string, ElementType> = {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiNodedotjs, SiExpress,
  SiPrisma, SiPostgresql, SiMongodb, SiDocker, SiGit, SiGithub, SiTailwindcss,
  SiMui, SiFigma, SiVite, SiExpo, SiLinux, SiVercel, SiLangchain, SiPython,
  SiOpenai, SiGooglegemini, SiPhp, SiDjango, SiSpringboot, SiRabbitmq,
  SiPytest, SiNeo4J, SiTerraform, SiDart, SiFlutter,
  FaAws, FaGolang, FaJava,
  BiVector,
};

export const serviceIconRegistry: Record<string, ElementType> = {
  Language, RocketLaunch, ShoppingCart, Link, Build, Extension,
};

export function resolveSkillIcon(iconName: string): ElementType {
  const icon = skillIconRegistry[iconName];
  if (!icon) throw new Error(`Unknown skill icon: ${iconName}`);
  return icon;
}

export function resolveServiceIcon(iconName: string): ElementType {
  const icon = serviceIconRegistry[iconName];
  if (!icon) throw new Error(`Unknown service icon: ${iconName}`);
  return icon;
}

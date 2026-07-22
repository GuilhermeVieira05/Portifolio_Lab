/**
 * Node-safe mirror of the icon name keys from `portifolio/src/lib/iconRegistry.ts`.
 *
 * We deliberately do NOT import iconRegistry.ts here: it pulls in React,
 * react-icons, and @mui/icons-material component objects just to expose a
 * handful of Record keys. Importing that whole module graph into a Vercel
 * serverless function bundle (Node-only, no DOM) is unnecessary weight and
 * risk — these packages are meant for client bundling, not a validation
 * function that only needs the set of valid string keys.
 *
 * If iconRegistry.ts's key sets change, these two sets must be updated to
 * match (there's no automated sync — keep them in sync by hand).
 */

export const KNOWN_SKILL_ICON_NAMES = new Set<string>([
  "SiReact", "SiNextdotjs", "SiTypescript", "SiJavascript", "SiNodedotjs", "SiExpress",
  "SiPrisma", "SiPostgresql", "SiMongodb", "SiDocker", "SiGit", "SiGithub", "SiTailwindcss",
  "SiMui", "SiFigma", "SiVite", "SiExpo", "SiLinux", "SiVercel", "SiLangchain", "SiPython",
  "SiOpenai", "SiGooglegemini", "SiPhp", "SiDjango", "SiSpringboot", "SiRabbitmq",
  "SiPytest", "SiNeo4J", "SiTerraform", "SiDart", "SiFlutter",
  "FaAws", "FaGolang", "FaJava",
  "BiVector",
]);

export const KNOWN_SERVICE_ICON_NAMES = new Set<string>([
  "Language", "RocketLaunch", "ShoppingCart", "Link", "Build", "Extension",
]);

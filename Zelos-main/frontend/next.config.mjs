import withFlowbiteReact from "flowbite-react/plugin/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
  i18n: {
    locales: ['pt', 'en'],   // idiomas suportados
    defaultLocale: 'pt',     // idioma padrão
  },
};

export default withFlowbiteReact(nextConfig);
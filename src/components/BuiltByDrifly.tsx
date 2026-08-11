import { useTranslation } from "react-i18next";

const BuiltByDrifly = () => {
  const { i18n } = useTranslation();
  const isSwedish = i18n.language?.startsWith("sv");

  return (
    <p className="text-muted-foreground text-sm">
      {isSwedish ? "Byggd av " : "Built by "}
      <a
        href="https://driflysolutions.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary transition-colors"
      >
        Drifly Solutions
      </a>
    </p>
  );
};

export default BuiltByDrifly;

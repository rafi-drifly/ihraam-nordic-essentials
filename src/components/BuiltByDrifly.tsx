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
        className="text-foreground underline underline-offset-4 decoration-foreground/50 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
      >
        Drifly Solutions
      </a>
    </p>
  );
};

export default BuiltByDrifly;

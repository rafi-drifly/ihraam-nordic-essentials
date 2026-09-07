import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  LOCALES,
  LOCALE_CODES,
  localeFromPath,
  localisePath,
  type LocaleCode,
} from '@/i18n/locales';

// Menu contents come from the locale manifest, so a new language appears
// here on its own.
const languages = LOCALE_CODES.map((code) => ({
  code,
  name: LOCALES[code].name,
  prefix: LOCALES[code].prefix,
}));

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentLocalePrefix = () => LOCALES[localeFromPath(location.pathname)].prefix;

  // Stay on the same page, just in another language.
  const switchLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    navigate(localisePath(location.pathname, langCode as LocaleCode));
  };

  const currentLang = languages.find(
    (l) => l.prefix === getCurrentLocalePrefix()
  ) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium">
          <Globe className="h-4 w-4" />
          <span className="uppercase">{currentLang.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={currentLang.code === lang.code ? 'bg-accent' : ''}
          >
            <span className="uppercase font-medium mr-2">{lang.code}</span>
            <span className="text-muted-foreground">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

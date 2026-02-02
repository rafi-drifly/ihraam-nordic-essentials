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

const languages = [
  { code: 'en', name: 'English', prefix: '' },
  { code: 'sv', name: 'Svenska', prefix: '/sv' },
  { code: 'no', name: 'Norsk', prefix: '/no' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };

  const getPathWithoutLocale = () => {
    const path = location.pathname;
    if (path.startsWith('/sv')) return path.replace(/^\/sv/, '') || '/';
    if (path.startsWith('/no')) return path.replace(/^\/no/, '') || '/';
    return path;
  };

  const switchLanguage = (langCode: string, prefix: string) => {
    const pathWithoutLocale = getPathWithoutLocale();
    
    // Build the new path
    let newPath: string;
    if (prefix === '') {
      // English (default)
      newPath = pathWithoutLocale;
    } else {
      // Swedish or Norwegian
      newPath = pathWithoutLocale === '/' ? prefix : `${prefix}${pathWithoutLocale}`;
    }
    
    i18n.changeLanguage(langCode);
    navigate(newPath);
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
            onClick={() => switchLanguage(lang.code, lang.prefix)}
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

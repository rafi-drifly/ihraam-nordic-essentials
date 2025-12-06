import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getLocalizedPath, reverseRouteMapping, routeMapping } from '@/i18n';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

const LanguageSwitcher = ({ className = '', variant = 'desktop' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentLang = i18n.language;
  
  const switchLanguage = (newLang: string) => {
    const currentPath = location.pathname;
    
    let newPath: string;
    
    if (newLang === 'sv') {
      // Switching to Swedish
      // First, get the English path if we're on a Swedish path
      const englishPath = reverseRouteMapping[currentPath] || currentPath;
      // Then get the Swedish equivalent
      newPath = routeMapping.sv[englishPath] || `/sv${englishPath}`;
    } else {
      // Switching to English
      // Get the English path from Swedish path
      newPath = reverseRouteMapping[currentPath] || currentPath.replace(/^\/sv/, '') || '/';
    }
    
    i18n.changeLanguage(newLang);
    navigate(newPath);
  };

  if (variant === 'mobile') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant={currentLang === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLanguage('en')}
          className="text-sm"
        >
          EN
        </Button>
        <span className="text-muted-foreground">|</span>
        <Button
          variant={currentLang === 'sv' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLanguage('sv')}
          className="text-sm"
        >
          SV
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchLanguage('en')}
        className={`text-sm px-2 ${currentLang === 'en' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
      >
        EN
      </Button>
      <span className="text-muted-foreground text-sm">|</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchLanguage('sv')}
        className={`text-sm px-2 ${currentLang === 'sv' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
      >
        SV
      </Button>
    </div>
  );
};

export default LanguageSwitcher;

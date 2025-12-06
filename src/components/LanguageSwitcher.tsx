import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const currentPath = location.pathname;
    const isSwedish = currentPath.startsWith('/sv');
    
    if (isSwedish) {
      // Switch to English: remove /sv prefix
      const englishPath = currentPath.replace(/^\/sv/, '') || '/';
      i18n.changeLanguage('en');
      navigate(englishPath);
    } else {
      // Switch to Swedish: add /sv prefix
      const swedishPath = currentPath === '/' ? '/sv' : `/sv${currentPath}`;
      i18n.changeLanguage('sv');
      navigate(swedishPath);
    }
  };

  const isSwedish = location.pathname.startsWith('/sv') || i18n.language === 'sv';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-sm font-medium"
    >
      {isSwedish ? 'EN' : 'SV'}
    </Button>
  );
};

export default LanguageSwitcher;

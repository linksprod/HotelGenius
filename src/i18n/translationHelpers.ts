import { useTranslation } from 'react-i18next';

export const getCleanTranslationKey = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const useTranslatedServices = (lng?: string) => {
  const { t } = useTranslation();

  const translateCategory = (name: string): string => {
    const key = `profilePage.servicesList.categories.${getCleanTranslationKey(name)}`;
    return t(key, name, lng ? { lng } : undefined);
  };

  const translateCategoryDescription = (name: string, defaultDesc: string): string => {
    const key = `profilePage.servicesList.categories.${getCleanTranslationKey(name)}Description`;
    return t(key, defaultDesc, lng ? { lng } : undefined);
  };

  const translateItemName = (name: string): string => {
    const key = `profilePage.servicesList.items.${getCleanTranslationKey(name)}.name`;
    return t(key, name, lng ? { lng } : undefined);
  };

  const translateItemDescription = (name: string, defaultDesc: string): string => {
    const key = `profilePage.servicesList.items.${getCleanTranslationKey(name)}.description`;
    return t(key, defaultDesc, lng ? { lng } : undefined);
  };

  return { 
    translateCategory, 
    translateCategoryDescription, 
    translateItemName, 
    translateItemDescription 
  };
};
